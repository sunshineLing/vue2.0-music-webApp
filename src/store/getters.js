// 包装取数据
export const singer = state => state.singer
/**
 * 箭头函数的简写，相当于
 * function singer(state) {
        return state.singer
    }
 */

export const playing = state => state.playing

export const fullScreen = state => state.fullScreen

export const playList = state => state.playList

export const sequenceList = state => state.sequenceList

export const mode = state => state.mode

export const currentIndex = state => state.currentIndex

export const currentSong = (state) => {
    return state.sequenceList[state.currentIndex] || {}
}

export const disc = state => state.disc

export const topList = state => state.topList

export const searchHistory = state => state.searchHistory

// 获取播放历史记录
export const playHistory = state => {
    state.playHistory
}