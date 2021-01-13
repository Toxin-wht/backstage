<template>
  <div>
      <el-form :inline="true" :model="categoryList" class="demo-form-inline">
        <el-form-item label="一级列表">
            <el-select v-model="categoryList.category1id" placeholder="请选择" @change="category1Change">
            <el-option 
            :label="c1.name" 
            :value="c1.id"
            v-for="c1 in category1List"
            :key="c1.id"
            ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="二级列表">
            <el-select v-model="categoryList.category2id" placeholder="请选择" @change="category2Change">
            <el-option 
            :label="c2.name" 
            :value="c2.id"
            v-for="c2 in category2List"
            :key="c2.id"
            ></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="三级列表">
            <el-select v-model="categoryList.category3id" placeholder="请选择" @change="category3Change">
            <el-option 
            :label="c3.name" 
            :value="c3.id"
            v-for="c3 in category3List"
            :key="c3.id"
            ></el-option>
            </el-select>
        </el-form-item>
      </el-form>
  </div>
</template>

<script>
export default {
  name: 'CategorySelect',
  data(){
      return{
          categoryList:{
            category1id:'',
            category2id:'',
            category3id:''
          },
          category1List:[],
          category2List:[],
          category3List:[],
      }
  },
  mounted(){
      this.getCategory1List()
  },
  methods:{
      //初始化获取一级列表
      async getCategory1List(){
          const result =await this.$API.category.getCategory1()
          if(result.code===200){
            this.category1List=result.data
          }
      },
      //当一级列表发生变化 调用该函数获取二级列表
      //在每次放生变化时 清空二级列表与三级列表相关信息
      async category1Change(category1id){
          this.categoryList.category2id=''
          this.categoryList.category3id=''
          this.category2List=[]
          this.category3List=[]
          const result =await this.$API.category.getCategory2(category1id)
          if(result.code===200){
            this.category2List=result.data
          }
          this.$emit('saveCategory',category1id,1)
      },
      //当二级列表发生变化 调用该函数获取三级列表
      //在每次放生变化时 清空三级列表相关信息
      async category2Change(category2id){
          this.categoryList.category3id=''
          this.category3List=[]
          const result =await this.$API.category.getCategory3(category2id)
          if(result.code===200){
            this.category3List=result.data
          }
          this.$emit('saveCategory',category2id,2)
      },
      //当三级id放生变化
      category3Change(category3id){
        this.$emit('saveCategory',category3id,3)
      }
  }
}
</script>

<style lang="less" scoped>

</style>
