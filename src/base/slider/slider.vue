<template>
    <div class="slider" ref="slider">
        <!--1.0 图片-->
        <div class="slider-group" ref="sliderGroup">
            <!--slot插槽，外部引用slider的时候，它里面的slider包裹的dom会被插入到插槽的部分-->
            <slot>

            </slot>
        </div>
        <!--2.0 小圆点-->
        <div class="dots">
            <span v-for="(dot,index) in dots" class="dot" :class="{'active':currentPageIndex === index}"></span>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
    // 引入addClass方法，为轮播图图片添加样式
    import {addClass} from '../../common/js/dom.js'
    // 引入轮播图滚动的插件
    import BScroll from 'better-scroll'

    export default {
        data () {
            return {
                dots: [],
                currentPageIndex: 0
            }
        },
        // dom加载完成
        mounted () {
            // 1.0 初始化让轮播图图片滚动的插件better-scroll,初始的时机是dom树加载完成之后
            // 可以用this.$nextTick()，但是此处建议用setTimeout,设置为20毫秒，因为浏览器是17毫秒刷新一次
            setTimeout(() => {
                // 因为是横向滚动，滚动之前需要设置slider的宽度
                this._setSliderWidth()
                this._initDots()    // 需要在slider完成之前
                this._initSlider()

                // 自动播放
                if (this.autoPlay) {
                    this._play()
                }

                // 优化，解决窗口改变slider错乱问题
                // 重新去计算宽度，但是这个时候不能再增加两个图片，所以要用一个标志符来判断
                window.addEventListener('resize', () => {
                    if (!this.slider) {
                        return
                    }
                    this._setSliderWidth(true)
                    this.slider.refresh()   // scroll刷新
                })
            }, 20)
        },
        // 组件被销毁的时候，先清除对象
        destroyed () {
            clearTimeout(this.timer)
        },
        methods: {
            // 1.0 设置轮播图的外部的图片，相当于Ul的宽度
            _setSliderWidth (isResize) {
                // 首先拿到要滚动的元素的子元素,dom对象集合
                this.children = this.$refs.sliderGroup.children

                let width = 0
                // slider父容器的宽度，是屏幕的宽度
                let sliderWidth = this.$refs.slider.clientWidth

                for (let i = 0; i < this.children.length; i++) {
                    let child = this.children[i]

                    // 给slider的每一个图片添加样式
                    // 添加样式是通用方法，在common.js设置
                    addClass(child, 'slider-item')
                    // 给每一个轮播图片设置宽度,和父容器宽度一样
                    child.style.width = sliderWidth + 'px'
                    width += sliderWidth // 总的图片的宽度要累加，也可以用子元素的个数*宽度
                }
                // 如果配置是循环播放，需要在前面和后面各设置1张图片，宽度要增加2个宽
                // 如果是窗口改变调用方法的时候，不要增加图片
                if (this.loop && !isResize) {
                    width += 2 * sliderWidth
                }
                // 将图片外层的父容器的宽度，相当于ul的宽度设置为总的图片*每张图片的宽度
                this.$refs.sliderGroup.style.width = width + 'px'
            },
            // 2.0 初始化dots，只需要让它是一个长度为图片的长度的空数组就可以了
            _initDots () {
                // this指向slider-group元素
                this.dots = new Array(this.children.length)
            },
            // 3.0 初始化轮播图
            _initSlider () {
                // 第一个参数滚动的区块外围的div
               this.slider = new BScroll(this.$refs.slider, {
                   scrollX: true,   // 可以横向滚动
                   scrollY: false, // 不可以竖向滚动
                   momentum: false, // 惯性
                   snap: true,
                   snapLoop: this.loop,
                   snapThreshold: 0.3, // 手指滑动页面可切换的阈值，大于这个阈值可以滑动到下一页
                   snapSpeed: 400, // 轮播图切换的动画时间
                   click: true
               })
               // 滚动完毕后会触发滚动结束17:29:42
               this.slider.on('scrollEnd', () => {
                   // 当snap为true时，可以获取滚动的当前页，返回的是一个包含滚动的位置和索引的对象
                   // 获取到页面的索引
                   let pageIndex = this.slider.getCurrentPage().pageX
                   // 如果是循环滚动，页面的索引并不是实际的索引，而是前面一个，所以应该-1
                   if (this.loop) {
                        pageIndex -= 1
                   }
                   this.currentPageIndex = pageIndex

                   // 每次滚动结束之后，如果是自动轮播
                   if (this.autoPlay) {
                       this._play()
                   }
               })
            },
            // 4.0 自动播放方法
            _play () {
                // 自动播放的时候，即相当于点击向下一页
                let pageIndex = this.currentPageIndex + 1
                // 如果是循环播放的化，因为currentIndex是从0开始计算,而图片的张数是比小圆点多的
                if (this.loop) {
                    pageIndex += 1
                }
                this.timer = setTimeout(() => {
                    // goToPage(x,y,time,easing)x,y是索引
                    this.slider.goToPage(pageIndex, 0, 400)
                }, this.interval)
            }
        },
        props: { // 设置是否可以循环轮播
            loop: {
                type: Boolean,
                default: true
            },
            autoPlay: { // 自动轮播
                type: Boolean,
                default: true
            },
            interval: { // 设置4秒轮播
                type: Number,
                default: 4000
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    .slider
        min-height: 1px
        .slider-group
            position: relative
            overflow: hidden
            white-space: nowrap
            .slider-item
                float: left
                box-sizing: border-box
                overflow: hidden
                text-align: center
                a 
                    display: block
                    width: 100%
                    overflow: hidden
                    text-decoration: none
                img
                    display: block
                    width: 100%  // 关键，设置之后宽度和高度等比例
        .dots   // 相对于slider-wrapper定位
            position: absolute
            right: 0
            left: 0
            bottom: 12px
            text-align: center
            font-size: 0
            .dot
                display: inline-block
                margin: 0 4px
                width: 8px
                height: 8px
                border-radius: 50%
                background: $color-text-l
                &.active
                    width: 20px
                    border-radius: 5px
                    background: $color-text-ll
</style>