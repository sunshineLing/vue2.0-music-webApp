// 封装获取推荐组件里面的轮播图图片的方法

// 引入暴露出来的jsonp方法，因为是用export default 暴露出来的，不是用export function 方法，所以不用{}来导入
import jsonp from '../common/js/jsonp.js'
import {commonParams, options, options1} from './config.js'
import axios from 'axios'

export function getRecommend () {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

    // object.assign方法用于将所有可枚举的属性的值从一个或多个源对象复制到目标对象，将返回一个目标对象，相当于jquery里面的$.extend({},obj1, obj2)  对象的浅拷贝
    // 第一个参数是拷贝之后，返回的对象，target
    // 后面是要拷贝的对象源
    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        uin: 0, // 登陆之后是qq号
        needNewCode: 1
    })

    return jsonp(url, data, options)
}

// 获取歌单数据,使用了node端代理，而不是前端直接跨域请求，此处是一个ajax请求，不用jsonp,而是axios
export function getDiscList () {
    const url = '/api/getDiscList'
    const data = Object.assign({}, commonParams, {
        loginUin: 0,
        hostUin: 0,
        platform: 'yqq',
        needNewCode: 0,
        categoryId: 10000000,
        sortId: 5,
        sin: 0,
        ein: 29,
        rnd: Math.random(),
        format: 'json'  // 否则返回的是一个jsonp格式的字符串
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}

// 获取歌单详情的列表数据
export function getSongList(disstid) {
  const url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'

  const data = Object.assign({}, commonParams, {
    disstid,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0
  })

  return jsonp(url, data, options1)
}