/**
 * 因为在很多地方都要用到jsonp，所以封装一个通用的方法，传入地址即可调用
 */
// 导入原始的jsonp库
import originJSONP from 'jsonp'

// 暴露一个jsonp方法
// 第二个参数data，通常传给服务端的地址url是带参数的，库是不支持传入一个Objectdata的，需要先把url拼好，再去调用这个库，使用的时候，希望传入一个纯净的url地址，参数用对象的形式传入，拼到url上面，这样调用就更加方便
export default function jsonp (url, data, option) {
    // 判断url参数里面有没有?，如果没有，api/user + '?' + data,r如果有的话，api/user?id=1 + '&' + data
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
    
    // jsonp函数返回一个promise对象，有两个参数
    return new Promise((resolve, reject) => {
        // 在promise里面调用原始的originJSONP方法，回调里面，第一个err是null的时候，表示成功
        originJSONP(url, option, (err, data) => {
            if (!err) { // 如果成功，就调用promise的resolve方法
                resolve(data)
            } else {
                reject(err) // 把错误返回出去
            }
        })
    })
}

function param (data) {
    let url = ''
    // 相当于/api/user?id=1&callback=a  ？后面的
    // 遍历传进来的data对象，key:value的形式，通常只有一层，如果多了的话，还需要递归去遍历，并且需要用到hasOwnProperty
    for (var k in data) {
        // 因为不能直接给后端传一个undefined的值，所以需要先判断，没有传递""
        let value = data[k] !== undefined ? data[k] : ''
        url += '&' + k + '=' + encodeURIComponent(value)
        // es6的语法：url += `&${k}=${encodeURIComponent(value)}`
    }
    // 判断url是否存在，如果有，需要把前面的&去掉,如果没有，返回空
    return url ? url.substring(1) : ''
}