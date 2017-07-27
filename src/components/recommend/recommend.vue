<template>
    <div class="recommend" ref="recommend">
        <!--把原来的这个div改成scroll组件，没有传入slider的数据是因为slider的数据获取的-->
        <!--<sc class="recommend-content">-->
        <scroll class="recommend-content" :data="discList" ref="scroll">
            <!--设置div是关键的一步，可以让slider和list一起滚动-->
            <div>
                <div v-if="recommends.length" class="slider-wrapper">
                    <!--引入slider组件-->
                    <slider>
                        <!--插槽slot相关的dom-->
                        <div v-for="item in recommends">
                            <!--图片链接-->
                            <a :href="item.linkUrl">
                                <img @load="loadImage" class="needsclick" :src="item.picUrl" alt="">
                            </a>
                        </div>
                    </slider>
                </div>
                <div class="recommend-list">
                    <h1 class="list-title">热门歌单推荐</h1>
                    <!--歌单列表-->
                    <ul>
                        <li v-for="item in discList" class="item" @click="selectItem(item)">
                            <div class="icon">
                                <img width="60" height="60" v-lazy="item.imgurl" alt="">
                            </div>
                            <div class="text">
                                <h2 class="name" v-html="item.creator.name"></h2>
                                <p class="desc" v-html="item.dissname"></p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <!--loading需要居中，显示的时机是列表没有数据的时候-->
            <div class="loading-container" v-show="!discList.length">
                <loading></loading>
            </div>
        </scroll>
        <!--添加性情页的二级路由容器-->
        <router-view></router-view>
    </div>
</template>

<script type="text/ecmascript-6">
    import { getRecommend, getDiscList } from '../../api/recommend.js'
    import { ERR_OK } from '../../api/config.js'
    import Slider from '../../base/slider/slider.vue'
    import Scroll from '../../base/scroll/scroll.vue'
    import Loading from '../../base/loading/loading.vue'
    import {playListMixin} from '../../common/js/mixin.js'
    import {mapMutations} from 'vuex'

    export default {
        mixins: [playListMixin],
        data () {
            return {
                recommends: [],  // 推荐slider的图片数据
                discList: []    // 歌单列表的数据
            }
        },
        created () {
            // 1.0 获取轮播图的数据
            this._getRecommedData()

            // 2.0 获取歌单列表的数据
            this._getDiscListData()
        },
        methods: {
            // 1.0 调用api里面定义的方法
            _getRecommedData () {
                getRecommend().then((res) => {
                    if (res.code === ERR_OK) {
                        // 返回的是一个轮播图的数组
                        this.recommends = res.data.slider
                    }
                })
            },
            // 2.0
            _getDiscListData () {
                getDiscList().then((res) => {
                    if (res.code === ERR_OK) {
                        this.discList = res.data.list
                    }
                })
            },
            // 解决img未加载完毕，导致slider未被图片撑开，滚动的时候discList无法滚动到底部，检测图片加载状态，有一张图片加载了，就刷新scroll方法
            loadImage () {
                if (!this.checkloaded) {
                    this.checkloaded = true
                    this.$refs.scroll.refresh()
                }
            },
            // 3.0 当mini播放器显示在页面底部的时候，可滚动列表的高度在底部预留出播放器的高度60px
            handlePlayList (playList) {
                const bottom = playList.length > 0 ? '60px' : 0
                this.$refs.recommend.style.bottom = bottom
                // refresh（）方法在listView组件里面已经定义
                this.$refs.scroll.refresh()
            },
            // 4.0 点击歌单列表时，跳转到歌单详情页，设置路由
            selectItem (item) {
                this.$router.push({
                    path: `/recommend/${item.dissid}`
                })
                // 修改mutations的值
                this.setDisc(item)
            },
            ...mapMutations({
                setDisc: 'SET_DISC'
            })
        },
        components: {
            Slider,  // slider组件
            Scroll,  // scroll组件
            Loading  // loading组件
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    .recommend
       position: fixed
       width: 100%
       top: 88px
       bottom: 0
       .recommend-content
            height: 100%
            overflow: hidden
            .slider-wrapper
                position: relative
                width: 100%
                overflow: hidden
            .recommend-list
                .list-title
                    height: 65px
                    line-height: 65px
                    text-align: center
                    font-size: $font-size-medium
                    color: $color-theme
                .item
                    display: flex
                    box-sizing: border-box
                    align-items: center
                    padding: 0 20px 20px 20px 
                    .icon
                        flex: 0 0 60px
                        width: 60px
                        padding-right: 20px
                    .text
                        display: flex
                        flex-direction: column
                        justify-content: center
                        flex: 1
                        line-height: 20px
                        font-size: $font-size-medium
                        overflow: hidden
                        .name
                            margin-bottom: 10px
                            color: $color-text
                        .desc
                            color: $color-text-d
            .loading-container 
                position: absolute
                width: 100%
                top: 50%
                transform: translateY(-50%)
</style>