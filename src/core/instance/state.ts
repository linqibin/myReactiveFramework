import { ViewModel } from './index';
import { defineReactive } from '../observer/index';


export function initState(vm: ViewModel) {
    const opts = vm.$options;
    if(opts.data){
        vm = initData(vm);
    }
    return vm;
}

function initData(vm: ViewModel) {
    let data = vm.$options.data;

    vm._data = defineReactive(data);//将data变为响应式的

    return new Proxy(vm, {
        get: function (target, property, receiver) {
            if( property in target._data){
                return Reflect.get(target._data, property, receiver);
            }
            return Reflect.get(target, property, receiver);
        },
        set: function(target, property: (keyof Object), value, receiver){
            if( property in target._data){
                return Reflect.set(target._data, property, value);
            }
            return Reflect.set(target, property, value, receiver);
        },
        deleteProperty: function(target, property){
            if( property in target._data){
                return Reflect.deleteProperty(target._data, property);
            }
            return Reflect.deleteProperty(target, property);
        }
    })
}