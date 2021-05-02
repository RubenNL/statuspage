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
            item-text="data.name"
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
          </v-treeview>
          <v-btn @click="generateLink">generateLink</v-btn>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col v-if="selected">
          Output:
          <code>{{selected.response}}</code>
          <v-card>
            <v-card-text>
              <v-select v-model="selected.module" :items="Object.keys(modules)" persistent-hint :hint="selected.module?modules[selected.module].info:''"/>
              <div v-if="selected.module" >
                <v-text-field v-for="(text, name) in modules[selected.module].help" v-model="selected.args[name]" :key="name" :label="name" :hint="text" persistent-hint/>
              </div>
            </v-card-text>
          </v-card>
          <v-btn @click="save">save</v-btn>
        </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>

<script>
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
      const data=JSON.parse(decodeURIComponent(document.location.search.split('?')[1]))
      this.modules=data.modules;
      this.items=data.items;
      this.header=data.header;
      this.date=data.date;
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
        let item = this.items[data.trace.shift()];
        data.trace.forEach(trace => item = item.after[trace]);
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
    save() {
      const deleteUnneeded=items=>items.map(item=>{
        delete item.data;
        delete item.trace;
        delete item.response;
        delete item.status;
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
      window.location.search=encodeURIComponent(JSON.stringify({
        items:this.items,
        modules:this.modules,
        header:prompt('header?'),
        date: this.date,
      }));
    }
  }
};
</script>
