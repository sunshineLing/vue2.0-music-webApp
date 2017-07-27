// 引入jsonp方法
import jsonp from '../common/js/jsonp.js'
import {commonParams, options} from './config.js'

// 定义获取排行榜数据的方法
export function getTopList () {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg'

    const data = Object.assign({}, commonParams, {
        uin: 0,
        platform: 'h5',
        needNewCode: 1
    })

    return jsonp(url, data, options)
}

// 获取列表歌曲详情页的歌曲数据
export function getSongList (id) {
    const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
    
    const data = Object.assign({}, commonParams, {
        tpl: 3,
        page: 'detail',
        topid: id,
        type: 'top',
        song_begin: 0,
        song_num: 30,
        loginUin: 0,
        hostUin: 0,
        platform: 'yqq',
        needNewCode: 0
    })
    return jsonp(url, data, options)
}