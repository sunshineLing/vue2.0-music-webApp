<template>
    <transition name="slide">
        <music-list :title="title" :bgImage="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script type="text/ecmascript-6">
    import MusicList from '../../components/music-list/music-list.vue'
    import {mapGetters} from 'vuex'
    import {getSongList} from '../../api/recommend.js'
    import {ERR_OK} from '../../api/config.js'
    import {createSong} from '../../common/js/song.js'

    export default {
        data () {
            return {
                songs: []
            }
        },
        computed: {
            title () {
                return this.disc.dissname
            },
            bgImage () {
                return this.disc.imgurl
            },
            ...mapGetters([
                'disc'
            ])
        },
        created () {
            // 获取歌曲列表数据
            this._getSongListData()
        },
        methods: {
            _getSongListData () {
                // 处理刷新页面没有数据的问题，这个时候是没有dissid的时候，给设置权限，跳转到上一个页面
                if (!this.disc.dissid) {
                    this.$router.push('/recommend')
                    return
                }
               getSongList(this.disc.dissid).then((res) => {
                   if (res.code === ERR_OK) {
                       this.songs = this._normalizeSongs(res.cdlist[0].songlist)
                       console.log(this.songs)
                   }
               }) 
            },
            // 处理返回的列表数据，把列表转化为一首首歌曲，歌曲对象里面有需要的数据
            _normalizeSongs (list) {
                let ret = []
                list.forEach((musicData) => {
                    // 调用之前定义过的生成song数组的方法
                    if (musicData.songid && musicData.albumid) {
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

<style scoped lang="stylus" rel="stylesheet/stylus">
    .slide-enter-active, .slide-leave-active
        transition: all 0.3s
    .slide-enter, .slide-leave-to
        transform: translate3d(100%, 0, 0)
</style>
