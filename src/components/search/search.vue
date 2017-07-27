<template>
    <div class="search">
        <!--1.0 搜素框-->
        <div class="search-box-wrapper">
            <search-box ref="searchBox" @query="onQueryChange"></search-box>
        </div>
        <!--2.0 热门关键词-->
        <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
            <scroll class="shortcut" ref="shortcut" :data="shortcut">
                <!--因为需要滚动两个数据块，而scroll只滚动第一个了列表，所以增加一个div包裹-->
                <div>
                    <div class="hot-key">
                        <h1 class="title">热门搜索</h1>
                        <ul class="list">
                            <li class="item" v-for="item in hotKey" @click="addQuery(item.k)">
                                <span>{{item.k}}</span>
                            </li>
                        </ul>
                    </div>
                    <!--3.0 历史搜索记录-->
                    <div class="search-history" v-show="saveSearchHistory.length">
                        <h1 class="title">
                            <span class="text">搜索历史</span>
                            <span class="clear" @click="showConfirm">
                                <i class="icon-clear"></i>
                            </span>
                        </h1>
                        <!--3.1 search-list组件-->
                        <search-list :searches="searchHistory" @select="addQuery" @delete="deleteOne"></search-list>
                    </div>
                </div>
            </scroll>
        </div>
        <!--4.0 关键词检索列表-->
        <div ref="searchResult" class="search-result" v-show="query">
            <suggest :query="query" @listScroll="blurInput" @select="saveSearch" ref="suggest"></suggest>
        </div>
        <!--清空历史记录时的确认弹框-->
        <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"></confirm>
        <!--4.0 二级路由-->
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
    import SearchBox from '../../base/search-box/search-box.vue'
    import Suggest from '../suggest/suggest.vue'
    import SearchList from '../../base/search-list/search-list.vue'
    import Confirm from '../../base/confirm/confirm.vue'
    import Scroll from '../../base/scroll/scroll.vue'
    import {getHotKey} from '../../api/search.js'
    import {ERR_OK} from '../../api/config.js'
    import {mapActions} from 'vuex'
    import {playListMixin, searchMixin} from '../../common/js/mixin.js'
 
    export default {
        mixins: [playListMixin, searchMixin],
        data () {
            return {
                hotKey: [],
                query: ''  // 便于向suggest组件传递query值
            }
        },
        created () {
            this._getHotKeyData()
        },
        computed: {
            // 滚动效果两个数据合并
            shortcut () {
                return this.hotKey.concat(this.searchHistory)
            }
            // // 获取历史存储记录的数据
            // ...mapGetters([
            //     'searchHistory'
            // ])
        },
        methods: {
            handlePlayList (playList) {
                const bottom = playList.length > 0 ? '60px' : ''

                this.$refs.shortcutWrapper.style.bottom = bottom
                this.$refs.searchResult.style.bottom = bottom
                this.$refs.shortcut.refresh()
                this.$refs.suggest.refresh()
            },
            _getHotKeyData () {
               getHotKey().then((res) => {
                   if (res.code === ERR_OK) {
                       this.hotKey = res.data.hotkey.slice(0, 10)
                   }
               }) 
            },
            // 添加搜索关键词
            // addQuery (query) {
            //     console.log(1)
            //     // 点击搜索关键词的时候，给search-box设置关键词
            //     this.$refs.searchBox.setQuery(query)
            // },
            // 搜索文本框的值改变的时候，将改变后的值传递过来了
            // onQueryChange (newQuery) {
            //     // 将当前要向服务器传递的参数query的值设置为从search-box传递过来的值
            //     this.query = newQuery
            // },
            // 监听到子组件传递过来的列表将要被滚动的事件的时候，让文本框失去焦点，手机端键盘就会被收起
            // blurInput () {
            //     // 通过search-box调用search-box里面定义的失去焦点的blur方法
            //     this.$refs.SearchBox.blur()
            // },
            // 保存搜索历史
            // saveSearch () {
            //     this.saveSearchHistory(this.query)
            // },
            // 删除搜索历史
            deleteOne (item) {
                this.deleteSearchHistory(item)
            },
            // 清空历史搜索记录
            showConfirm () {
                // 确认框显示
                this.$refs.confirm.show()
            },
            ...mapActions([
                // 'saveSearchHistory',
                // 'deleteSearchHistory',
                'clearSearchHistory'
            ])
        },
        watch: {
            query (newQuery) {
                if (!newQuery) {
                    setTimeout(() => {
                        this.$refs.shortcut.refresh()
                    }, 20)
                }
            }
        },
        components: {
            SearchBox,
            Suggest,
            SearchList,
            Confirm,
            Scroll
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'

    .search
        .search-box-wrapper
            margin: 20px
        .shortcut-wrapper
            position: fixed
            top: 178px
            bottom: 0
            width: 100%
            .shortcut
                height: 100%
                overflow: hidden
                .hot-key
                    margin: 0 20px 20px 20px
                    .title
                        margin-bottom: 20px
                        font-size: $font-size-medium
                        color: $color-text-l
                    .list
                        .item
                            display: inline-block
                            padding: 5px 10px
                            margin: 0 20px 10px 0
                            border-radius: 6px
                            background: $color-highlight-background
                            font-size: $font-size-medium
                            color: $color-text-d 
                .search-history
                    position: relative
                    margin: 0 20px
                    .title
                        display: flex
                        align-items: center 
                        height: 40px
                        font-size: $font-size-medium 
                        color: $color-text-l
                        .text
                            flex: 1
                        .clear
                            .icon-clear
                                font-size: $font-size-medium
                                color: $color-text-d 
        .search-result
            position: fixed
            width: 100%
            top: 178px
            bottom: 0
</style>