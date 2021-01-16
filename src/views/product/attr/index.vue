<template>
  <div>
    <!-- 三级联动 -->
    <el-card>
      <CategorySelect @saveCategory="saveCategory" :isShowList="isShowList"></CategorySelect>
    </el-card>
    <!-- 属性列表与添加修改属性 -->
    <el-card style="margin-top:20px">
      <!-- attr列表页-->
      <div v-show="isShowList">
        <!-- 添加按钮 -->
        <el-button type="primary" icon="el-icon-plus" @click="showAddDiv" :disabled="!category3Id">添加属性</el-button>
        <!-- attr属性列表table -->
        <el-table
          :data="attrList"
          border
          style="width: 100%">
          <el-table-column
            type="index"
            align="center"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            prop="attrName"
            label="属性名称"
            width="150">
          </el-table-column>
          <el-table-column
            label="属性值列表"
            width="width">
            <template slot-scope="{row,$index}">
              <el-tag type="success" v-for="attr in row.attrValueList" :key="attr.id">{{attr.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="150">
            <template slot-scope="{row,$index}">
              <HintButton type="warning" icon="el-icon-edit" title="修改" size="mini" @click="updateAttrValue(row)"></HintButton>
              <el-popconfirm :title="`确定删除${row.attrName}吗？`" @onConfirm="deleteAttrValue(row)">
                <HintButton 
                slot="reference" 
                type="danger" 
                icon="el-icon-delete" 
                title="删除" 
                size="mini" 
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加或者修改页 -->
      <div v-show="!isShowList">
        <el-form :model="attrForm" :inline="true">
          <el-form-item label="属性名">
            <el-input v-model="attrForm.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>

        <el-button type="primary" icon="el-icon-plus" :disabled="!attrForm.attrName" @click="addAttrValue">添加属性值</el-button>
        <el-button @click="cancelAddOrUpdate">取消</el-button>

        <el-table
          border
          :data="attrForm.attrValueList"
          style="width: 100%;margin:20px 0">
          <el-table-column
            type="index"
            align="center"
            label="序号"
            width="80">
          </el-table-column>
          <el-table-column
            label="属性值名称"
            width="width">
            <template  slot-scope="{row,$index}">
              <!-- 编辑模式 -->
              <el-input 
              :ref="$index"
              v-if="row.isEdit" 
              v-model="row.valueName" 
              size="mini" 
              placeholder="请输入属性值名称"
              @blur="toLook(row)"
              @keyup.enter.native="toLook(row)"
              ></el-input>
              <!-- 查看模式 -->
              <span v-else @click="toEdit(row,$index)" style="display:block;width:100%;height:100%">{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="width">
            <template slot-scope="{row,$index}">
              <el-popconfirm @onConfirm="attrForm.attrValueList.splice($index,1)" :title="`确定删除${row.valueName}么？`">
                <HintButton 
                slot="reference" 
                type="danger" 
                size="mini" 
                icon="el-icon-delete" 
                title="删除"></HintButton>
              </el-popconfirm>   
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" @click="save" :disabled="!attrForm.attrValueList.length">保存</el-button>
        <el-button @click="cancelAddOrUpdate">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'Attr',
  data(){
    return{
      category1Id:'',
      category2Id:'',
      category3Id:'',
      attrList:[],
      isShowList:true,//控制显示列表页或增加修改页
      attrForm:{
        attrName:'',
        attrValueList:[
          // {
          //   attrId: 0,
          //   valueName:''
          // }
        ],
        categoryId:0,
        categoryLevel:3,
      }
    }
  },
  methods:{
    //自定义事件
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
    //根据1、2、3级id获取attrList
    async getAttrList(){
      const {category1Id,category2Id,category3Id} =this
      const result =await this.$API.attr.getAttrList(category1Id,category2Id,category3Id)
      if(result.code===200){
        this.attrList=result.data
      }
    },
    //点击添加属性 显示添加修改页面
    showAddDiv(){
      this.isShowList=false
      //重置数据
      this.attrForm={
        attrName:'',
        attrValueList:[],
        categoryId:this.category3Id,
        categoryLevel:3,
      }
    },
    //点击取消 显示列表页
    cancelAddOrUpdate(){
      this.isShowList=true
    },
    //添加属性值
    addAttrValue(){
      this.attrForm.attrValueList.push({
          attrId:this.attrForm.id,
          valueName:'',//点击添加时属性值是空的 得用户自己输入 
          isEdit:true
      })
      this.$nextTick(()=>{
        this.$refs[this.attrForm.attrValueList.length-1].focus()
      })
    },
    //点击修改
    updateAttrValue(row){
      this.isShowList=false
      this.attrForm=cloneDeep(row)
      //为每一个属性添加模式标识 添加响应式数据标识
      this.attrForm.attrValueList.forEach(item=>{
        this.$set(item,'isEdit',false)
      })
    },
    //input框失去焦点或回车
    toLook(row){
      // 确保不是空值
      let valueName=row.valueName.trim()
      if(!valueName){
        this.$message.error('不能输入空值')
        row.valueName=''
        return
      }
      // 不能重复
      let isRepeat=this.attrForm.attrValueList.some(item=>{
        if(item !== row){
          return item.valueName === valueName
        }
      })
      if(isRepeat){
        this.$message.error('不能输入重复值')
        row.valueName=''
        return
      }
      row.isEdit=false
    },
    //点击span进入编辑模式
    toEdit(row,index){
      row.isEdit=true
      //代表在页面的最近一次更新完成之后执行回调
      this.$nextTick(()=>{
        this.$refs[index].focus()
      })

    },
    //点击保存的回调
    async save(){
      //1.收集整理数据
      let attr = this.attrForm
      attr.attrValueList=attr.attrValueList.filter(item=>{
        //剔除属性值名称为空的
        if(item.valueName!==''){
          //并删除isEdit自定义属性
          delete item.isEdit
          return true
        }
      })
      //属性值列表如果没有属性值，不发请求
      if(attr.attrValueList.length===0){
        this.$message.info('属性必须要有属性值')
        return
      }
      //2.发送请求
      try {
        //成功
        await this.$API.attr.addOrUpdateAttr(attr)
        this.$message.success('保存成功')
        this.isShowList=true
        this.getAttrList()
      } catch (error) {
        //失败
        this.$message.error('保存失败')
      }
      
      
      
    },
    //点击删除
    async deleteAttrValue(row){
      try {
        await this.$API.attr. deleteAttr(row.id)
        this.$message.success('删除成功')
        this.getAttrList()
      } catch (error) {
        this.$message.error('删除失败')
      }
      
    }

  }
}
</script>

<style lang="scss" scoped>

</style>
