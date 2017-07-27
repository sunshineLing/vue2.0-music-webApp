<template>
    <scroll class="listview" 
            :data="data"
            :probe-type="probeType"
            :listenScroll="listenScroll"
            @scroll="getCurrentPos" 
            ref="listview">
        <!--1.0 左侧歌手列表-->
        <ul>
            <li v-for="group in data" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2>
                <ul>
                    <!--点击歌手详情-->
                    <li @click="selectItem(item)" class="list-group-item" v-for="item in group.items">
                        <img v-lazy="item.avatar" alt="" class="avatar">
                        <span class="name">{{item.name}}</span>
                    </li>
                </ul>
            </li>
        </ul>
        <!--2.0 右侧快速滚动列表-->
        <div class="shortcutList" @touchstart="onShortcutTarchStart" @touchmove.stop.prevent="onShortcutTarchMove">
            <ul>
                <li v-for="(item,index) in shortcutList" class="item" :class="{'current':currentIndex===index}" :data-index="index">{{item}}</li>
            </ul>
        </div>
        <!--3.0 左侧歌手列表滚动时，需要在顶部总是显示当前列表的title-->
        <div class="list-title" ref="fixed" v-show="fixedTitle">
            <div class="fixed-title">{{fixedTitle}}</div>
        </div>
        <!--4.0 加载的时候的进度条-->
        <div v-show="!data.length" class="loading-container">
            <loading></loading>
        </div>
    </scroll>
</template>

