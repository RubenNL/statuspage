<template>
  <v-container>
    <v-dialog v-model="dialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-on="on" v-bind="attrs">
          <v-progress-circular indeterminate v-if="status=='STARTED'"/>
          <v-icon v-if="status=='PENDING'">mdi-timer-sand</v-icon>
          <v-icon v-if="status=='SUCCESS'">mdi-check</v-icon>
          <v-icon v-if="status=='ERROR'">mdi-alert-circle</v-icon>
          <v-icon v-if="status=='CANCELLED'">mdi-minus-circle</v-icon>
          {{item.data.name}}
        </v-btn>
      </template>
      <v-card>{{response}}</v-card>
    </v-dialog>
    <Item v-for="item in item.after" :key="item.name" :item="item"/>
  </v-container>
</template>

<script>
  import { eventBus } from '@/main'
  export default {
    name: 'Item',
    props: {
      'item': Object,
    },
    data(){
      return {
        status:'PENDING',
        dialog: false,
        response: 'PENDING',
      }
    },
    created() {
      eventBus.$on('data', data => {
        if(data.name!=this.item.data.name) return;
        console.log(data.name,data);
        if(data.type=="status") {
          this.status=data.status;
          this.response=data.response??"no data available";
        }
      })
    }
  }
</script>
