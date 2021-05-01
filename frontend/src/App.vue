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
          <v-progress-circular indeterminate v-if="item.status=='STARTED'"/>
          <v-icon v-if="item.status=='PENDING'">mdi-timer-sand</v-icon>
          <v-icon v-if="item.status=='SUCCESS'">mdi-check</v-icon>
          <v-icon v-if="item.status=='ERROR'">mdi-alert-circle</v-icon>
          <v-icon v-if="item.status=='CANCELLED'">mdi-minus-circle</v-icon>
        </template>
      </v-treeview>
      {{selected.response}}
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',

  data() {
    return {
      ws:null,
      items:[],
      active: [],
    }
  },
  mounted(){
    this.ws=new WebSocket(window.location.protocol.toString().replace('http','ws')+'//'+window.location.host+'/ws');
    this.ws.onmessage=event=>{
      const data=JSON.parse(event.data);
      if(data.type=="actions") {
        this.items=data.actions;
      } else if(data.type=="status") {
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
  }
};
</script>
