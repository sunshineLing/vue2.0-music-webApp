<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>

<script type="text/ecmascript-6">
    import BScroll from 'better-scroll'

    export default {
        props: {
            probeType: {    // 缓慢拖动的时候能监听到或快速拖动的时候监听
                type: Number,
                default: 1
            },
            click: {    // scroll已设置的区域是否可以点击
                type: Boolean,
                default: true
            },
            data: { // 组件套的数据是动态变化的，变化了就需要refresh,否则数据变化了就无法滚动
                type: Array,
                default: null
            },
            listenScroll: { // 监听滚动的距离
                type: Boolean,
                default: false
            },
            pullup: {   // 是否开始上拉刷新
                type: Boolean,
                default: false
            },
            beforeScroll: { // 在列表滚动之前触发
                type: Boolean,
                default: false
            }
        },
        mounted () {    // 初始化scroll的方法在dom ready的时候调用
            setTimeout(() => {  // 确保dom树渲染完毕之后
               this._initScroll()
            }, 20)
        },
        // 传进来的有data,用watch来检测data的变化,如果数据有变化，就调用刷新方法重新计算高度，这样就不用使用scroll组件的适用方在数据变化的时候再调用scroll方法，而是被使用的组件自己去检测数据变化，自己自动刷新
        watch: {
            data (newVal) {
                setTimeout(() => {
                    this.refresh()
                }, 20)
            }
        },
        methods: {
            _initScroll () {
                // 假设被调用，dom元素没有的时候，就返回
                if (!this.$refs.wrapper) {
                    return
                }
                this.scroll = new BScroll(this.$refs.wrapper, {
                    probeType: this.probeType,  // 配置的参数
                    click: this.click
                })

                // 初始化的时候，如果传入的值，需要监听事件
                if (this.listenScroll) {
                    let _this = this
                    this.scroll.on('scroll', (pos) => {
                        // 触发事件，将当前滚动的位置传值给父组件
                        // 这里this的指向会改变，变为scroll
                        _this.$emit('scroll', pos)
                    })
                }

                // 判断是否上拉刷新
                if (this.pullup) {
                    // 监听滚动结束事件
                    this.scroll.on('scrollEnd', () => {
                        // 回调里面
                        if (this.scroll.y <= (this.scroll.maxScrollY + 50)) {   
                            // 触发到滚动到底部事件
                            this.$emit('scrollToEnd')
                        }
                    })
                }

                // 初始化的时候监听是否有beforeScrollstart事件，对外派发
                if (this.beforeScroll) {
                    this.scroll.on('beforeScrollStart', () => {
                        // 对外派发beforeSCroll事件
                        this.$emit('beforeScroll')
                    })
                }
            },
            // 方法的代理
            enable () {
                this.scroll && this.scroll.enable()
            },
            disable () {
                this.scroll && this.scroll.disable()
            },
            // scroll的刷新方法，重新计算高度
            refresh () {
                this.scroll && this.scroll.refresh()
            },
            // 滚动到某个位置的方法
            scrollTo () {
                this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
            },
            scrollToElement () {
                this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
            }
        }
    }
</script>