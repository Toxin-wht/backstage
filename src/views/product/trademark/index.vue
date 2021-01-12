<template>
  <div>
    <!-- element-ui button 按钮 -->
    <el-button type="primary" icon="el-icon-plus">添加</el-button>
    <!-- element-ui table 表单 -->
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
          <img :src="row.logoUrl" alt="" style="width:80px; heigt:80px">
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="width">
        <template slot-scope="{row}">
          <el-button type="warning" icon="el-icon-edit" size="mini">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
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
  </div>
</template>

<script>
export default {
  name: 'Trademark',
  data(){
    return{
      page:1,
      limit:3,
      trademarkList:[],
      total:0
    }
  },
  mounted(){
    this.getTrademarkList()
  },
  methods:{
    async getTrademarkList(page=1){
      this.page=page
      const result =await this.$API.trademark.getTrademarkList(this.page,this.limit)
      if(result.code===200){
        this.trademarkList=result.data.records
        this.total=result.data.total
      }
    },
    handleSizeChange(limit){
      this.limit=limit
      this.getTrademarkList()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
