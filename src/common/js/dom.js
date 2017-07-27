 export function addClass (el, className) {
    if (hasClass(el, className)) {
        return
    }
    // 如果没有，先把el的classname拆开
    let newClass = el.className.split(' ')
    // 再把要添加的classpush进数组里面
    newClass.push(className)
    // 再转化成字符串赋值,用空格分隔
    el.className = newClass.join(' ')
 }

// 判断是否已经有class
 export function hasClass(el, className) {
     // 开头没有或者是空白字符在class前面,后面可以跟一个空白字符，也可以直接结束
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
 }

 // 封装获取和设置元素上面的属性的方法，原生
 export function getData (el, name, val) {
     const prefix = 'data-'
     name = prefix + name
     if (val) {
         return el.setAttribute(name, val)
     } else {
         return el.getAttribute(name)
     }
 }

 // 封装prefixed方法,会根据浏览器的支持能力去自动确定添加前缀
 let elementStyle = document.createElement('div').style

 let vendor = (() => {
    // 列举浏览器支持的
    let transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MazTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }
    // 测试浏览器支持哪一种
    for (let key in transformNames) {
        if (elementStyle[transformNames[key]] !== undefined) {
            return key
        }
    }

    // 如果所有的都不支持，则浏览器有故障
    return false
 })()

 export function prefixStyle (style) {
    if (vendor === false) {
        return false
    }
    // 支持标准的
    if (vendor === 'standard') {
        return style
    }

    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
 }
