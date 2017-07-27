// 引入store里面的getter方法，以便于拿到播放列表数据
import {mapGetters, mapMutations, mapActions} from 'vuex'
import {playMode} from '../../common/js/config.js'
import {shuffle} from '../../common/js/uitl.js'

export const playListMixin = {
    computed: {
        ...mapGetters([
            'playList'
        ])
    },
    // domready时候
    mounted () {
        this.handlePlayList(this.playList)
    },
    // keep-alived组件切换过来的时候
    activated () {
        this.handlePlayList(this.playList)
    },
    watch: {
        // 监听playList的变化
        playList (newVal) {
            this.handlePlayList(newVal)
        }
    },
    methods: {
        // 处理playList的方法
        handlePlayList () {
            throw new Error('component must implement handlePlayList method')
        }
    }
}

export const playerMixmin = {
    computed: {
        // 歌曲播放模式,设置歌曲播放模式的class
        iconMode () {
            return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
        },
        ...mapGetters([
            'playing',
            'currentIndex',
            'mode',
            'sequenceList'
        ])
    },
    methods: {
        // 改变歌曲列表的播放模式
        changeMode () {
            const mode = (this.mode + 1) % 3    // 模式在0-2之间切换
            // 通过mutations设置mode的状态
            this.setPlayMode(mode)
            let list = null
            // 如果播放模式是随机播放
            if (mode === playMode.random) {
                // 先拿到顺序播放的列表,将顺序播放列表打乱
                list = shuffle(this.sequenceList)
            } else {
                list = this.sequenceList
            }
            // 找到新的列表里面当前这首歌曲，在新的列表的索引
            this.resetCurrentIndex(list)
            // 修改mutatios的playlist的值
            this.setPlayList(list)
        },
        // 找到当前播放的歌曲，在新的模式的列表中的索引
        resetCurrentIndex (list) {
            let index = list.findIndex((item) => {
                return item.id === this.currentSong.id
            })
            // 给mutations的currentIndex 设置为当前的index,保证模式切换的时候，当前播放的歌曲还是原来的那首
            this.setCurrentIndex(index)
        },
        ...mapMutations({
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayMode: 'SET_PLAY_MODE',
            setPlayList: 'SET_PLAYLIST'
        })
    }
}

// 添加歌曲，search相关的js逻辑重复的地方
export const searchMixin = {
    computed: {
        // 获取历史存储记录的数据
        ...mapGetters([
            'searchHistory'
        ])
    },
    methods: {
        // 添加搜索关键词
        addQuery (query) {
            console.log(1)
            // 点击搜索关键词的时候，给search-box设置关键词
            this.$refs.searchBox.setQuery(query)
        },
        // 监听到子组件传递过来的列表将要被滚动的事件的时候，让文本框失去焦点，手机端键盘就会被收起
        blurInput () {
            // 通过search-box调用search-box里面定义的失去焦点的blur方法
            this.$refs.SearchBox.blur()
        },
        // 保存搜索历史
        saveSearch () {
            this.saveSearchHistory(this.query)
        },
        // 搜索文本框的值改变的时候，将改变后的值传递过来了
        onQueryChange (newQuery) {
            // 将当前要向服务器传递的参数query的值设置为从search-box传递过来的值
            this.query = newQuery
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory'
        ])
    }
}