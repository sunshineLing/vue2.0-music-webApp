<template>
    <transition name="list-fade">
        <div class="playlist" v-show="showFlag" @click="hide">
            <div class="list-wrapper" @click.stop>
                <!--1.0 列表头部-->
                <div class="list-header">
                    <h1 class="title">
                        <i class="icon" :class="iconMode" @click="changeMode"></i>
                        <span class="text">{{modeText}}</span>
                        <span class="clear" @click="showConfirm">
                            <i class="icon-clear"></i>
                        </span>
                    </h1>
                </div>
                <!--2.0 列表内容-->
                <scroll class="list-content" :data="sequenceList" ref="listContent">
                    <transition-group ref="list" name="list" tag="ul">
                        <li :key="item.id" ref="listItem" class="item" v-for="(item,index) in sequenceList" @click="selectItem(item,index)">
                            <i class="current" :class="getCurrentIcon(item)"></i>
                            <span class="text">{{item.name}}</span>
                            <span class="like">
                                <i></i>
                            </span>
                            <span class="delete" @click.stop="deleteOne(item)">
                                <i class="icon-delete"></i>
                            </span>
                        </li>
                    </transition-group>
                </scroll>
                <!--3.0 列表操作按钮-->
                <div class="list-operate">
                    <div class="add" @click="addSong">
                        <i class="icon-add"></i>
                        <span class="text">添加歌曲到队列</span>
                    </div>
                </div>
                <!--4.0 列表的关闭-->
                <div class="list-close" @click="hide">
                    <span>关闭</span>
                </div>
            </div>
            <confirm ref="confirm" text="是否清空播放列表" confirmBtnText="清空" @confirm="confirmClear"></confirm>
            <!--添加歌曲列表组件-->
            <add-song ref="addSong"></add-song>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">
    import {mapGetters, mapMutations, mapActions} from 'vuex'
    import Scroll from '../../base/scroll/scroll.vue'
    import {playMode} from '../../common/js/config.js'
    import Confirm from '../../base/confirm/confirm.vue'
    import AddSong from '../../components/add-song/add-song.vue'
    import {playerMixmin} from '../../common/js/mixin.js'

    export default {
        mixins: [playerMixmin],
        data () {
            return {
                showFlag: false
            }
        },
        computed: {
            modeText () {
                return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.random ? '随机播放' : '单曲循环'
            },
            ...mapGetters([
                'sequenceList',
                'currentSong',
                'playList',
                'mode'
            ])
        },
        methods: {
            show () {
                this.showFlag = true
                // 列表滚动效果
                setTimeout(() => {
                    this.$refs.listContent.refresh()
                    this.scrollToCurrent(this.currentSong)
                }, 20)
            },
            hide () {
                this.showFlag = false
            },
            // 当前播放歌曲的样式
            getCurrentIcon (item) {
                return item.id === this.currentSong.id ? 'icon-play' : ''
            },
            // 点击当前列表的时候播放当前选择的歌曲
            selectItem (item, index) {
                // 设置歌曲
                if (this.mode === playMode.random) {
                    index = this.playList.findIndex((song) => {
                        return song.id === item.id
                    })
                }
                this.setCurrentIndex(index)
                this.setPlayingState(true)
            },
            // 滚动到当前播放的歌曲
            scrollToCurrent (current) {
                const index = this.sequenceList.findIndex((song) => {
                    return current.id === song.id
                })
                this.$refs.listContent.scrollToElement(this.$refs.list.$el.children[index], 300)
            },
            // 删除当前这一首歌曲
            deleteOne (item) {
                // 就是去action里面修改歌曲的列表和当前播放列表
                this.deleteSong(item)
                if (!this.playList.length) {
                    this.hide()
                }
            },
            // 清空播放列表时确认弹出框
            showConfirm () {
                this.$refs.confirm.show()
            },
            confirmClear () {
                this.deleteSongList()
                this.hide()
            },
             ...mapMutations({
                setCurrentIndex: 'SET_CURRENT_INDEX',
                setPlayingState: 'SET_PLAYING_STATE'
            }),
            // 添加歌曲
            addSong () {
                // 调用添加歌曲的方法
                this.$refs.addSong.show()
            },
            ...mapActions([
                'deleteSong',
                'deleteSongList'
            ])
        },
        watch: {
            currentSong (newSong, oldSong) {
                if (!newSong.id) {
                    return
                }
                if (!this.showFlag || newSong.id === oldSong.id) {
                    return
                }

                setTimeout(() => {
                    this.scrollToCurrent(newSong)
                })
            }
        },
        components: {
            Scroll,
            Confirm,
            AddSong
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    @import '../../common/stylus/mixin.styl'

    .playlist
        position: fixed
        left: 0
        right: 0
        top: 0
        bottom: 0
        z-index: 200
        background-color: $color-background-d
        &.list-fade-enter-active, &.list-fade-leave-active
            transition: opacity 0.3s
            .list-wrapper 
                transition: all 0.3s
            &.list-fade-enter, &.list-fade-leave-to
                opacity: 0
                .list-wrapper  
                    transform: translate3d(0, 100%, 0)
        .list-wrapper
            position: absolute
            left: 0
            bottom: 0
            width: 100%
            background-color: $color-highlight-background
            .list-header    
                position: relative
                padding: 20px 30px 10px 20px
                .title
                    display: flex
                    align-items: center
                    .icon
                        margin-right: 10px
                        font-size: 30px
                        color: $color-theme-d
                    .text
                        flex: 1
                        font-size: $font-size-medium
                        color: $color-text-l
                    .clear
                        extend-click()
                        .icon-clear
                            font-size: $font-size-medium
                            color: $color-text-d         
            .list-content
                max-height: 240px
                overflow: hidden
                .item
                    display: flex
                    align-items: center
                    height: 40px
                    padding: 0 30px 0 20px
                    overflow: hidden
                    &.list-enter-active, &.list-leave-active
                        transition: all 0.1s
                    &.list-enter, &.list-leave-to
                        height: 0
                    .current
                        flex: 0 0 20px
                        width: 20px
                        font-size: $font-size-small
                        color: $color-theme-d
                    .text
                        flex: 1
                        no-wrap()
                        font-size: $font-size-medium
                        color: $color-text-d
                    .like
                        extend-click()
                        margin-right: 15px
                        font-size: $font-size-small
                        color: $color-theme
                        .icon-favorite
                            color: $color-sub-theme
                    .delete
                        extend-click()
                        font-size: $font-size-small
                        color: $color-theme
            .list-operate
                width: 140px
                margin: 20px auto 30px auto
                .add
                    display: flex
                    align-items: center
                    padding: 8px 16px
                    border: 1px solid $color-text-l
                    border-radius: 100px
                    color: $color-text-l 
                    .icon-add
                        margin-right: 5px
                        font-size: $font-size-small-s
                    .text
                        font-size: $font-size-small  
            .list-close
                text-align: center
                line-height: 50px
                background: $color-background
                font-size: $font-size-medium-x
                color: $color-text-l       
</style>