import request from '@/utils/request'

export default {
// DELETE /admin/product/baseTrademark/remove/{id}
// 删除BaseTrademark
    deleteTrademark(id){
        return request.delete(`/admin/product/baseTrademark/remove/${id}`)
    },

// POST /admin/product/baseTrademark/save
// 新增BaseTrademark

// PUT /admin/product/baseTrademark/update
// 修改BaseTrademark

    addOrUpdateTrademark(tradeInfo){
        //判断tradeinfo中是否含有id id是添加数据成功后 后台服务器自动加的 有id就是修改 没有id就是增加
        if(tradeInfo.id){
            return request.put('/admin/product/baseTrademark/update',tradeInfo)
        }else{
            return request.post('/admin/product/baseTrademark/save',tradeInfo)
        }
    },

// GET /admin/product/baseTrademark/{page}/{limit}
// 分页列表
    getTrademarkList(page,limit){
        return request.get(`/admin/product/baseTrademark/${page}/${limit}`)
    }
}