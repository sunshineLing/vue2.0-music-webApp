import Vue from 'vue'
import VueRouter from 'vue-router'

// 引入组件
import Rank from '../components/rank/rank.vue'
import Recommend from '../components/recommend/recommend.vue'
import Singer from '../components/singer/singer.vue'
import Search from '../components/search/search.vue'
import SingerDetail from '../components/singer-detail/singer-detail.vue'
import Disc from '../components/disc/disc.vue'
import TopList from '../components/top-list/top-list.vue'

Vue.use(VueRouter)

export default new VueRouter({
    routes: [
        {   // 给根配置路径，重定向
            path: '/',
            redirect: '/recommend'
        },
        {
            path: '/recommend',
            component: Recommend,
            children: [
                {
                    path: ':id',
                    component: Disc
                }
            ]
        },
        {
            path: '/singer',
            component: Singer,
            // 配置子组件,也是一个树状结构，可以有多个子组件
            children: [
                {
                    path: ':id', // 表示以id为变量的路由，可以传递多个值
                    component: SingerDetail // 子组件歌手详情
                }
            ]
        },
        {
            path: '/rank',
            component: Rank,
            children: [
                {
                    path: ':id',
                    component: TopList
                }
            ]
        },
        {
            path: '/search',
            component: Search,
            // 配置子组件,也是一个树状结构，可以有多个子组件
            children: [
                {
                    path: ':id', // 表示以id为变量的路由，可以传递多个值
                    component: SingerDetail // 子组件歌手详情
                }
            ]
        }
    ]
})