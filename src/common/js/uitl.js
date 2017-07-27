// 数组顺序打乱，随机播放
export function shuffle (arr) {
    let _arr = arr.slice()
    // 从0-i之间去取一个数，取一个索引，将这个索引和arr[i]作交换
    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0, i)
        // 临时交换
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return arr
}

// 返回min到max之间的一个随机数，包括max
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

// 点击输入的search-box的时候，不会立即向服务器发送请求，会先节流
// 原理就是处理要节流的函数，返回一个新的函数，对要执行的函数做牙齿
export function debounce(func, delay) {
    let timer

    return function (...args) {
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args)
        }, delay)
    }
}