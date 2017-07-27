<template>
    <div class="music-list">
        <!--1.0 back按钮-->
        <div class="back" @click="back">
            <i class="icon-back"></i>
        </div>
        <!--2.0 顶部标题-->
        <h1 class="title" v-html="title"></h1>
        <!--3.0 背景图片-->
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="play-wrapper">
                <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <div class="filter" ref="filter"></div>
        </div>
        <!--给list列表增加一个黑色的背景，向上拉的时候，也向上移动-->
        <div class="bg-layer" ref="layer"></div>
        <!--歌曲列表组件，滚动效果-->
        <scroll :data="songs" 
                :probe-type="probeType" 
                :listenScroll="listenScroll"
                @scroll="getCurrentPos" 
                class="list" 
                ref="list">
        <!--4.0 song-list列表组件-->
            <div class="song-list-wrapper">
                <song-list :songs="songs" @select="selectSong" :rank="rank"></song-list>
            </div>
            <div class="loading-wrapper" v-show="!songs.length">
                <loading></loading>
            </div>
        </scroll>
    </div>
</template>

<script type="text/ecmascript-6">
    import SongList from '../../base/song-list/song-list.vue'
    import Scroll from '../../base/scroll/scroll.vue'
    import Loading from '../../base/loading/loading.vue'
    import {prefixStyle} from '../../common/js/dom.js'
    import {mapActions} from 'vuex'
    import {playListMixin} from '../../common/js/mixin.js'

    const TITLE_HEIGHT = 40
    const transform = prefixStyle('transform')
    const backdrop = prefixStyle('backdrop-filter')

    export default {
        // 插入mixin,组件里面原来有同名的方法，会覆盖掉mixin里面的方法
        mixins: [playListMixin],
        data () {
            return {
                scrollY: 0
            }
        },
        created () {
            this.probeType = 3  // 传递给scroll组件，以便于在滚动的时候监听滚动的高度
            this.listenScroll = true    // 这个属性是传值给scroll，实现监听滚动距离事件
        },
        props: {
            title: {
                type: String,
                default: ''
            },
            bgImage: {
                type: String,
                default: ''
            },
            songs: {
                type: Array,
                default: []
            },
            rank: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            bgStyle () {
                return `background-image:url(${this.bgImage})`
            }
        }, 
        mounted () {
            // 获取背景图片的高度
            this.imageHeight = this.$refs.bgImage.clientHeight
            // 最小可以滚动到顶部
            this.minTranslateY = -this.imageHeight + TITLE_HEIGHT
            // 让歌曲列表的高度随背景图片的高度而变化
            this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
        },
        methods: {
            // handlePlayList方法，处理如果列表被拉到底部的时候，需要预留出底部mini播放器的高度
            // 如果有playList,意味着有播放器会显示，那么列表的底部有bottom
            handlePlayList (playList) {
               const bottom = playList.length > 0 ? '60px' : ''
               this.$refs.list.$el.style.bottom = bottom
               this.$refs.list.refresh()
            },
            // 获取到scroll组件传递过来的，滚动时候的位置
            getCurrentPos (pos) {
                this.scrollY = pos.y    // 获取到滚动时候y的值
            },
            // 点击back按钮返回
            back () {
                this.$router.back()
            },
            // 子组件选择了歌曲
            selectSong (song, index) {
                this.selectPlay({
                    list: this.songs,
                    index: index 
                })
            },
            // 点击随机播放全部按钮的时候，随机播放
            random () {
                // 创建一个actions
                this.randomPlay({
                    list: this.songs
                })  
            },
            ...mapActions([
                'selectPlay',
                'randomPlay'
            ])
        },
        watch: {
            scrollY (newY) {
                console.log(newY)
                // 最多滚动到顶部，newY向上滚动的时候可以无限小，而minTranslate最小是到图片的顶部
                let translateY = Math.max(this.minTranslateY, newY)
                let zIndex = 0 
                // 定义一个方法的值
                let scale = 1
                // 定义高斯模糊值
                let blur = 0

                this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
                
                // 如果是向下拉，图片跟着放大
                const percent = Math.abs(newY / this.imageHeight)
                if (newY > 0) {
                    scale = 1 + percent
                    zIndex = 10
                } else {
                    blur = Math.min(20 * percent, 20) 
                }
                // ios下面的高斯模糊效果
                this.$refs.filter.style[backdrop] = `blur(${blur}px)`   
                 
                // 如果滚动到标题之上了,因为列表会显示在图片的上面，所以需要设置图片的高度为标题的高度，层级显示在最前面
                if (newY < this.minTranslateY) {
                    zIndex = 10
                    this.$refs.bgImage.style.paddingTop = 0
                    this.$refs.bgImage.style.height = `${TITLE_HEIGHT}px`
                    this.$refs.playBtn.style.display = 'none'
                } else {    // 没有滚动到的时候，应该保持原来的不变化
                    this.$refs.bgImage.style.paddingTop = '70%'
                    this.$refs.bgImage.style.height = '0'
                    this.$refs.playBtn.style.display = 'block'
                }
                this.$refs.bgImage.style.zIndex = zIndex
                this.$refs.bgImage.style[transform] = `scale(${scale})`
            }
        }, 
        components: {
            SongList,
            Scroll,
            Loading
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    @import '../../common/stylus/mixin.styl'
    .music-list
        position: fixed
        z-index: 100
        top: 0
        left: 0
        right: 0
        bottom: 0
        background-color: $color-background
        .back
            position: absolute
            top: 0
            left: 6px
            z-index: 50
            .icon-back
                display: block
                padding: 10px
                font-size: $font-size-large-x
                color: $color-theme
        .title
            position: absolute
            top: 0
            left: 10%
            z-index: 40
            width: 80%
            no-wrap()
            text-align: center
            line-height: 40px
            font-size: $font-size-large
            color: $color-text
        .bg-image
            position: relative
            width: 100%
            height: 0
            padding-top: 70%
            transform-origin: top
            background-size: cover
            .play-wrapper
                position: absolute
                bottom: 20px
                z-index: 50
                width: 100%
                .play
                    box-sizing: border-box
                    width: 135px
                    padding: 7px 0
                    margin: 0 auto
                    text-align: center
                    border: 1px solid $color-theme
                    color: $color-theme
                    border-radius: 100px
                    font-size: 0
                    .icon-play
                        display: inline-block
                        vertical-align: middle
                        margin-right: 6px
                        font-size: $font-size-medium-x
                    .text
                        display: inline-block
                        vertical-align: middle
                        font-size: $font-size-small
            .filter
                position: absolute
                top: 0
                left: 0
                width: 100%
                height: 100%
                background: rgba(7, 17, 27, 0.4)
        .bg-layer
            position: relative
            height: 100%
            background: $color-background
        .list
            position: fixed
            top: 0
            bottom: 0
            width: 100%
            // overflow: hidden
            background: $color-background
            .song-list-wrapper
                padding: 20px 30px
</style>