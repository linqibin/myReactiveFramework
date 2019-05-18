import { Dep } from './dep';
import { def, hasOwn} from '../util/index';

export class Observer {

    public value : any;
    public dep : Dep;

    constructor(value : any){
        this.value = value; 

        //如果value是数组的话，当数组元素改变时，其父元素的依赖也应该获得通知
        //这个dep就是用来给父元素进行childObs[i].dep.depend使用的
        this.dep = new Dep();
        
        def(value, '__ob__', this);//将value和observer关联起来
        
        this.value = defineReactive(value);
    }

}

export function observe(value: any): any{
    //如果这个值已经被观察了，就无需再新建Observer 防止循环嵌套对象无限递归
    if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer){
        return value;
    }else{
        return (new Observer(value)).value;
    }
}

export function defineReactive(obj: any):any{

    const keys = Object.keys(obj);
    const childObs = [];

    for(let key of keys){
        if(typeof obj[key] === 'object'){
            //如果子属性是对象，我们需要递归添加代理
            obj[key] = observe(obj[key]);

            if(Array.isArray(obj[key])){
                childObs.push(obj[key].__ob__);
            }
        }
    }
    
    if(!Array.isArray(obj)){
        return getObjectProxy(obj, childObs);
    }else{
        return getArrayProxy(obj, childObs);
    }
}

function getArrayProxy(arr: Array<any>, childObs: Array<Observer>){
    const dep = new Dep();
    return new Proxy(arr, {
        get: function (target, property, receiver) {
            if(typeof property === 'number' || property === 'length'){//取数组元素才需要添加依赖
                dep.depend();
                for(let ob of childObs){
                    ob.dep.depend();
                }
            }
            return Reflect.get(target, property, receiver);
        },
        set: function(obj, prop: (keyof Object), value, receiver){
            if(value === obj[prop]){//值无变化
                return false;
            }
            const result = Reflect.set(obj, prop, value, receiver);
            dep.notify();
            receiver.__ob__.dep.notify();
            return result;
        }
        //因为删除数组元素会set length，所以不需要拦截delete
    })
}

function getObjectProxy(obj : Object, childObs: Array<Observer>){
    const dep = new Dep();
    return new Proxy(obj, {
        get: function (target, property, receiver) {
            dep.depend();
            for(let ob of childObs){//当有需要子元素的元素改变 当前依赖也收到通知时，例如子元素是数组
                ob.dep.depend();
            }
            return Reflect.get(target, property, receiver);
        },
        set: function(obj, prop: (keyof Object), value, receiver){
            if(value === obj[prop]){//值无变化
                return false;
            }
            const result = Reflect.set(obj, prop, value, receiver);
            dep.notify();
            return result;
        },
        deleteProperty: function(target: any, p: string | number | symbol){
            const result = Reflect.deleteProperty(target, p);
            dep.notify();
            return result;
        }
    })
}