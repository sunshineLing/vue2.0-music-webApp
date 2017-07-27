import storage from 'good-storage'

const SEARCH_KEY = '__search__' 

// 最大只缓存15条，每次插入的放在数组的前面
const SEARCH_MAX_LENGTH = 15

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200

function insertArray(arr, val, compare, maxlen) {
    // compare是findIndex里面的比较的函数
    const index = arr.findIndex(compare)
    // 如果查找到的已经存在，且是第一条数据，那么什么都不处理
    if (index === 0) {
        return
    }
    // 如果不是第一条数据，就先删掉这条数据
    if (index > 0) {
        arr.splice(index, 1)
    }
    // 将需要插入的值放在数组的第一个位置
    arr.unshift(val)
    // 超过了定义的最大长度，把最后一个给删掉
    if (maxlen && arr.length > maxlen) {
        arr.pop()
    }
}

// 删除搜索历史数组的方法
function deleteFromArray (arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) {
        arr.splice(index, 1)
    }
}

// 用localstroage缓存搜索历史的相关逻辑
export function saveSearch (query) {
    // 如果没有存储过，就是一个空数组
    let searches = storage.get(SEARCH_KEY, [])

    // 在searches数组里面插入query
    insertArray(searches, query, (item) => {
        return item === query
    }, SEARCH_MAX_LENGTH)

    // 设置存储
    storage.set(SEARCH_KEY, searches)

    // 把searches数组返回出去
    return searches
}

// 删除搜索历史里面的某一下query
export function deleteSearch(query) {
    let searches = storage.get(SEARCH_KEY, [])

    deleteFromArray(searches, (item) => {
        return item === query
    })

    // 保存新的数组
    storage.set(SEARCH_KEY, searches)

    // 把searches数组返回出去
    return searches
}

// 清除历史记录的方法
export function clearSearch() {
    // 调用storage的remove清空方法
    storage.remove(SEARCH_KEY)
    // 返回一个空数组
    return []
}

// 从本地缓存去读search的值，并设置给state的值
export function loadSearch () {
    return storage.get(SEARCH_KEY, [])
}

// 存储播放记录
export function savePlay (song) {
    let songs = storage.get(PLAY_KEY, [])
    insertArray(songs, song, (item) => {
        return item.id === song.id
    }, PLAY_MAX_LENGTH)
    storage.set(PLAY_KEY, songs)
    return songs
}

// 从本地还从里面读取
export function loadPlay () {
    return storage.get(PLAY_KEY, [])
}