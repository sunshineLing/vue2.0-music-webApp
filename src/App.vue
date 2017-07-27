<template>
  <div id="app">
    <!--1.0 header-->
    <m-header></m-header>
    <!--2.0 tab-->
    <tab></tab>
    <!--3.0 路由的出口-->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <!--4.0 played组件-->
    <player></player>
  </div>
</template>

<script type="text/ecmascript-6">
// 引入组件,驼峰写法
import MHeader from './components/m-header/m-header.vue'
import Tab from './components/tab/tab.vue'
import Player from './components/player/player.vue'

export default {
  name: 'app',
  components: {
    MHeader,
    Tab,
    Player
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  
</style>
