<template>
  <transition name="slide">
    <music-list :title="title" :bgImage="bgImage" :songs="songs" :rank="rank"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
    import MusicList from '../music-list/music-list'
    import {mapGetters} from 'vuex'
    import {getSongList} from '../../api/rank.js'
    // import {ERR_OK} from '../../api/config.js'
    import {createSong} from '../../common/js/song.js'

    export default {
        data () {
            return {
                songs: [],
                rank: true
            }
        },
        created () {
            this._getSongListData()
        },
        computed: {
            title () {
                return this.topList.topTitle
            },
            bgImage () {
                // 如果有歌曲列表，就返回第一首歌曲的图片
                if (this.songs.length) {
                    return this.songs[0].image
                }
                return this.topList.picUrl
            },
            ...mapGetters([
                'topList'
            ])
        },
        methods: {
            _getSongListData () {
                // 如果是直接刷新本页，就返回到上一页
                if (!this.topList.id) {
                    this.$router.push({
                        path: '/rank'
                    })
                }
                getSongList(this.topList.id).then((res) => {
                    this.songs = this._normalizeSongList(res.songlist)
                })
            },
            // 处理返回的songlist列表，获取每一条song需要的信息组成的数组
            _normalizeSongList (list) {
                let ret = []
                list.forEach((item) => {
                    const musicData = item.data
                    if (musicData.albumid && musicData.songid) {
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
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>