<template>
  <div>
    <el-form :model="spuForm" label-width="100px">
      <!-- 输入框 -->
      <el-form-item label="SPU名称">
        <el-input v-model="spuForm.spuName" placeholder="SPU名称"></el-input>
      </el-form-item>
      <!-- select框 -->
      <el-form-item label="品牌">
        <el-select v-model="spuForm.tmId" placeholder="请选择品牌">
          <el-option :label="tk.tmName" :value="tk.id" v-for="tk in trademarkList" :key="tk.id"></el-option>
        </el-select>
      </el-form-item>
      <!-- textarea -->
      <el-form-item label="SPU描述">
        <el-input v-model="spuForm.description" type="textarea" rows="4" placeholder="SPU描述"></el-input>
      </el-form-item>
      <!-- 照片墙 -->
      
      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleAvatarSuccess"
          :file-list="spuImageList"
          >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>
      <!-- 销售属性 -->
      <el-form-item label="销售属性">
        <!-- 下拉框 -->
        <el-select v-model="SaleAttrIdName" :placeholder="unCheckedSaleAttrValueList.length>0?`还有${unCheckedSaleAttrValueList.length}个未选择`:'没有了'">
          <el-option :label="un.name" :value="`${un.id}:${un.name}`" v-for="un in unCheckedSaleAttrValueList" :key="un.id"></el-option>
        </el-select>
        <!-- 按钮 -->
        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr" :disabled="!SaleAttrIdName">添加销售属性</el-button>
        <!-- table -->
        <el-table
          :data="spuForm.spuSaleAttrList"
          border
          style="width: 100%;margin:20px 0">
          <el-table-column
            type="index"
            align="center"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            prop="saleAttrName"
            label="属性名"
            width="150">
          </el-table-column>
          <el-table-column
            prop="prop"
            label="属性值名称列表"
            width="width">
            <template slot-scope="{row,$index}">
              <!--  -->
              <el-tag
                :key="sav.id"
                v-for="(sav,index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index,1)"
              >
                {{sav.saleAttrValueName}}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="row.inputVisible"
                v-model="row.inputValue"
                ref="saveTagInput"
                size="small" 
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)" 
                placeholder="名称"
              >
              </el-input>
              
              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)" >+添加</el-button>
            </template>
          </el-table-column>
          <el-table-column
            prop="prop"
            label="操作"
            width="150">
            <template slot-scope="{row,$index}">
              <HintButton  
              type="danger" 
              icon="el-icon-delete" 
              size="mini" 
              title="删除"
              @click="spuForm.spuSaleAttrList.splice($index,1)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
        <!-- 按钮 -->
        <el-button type="primary">保存</el-button>
        <el-button @click="$emit('update:visible',false)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SpuForm',
  data(){
    return{
      spuForm:{
        spuName:'',//品牌名称
        tmId:'',//品牌ID
        description:'',//SPU描述
        category3Id:0,
        spuImageList:[
        //   {
        //     "id": 0,
        //     "imgName": "string",
        //     "imgUrl": "string",
        //     "spuId": 0
        //   }
        ],  
        spuSaleAttrList:[
        //   {
        //     "baseSaleAttrId": 0,
        //     "saleAttrName": "string",
        //     "spuSaleAttrValueList": [
        //       {
        //         "baseSaleAttrId": 0,
        //         "isChecked": "string",
        //         "saleAttrName": "string",
        //         "saleAttrValueName": "string",
        //       }
        //     ]
        //   }
        ],  
      },
      //照片墙所用数据
      dialogImageUrl: '',
      dialogVisible: false,
      //销售属性
      SaleAttrIdName:'',

      spuImageList:[],//图片列表
      trademarkList:[],//品牌列表
      saleAttrList:[],//所有销售属性列表

    }
  },
  methods:{
    //添加--初始化获取数据
    async initAddDate(){
      //http://localhost:9528/dev-api/admin/product/baseTrademark/getTrademarkList 获取所有的品牌列表数据
      const trademarkResult=await this.$API.trademark.getList()
      if (trademarkResult.code===200) {
        this.trademarkList=trademarkResult.data
      }
      //http://localhost:9528/dev-api/admin/product/baseSaleAttrList 获取spu所有的销售属性数据
      const saleAttrResult=await this.$API.spu.getSaleAttrList()
      if (saleAttrResult.code===200) {
        this.saleAttrList=saleAttrResult.data
      }
    },
    //修改--初始化获取数据
    async initUpdateData(spu){
      //http://localhost:9528/dev-api/admin/product/getSpuById/4 获取spu的详情
      const result=await this.$API.spu.get(spu.id)
      if(result.code===200){
        this.spuForm=result.data
      }
      //http://localhost:9528/dev-api/admin/product/spuImageList/4 获取spu的图片列表数据
      const imgResult=await this.$API.sku.getSpuImageList(spu.id)
      if(imgResult.code===200){
        let imgList=imgResult.data
        imgList.forEach(item=>{
          item.url=item.imgUrl
          item.name=item.imgName
        })
        this.spuImageList=imgList
      }
      //http://localhost:9528/dev-api/admin/product/baseTrademark/getTrademarkList 获取所有的品牌列表数据
      const trademarkResult=await this.$API.trademark.getList()
      if (trademarkResult.code===200) {
        this.trademarkList=trademarkResult.data
      }
      //http://localhost:9528/dev-api/admin/product/baseSaleAttrList 获取spu所有的销售属性数据
      const saleAttrResult=await this.$API.spu.getSaleAttrList()
      if (saleAttrResult.code===200) {
        this.saleAttrList=saleAttrResult.data
      }

    },
    //图片墙删除图片回调
    handleRemove(file, fileList) {
      this.spuImageList=fileList//删除照片后 收集剩余照片
    },
    //预览大图的回调
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    //上传图片成功回调
    handleAvatarSuccess(response, file, fileList){
      this.spuImageList=fileList
    },
    //添加销售属性
    addSaleAttr(){
      let [baseSaleAttrId,saleAttrName] = this.SaleAttrIdName.split(':')
      let obj={
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      }
      this.spuForm.spuSaleAttrList.push(obj)
      this.SaleAttrIdName=''
    },
    //点击添加BUTTON
    showInput(row){
      this.$set(row,'inputVisible',true)
      this.$nextTick(()=>{
        this.$refs.saveTagInput.focus()
      })  
    },
    //回车与失去焦点事件
    handleInputConfirm(row){
      let saleAttrValueName=row.inputValue
      //校验
      if (saleAttrValueName.trim()==='') {
        row.inputValue=''
        return
      }
      let isRepeat =row.spuSaleAttrValueList.some(item=>{
        return saleAttrValueName===item.saleAttrValueName
      })
      if (isRepeat) {
        this.$message.info('不能重复')
        row.inputValue=''
        return
      }
      //整理数据 添加到属性值列表中
      let obj={saleAttrValueName}
      row.spuSaleAttrValueList.push(obj)
      //清空输入框内容
      row.inputValue=''
      //将input变为button
      row.inputVisible=false
    }

  },
  computed:{
    //剩余未选择项目数
    unCheckedSaleAttrValueList(){
      return this.saleAttrList.filter(allItem=>{
        return this.spuForm.spuSaleAttrList.every(item=>{
          return item.saleAttrName!==allItem.name
        })
      })
    }     
  }
}
</script>

<style>
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
