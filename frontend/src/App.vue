<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
      dense
    >
      {{ header }}
      <v-spacer/>
      {{ new Date(date).toLocaleString('nl-NL') }}
    </v-app-bar>

    <v-main>
      <v-row>
        <v-col>
          <v-treeview
            v-if="items.length"
            :items="items"
            activatable
            transition
            item-children="after"
            item-key="trace"
            :active.sync="active"
            return-object
            open-all
          >
            <template v-slot:prepend="{ item }">
              <v-progress-circular indeterminate v-if="item.status==='STARTED'"/>
              <v-icon v-if="item.status==='PENDING'">mdi-timer-sand</v-icon>
              <v-icon v-if="item.status==='SUCCESS'">mdi-check</v-icon>
              <v-icon v-if="item.status==='ERROR'">mdi-alert-circle</v-icon>
              <v-icon v-if="item.status==='CANCELLED'">mdi-minus-circle</v-icon>
            </template>
            <template v-slot:label="{ item }">
              {{item.name || (item.data?item.data.name:"new module")}}
            </template>
          </v-treeview>
          <v-btn @click="generateLink">generateLink</v-btn>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col v-if="selected">
          Output:
          <pre><code>{{selected.response}}</code></pre>
          <v-card>
            <v-card-text>
              <v-select v-model="selected.module" :items="Object.keys(modules)" persistent-hint :hint="selected.module?modules[selected.module].info:''"/>
              <v-text-field v-model="selected.name" label="name"/>
              <div v-if="selected.module" >
                <v-text-field v-for="(text, name) in modules[selected.module].help" v-model="selected.args[name]" :key="name" :label="name" :hint="text" persistent-hint/>
              </div>
              <v-btn @click="deleteLine">delete</v-btn>
            </v-card-text>
          </v-card>
          <v-btn @click="save">save</v-btn>
        </v-col>
      </v-row>
      <v-btn @click="addLine">new task</v-btn>
    </v-main>
  </v-app>
</template>

<script>
import jsonurl from 'json-url';
const compress = jsonurl('lzma');
export default {
  name: 'App',

  data() {
    return {
      modules: {},
      ws:null,
      items:[],
      active: [],
      header:'Live',
      date: +new Date(),
    }
  },
  mounted(){
    if(document.location.search.split('?')[1]) {
      compress.decompress(document.location.search.split('?')[1]).then(data => {
        this.modules=data.modules;
        this.items=data.items;
        this.header=data.header;
        this.date=data.date;
      })
      return;
    }
    this.ws=new WebSocket(window.location.protocol.toString().replace('http','ws')+'//'+window.location.host+'/ws');
    this.ws.onmessage=event=>{
      const data=JSON.parse(event.data);
      if(data.type==="modules") this.modules=data.modules;
      if(data.type==="actions") {
        console.dir(JSON.parse(JSON.stringify(data.actions)));
        this.items=data.actions;
      } else if(data.type==="status") {
        const item=this.findByTrace(data.trace);
        item.status=data.status;
        item.response=data.response??"no data available";
        this.$forceUpdate();
      }
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
        if(item.after.length==0) delete item.after;
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
    generateLink() {
      compress.compress({
        items:this.items,
        modules:this.modules,
        header:prompt('bericht?'),
        date: this.date,
      }).then(result => window.location.search=result);
    },
    addLine() {
      const defaultLine={args:{},module:'',after:[]}
      if(this.selected) {
        defaultLine.trace=JSON.stringify([...JSON.parse(this.selected.trace),this.selected.after.length]);
        this.selected.after.push(defaultLine);
      } else {
        defaultLine.trace=JSON.stringify([this.items.length]);
        this.items.push(defaultLine);
      }
      this.$forceUpdate();
    },
    deleteLine() {
      console.log(this.selected);
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
