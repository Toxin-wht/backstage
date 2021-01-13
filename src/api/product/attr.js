import request from '@/utils/request'
export default {
    //根据选中三级分类后获取平台属性列表
    // GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
    // attrInfoList
    getAttrList(category1Id,category2Id,category3Id){
        return request.get(`/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`)
    },
    //根据id删除某个平台属性
    // DELETE /admin/product/deleteAttr/{attrId}
    // deleteAttr
    deleteAttr(attrId){
        return request.delete(`/admin/product/deleteAttr/${attrId}`)
    },
    // 添加或者修改属性
    // POST /admin/product/saveAttrInfo
    // saveAttrInfo
    addOrUpdateAttr(attr){
        return request.post('/admin/product/saveAttrInfo',attr)
    }

    //暂时不用
    // GET /admin/product/getAttrValueList/{attrId}
    // getAttrValueList
}