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
      <Item v-for="item in items" :key="item.name" :item="item"/>
    </v-main>
  </v-app>
</template>

<script>
import Item from './components/Item.vue';
import { eventBus } from '@/main'
export default {
  name: 'App',

  components: {
    Item,
  },

  data() {
    return {
      ws:null,
      items:[],
    }
  },
  mounted(){
    this.ws=new WebSocket(window.location.protocol.toString().replace('http','ws')+'//'+window.location.host+'/ws');
    this.ws.onmessage=event=>{
      const data=JSON.parse(event.data);
      eventBus.$emit('data',data);
      if(data.type=="actions") {
        this.items=data.actions;
      }
    }
  }
};
</script>
