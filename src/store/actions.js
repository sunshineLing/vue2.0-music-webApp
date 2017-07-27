// 定义修改mutations的行为

import * as types from './mutation-types.js'
import {playMode} from '../common/js/config.js'
import {shuffle} from '../common/js/uitl.js'
import {saveSearch, deleteSearch, clearSearch, savePlay} from '../common/js/cache.js'

function findIndex (list, song) {
    return list.findIndex((item) => {
        return item.id === song.id
    })
}

export const selectPlay = function ({commit, state}, {list, index}) {
    // 设置播放列表，循序播放列表，播放的歌曲的dangqiansuoyin
    commit(types.SET_SEQUENCE_LIST, list)
    if (state.mode === playMode.random) {
        let randomList = shuffle(list)
        commit(types.SET_PLAYLIST, randomList)
        index = findIndex(randomList, list[index])
    } else {
        commit(types.SET_PLAYLIST, list)
    }
    commit(types.SET_CURRENT_INDEX, index)
    commit(types.SET_PLAYING_STATE, true) // 设置为播放
    commit(types.SET_FULL_SCREEN, true) // 设置播放全屏
}

// 点击随机播放全部按钮
export const randomPlay = function ({commit, state}, {list}) {
    commit(types.SET_PLAY_MODE, playMode.random)
    commit(types.SET_SEQUENCE_LIST, list)
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    commit(types.SET_CURRENT_INDEX, 0)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

export const insertSong = function ({commit, state}, song) {
    let playList = state.playList.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    // 记录当前歌曲
    let currentSong = playList[currentIndex]

    // 查找需要插入的歌曲在当前的列表里面有没有,返回其索引
    let fpIndex = findIndex(playList, song)
    // 因为是插入歌曲，所以索引要+1
    currentIndex++
    // 插入一首歌到当前索引位置
    playList.splice(currentIndex, 0, song)
    // 如果已经包含了这首歌
    if (fpIndex > -1) {
        // 如果当前插入的序号大于列表原来歌曲的位置的序号，直接删除
        if (currentIndex > fpIndex) {
            playList.splice(fpIndex, 1)
            currentIndex--
        } else {
            // 因为插入了一个数据，所以实际上fpIndex所在索引的数据已经向后加了一位，所以需要+1
            playList.splice(fpIndex + 1, 1)  
        }
    }

    // 处理在sequence里面插入的位置
    // 先找到当前歌曲在se列表的位置，插入的位置+1
    let currentSIndex = findIndex(sequenceList, currentSong) + 1

    // 查询之前的sequence有没有包含要插入的这首歌
    let fsIndex = findIndex(sequenceList, song)
    // 插入一首歌
    sequenceList.splice(currentSIndex, 0, song)

    // 判断之前有没有
    if (fsIndex > -1) {
        if (currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1)
        } else {
            sequenceList.splice(fsIndex + 1, 1)
        }
    }

    // 提交
    commit(types.SET_PLAYLIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)
    commit(types.SET_FULL_SCREEN, true)
    commit(types.SET_PLAYING_STATE, true)
}

// 保存搜索历史
export const saveSearchHistory = function ({commit, state}, query) {
    commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

// 删除搜索历史记录
export const deleteSearchHistory = function ({commit, state}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 清空搜索历史记录的方法
export const clearSearchHistory = function ({commit, state}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch())
}

// 删除当前播放列表
export const deleteSong = function ({commit, state}, song) {
    let playList = state.playList.slice()
    let sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex

    let pIndex = findIndex(playList, song)
    playList.splice(pIndex, 1)

    let sIndex = findIndex(sequenceList, song)
    sequenceList.splice(sIndex, 1)

    if (currentIndex > pIndex || currentIndex === playList.length) {
        currentIndex--
    }

    commit(types.SET_PLAYLIST, playList)
    commit(types.SET_SEQUENCE_LIST, sequenceList)
    commit(types.SET_CURRENT_INDEX, currentIndex)

    const playingState = playList.length > 0 

    commit(types.SET_PLAYING_STATE, playingState)
}

export const deleteSongList = function ({commit}) {
    commit(types.SET_PLAYLIST, [])
    commit(types.SET_SEQUENCE_LIST, [])
    commit(types.SET_CURRENT_INDEX, -1)
    commit(types.SET_PLAYING_STATE, false)
}

// 定义保存播放歌曲历史记录的方法
export const savePlayHistory = function ({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song))
}