<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      Hoi!
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
        </v-col>
        <v-divider vertical></v-divider>
        <v-col>
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
    }
  },
  mounted(){
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
      if (!this.active.length) return {response:"nothing selected."}
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
        if(item.after) item.after=deleteUnneeded(item.after);
        return item;
      })
      const filtered=deleteUnneeded(JSON.parse(JSON.stringify(this.items)));
      console.log(filtered);
    }
  }
};
</script>
