// store的初始化
import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions.js'
import * as getters from './getters.js'
import state from './state.js'
import mutations from './mutations.js'
import createLogger from 'vuex/dist/logger' // 每次修改state的时候会在控制台打印，之前的状态和现在的状态

Vue.use(Vuex)   // 注册插件

// 调试工具，调用webpack编译的时候，如果说是npm run dev的话，是dev环境，如果是build的话，是生产环境，线下调试的时候，可以开启测试 
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    strict: debug,  // 开发环境开启严格模式，上线环境关闭，因为损耗性能
    plugins: debug ? [createLogger()] : []    // 打印state的值
})