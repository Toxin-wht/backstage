<template>
  <div>
    <el-card>
      <CategorySelect @saveCategory="saveCategory" :isShowList="isShowList"></CategorySelect>
    </el-card>
    <el-card style="margin-top:20px">
      <!-- 列表页 -->
      <div v-show="!isShowSku && !isShowSpu">
        <el-button type="primary" icon="el-icon-plus" @click="showAddSpu">添加SPU</el-button>
        <el-table
          :data="spuList"
          border
          style="width: 100%">
          <el-table-column
            type="index"
            align="center"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            prop="spuName"
            label="SPU名称"
            width="width">
          </el-table-column>
          <el-table-column
            prop="description"
            label="SPU描述"
            width="width">
          </el-table-column>
          <el-table-column
            prop="prop"
            label="操作"
            width="width">
            <template slot-scope="{row,$index}">
              <HintButton type="primary" @click="showAddSku(row)" icon="el-icon-plus" size="mini" title="添加SKU"></HintButton>
              <HintButton type="warning" @click="updateSpu(row)" icon="el-icon-edit" size="mini" title="修改SPU"></HintButton>
              <HintButton type="info" icon="el-icon-info" size="mini" title="查看SKU列表"></HintButton>
              <HintButton type="danger" icon="el-icon-delete" size="mini" title="删除SPU"></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="getSpuList"
          style="text-align:center"
          :current-page="page"
          :page-sizes="[2,3,4]"
          :page-size="limit"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total">
        </el-pagination>
      </div>
      <!-- sku -->
      <SkuForm v-show="isShowSku"></SkuForm>
      <!-- spu -->
      <SpuForm v-show="isShowSpu"></SpuForm>
    </el-card>
  </div>
</template>

<script>
import SkuForm from '../components/SkuForm'
import SpuForm from '../components/SpuForm'
export default {
  name: '',
  components:{
    SpuForm,
    SkuForm
  },
  data(){
    return{
      isShowList:true,//单纯用于三级联动的可操作性设置 防止报错
      category1Id:'',
      category2Id:'',
      category3Id:'',
      page:1,
      limit:3,
      total:0,
      spuList:[],
      // 控制页面显示
      isShowSku:false,
      isShowSpu:false
    }
  },
  methods:{
    //自定义事件
    saveCategory(categoryId,level){
      if(level===1){
        this.category1Id=categoryId
        this.category2Id=''
        this.category3Id=''
        this.spuList=[]
      }else if(level===2){
        this.category2Id=categoryId
        this.category3Id=''
        this.spuList=[]
      }else{
        this.category3Id=categoryId
        this.getSpuList()
      }
    },
    //初始化获取数据
    async getSpuList(pager=1){
      this.page=pager
      const result =await this.$API.spu.getList(this.page,this.limit,this.category3Id)
      if(result.code===200){
        this.total=result.data.total
        this.spuList=result.data.records
      }
    },
    //切换每页数据数量
    handleSizeChange(limit){
      this.limit=limit
      this.getSpuList()
    },
    //点击添加SPU
    showAddSpu(){
      this.isShowSpu=true
    },
    //点击修改SPU
    updateSpu(row){
      this.isShowSpu=true
    },
    //点击添加SKU
    showAddSku(row){
      this.isShowSku=true
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
