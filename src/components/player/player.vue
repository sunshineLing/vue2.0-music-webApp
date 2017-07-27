<template>
    <div class="player" v-show="playList.length>0">
        <!--大播放器的动画效果-->
        <transition name="normal"
                    @enter="enter"
                    @after-enter="afterEnter"
                    @leave="leave"
                    @after-leave="afterLeave"
                    >
            <!--1.0 播放器-->
            <div class="normal-player" v-show="fullScreen" ref="normalPlayer">
                <!--1.1 大的背景图-->
                <div class="background">
                    <img width="100%" height="100%" :src="currentSong.image" alt="">
                </div>
                <!--1.2 背景图上面的顶部部分-->
                <div class="top">
                    <!--1.2.1 返回按钮-->
                    <dic class="back" @click="back">
                        <i class="icon-back"></i>
                    </dic>
                    <!--1.2.2 标题-->
                    <h1 class="title" v-html="currentSong.name"></h1>
                    <!--1.2.3 子标题-->
                    <h1 class="subtitle" v-html="currentSong.singer"></h1>
                </div>
                <!--1.3 背景图的中部-->
                <div class="middle"
                     @touchstart.prevent="middleTouchStart"
                     @touchmove.prevent="middleTouchMove"
                     @touchend="middleTouchEnd"
                >
                    <div class="middle-l" ref="middleL">
                        <div class="cd-wrapper" ref="cdWrapper">
                            <div class="cd" :class="cdCls">
                                <img :src="currentSong.image" alt="" class="image">
                            </div>
                        </div>
                        <!--左边显示当前正在播放的歌词-->
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">{{playingLyric}}</div>
                        </div>
                    </div>
                    <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric">
                                <p ref="lyricLine" class="text" :class="{'current': currentLineNum === index}" v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <!--1.4 背景图的底部-->
                <div class="bottom">
                    <!--1.4 -->
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active':currentShow==='cd'}"></span>
                        <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
                    </div>
                    <!--进度条-->
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <!--progress组件-->
                            <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <!--1.5.1 操作按钮-->
                    <div class="operators">
                        <!--左边顺序播放还是随机播放的选择按钮-->
                        <div class="icon i-left" @click="changeMode">
                            <i :class="iconMode"></i>
                        </div>
                        <!--左边上一首-->
                        <div class="icon i-left" :class="disableCls">
                            <i @click="prev" class="icon-prev"></i>
                        </div>
                        <!--中间播放状态-->
                        <div class="icon i-center" :class="disableCls">
                            <i :class="playIcon" @click="togglePlaying"></i>
                        </div>
                        <!--右边下一首-->
                        <div class="icon i-right" :class="disableCls">
                            <i @click="next" class="icon-next"></i>
                        </div>
                        <!--右边收藏按钮-->
                        <div class="icon i-right">
                            <i class="icon-not-favorite"></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!--mini播放器的动画效果-->
        <transition name="mini">
            <!--2.0 mini播放器-->
            <div class="mini-player" v-show="!fullScreen" @click="open">
                <!--2.1 左侧图标-->
                <div class="icon">
                    <img :class="cdCls" width="40" height="40" :src="currentSong.image" alt="">
                </div>
                <!--2.2 中间歌曲描述-->
                <div class="text">
                    <h2 class="name" v-html="currentSong.name"></h2>
                    <p class="desc" v-html="currentSong.singer"></p>
                </div>
                <!--2.3 右侧控制部分-->
                <div class="control">
                    <!--引入progress-circle组件-->
                    <progress-circle :radius="radius" :percent="percent">
                        <i :class="miniIcon" class="icon-mini" @click.stop="togglePlaying"></i>
                    </progress-circle>
                </div>
                <!--2.4 右侧控制按钮，播放列表-->
                <div class="control" @click.stop="showPlaylist">
                    <i class="icon-playlist"></i>
                </div>
            </div>
        </transition>
        <!--3.0 添加歌曲组件-->
        <playlist ref="playlist"></playlist>
        <!--4.0 播放器-->
        <audio :src="currentSong.url" ref="audio" @canplay="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
    </div>
