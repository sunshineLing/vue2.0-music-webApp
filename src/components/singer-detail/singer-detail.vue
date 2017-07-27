<template>
    <!--给跳转到歌手详情页添加动画-->
    <transition name="slide">
         <music-list :songs="songList" :title="title" :bg-image="bgImage"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
    import {mapGetters} from 'vuex'
    import {getSingerDetail} from '../../api/singer.js'
    import {ERR_OK} from '../../api/config.js'
    import {createSong} from '../../common/js/song.js'
    import MusicList from '../music-list/music-list.vue'

    export default {
        data () {
            return {
                songList: []
            }
        },
        computed: {
            // 从vuex的store里面取数据
            ...mapGetters([
                'singer'
            ]),
            // 获取歌手详情页的title
            title () {
                return this.singer.name
            },
            // 获取歌手详情页的头像
            bgImage () {
                return this.singer.avatar
            }
        },
        created () {
            this.getSingerDetailData(this.singer.id)
        },
        methods: {
            // 1.0 获取歌手详情数据
            getSingerDetailData (singerId) {
                // 1.1 如果当前的页面无法获取到歌手的id，回退到上一个页面
                if (!this.singer.id) {
                    this.$router.push('/singer')
                    return
                }
                getSingerDetail(singerId).then((res) => {
                    if (res.code === ERR_OK) {
                        this.songList = this._normalizeSongList(res.data.list)
                    }
                })
            },
            // 2.0 处理歌曲信息的列表
            _normalizeSongList (list) {
                let ret = []
                list.forEach((item) => {
                    let musicData = item.musicData
                    if (musicData.songid && musicData.albummid) {
                        ret.push(createSong(musicData))
                    }
                })
                return ret
            }
        },
        components: {
            MusicList
        }
    }
</script>

<style lang="stylus" rel="stylesheet/stylus">
    @import '../../common/stylus/variable.styl'
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s
    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)  // 从右到左划入的动画
</style>