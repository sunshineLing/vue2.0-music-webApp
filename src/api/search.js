// 引入jsonp方法
import jsonp from '../common/js/jsonp.js'
import {commonParams, options} from './config.js'

export function getHotKey () {
    const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'

    const data = Object.assign({}, commonParams, {
        uin: 0,
        format: 'json',
        platform: 'h5',
        needNewCode: 1
    })

    return jsonp(url, data, options)
}

// 根据搜索关键词获取搜索结果数据
export function getSuggest (query, page, zhida, perpage) {
    const url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
    const data = Object.assign({}, commonParams, {
        uin: 0,
        platform: 'h5',
        needNewCode: 1,
        w: query,
        zhidaqu: 1,
        catZhida: zhida ? 1 : 0,    // 歌手直达
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        perpage: perpage,   // 每页获取的数据条数，比如20条
        n: perpage,     // 每次获取的条数
        p: page,    // 检索的是第几页
        remoteplace: 'txt.mqq.all'
    })

    return jsonp(url, data, options)
}

