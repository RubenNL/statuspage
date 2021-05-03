<template>
  <v-app>
    Output:
    <pre><code>{{item.response}}</code></pre>
    <v-card>
      <v-card-text>
        <v-select v-model="item.module" :items="Object.keys(modules)" persistent-hint :hint="item.module?modules[item.module].info:''"/>
        <v-text-field v-model="item.name" label="name"/>
        <div v-if="item.module" >
          <v-text-field v-for="(text, name) in modules[item.module].help" v-model="item.args[name]" :key="name" :label="name" :hint="text" persistent-hint/>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="addLine">new task</v-btn>
        <v-btn @click="()=>this.$emit('deleteLine')">delete line</v-btn>
      </v-card-actions>
    </v-card>
  </v-app>
</template>
<script>
export default {
  name: 'TaskEditor',
  props: {
    item: Object,
    modules: Object,
  },
  methods:{
    addLine() {
      const defaultLine={args:{},module:'',after:[]}
      defaultLine.trace=JSON.stringify([...JSON.parse(this.item.trace),this.item.after.length]);
      this.item.after.push(defaultLine);
    }
  }
}
</script>