<template>
  <v-dialog width="500">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on">Generate link</v-btn>
    </template>
    <v-card>
      <v-card-title>generate link</v-card-title>
      <v-card-text>
        <v-switch v-for="id in Object.keys(link.toggles)" :key="id" v-model="link.toggles[id]" :label="id"/>
        <v-text-field v-model="link.text" label="extra info"/>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="generateLink">generateLink</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>

export default {
  name: 'GenerateLink',
  props: {
    items:Array,
    date:Number,
    compress: Object,
    status:String,
  },
  data() {
    return {
      link: {
        toggles:{success:false,error:true},
        text:'',
      },
    }
  },
  methods:{
    generateLink() {
      const removeResponse=items=>items.map(item=>{
        if(item.status==="PENDING" || item.status==="CANCELLED" || item.status==="STARTED") delete item.response;
        if(item.status==="ERROR" && !this.link.error) delete item.response;
        if(item.status==="SUCCESS" && !this.link.success) delete item.response;
        if(item.after && item.after.length===0) delete item.after;
        if(item.after) item.after=removeResponse(item.after);
        return item;
      })
      this.compress.compress({
        items:removeResponse(this.items),
        header:this.link.text,
        date: this.date,
        status: this.status,
      }).then(result => window.location.search=result);
    },
  }
}
</script>