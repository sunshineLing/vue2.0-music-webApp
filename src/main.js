import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router' // 从router文件夹里面导出来的
import store from './store' // 引入vuex的store
import VueLazyload from 'vue-lazyload'
import fastclick from 'fastclick'

// 使用vue插件
Vue.use(VueLazyload, {
  loading: require('common/image/default.png') // 加载时候显示的图片，vue会自动转化为base64格式的图片
})

import './common/stylus/index.styl'

fastclick.attach(document.body) // 将fastclick绑定在body上，整个body都没有300ms延时

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
