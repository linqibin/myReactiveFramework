import { ViewModel } from './index';
import { defineReactive } from '../observer/index';


export function initState(vm: ViewModel) {
    const opts = vm.$options;    
    if(opts.data){
        initData(vm);
    }
}

function initData(vm: ViewModel) {
    let data = vm.$options.data;

    vm._data = defineReactive(data);//将data变为响应式的

    const keys = Object.keys(data);
    for(let key of keys){
        proxy(vm, `_data`, key);//通过defineProperty 使得可以通过 vm[key] 操作vm.__data[key]
    }
}

const sharedPropertyDefinition: PropertyDescriptor = {
    enumerable: true,
    configurable: true,
    get: undefined,
    set: undefined
}

export function proxy(target: Object, sourceKey: string, key: string) {
    sharedPropertyDefinition.get = function proxyGetter() {
        return (this as any)[sourceKey][key]
    }
    sharedPropertyDefinition.set = function proxySetter(val) {
        (this as any)[sourceKey][key] = val
    }
    Object.defineProperty(target, key, sharedPropertyDefinition)
}
