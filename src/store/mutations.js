// 引入所有的常量
import * as types from './mutation-types.js'

// 定义matutaions 
const matutaions = {
    // 相关的修改方法,同步的修改状态
    [types.SET_SINGER](state, singer) {
        state.singer = singer
    },
    [types.SET_PLAYING_STATE](state, flag) {
        state.playing = flag
    },
    [types.SET_FULL_SCREEN](state, flag) {
        state.fullScreen = flag
    },
    [types.SET_PLAYLIST](state, list) {
        state.playList = list
    },
    [types.SET_SEQUENCE_LIST](state, list) {
        state.sequenceList = list
    },
    [types.SET_PLAY_MODE](state, mode) {
        state.mode = mode
    },
    [types.SET_CURRENT_INDEX](state, index) {
        state.currentIndex = index
    },
    [types.SET_DISC](state, disc) {
        state.disc = disc
    },
    [types.SET_TOP_LIST](state, topList) {
        state.topList = topList
    },
    [types.SET_SEARCH_HISTORY](state, historyList) {
        state.searchHistory = historyList
    },
    [types.SET_PLAY_HISTORY](state, history) {
        state.playHistory = history
    }
}

export default matutaions