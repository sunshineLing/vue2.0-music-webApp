<template>
    <div class="singer" ref="singer">
        <list-view @select="selectSinger" :data="singerList" ref="listView"></list-view>
        <!--承载子路由歌手详情,挂在子路由-->
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
    import {getSingerList} from '../../api/singer.js'
    import {ERR_OK} from '../../api/config.js'
    import Singer from '../../common/js/singer.js'
    import ListView from '../../base/listview/listview.vue'
    import {mapMutations} from 'vuex'
    import {playListMixin} from '../../common/js/mixin.js'

    const HOT_NAME = '热门'
    const HOT_SINGER_LEN = 10   // 热门分类歌手的条数

    export default {
        mixins: [playListMixin],
        data () {
            return {
                singerList: []
            }
        },
        created () {
            this.getSingerListData()
        },
        methods: {
            // 1.0 获取歌手列表数据
            getSingerListData () {
                getSingerList().then(res => {
                    if (res.code === ERR_OK) {
                        // 歌手列表需要先做处理，排序
                        this.singerList = this._normalizeSinger(res.data.list)
                    }
                })
            },
            // 2.0 处理歌手列表
            _normalizeSinger (list) {
                // 有两类数据，第一类hot，第二类按字母归类的
                let map = {
                    hot: {
                        title: HOT_NAME,
                        items: []
                    }
                }
                list.forEach((item, index) => {
                    // 2.1 填充hot的items数据
                    if (index < HOT_SINGER_LEN) {
                        map.hot.items.push(new Singer({ // es6创建类的方法
                            id: item.Fsinger_id,
                            name: item.Fsinger_name,
                            mid: item.Fsinger_mid
                        }))
                    }
                    // 2.2 设置一个以字母开头的对象，每一个对象下面有一个items
                    const key = item.Findex
                    if (!map[key]) {
                        map[key] = {
                            title: key,
                            items: []
                        }
                    }
                    // 2.3 填充items的数据
                    map[key].items.push(new Singer({
                        id: item.Fsinger_id,
                        name: item.Fsinger_name,
                        mid: item.Fsinger_mid
                    }))
                })
                // 2.4 为了得到有序列表，需要处理map
                let hot = []
                let ret = []
                for (let key in map) {  // key相当于hot或A\B\C
                    let val = map[key]
                    if (val.title.match(/[a-zA-Z]/)) {  // 如果是title为a/b/c的对象，添加到ret
                        ret.push(val)
                    } else if (val.title === HOT_NAME) {
                        hot.push(val)
                    }
                }
                // 对字母数组ret排序
                ret.sort((a, b) => {
                    // 比较每一个title的首字母，升序
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0)
                })
                // 将hot数组和ret数组拼接
                return hot.concat(ret)
            },
            // 3.0 处理歌手列表被点击事件 
            selectSinger (singer) {
                // 利用router.push的跳转路由事件,这个层把原来的页面盖住了
                this.$router.push({
                    path: `/singer/${singer.id}`
                })
                this.setSinger(singer)  // 将数据传递给vuex,提交了一个mutations
            },
            // 4.0 在有播放器的时候，歌手列表的底部预留出播放器列表的高度
            handlePlayList (playList) {
                const bottom = playList.length > 0 ? '60px' : 0
                this.$refs.singer.style.bottom = bottom
                // refresh（）方法在listView组件里面已经定义
                this.$refs.listView.refresh()
            },
            ...mapMutations({
                setSinger: 'SET_SINGER'
            })
        },
        components: {
            ListView
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    .singer
        position: fixed
        top: 88px
        bottom: 0
        width: 100%
</style>