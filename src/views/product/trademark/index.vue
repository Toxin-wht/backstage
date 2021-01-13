<template>
  <div>
    <!-- element-ui button 按钮 -->
    <el-button type="primary" icon="el-icon-plus" @click="showDialog">添加</el-button>
    <!-- element-ui table 表格 -->
    <!-- element-ui table 表格 
    不同于原生，他是按列排的，且每列都暗含隐式遍历 
    ：data绑定动态显示数据
    prop绑定该列所要展示的数据内的属性
    type=index 是展示序号列 可以自动排序
    align="center"居中显示
    width写具体值就是像素 不写就是平分
    -->
   <el-table
    :data="trademarkList"
    border 
    style="width: 100%; margin:20px 0 ">
      <el-table-column
        type="index"
        label="序号"
        align="center"
        width="100">
      </el-table-column>
      <el-table-column
        prop="tmName"
        label="品牌名称"
        width="width">
      </el-table-column>
      <!-- prop="logoUrl" -->
      <el-table-column
        label="品牌LOGO"
        width="width">
        <template slot-scope="{row}">
          <img :src="row.logoUrl" alt="" style="width:80px; height:80px">
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="width">
        <template slot-scope="{row}">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateTrademark(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteTrademark(row)">删除</el-button>
        </template>
      </el-table-column>
   </el-table>
    <!-- element-ui pagination分页器 -->

    <el-pagination
      style="text-align:center"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
      :current-page="page"
      :page-sizes="[3,5,7]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total">
    </el-pagination>

    <!-- 嵌套表单的dialog -->
    <el-dialog :title="tmForm.id?'修改品牌':'添加品牌'" :visible.sync="dialogFormVisible">
      <el-form :model="tmForm" ref="myForm" :rules="rules" style="width:80%">
        <el-form-item label="品牌名称"  prop="tmName" label-width="100px">
          <el-input v-model="tmForm.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" prop="logoUrl" label-width="100px">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="tmForm.logoUrl" :src="tmForm.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过2mb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Trademark',
  data(){
    var validatePass=(rule, value, callback)=>{
      if(value.length<2 || value.length>10){
        callback(new Error('名称长度2-10个字符'))
      }else{
        callback()
      }
    }
    return{
      page:1,
      limit:3,
      trademarkList:[],
      total:0,
      dialogFormVisible:false,
      tmForm:{
        tmName:'',
        logoUrl:''
      },
      rules: {
        tmName: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          // { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' },
          //自定义表单验证
          { validator: validatePass, trigger: 'blur' }
        ],
        logoUrl: [
          { required: true, message: '请选择品牌LOGO', trigger: 'change' }
        ],
      }
    }
  },
  mounted(){
    //初始化获取数据
    this.getTrademarkList()
  },
  methods:{
    //初始化获取trademarkList和total数据
    async getTrademarkList(page=1){
      this.page=page
      const result =await this.$API.trademark.getTrademarkList(this.page,this.limit)
      if(result.code===200){
        this.trademarkList=result.data.records
        this.total=result.data.total
      }
    },
    //pagination输入跳转回调
    handleSizeChange(limit){
      this.limit=limit
      this.getTrademarkList()
    },
    //上传品牌LOGO成功回调
    handleAvatarSuccess(res, file) {
      // this.imageUrl = URL.createObjectURL(file.raw);
      //将上传图片接口改为真实接口 并保存图片的网络地址路径
      console.log(res);
      this.tmForm.logoUrl=res.data
    },
    //上传图片前的回调
    beforeAvatarUpload(file) {
      const imageArr=['image/jpeg','image/png']
      // const isJPG = file.type === 'image/jpeg';
      const isJpgOrPng = imageArr.indexOf(file.type) !== -1
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJpgOrPng) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJpgOrPng && isLt2M;
    },
    //显示dialog框
    showDialog(){
      this.dialogFormVisible=true
      this.tmForm={
        tmName:'',
        logoUrl:''       
      }
    },
    //修改品牌回调
    updateTrademark(row){
      this.dialogFormVisible=true
      //这里不能直接赋值 直接赋值其实是赋值的同一数据地址 
      //在dialog框中修改数据 展示数据也会更改
      //所以要用拷贝 row中全是基本数据类型 所以哪种拷贝方式都可以
      this.tmForm={...row}
    },
    //点击确定后 新增或修改品牌的回调
    addOrUpdateTrademark(){
      //整体表单验证
       this.$refs.myForm.validate(async (valid) => {
          if (valid) {
            // 1、获取收集好的参数数据
            // 2、整理收集好的参数数据
            let tradeInfo = this.tmForm
            // 3、发送请求
            try {
              // 4、成功干啥
              await this.$API.trademark.addOrUpdateTrademark(tradeInfo)
              //根据对象中是否存在id进行信息提示
              this.$message.success(tradeInfo.id?'修改成功':'新增成功')
              this.dialogFormVisible = false
              //如果是修改 则停在当前页 如果是新增 则跳转至第一页
              this.getTrademarkList(tradeInfo.id?this.page:1)
            } catch (error) {
              // 5、失败干啥  
              this.$message.error(tradeInfo.id?'修改失败':'新增失败')      
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
    },
    //删除商品
    deleteTrademark(row){
      this.$confirm(`确定删除${row.tmName}么?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {//点击确定的回调
        try {
          //发送请求删除相关商品
          const result =await this.$API.trademark.deleteTrademark(row.id)
          if(result.code===200){
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            //删除成功后 重新获取列表 如果当前页商品数大于1 那么就停在当前页
            //如果当前页商品数小于1，删除成功后跳转至上一页
            this.getTrademarkList(this.trademarkList.length>1?this.page:this.page-1)
          } 
        } catch (error) {
          this.$message.error('删除失败')
        }   
      }).catch(() => {//点击取消的回调
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    }
  }
}
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>