</template>

<script type="text/ecmascript-6">
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import animations from 'create-keyframe-animation'
    import {prefixStyle} from '../../common/js/dom.js'
    import ProgressBar from '../../base/progress-bar/progress-bar.vue'
    import ProgressCircle from '../../base/progress-circle/progress-circle.vue'
    import {playMode} from '../../common/js/config.js'
    // import {shuffle} from '../../common/js/uitl.js'
    import Lyric from 'lyric-parser'
    import Scroll from '../../base/scroll/scroll.vue'
    import Playlist from '../../components/playlist/playlist.vue'
    import {playerMixmin} from '../../common/js/mixin.js'

    const transform = prefixStyle('transfrom')

    export default {
        mixins: [playerMixmin],
        data () {
            return {
                songReady: false,
                currentTime: 0,  // 歌曲当前播放的时长
                radius: 32,  // mini播放器的播放进度圆的宽和高
                currentLyric: null, // 当前的歌词
                currentLineNum: 0, // 当前歌词所在的行
                currentShow: 'cd',   // 当前应该显示的是cd还是歌词
                playingLyric: ''    // 当前正在播放的歌词
            }
        },
        created () {
            // 滑动效果，维护一个空对象
            this.touch = {}
        },
        computed: {
            // 大播放器播放图标的切换
            playIcon () {
                return this.playing ? 'icon-pause' : 'icon-play'
            },
            // mini播放器播放图标的切换
            miniIcon () {
                return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
            },
            // 歌曲播放模式,设置歌曲播放模式的class
            // iconMode () {
            //     return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
            // },
            // 歌曲播放时cd旋转的效果
            cdCls () {
                return this.playing ? 'play' : 'pause'
            },
            // 不能点击的时候添加禁止样式
            disableCls () {
                return this.songReady ? '' : 'disable'
            },
            // 歌曲播放的进度
            percent () {
                return this.currentTime / this.currentSong.duration
            },
            ...mapGetters([
                'fullScreen',
                'playList',
                'currentSong',
                // 'playing',
                // 'currentIndex',
                'mode'
                // 'sequenceList'
            ])
        },
        watch: {
            // 当currentSong的状态发生变化的时候，调用方法
            currentSong (newSong, oldSong) {
                if (!newSong.id) {
                    return
                }
                if (newSong.id === oldSong.id) {
                    return
                }

                if (this.currentLyric) {
                    this.currentLyric.stop()
                }
                // dom还没有ready
                this.$nextTick(() => {
                    this.$refs.audio.play()
                    // 调用歌词方法
                    this.getCurLyric()
                })
            },
            fullScreen (newVal) {
                if (newVal === false) {
                    this.$refs.normalPlayer.style.display = 'none'
                }
            },
            // watch playing的状态
            playing (newPlaying) {
                const audio = this.$refs.audio
                this.$nextTick(() => {
                    newPlaying ? audio.play() : audio.pause()
                })
            }

        },
        methods: {
            // 1.0 点击back按钮时，大的播放器收起，mini播放器显示
            back () {
                this.setFullScreen(false)
            },
            // 2.0 点击mini播放器的时候，显示大播放器
            open () {
                this.setFullScreen(true)
            },
            // 定义动画
            enter (el, done) {
                const pos = this._getPosAndScale()
                
                // 定义动画
                let animation = {
                    0: {
                        transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${pos.scale})`
                    },
                    60: {
                        transform: `translate3d(0, 0, 0) scale(1.1)`
                    },
                    100: {
                        transform: `translate3d(0, 0, 0) scale(1)`
                    }
                }

                // 注册动画
                animations.registerAnimation({
                    name: 'move',
                    animation,
                    presets: {  // 预设字段，设置动画间隔，缓动
                        duration: 2000,
                        easing: 'linear'
                    }
                })

                // 运行动画
                // 第一个参数是要run的dom
                // 第二个参数是要运行的动画name
                // 第三个是回调函数，运行完了执行下一个enterAfter
                animations.runAnimation(this.$refs.cdWrapper, 'move', done)
            },
            afterEnter () {
                // 动画执行完了，动画撤销
                animations.unregisterAnimation('move')
                this.$refs.cdWrapper.style.animation = ''
            },
            leave (el, done) {
                // 离开的时候，直接让大图片位置移动到小图片，不需要再缩放
                // 首先需要设置过渡时候的动画状态
                this.$refs.cdWrapper.style.transition = 'all 0.4s'
                // 获取当前大图片距离小图片的位置
                const pos = this._getPosAndScale()

                // 设置过渡后要达到的效果
                this.$refs.cdWrapper.style[transform] = `translate3d(${pos.x}px,${pos.y}px,0) scale(${pos.scale})`

                // 监听动画执行完毕事件，调用回掉函数
                this.$refs.cdWrapper.addEventListener('transitionend', done)
            },
            afterLeave () {
                this.$refs.cdWrapper.style.transition = ''
                this.$refs.cdWrapper.style[transform] = ''
            },
            // 点击控制播放状态
            togglePlaying () {
                if (!this.songReady) {
                    return
                }

                this.setPlayingState(!this.playing)
                
                if (this.currentLyric) {
                    this.currentLyric.togglePlay()
                }
            },
            // 一首歌曲播放完毕事件
            end () {
                // 判断如果当前的模式是循环播放，则再把当前的这首播放一次
                if (this.mode === playMode.loop) {
                    this.loop()
                } else {
                    // 跳到下一首
                    this.next()
                }
            },
            // 改变歌曲列表的播放模式
            // changeMode () {
            //     const mode = (this.mode + 1) % 3    // 模式在0-2之间切换
            //     // 通过mutations设置mode的状态
            //     this.setPlayMode(mode)
            //     let list = null
            //     // 如果播放模式是随机播放
            //     if (mode === playMode.random) {
            //         // 先拿到顺序播放的列表,将顺序播放列表打乱
            //         list = shuffle(this.sequenceList)
            //     } else {
            //         list = this.sequenceList
            //     }
            //     // 找到新的列表里面当前这首歌曲，在新的列表的索引
            //     this.resetCurrentIndex(list)
            //     // 修改mutatios的playlist的值
            //     this.setPlayList(list)
            // },
            // // 找到当前播放的歌曲，在新的模式的列表中的索引
            // resetCurrentIndex (list) {
            //     let index = list.findIndex((item) => {
            //         return item.id === this.currentSong.id
            //     })
            //     // 给mutations的currentIndex 设置为当前的index,保证模式切换的时候，当前播放的歌曲还是原来的那首
            //     this.setCurrentIndex(index)
            // },
            // 循环播放
            loop () {
                // 将当前的播放时间设置为0即可
                this.$refs.audio.currentTime = 0
                this.$refs.audio.play()

                // 循环播放的时候，歌词从0的地方开始
                if (this.currentLyric) {
                    this.currentLyric.seek(0)
                }
            },
            // 点击播放上一首歌曲
            prev () {
                // 如果歌曲没有加载完毕，不能点击
                if (!this.songReady) {
                    return
                }
                // 如果歌曲长度为1，即歌曲列表只有一个的时候，处理
                if (this.playList.length === 1) {
                    this.loop()
                } else {
                    let index = this.currentIndex - 1
                    if (index === -1) {
                        index = this.playList.length - 1
                    }
                    this.setCurrentIndex(index)
                    // 改变播放状态
                    if (!this.playing) {
                        this.togglePlaying()
                    }
                    this.songReady = false
                }
            },
            // 点击播放下一首歌曲
            next () {
                // 如果歌曲没有加载完毕，不能点击
                if (!this.songReady) {
                    return
                }
                // 如果当前播放列表只有一条，长度为1的时候，就让它循环播放
                if (this.playList.length === 1) {
                    this.loop()
                } else {
                    let index = this.currentIndex + 1

                    if (index === this.playList.length) {
                        index = 0
                    }
                    // 调用action设置的方法，修改Mutations的状态
                    this.setCurrentIndex(index)
                    // 改变播放状态
                    if (!this.playing) {
                        this.togglePlaying()
                    }
                    this.songReady = false
                }
            },
            // 点击歌曲列表，显示歌曲列表
            showPlaylist () {
                this.$refs.playlist.show()
            },
            // 歌曲加载完毕事件
            ready () {
                this.songReady = true
                this.savePlayHistory(this.currentSong)
            },
            // 歌曲加载错误的时候报错
            error () {
                this.songReady = true
            },
            // 获取歌词
            getCurLyric () {
                this.currentSong.getLyric().then((lyric) => {
                    this.currentLyric = new Lyric(lyric, this.handleLyric)
                    // 如果歌曲正在播放
                    if (this.playing) {
                        this.currentLyric.play()
                    }
                }).catch(() => {
                    this.currentLyric = null
                    this.playingLyric = ''
                    this.currentLineNum = 0
                })
            },
            // 处理歌曲的回掉函数
            handleLyric ({lineNum, txt}) {
                // 当前歌词的行数变化
                this.currentLineNum = lineNum
                // 如果大于5行，前5行是不用做处理的
                // 如果大于5行，那么列表需要向上滚动到到-5的元素的位置
                if (lineNum > 5) {
                    // 需要向上滚动到当前的LineNum - 5的位置
                    let lineEl = this.$refs.lyricLine[lineNum - 5]
                    this.$refs.lyricList.scrollToElement(lineEl, 1000)
                } else {
                    this.$refs.lyricList.scrollTo(0, 0, 1000)
                }
                // 左边当前显示的歌词是正在播放中的歌词
                this.playingLyric = txt
            },
            // 获取auto标签当前播放的时间
            updateTime (e) {
                this.currentTime = e.target.currentTime
            },
            // 把时间转化为分秒
            format (interval) {
                interval = Math.floor(interval)
                const minute = Math.floor(interval / 60)
                let second = interval % 60
                second = second < 10 ? '0' + second : second
                let time = minute + ':' + second
                return time
                // return `${minute}:${second}`
            },
            // progress子组件传递过来的，进度条拖动时候，播放进度改变
            onProgressBarChange (percent) {
                const currentTime = this.currentSong.duration * percent
                // audio标签的currentTime属性是可以读写的
                this.$refs.audio.currentTime = currentTime
                // 因为拖动的时候，如果当前不是播放状态，不播放，需要设置为播放
                if (!this.playing) {
                    this.togglePlaying()
                }

                if (this.currentLyric) {
                    this.currentLyric.seek(currentTime * 1000)
                }
            },
            // middle的滑动事件，是显示cd还是显示歌词
            middleTouchStart (e) {
                // 设置标志符,标志已经初始化过了
                this.touch.initiated = true
                // 用来判断是否是一次移动
                this.touch.moved = false

                // 当前触摸到的对象
                const touch = e.touches[0]
                // 记录初始时触摸到的touch的x和y轴坐标
                this.touch.startX = touch.pageX
                this.touch.startY = touch.pageY
            },
            middleTouchMove (e) {
                if (!this.touch.initiated) {
                    return
                }
                const touch = e.touches[0]
                const deltaX = touch.pageX - this.touch.startX
                const deltaY = touch.pageY - this.touch.startY

                // 如果纵轴的偏移大于横轴的偏移，不处理,因为是纵向滚动
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    return
                }

                if (!this.touch.moved) {
                    this.touch.moved = true
                }
                // 如果currentShow是cd的话
                const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
                
                // 计算宽度,最小值是0，最大值是-window.innerWidth
                const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))

                // 滑动的百分比
                this.touch.percent = Math.abs(offsetWidth / window.innerWidth)

                // 向左拖动时，设置middle-r向左偏移
                this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px,0,0)`
                this.$refs.lyricList.$el.style.transitionDuration = `0`
                // 修改左边的唱片的透明度,percent越大，透明度就越小
                this.$refs.middleL.style.opacity = 1 - this.touch.percent
                this.$refs.middleL.style.transitionDuration = `0`
            },
            middleTouchEnd () {
                if (!this.touch.moved) {
                    return
                }
                let offsetWidth
                let opacity
                // 如果当前显示的是cd
                if (this.currentShow === 'cd') {
                    // 如果滑动的比例大于10%,宽度就设置为移动到整个屏幕
                    if (this.touch.percent > 0.1) {
                        offsetWidth = -window.innerWidth
                        this.currentShow = 'lyric'
                        opacity = 0
                    } else {
                        offsetWidth = 0
                        opacity = 1
                    }
                } else { // 如果当前显示的是歌词
                    // 从左向右划
                    if (this.touch.percent < 0.9) {
                        offsetWidth = 0
                        this.currentShow = 'cd'
                        opacity = 1
                    } else {
                        offsetWidth = -window.innerWidth
                        opacity = 0
                    }
                }
                const time = 300
                this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px,0,0)`
                // 滑动结束的时候，从原来的位置来到需要偏移的位置，设置过渡时间为300ms
                this.$refs.lyricList.$el.style.transitionDuration = `${time}ms`

                // 设置透明度
                this.$refs.middleL.style.opacity = opacity
            },
            ...mapMutations({
                setFullScreen: 'SET_FULL_SCREEN'
                // setPlayingState: 'SET_PLAYING_STATE',
                // setCurrentIndex: 'SET_CURRENT_INDEX',
                // setPlayMode: 'SET_PLAY_MODE',
                // setPlayList: 'SET_PLAYLIST'
            }),
            ...mapActions([
                'savePlayHistory'
            ]),
            // 获取mini播放器icon的图片的位置和scale，和大播放器的图片的位置和scale
            _getPosAndScale () {
                const targetWidth = 40 // 小图片的宽度
                const paddingLeft = 40  // 小图片中心点离左边的距离
                const paddingBottom = 30    // 小图片中心点离下面的距离
                const paddingTop = 80   // 大图片离顶部的高度
                const width = window.innerWidth * 0.8 // 因为大图片的宽度，是屏幕宽的的80%
                const scale = targetWidth / width   // 一开始的缩小比例是小图片的宽/大图片的宽
                const x = -(window.innerWidth / 2 - paddingLeft) // 初始时候，两个图片中心点的距离
                const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // 初始两个圆心的纵坐标距离
                return {
                    x,
                    y,
                    scale
                }
            }
        },
        components: {
            ProgressBar,
            ProgressCircle,
            Scroll,
            Playlist
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    @import '../../common/stylus/mixin.styl'
    .player
        .normal-player
            position: fixed
            left: 0
            right: 0
            top: 0
            bottom: 0
            z-index: 150
            background: $color-background
            .background
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                z-index: -1
                opacity: 0.6
                filter: blur(20px)
            .top
                position: relative
                margin-bottom: 25px
                .back
                    position: absolute
                    top: 0
                    left: 0
                    z-index: 50
                    .icon-back
                        display: block
                        padding: 9px
                        font-size: $font-size-large-x
                        color: $color-theme
                        transform: rotate(-90deg)
                .title
                    width: 70%
                    margin: 0 auto
                    line-height: 40px
                    text-align: center
                    no-wrap()
                    font-size: $font-size-large
                    color: $color-text
                .subtitle
                    line-height: 20px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-text
            .middle
                position: fixed
                width: 100%
                top: 80px
                bottom: 170px
                white-space: nowrap
                font-size: 0
                .middle-l   
                    display: inline-block
                    vertical-align: top
                    position: relative
                    width: 100%
                    height: 0
                    padding-top: 80%
                    .cd-wrapper
                        position: absolute
                        left: 10%
                        top: 0
                        width: 80%
                        height: 100%
                        .cd
                            width: 100%
                            height: 100%
                            box-sizing: border-box
                            border: 10px solid rgba(255, 255, 255, 0.1)
                            border-radius: 50%
                            &.play
                                animation: rotate 20s linear infinite
                            &.pause
                                animation-play-state: paused
                            .image
                                position: absolute
                                left: 0
                                top: 0
                                width: 100%
                                height: 100%
                                border-radius: 50%
                    .playing-lyric-wrapper
                        width: 80%
                        margin: 30px auto 0 auto
                        overflow: hidden
                        text-align: center
                        .playing-lyric
                            height: 20px
                            line-height: 20px
                            font-size: $font-size-medium
                            color: $color-text-l
                .middle-r
                    display: inline-block
                    vertical-align: top
                    width: 100%
                    height: 100%
                    overflow: hidden
                    .lyric-wrapper
                        width: 80%
                        margin: 0 auto
                        overflow: hidden
                        text-align: center
                        .text
                            line-height: 32px
                            color: $color-text-l
                            font-size: $font-size-medium
                            &.current
                                color: $color-text  
            .bottom
                position: absolute
                bottom: 50px
                width: 100%
                .dot-wrapper
                    text-align: center
                    font-size: 0
                    .dot
                        display: inline-block
                        vertical-align: middle
                        margin: 0 4px
                        width: 8px
                        height: 8px
                        border-radius: 50%
                        background: $color-text-l
                        &.active
                            width: 20px
                            border-radius: 5px
                            background: $color-text-ll
                .progress-wrapper
                    display: flex
                    align-items: center
                    width: 80%
                    margin: 0 auto
                    padding: 10px 0
                    .time
                        color: $color-text
                        font-size: $font-size-small
                        flex: 0 0 30px
                        line-height: 30px
                        width: 30px
                        &.time-l
                            text-align: left
                        &.time-r
                            text-align: right
                    .progress-bar-wrapper
                        flex: 1
                .operators
                    display: flex
                    align-items: center
                    .icon
                        flex: 1
                        color: $color-theme
                        &.disable
                            color: $color-theme-d 
                        i
                            font-size: 30px
                    .i-left
                        text-align: right
                    .i-center
                        padding: 0 20px
                        text-align: center
                        i
                            font-size: 40px
                    .i-right
                        text-align: left
                    .icon-favorite
                        color: $color-sub-theme
            &.normal-enter-active, &.normal-leave-active
                transition: all 0.4s
                .top, .bottom
                    transition: all 0.4s
                    cubic-bezier(0.86, 0.18, 0.82, 1.32)
            &.normal-enter, &.normal-leave-to
                opacity: 0
                .top    // 进入的时候位置在上方的100px处，到0
                    transform: translate3d(0, -100px, 0)
                .bottom // 进入的时候，下面100px，到0的位置
                    transform: translate3d(0, 100px, 0)   
        .mini-player
            display: flex
            align-items: center  // 垂直方向上居中
            position: fixed
            left: 0
            bottom: 0
            z-index: 180
            width: 100%
            height: 60px
            background: $color-highlight-background
            &.mini-enter-active, &.mini-leave-active
                transition: all 0.4s
            &.mini-enter, &.mini-leave-to
                opacity: 0
            .icon
                flex: 0 0 40px  // 宽度固定为40px
                width: 40px
                padding: 0 10px 0 20px
                img
                    border-radius: 50%
                    &.play
                        animation: rotate 10s linear infinite
                    &.pause
                        animation-play-state: paused
            .text
                display: flex
                flex-direction: column // 垂直排列
                justify-content: center // 居中对齐
                flex: 1
                line-height: 20px
                overflow: hidden
                .name
                    margin-bottom: 2px
                    no-wrap()
                    font-size: $font-size-medium
                    color: $color-text
                .desc
                   no-wrap()
                   font-size: $font-size-small
                   color: $color-text-d
            .control
                flex: 0 0 30px
                width: 30px
                padding: 0 10px 
                .icon-play-mini, .icon-pause-mini, .icon-playlist
                    font-size: 30px
                    color: $color-theme-d
                .icon-mini
                    font-size: 32px
                    position: absolute
                    left: 0
                    top: 0
    @keyframes rotate
        0%
            transform: rotate(0)
        100%
            transform: rotate(360deg)
</style>