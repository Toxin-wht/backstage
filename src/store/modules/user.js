import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter,constantRoutes,allAsyncRoutes,anyRoute } from '@/router'
import router from '@/router'
import cloneDeep from 'lodash/cloneDeep'
const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',

    buttons:[],
    roles:[],
    routes:[],

    overRoutes:[]
  }
}
//整理路由权限数据
function getRoutes(allAsyncRoutes,routeNames){
  let routes=allAsyncRoutes.filter(item=>{
    if(routeNames.indexOf(item.name)!== -1){
      if(item.children&&item.children.length>0){
        item.children=getRoutes(item.children,routeNames)
      }
      return true
    }
  })
  return routes
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // SET_NAME: (state, name) => {
  //   state.name = name
  // },
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar
  // }
  SET_USERINFO(state,userInfo){
    state.name=userInfo.name
    state.avatar=userInfo.avatar
    state.buttons=userInfo.buttons
    state.roles=userInfo.roles
  },
  SET_ROUTES(state,asyncRoute){
    state.routes=asyncRoute
    state.overRoutes=constantRoutes.concat(asyncRoute,anyRoute)
    //添加路由 在已有常量路由的情况下 填入动态路由
    router.addRoutes([...asyncRoute,anyRoute])
  }

}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }
        // const { name, avatar } = data
        // commit('SET_NAME', name)
        // commit('SET_AVATAR', avatar)
        commit('SET_USERINFO',data)
        commit('SET_ROUTES',getRoutes(cloneDeep(allAsyncRoutes),data.routes))
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

