<template>
  <div>
    <el-form :model="skuForm" label-width="100px">
      <el-form-item label="SPU名称">{{spu.spuName}}</el-form-item>
      <!-- sku名称 -->
      <el-form-item label="SKU名称">
        <el-input v-model="skuForm.skuName" placeholder="SKU名称"></el-input>
      </el-form-item>
      <!-- 价格 -->
      <el-form-item label="价格(元)">
        <el-input v-model="skuForm.price" placeholder="SKU价格" type="number"></el-input>
      </el-form-item>
      <!-- 质量 -->
      <el-form-item label="质量(千克)">
        <el-input v-model="skuForm.weight" placeholder="SKU重量" type="number"></el-input>
      </el-form-item>
      <!-- 规格描述 -->
      <el-form-item label="规格描述">
        <el-input v-model="skuForm.skuDesc" placeholder="SKU规格描述" type="textarea" rows="4"></el-input>
      </el-form-item>
      <!-- 平台属性 -->
      <el-form-item label="平台属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item :label="attr.attrName" v-for="attr in attrList" :key="attr.id">
            <el-select v-model="attr.attrIdValue" placeholder="请选择">
              <el-option :label="atValue.valueName" :value="`${attr.id}:${atValue.id}`" v-for="atValue in attr.attrValueList" :key="atValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <!-- 销售属性 -->
      <el-form-item label="销售属性">
        <el-form :inline="true" label-width="100px">
          <el-form-item :label="sale.saleAttrName" v-for="sale in spuSaleAttrList" :key="sale.id">
            <el-select v-model="sale.saleIdValue" placeholder="请选择">
              <el-option :label="saleValue.saleAttrValueName" :value="`${sale.id}:${saleValue.id}`" v-for="saleValue in sale.spuSaleAttrValueList" :key="saleValue.id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <!-- 图片列表 -->
      <el-form-item label="图片列表">
        <el-table
          :data="spuImageList"
          border
          @selection-change="handleSelectionChange"
          style="width: 100%">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <el-table-column
            label="图片"
            width="width">
            <template slot-scope="{row,$index}">
              <img :src="row.imgUrl" alt="" style="width:100px;height:100px">
            </template>
          </el-table-column>
          <el-table-column
            prop="imgName"
            label="名称"
            width="width">
          </el-table-column>
          <el-table-column
            label="操作"
            width="width">
            <template slot-scope="{row,$index}">
              <el-button v-if="row.isDefault==='0'" type="primary" size="mini" @click="setDefault(row)">设为默认</el-button>
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <!-- 保存取消按钮 -->
      <el-form-item>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SkuForm',
  data(){
    return{
      skuForm:{  
        tmId: 0,
        category3Id: 0,
        spuId:0,

        skuName:'',
        price: '',
        skuDesc:'',
        weight:'',

        skuDefaultImg:'',
        skuAttrValueList:[
        //   {
        //     "attrId": 0,
        //     "attrName": "string",
        //     "id": 0,
        //     "skuId": 0,
        //     "valueId": 0,
        //     "valueName": "string"
        //   }
        ],
        skuImageList:[
        //   {
        //     "id": 0,
        //     "imgName": "string",
        //     "imgUrl": "string",
        //     "isDefault": "string",
        //     "skuId": 0,
        //     "spuImgId": 0
        //   }
        ],
        skuSaleAttrValueList:[
        //   {
        //     "id": 0,
        //     "saleAttrId": 0,
        //     "saleAttrName": "string",
        //     "saleAttrValueId": 0,
        //     "saleAttrValueName": "string",
        //     "skuId": 0,
        //     "spuId": 0
        //   }
        ],
      },
      //父组件传来的spu对象
      spu:{},
      //初始化获取数据
      attrList:[],
      spuSaleAttrList:[],
      spuImageList:[],
      //table选中图片
      checkedImgList:[]
    }
  },
  methods:{
    //初始化获取数据
    async initAddData(spu,category1Id,category2Id){
      this.spu=spu
      //根据三级分类id获取平台属性的分页列表
      //http://localhost:9529/dev-api/admin/product/attrInfoList/2/13/61
      const promise1=this.$API.attr.getAttrList(spu.category3Id,category1Id,category2Id)
      //获取指定SPU的id对应的销售属性列表
      //http://localhost:9529/dev-api/admin/product/spuSaleAttrList/4
      const promise2=this.$API.sku.getSpuSaleAttrList(spu.id)
      //获取指定SPU的id对应的图片列表
      //http://localhost:9529/dev-api/admin/product/spuImageList/4
      const promise3=this.$API.sku.getSpuImageList(spu.id)

      const result =await Promise.all([promise1,promise2,promise3])
      this.attrList=result[0].data
      this.spuSaleAttrList=result[1].data
      let imgList=result[2].data
      imgList.forEach(item=>{
        item.isDefault='0'
      })
      this.spuImageList=imgList
    },
    //选择table点击框回调
    handleSelectionChange(val){
      this.checkedImgList=val//收集选中图片的数组
    },
    //设置默认图片
    setDefault(row){
      //排它
      this.spuImageList.forEach(item=>item.isDefault='0')
      row.isDefault='1'
      //收集默认图片
      this.skuForm.skuDefaultImg=row.imgUrl
    },
    //点击保存
    async save(){
      let {skuForm,spu,attrList,spuSaleAttrList,checkedImgList} = this
      //整理spu数据
      skuForm.tmId=spu.tmId
      skuForm.category3Id=spu.category3Id
      skuForm.spuId=spu.id
      //整理平台属性 数组reduce统计出一个标准格式的数组   
      skuForm.skuAttrValueList=attrList.reduce((prev,item)=>{
        if (item.attrIdValue) {
          let [attrId,valueId] =item.attrIdValue.split(':')
          let obj={
            attrId,
            valueId
          }
          prev.push(obj)
        }
        return prev
      },[])
      //整理销售属性
      skuForm.skuSaleAttrValueList=spuSaleAttrList.reduce((prev,item)=>{
        if (item.saleIdValue) {
          let [saleAttrId,saleAttrValueId] =item.saleIdValue.split(':')
          let obj={
            saleAttrId,
            saleAttrValueId
          }
          prev.push(obj)
        }
        return prev
      },[])
      //整理图片
      skuForm.skuImageList=checkedImgList.map(item=>{
        return{
          imgName:item.imgName,
          imgUrl:item.imgUrl,
          isDefault:item.isDefault,
          spuImgId:item.id
        }
      })
      //发请求
      try {
        await this.$API.sku.addUpdate(skuForm)
        this.$message.success('保存成功')
        this.$emit('update:visible',false)//切回页面
        this.resetData()//清空数据
      } catch (error) {
        this.$message.error('保存失败')
      }
      
    },
    //点击取消
    cancel(){
      this.$emit('update:visible',false)
      this.resetData()
    },
    //清空数据
    resetData(){
      this.skuForm={  
        tmId: 0,
        category3Id: 0,
        spuId:0,

        skuName:'',
        price: '',
        skuDesc:'',
        weight:'',

        skuDefaultImg:'',
        skuAttrValueList:[],
        skuImageList:[],
        skuSaleAttrValueList:[],
      },
      //父组件传来的spu对象
      this.spu={},
      //初始化获取数据
      this.attrList=[],
      this.spuSaleAttrList=[],
      this.spuImageList=[],
      //table选中图片
      this.checkedImgList=[]
    }
  }
}
</script>

<style lang="less" scoped>

</style>
