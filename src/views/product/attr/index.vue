<template>
  <div>
    <el-card>
      <CategorySelect @saveCategory="saveCategory"></CategorySelect>
    </el-card>
    <el-card style="margin-top:20px"></el-card>
  </div>
</template>

<script>
export default {
  name: 'Attr',
  data(){
    return{
      category1Id:'',
      category2Id:'',
      category3Id:'',
      attrList:[]
    }
  },
  methods:{
    saveCategory(categoryId,level){
      //判断id等级 当每次1级id更新时 清空2、3级id一级attr列表
      if(level===1){
        this.category1Id=categoryId
        this.category2Id=''
        this.category3Id=''
        this.attrList=[]
        //判断id等级 当每次2级id更新时 清空3级id一级attr列表
      }else if(level===2){
        this.category2Id=categoryId
        this.category3Id=''
        this.attrList=[]
      }else{
        //判断id等级 当每次3级id更新时 请求attr
        this.category3Id=categoryId
        this.getAttrList()
      }
    },
    async getAttrList(){
      const {category1Id,category2Id,category3Id} =this
      const result =await this.$API.attr.getAttrList(category1Id,category2Id,category3Id)
      if(result.code===200){
        this.attrList=result.data
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
