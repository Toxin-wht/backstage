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
              <HintButton type="info" @click="showSku(row)" icon="el-icon-info" size="mini" title="查看SKU列表"></HintButton>
              <el-popconfirm :title="`确定删除${row.spuName}吗？`" @onConfirm="deleteSpu(row)">
                <HintButton type="danger" slot="reference" icon="el-icon-delete" size="mini" title="删除SPU"></HintButton>
              </el-popconfirm>
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
      <SkuForm v-show="isShowSku" ref="skuForm" :visible.sync="isShowSku"></SkuForm>
      <!-- spu -->
      <SpuForm 
      v-show="isShowSpu" 
      :visible.sync="isShowSpu" 
      ref="spuForm"
      @successBack="successBack"
      @cancelBack="cancelBack"
      ></SpuForm>
      <!-- 查看sku的dialog -->
      <el-dialog :title="`${spu.spuName}===>SKU列表`" :before-close="beforeClose" :visible.sync="dialogTableVisible">
        <el-table :data="skuList" v-loading="loading">
          <el-table-column prop="skuName" label="名称" width="150"></el-table-column>
          <el-table-column prop="price" label="价格(元)" width="200"></el-table-column>
          <el-table-column prop="weight" label="重量(KG)"></el-table-column>
          <el-table-column  label="默认图片" width="200">
            <template slot-scope="{row,$index}">
              <img :src="row.skuDefaultImg" alt="" style="width:60px;height:80px">
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import SkuForm from '../components/SkuForm'
import SpuForm from '../components/SpuForm'
export default {
  name: 'Spu',
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
      isShowSpu:false,
      //dialog  的显示隐藏
      dialogTableVisible:false,
      spu:{},
      skuList:[],
      loading:false
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
        this.total=0
      }else if(level===2){
        this.category2Id=categoryId
        this.category3Id=''
        this.spuList=[]
        this.total=0
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
      this.$refs.spuForm.initAddDate(this.category3Id)
    },
    //点击修改SPU
    updateSpu(row){
      this.flag=row.id//添加标识数据
      this.isShowSpu=true
      this.$refs.spuForm.initUpdateData(row)
    },
    //点击添加SKU
    showAddSku(row){
      this.isShowSku=true
      this.$refs.skuForm.initAddData(row,this.category1Id,this.category2Id)
    },
    //成功返回
    successBack(){
      if (this.flag) {
        this.getSpuList(this.page)
      }else{
        this.getSpuList()
      }
      this.flag=null//清空标识数据
    },
    //取消返回
    cancelBack(){
      this.flag=null
    },
    // 删除SPU
    async deleteSpu(row){
      try {
        await this.$API.spu.remove(row.id)
        this.$message.success('删除成功')
        this.getSpuList(this.spuList.length>1?this.page:this.page-1)
      } catch (error) {
        this.$message.error('删除失败')
      }
      
    },
    //查看SKU列表
    async showSku(row){
      this.spu=row
      this.dialogTableVisible=true
      this.loading=true//开始加载
      const result =await this.$API.sku.getListBySpuId(row.id)
      if (result.code===200) {
        this.skuList=result.data
        this.loading=false//停止加载
      }
    },
    //dialog关闭前
    beforeClose(){
      this.skuList=[]//清空数据
      this.loading=false//停止加载
      this.dialogTableVisible=false//关闭dialog
    }
  },
  //关于三级联动的可操作性处理
  watch:{
    isShowSku(newValue,oldValue){
      this.isShowList=oldValue
    },
    isShowSpu(newValue,oldValue){
      this.isShowList=oldValue
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
