<template>
    <transition name="slide">
        <div class="add-song" v-show="showFlag" @click.stop>
            <!--1.0 头部-->
            <div class="header">
                <h1 class="title">添加歌曲到列表</h1>
                <div class="close" @click="hide">
                    <i class="icon-close"></i>
                </div>
            </div> 
            <!--2.0 搜索列表框-->
             <div class="search-box-wrapper"> 
                 <search-box placeholder="搜索歌曲" @query="onQueryChange"></search-box>
            </div>
            <!--3.0 -->
            <div class="shortcut" v-show="!query">
                <!--切换按钮-->
                <switches :switches="switches" :currentIndex="currentIndex" @switch="switchItem"></switches>
                <div class="list-wrapper">
                    <scroll ref="songList" v-if="currentIndex===0" :data="playHistory" class="list-scroll">
                        <!--歌曲列表组件-->
                        <div class="list-inner">
                            <song-list :songs="playHistory" @select="selectSong">
                            </song-list>
                        </div>
                    </scroll>
                </div>
            </div>
            <!--4.0 搜索结果-->
            <div class="search-result" v-show="query">
                <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
    import SearchBox from '../../base/search-box/search-box.vue'
    import Suggest from '../../components/suggest/suggest.vue'
    import Switches from '../../base/switches/switches.vue'
    import Scroll from '../../base/scroll/scroll.vue'
    import SongList from '../../base/song-list/song-list.vue'
    import {searchMixin} from '../../common/js/mixin.js'
    import {mapGetters, mapActions} from 'vuex'
    import Song from '../../common/js/song.js'

    export default {
        mixins: [searchMixin],
        data () {
            return {
                showFlag: false,
                query: '',
                showSinger: false,
                currentIndex: 0,
                songs: [],
                switches: [
                    {name: '最近播放'},
                    {name: '搜索历史'}
                ]
            }
        },
        computed: {
            ...mapGetters([
                'playHistory'
            ])
        },
        methods: {
            show () {
                this.showFlag = true
                setTimeout(() => {
                    if (this.currentIndex === 0) {
                        this.$refs.SongList.refresh()
                    } else {
                        this.$refs.searchList.refresh()
                    }
                }, 20)
            },
            hide () {
                this.showFlag = false
            },
            selectSong(song, index) {
                if (index !== 0) {
                this.insertSong(new Song(song))
                this.$refs.topTip.show()
                }
            },
            // 从子组件里面传递过来的搜索关键词
            search (query) {
                this.query = query
            },
            // 子组件点击某一首歌曲，触发父组件的选择事件
            selectSuggest () {
                this.saveSearch()
            },
            switchItem (index) {
                this.currentIndex = index
            }
        },
        components: {
            SearchBox,
            Suggest,
            Switches,
            Scroll,
            SongList
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    @import '../../common/stylus/mixin.styl'
    .add-song
        position: fixed
        top: 0
        bottom: 0
        width: 100%
        z-index: 200
        background: $color-background
        &.slide-enter-active, &.slide-leave-active
            transition: all 0.3s
        &.slide-enter, &.slide-leave-to
            transform: translate3d(100%, 0, 0)
        .header
            position: relative
            height: 44px
            text-align: center
            .title
                line-height: 44px
                font-size: $font-size-large
                color: $color-text
            .close
                position: absolute
                top: 0
                right: 8px
                .icon-close
                    display: block
                    padding: 12px
                    font-size: 20px
                    color: $color-theme
        .search-box-wrapper
            margin: 20px
        .shortcut
        .search-result
            position: fixed
            top: 124px
            bottom: 0
            width: 100%
</style>