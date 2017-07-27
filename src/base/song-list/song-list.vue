<template>
    <div class="song-list">
        <ul>
            <li @click="selectItem(song,index)" v-for="(song,index) in songs" class="item">
                <!--奖杯图标，如果props传入的有值的话-->
                <div class="rank" v-show="rank">
                    <span :class="getRankCls(index)">{{getRankText(index)}}</span>
                </div>
                <div class="content">
                    <h2 class="name">{{song.name}}</h2>
                    <p class="desc">{{getDesc(song)}}</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<script type="text/ecmascript-6">
    export default {
        props: {
            songs: {
                type: Array,
                default: function () {
                    return []
                }
            },
            rank: {
                type: Boolean,
                default: false
            }
        },
        mounted () {
            console.log(this.songs)
        },
        methods: {
            // 获取歌曲列表的详细信息
            getDesc (song) {
                console.log(this.songs)
                return `${song.singer}·${song.album}`
            },
            // 点击某一个歌曲列表时触发事件，传值
            selectItem (song, index) {
                this.$emit('select', song, index)
            },
            // 获取奖杯图标样式，前三返回图标样式，否则是文字样式
            getRankCls (index) {
                if (index <= 2) {
                    return `icon icon${index}`
                } else {
                    return `text`
                }
            },
            getRankText (index) {
                if (index > 2) {
                    return index + 1
                }
            }
        }
    }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    @import '../../common/stylus/mixin.styl'
    .song-list
        .item
            display: flex
            align-items: center
            box-sizing: border-box
            height: 64px
            font-size: $font-size-medium
            .rank
                flex: 0 0 25px
                width: 25px
                margin-right: 30px
                text-align: center
                .icon
                    display: inline-block
                    width: 25px
                    height: 24px
                    background-size: 25px 25px
                    &.icon0
                        bg-image('first')
                    &.icon1
                        bg-image('second')
                    &.icon2
                        bg-image('third')
                    .text
                        color: $color-theme
                        font-size: $font-size-large
            .content
                flex: 1
                line-height: 20px
                overflow: hidden 
                .name
                    no-wrap()
                    color: $color-text
                .desc
                    no-wrap()
                    margin-top: 4px
                    color: $color-text-d        
</style>