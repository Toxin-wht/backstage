<template>
    <el-tooltip :content="title" placement="top-start">
      <el-button v-bind="$attrs" v-on="$listeners"></el-button>
    </el-tooltip>
</template>

<script>
export default {
  name: 'HintButton',
  props:['title'],
//   mounted(){
//       console.log(this.$attrs,this.$listeners);
//   }
}
</script>

<style lang="less" scoped>

</style>
