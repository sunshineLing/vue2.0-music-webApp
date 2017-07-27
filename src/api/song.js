import {commonParams} from '../api/config.js'
import axios from 'axios'

// 获取歌词
export function getLyric (mid) {
    const url = '/api/lyric'

    const data = Object.assign({}, commonParams, {
        pcachetime: +new Date(),
        songmid: mid,
        loginUin: 0,
        hostUin: 0,
        format: 'json',
        platform: 'yqq',
        needNewCode: 0
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}