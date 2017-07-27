<template>
    <scroll class="suggest" 
            :data="result" 
            :pullup="pullup"
            :beforeScroll="beforeScroll"
            @scrollToEnd="searchMore"
            @beforeScroll="listScroll"
            ref="suggest"
            >
        <ul class="suggest-list">
            <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title></loading>
        </ul>
        <!--没有搜索内容时候的提示-->
        <div class="no-result-wrapper">
            <no-result :title="title" v-show="!hasMore && !result.length"></no-result>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
    import {getSuggest} from '../../api/search.js'
    import {createSong} from '../../common/js/song.js'
    import Scroll from '../../base/scroll/scroll.vue'
    import Loading from '../../base/loading/loading.vue'
    import NoResult from '../../base/no-result/no-result.vue'
    import Singer from '../../common/js/singer.js'
    import {mapMutations, mapActions} from 'vuex'

    const TYPE_SINGER = 'singer'
    const perpage = 20
    const TITLE = '小树不在线，哈哈哈'

    export default {
        props: {
            query: {
                type: String,
                default: ''
            },
            // suggest列表时候展示歌手
            showSinger: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                page: 1,
                result: [],
                pullup: true,
                hasMore: true, // 标志位，有没有加载完
                title: TITLE,
                beforeScroll: true  // 在滚动之前触发
            }
        },
        watch: {
            // 监控query关键词的变化，每次变化时都重新去服务端请求数据
            query (newVal) {
                this.search(newVal)
            }
        },
        methods: {
            // 根据当前的query请求服务端返回的搜索数据
            search () {
                this.page = 1                
                this.hasMore = true
                this.$refs.suggest.scrollTo(0, 0)
                getSuggest(this.query, this.page, this.showSinger, perpage).then((res) => {
                    this.result = this._genSuggest(res.data)
                    // 检测当前搜索的数据有没有加载完毕
                    this._checkMore(res.data)
                })
            },
            // 检测返回来的数据有没有加载完毕
            _checkMore (data) {
                const song = data.song
                if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
                    this.hasMore = false
                }
            },
            // 处理搜索列表
            _genSuggest (data) {
                let ret = []
                // 如果有直达的数据，Push
                if (data.zhida && data.zhida.singerid) {
                    // 拷贝对象，把data.zhida里面的数据拷贝出来
                    ret.push({...data.zhida, ...{type: TYPE_SINGER}})
                }
                // 如果有song的数据，push
                if (data.song) {
                    ret = ret.concat(this._normalizeSongList(data.song.list))
                }
                return ret
            },
            // 处理songlist的方法
            _normalizeSongList (list) {
                let ret = []
                list.forEach((musicData) => {
                    if (musicData.albummid && musicData.songmid) {
                        ret.push(createSong(musicData))
                    }
                })
                return ret
            },
            // 设置当前列表的样式
            getIconCls (item) {
                // 判断当前的列表的type是不是singer，是的话前面是人物图标，不是的话，前面是音乐图标
                if (item.type === TYPE_SINGER) {
                    return 'icon-mine'
                } else {
                    return 'icon-music'
                }
            },
            // 获取显示的名称
            getDisplayName (item) {
                // 第一条是歌手信息，显示歌手名字
                if (item.type === TYPE_SINGER) {
                    return item.singername
                } else { // 其他后面是歌曲信息，显示歌名和歌手信息
                    return `${item.name}-${item.singer}`
                }
            },
            // 如果上拉列表，拉到底部了，需要加载新的数据
            searchMore () {
                // 检测有没有加载完
                if (!this.hasMore) {
                    return
                }
                // 如果已经加载完了，就需要page页面更新
                this.page++
                // 调用向服务器获取数据的方法
                getSuggest(this.query, this.page, this.showSinger, perpage).then((res) => {
                    // 将新获取的数据拼接到原来的后面
                    this.result = this.result.concat(this._genSuggest(res.data))
                    // 检测当前搜索的数据有没有加载完毕
                    this._checkMore(res.data)
                })
            },
            // 监听歌曲选择事件
            selectItem (item) {
                // 判断item的类型
                if (item.type === TYPE_SINGER) {
                    const singer = new Singer({
                        id: item.singerid,
                        name: item.singername,
                        mid: item.singermid
                    })
                    this.$router.push({
                        path: `/search/${singer.id}`
                    })
                    this.setSinger(singer)
                } else {
                    this.insertSong(item)
                }
                // 派发一个事件，选择了当前项目，留下历史记录
                this.$emit('select')
            },
            // 监听scroll组件传递过来的beforeScroll事件，如果有，也派发一个事件出去
            listScroll () {
                this.$emit('listScroll')
            },
            // 底部高度变化时，重新计算高度，刷新
            refresh () {
                this.$refs.suggest.refresh()
            },
            ...mapMutations({
                setSinger: 'SET_SINGER'
            }),
            ...mapActions([
                'insertSong'
            ])
        },
        components: {
            Scroll,
            Loading,
            NoResult
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'

    .suggest
        height: 100%
        overflow: hidden
        .suggest-list
            padding: 0 30px
            .suggest-item
                display: flex
                align-items: center
                padding-bottom: 20px
                .icon
                    flex: 0 0 30px
                    width: 30px
                    [class^="icon-"]
                        font-size: 14px
                        color: $color-text-d
                .name
                    flex: 1
                    font-size: $font-size-medium
                    color: $color-text-d
                    overflow: hidden
                    .text
                        no-wrap()
        .no-result-wrapper
            position: absolute
            width: 100%
            top: 50%
            transform: translateY(-50%)   
</style>
