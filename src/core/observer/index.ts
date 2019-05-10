import { Dep } from './dep';
import { def, hasOwn} from '../util/index';

export class Observer {

    public value : any;
    public dep : Dep;

    constructor(value : any){
        this.value = value;
        this.dep = new Dep();
        
        def(value, '__ob__', this);//将value和observer关联起来

        if(!Array.isArray(value)){
            this.value = defineReactive(value);
        }
    }

}

export function observe(value: any): any{
    //如果这个值已经被观察了，就无需再新建Observer 防止循环嵌套对象无限递归
    if(hasOwn(value, '__ob__') && value.__ob__ instanceof Observer){
        return;
    }else{
        return (new Observer(value)).value;
    }
}

export function defineReactive(obj: any ): any{
    const dep = new Dep();

    const keys = Object.keys(obj);
    for(let key of keys){
        if(typeof obj[key] === 'object'){
            //如果子属性是对象，我们需要递归添加代理
            obj[key] = observe(obj[key]);
        }
    }

    return new Proxy(obj, {
        get: function (target, property, receiver) {
            dep.depend();
            return Reflect.get(target, property, receiver);
        },
        set: function(obj, prop: (keyof Object), value, receiver){
            if(value === obj[prop]){//值无变化
                return false;
            }
            const result = Reflect.set(obj, prop, value, receiver);
            dep.notify();
            return result;
        }
    });
}