import {playMode} from '../common/js/config.js'
import {loadSearch, loadPlay} from '../common/js/cache.js'

// 定义歌手的数据
const state = {
    singer: {},
    playing: false, // 播放状态
    fullScreen: false,  // 全屏状态
    playList: [],   // 播放列表
    sequenceList: [],    // 顺序播放列表
    mode: playMode.sequence, // 默认播放模式是顺序播放
    currentIndex: -1,    // 默认当前播放的歌曲的索引，默认是-1
    disc: {},    // 推荐的歌单列表的歌单数据
    topList: {},     // 排行歌单列表的单条数据
    searchHistory: loadSearch(),   // 搜索历史数据
    playHistory: loadPlay() // 播放歌曲历史纪录，缓存到本地
}

export default state