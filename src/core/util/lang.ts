
/**
 * 为对象定义属性
 */
export function def(obj: Object, key: string, val: any, enumerable?: boolean) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

/**
 * \w为 a-z A-Z 0-9
 * [^]是排除字符组 
 * 这个正则意思是 排除字母 数组 . $
 */
const bailRE = /[^\w.$]/;
/**
 * 将路径字符串解析成对应的对象
 */
export function parsePath (path: string): any {
  if (bailRE.test(path)) {//即如果路径包含字母 数字 . $ 以外字符，为非法路径
    return
  }
  const segments = path.split('.')
  return function (obj : any) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}