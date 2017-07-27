// 因为有一些参数是公用的，所以写一个方法，不用每一处都去写请求的参数

export const commonParams = {
    g_tk: 5381,
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    format: 'jsonp'
}

// 一个callback常用的命名参数
export const options = {
    param: 'jsonpCallback'
}

export const options1 = {
    param: 'jsonpCallback',
    prefix: 'playlistinfoCallback'
}

export const ERR_OK = 0 // 返回的状态，如果成功，会有一个和data平级的code:0
