<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      dense
    >
      <v-icon v-if="status==='DOWNLOADING'">mdi-download</v-icon>
      <v-progress-circular indeterminate v-else-if="status==='ACTIVE'"/>
      <v-icon v-else-if="status==='DONE'">mdi-check</v-icon>
      <v-icon v-else-if="status==='ERROR'">mdi-alert-circle</v-icon>
      {{ header }}
      <v-spacer/>
      {{ new Date(date).toLocaleString('nl-NL') }}
    </v-app-bar>

    <v-main>
      <v-row>
        <v-col>
          <Treeview :items="items" @active="response=>this.active=response" :open="open"/>
          <v-btn @click="addLine">new task</v-btn>
          <GenerateLink :date="date" :items="items" :compress="compress" :status="status"/>
          <v-btn @click="save">save</v-btn>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col v-if="selected">
          <TaskEditor v-bind:modules="modules" v-bind:item="selected" @deleteLine="deleteLine"/>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
import jsonUrl from 'json-url';
import TaskEditor from './components/TaskEditor'
import GenerateLink from "./components/GenerateLink";
import Treeview from "./components/Treeview"
export default {
  name: 'App',
  components: {
    GenerateLink,
    TaskEditor,
    Treeview
  },
  data() {
    return {
      modules: {},
      ws:null,
      items:[],
      active: [],
      header:'Live',
      date: +new Date(),
      compress: jsonUrl('lzma'),
      status:'DOWNLOADING',
      open: [],
    }
  },
  mounted(){
    fetch('/api/modules').then(response=>response.json()).then(modules=>{this.modules=modules});
    if(document.location.search.split('?')[1]) {
      this.compress.decompress(document.location.search.split('?')[1]).then(data => {
        this.items=data.items;
        this.header=data.header;
        this.date=data.date;
        this.status=data.status;
      })
      return;
    }
    this.ws=new WebSocket(window.location.protocol.toString().replace('http','ws')+'//'+window.location.host+'/ws');
    this.ws.onmessage=event=>{
      const data=JSON.parse(event.data);
      if(data.type==="actions") {
        this.items=data.actions;
        this.status='ACTIVE';
      } else if(data.type==="status") {
        const item=this.findByTrace(data.trace);
        item.status=data.status;
        item.response=data.response??"no data available";
        if(data.status==="ERROR") {
          const trace=JSON.parse(JSON.stringify(data.trace));
          while(trace.length>0) {
            const item=this.findByTrace(trace);
            this.open=[item,...this.open];
            item.childError=true;
            trace.pop();
          }
        }
        this.$forceUpdate();
      } else if(data==="DONE") this.status="DONE";
    }
    this.ws.onclose=close=>{
      console.error(close);
      this.status='ERROR';
    }
    this.ws.onerror=err=>{
      console.error(err);
      this.status="ERROR";
    }
  },
  computed: {
    selected() {
      if (!this.active.length) return undefined;
      return this.active[0];
    }
  },
  methods: {
    findByTrace(trace) {
      trace=JSON.parse(JSON.stringify(trace));
      let item = this.items[trace.shift()];
      trace.forEach(trace => item = item.after[trace]);
      return item;
    },
    save() {
      const deleteUnneeded=items=>items.map(item=>{
        delete item.data;
        delete item.trace;
        delete item.response;
        delete item.status;
        if(item.after.length===0) delete item.after;
        if(item.name!=null&&item.name.length===0) delete item.name;
        item.args=Object.fromEntries(Object.entries(item.args).filter(arg=>this.modules[item.module].help[arg[0]]))
        if(item.after) item.after=deleteUnneeded(item.after);
        return item;
      })
      const filtered=deleteUnneeded(JSON.parse(JSON.stringify(this.items)));
      fetch('/api',{
        method:'POST',
        body:JSON.stringify(filtered),
      }).then(res=>res.text()).then(alert).then(()=>location.reload())
      .catch(alert);
    },
    addLine() {
      const defaultLine={args:{},module:'',after:[]}
      defaultLine.trace=JSON.stringify([this.items.length]);
      this.items.push(defaultLine);
    },
    deleteLine() {
      const trace=JSON.parse(this.selected.trace);
      if(trace.length>1) {
        trace.pop();
        const item=this.findByTrace(trace);
        item.after=item.after.filter((x) => x.trace !== this.selected.trace)
      } else this.items=this.items.filter((x) => x.trace !== this.selected.trace)
      this.$forceUpdate();
    }
  }
};
</script>
