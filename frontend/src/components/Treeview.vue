<template>
  <v-treeview
      v-if="items.length"
      :items="items"
      activatable
      transition
      item-children="after"
      item-key="trace"
      :active.sync="active"
      return-object
      :open="open"
  >
  <template v-slot:prepend="{ item }">
    <v-icon v-if="item.status==='ERROR'">mdi-alert-circle</v-icon>
    <v-icon v-else-if="item.childError">mdi-alert-circle-outline</v-icon>
    <v-progress-circular indeterminate v-else-if="item.status==='STARTED'"/>
    <v-icon v-else-if="item.status==='PENDING'">mdi-timer-sand</v-icon>
    <v-icon v-else-if="item.status==='SUCCESS'">mdi-check</v-icon>
    <v-icon v-else-if="item.status==='CANCELLED'">mdi-minus-circle-outline</v-icon>
  </template>
  <template v-slot:label="{ item }">
    {{item.name || (item.data?item.data.name:"new module")}}
  </template>
  </v-treeview>
</template>
<script>
export default {
  name: 'Treeview',
  props: {
    items: Array,
    open: Array,
  },
  data() {
    return {
      active: [],
    }
  },
  watch: {
    active: function(active){
      this.$emit('active',active)
    }
  }
}
</script>