<script type="text/ecmascript-6">
    // 需要整个组件可以滚动，引入scroll组件
    import Scroll from '../../base/scroll/scroll.vue'
    import {getData} from '../../common/js/dom.js'
    import Loading from '../../base/loading/loading.vue'

    // 右侧列表每一个字母的高度，含边距
    const ANCHOR_HEIGHT = 18
    const TITLE_HEIGHT = 30 // list-title的高度

    export default {
        data () {
            return {
                scrollY: -1, // 当前滚动的y轴的距离的初始值
                currentIndex: 0, // 当前显示是第几个索引值的区域
                diff: -1    // 定义滚动到的高度离下一个区域的距离
            }
        },
        created () {
            this.probeType = 3 // 滚动的时候实时监听
            this.touch = {}
            this.listenScroll = true
            this.listHeight = []
            this._calculateHeight()
        },
        components: {
            Scroll,
            Loading
        },
        // 计算属性
        computed: {
            // 获取快速滚动列表数据
            shortcutList () {
                return this.data.map((group) => {
                    return group.title.substring(0, 1)
                })
            },
            fixedTitle () {
                // 如果滚动到顶部了，再向上滚动就>0，此时设置title为0,不显示这个dom
                if (this.scrollY >= 0) {
                    return ''
                }
                return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
            }
        },
        // 监控父组件传递过来的data的值的变化,传进来的data数据，即左边列表的数据发生变化的时候，会影响到每一个列表的高度，需要重新计算列表高度数组的值
        watch: {
            data () {
                // 延时，因为数据到dom的变化有一个延时时间
                // 浏览器刷新的时间是17毫秒，17毫秒刷新一次，更新dom，此处设置20毫秒，dom已经重新渲染完毕
                // 此处也可以用this.$nextTick
                setTimeout(() => {
                    this._calculateHeight()
                }, 20)
            },
            // 监测scrollY的变化，scrollY是通过子组件传值可以获取到的，下面的Pos.y
            scrollY (newY) {    // 是一个函数，参数是新值和旧值
                // 获取到列表高度集合数组
                const listHeight = this.listHeight
                // 1.0 当滚动到顶部的时候
                if (newY > 0) {
                    this.currentIndex = 0
                    return
                }
                // 2.0 在中间部分滚动,此时newY是负值
                // 因为listHeight有24组，所以需要-1
                for (let i = 0; i < listHeight.length - 1; i++) {
                    let height1 = listHeight[i]
                    let height2 = listHeight[i + 1]
                    if (-newY >= height1 && -newY <= height2) {
                        // 高度在height1和height2之间
                        // 此时当前的index=i
                        this.currentIndex = i
                        // 此时当前滚动的高度和下一个区块的高度差
                        this.diff = height2 + newY
                        return
                    }
                }
                // 3.0 当滚动到底部的时候，且-newY > 最后一个元素的高度,让index是最后一个的index
                // this.currentIndex = listHeight.length - 2
                // console.log(this.currentIndex)
            },
            // 监测diff的值
            diff (newVal) {
                // 如果当前滚动的高度离当前区块的底部差比list-title的高度小的话，这个list-title就需要向上偏移，实现一个下面像上顶的效果
                let fixedTop = 0
                if (newVal > 0 && newVal < TITLE_HEIGHT) {
                    fixedTop = newVal - TITLE_HEIGHT
                } else {
                    fixedTop = 0
                }
                // 如果已经到底部了，就不做什么
                if (this.fixedTop === fixedTop) {
                    return
                }
                this.fixedTop = fixedTop
                // list-title这个元素向上偏移fixedTop的高度
                this.$refs.fixed.style.transform = `translate3d(0, ${fixedTop}px, 0)`
            }
        },
        methods: {
            // 1.0 监听右侧列表的点击点击事件
            onShortcutTarchStart (e) {
                // 获取当前点击的li的自定义属性值
                let currentIndex = parseInt(getData(e.target, 'index'))
                // 获取点击开始时被点击的元素
                let firstTouch = e.touches[0]
                // 获取到此时点击的元素的Pagey,并且需要在下面另外一个函数，点击结束时可以获取到，需要存入一个共同可以访问的对象
                this.touch.y1 = firstTouch.pageY
                // 当前被点击对象的index也需要在结束时可以访问到
                this.touch.index = currentIndex
                // scrollToElement(el, time, offsetX, offsetY, easing)
                // el表示滚动到某个dom元素,time表示动画时间
                // 滚动到左边区块对应的索应的位置
                this.scrollY = -this.listHeight[currentIndex + 1]
                console.log(currentIndex)
                // if (!currentIndex && currentIndex !== 0) {
                //     return
                // }
                this.$refs.listview.scrollToElement(this.$refs.listGroup[currentIndex], 0)
            },
            // 2.0 监听右侧列表的滑动事件
            // 需要在滑动开始，即点击的那一刻获取到当前的pageY，在滑动结束的时候获取到新的pageY，判断是从当前的字母移动到哪一个字母，根据移动的距离和他们每个字母之间间隔的px值来计算
            onShortcutTarchMove (e) {
                let firstTouch = e.touches[0]
                this.touch.y2 = firstTouch.pageY
                // 用当前的pageY-初始时的pageY得到移动的距离
                let distance = this.touch.y2 - this.touch.y1
                // 定义每一个字母距离上一个字母的距离，字母自身的高度+边距，计算为18
                // 用距离/18，可以知道滑动经过了几个字母
                let num = Math.ceil(distance / ANCHOR_HEIGHT)
                // 当前的字母的索引值为原来的索引值+num
                let currentIndex = this.touch.index + num
                // 左侧再滑动到对应的索引区域,0是指滚动的时间
                this.scrollY = -this.listHeight[currentIndex + 1]
                this.$refs.listview.scrollToElement(this.$refs.listGroup[currentIndex], 0)
            },
            // 3.0 scroll子组件传值，此处获取当前滚动的位置
            getCurrentPos (pos) {
                this.scrollY = pos.y    // 实时获取到better-scroll滚动的y轴的距离
            },
            // 4.0 计算当前的高度
            // 获取到每一个列表的高度，再和当前滚动到的位置做对比，就知道滚动到哪一个区间了
            _calculateHeight () {
                this.listHeight = []
                // 获取到23个列表元素集合
                const list = this.$refs.listGroup
                let height = 0
                // 先push进第一组的高度，高度是0
                this.listHeight.push(height)
                // 再遍历list
                for (let i = 0; i < list.length; i++) {
                    // 获取每一个区块，比如说第一个区块hot，整个的高度是760
                    let item = list[i]
                    // 第二个区块的高度是第一个的高度+第一个自身的高度
                    height += item.clientHeight
                    // 再把第二个区块的高度也添加进数组
                    this.listHeight.push(height)
                }
            },
            // 5.0 点击歌手详情的时候，把点击事件派发出去,告诉外部元素我被点击了，点击我的元素是什么，其他的业务由外部元素去处理
            selectItem (item) {
                this.$emit('select', item)
            },
            // 6.0 在底部有播放器的时候，需要给歌曲列表的底部增加60px，这个时候需要重新计算滚动列表的高度
            refresh () {
                this.$refs.listview.refresh()
            }
        }, 
        props: {
            data: {
                type: Array,
                default: []
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    .listview
        position: relative
        width: 100%
        height: 100%
        overflow: hidden
        background: $color-background
        .list-group 
            padding-bottom: 30px
            .list-group-title
                padding-left: 20px
                height: 30px
                line-height: 30px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
            .list-group-item
                display: flex
                align-items: center
                padding: 20px 0 0 30px
                .avatar
                    width: 50px
                    height: 50px
                    border-radius: 50%    
                .name
                    margin-left: 20px
                    color: $color-text-l
                    font-size: $font-size-medium
        .shortcutList
            position: absolute
            z-index: 30
            right: 0
            top: 50%
            transform: translateY(-50%)
            width: 20px
            padding: 20px 0
            text-align: center
            background: $color-background-d
            font-family: Helvetica
            .item
                padding: 3px
                line-height: 1
                color: $color-text-l
                font-size: $font-size-small
                &.current
                    color: $color-theme
        .list-title
            position: absolute
            top: 0
            left: 0
            width: 100%
            .fixed-title
                height: 30px
                line-height: 30px
                padding-left: 20px
                font-size: $font-size-small
                color: $color-text-l
                background: $color-highlight-background
        .loading-container  
            position: absolute
            top: 50%
            width: 100%
            transform: translateY(-50%)
</style>