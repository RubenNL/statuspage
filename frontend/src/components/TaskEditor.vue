<template>
  <v-app>
    Output:
    <pre><code>{{item.response}}</code></pre>
    <v-card>
      <v-card-text>
        <v-select v-model="item.module" :items="Object.keys(modules)" persistent-hint :hint="item.module?modules[item.module].info:''"/>
        <v-text-field v-model="item.name" label="name"/>
        <div v-if="item.module" >
          <div v-for="(value, name) in modules[item.module].help" :key="name">
            <v-text-field v-if="value.type?value.type==='text':true" v-model="item.args[name]" :key="name" :label="name" :hint="`${value.hint?value.hint:value}`" persistent-hint/>
            <v-text-field v-if="value.type==='number'" :rules="[v => /[0-9]/.test(v) || 'Numbers only']" :label="name" :hint="value.hint" persistent-hint/>
            <v-text-field v-if="value.type==='port'" :rules="[
                v => /[0-9]/.test(v) || 'Numbers only',
                v => v<65566 || 'too high number',
                v => v>0 || 'port number too low']" :label="name" :hint="value.hint" v-model="item.args[name]" persistent-hint min="1" max="65565" type="number"/>
            <v-text-field v-if="value.type==='ip'" :rules="[v=>/^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/.test(v)||'invalid IP']" :label="name" :hint="value.hint" persistent-hint/>
            <v-select v-if="value.type==='select'" :items="value.items" :label="name" :hint="value.hint" v-model="item.args[name]" persistent-hint/>
          </div>
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