import { ViewModel } from '../instance/index';
import { Dep} from '../observer/dep';
import { parsePath } from '../util/index';

let _watcherUid = 0;

export class Watcher { 

    public id : number;
    public vm : ViewModel;
    public cb : Function;
    public deps : Array<Dep> = [];    
    public depIds = new Set();

    private getter: Function;
    private value: any;

    constructor (
        vm : ViewModel, 
        expOrFn : string | Function, 
        cb : Function
    ){
        this.id = _watcherUid++;
        this.vm = vm;
        this.cb = cb;
        if(typeof expOrFn === 'function'){
            this.getter = expOrFn;
        }else{
            this.getter = parsePath(expOrFn);
        }

        this.value = this.get();
    }   

    public get(){
        Dep.target = this;
        const value = this.getter.call(this.vm, this.vm);
        Dep.target = undefined;
        return value;
    }

    public update(){
        const oldValue = this.value;
        this.value = this.get();
        this.cb.call(this.vm, this.value, oldValue);
    }

    public addDep(dep : Dep){
        const id = dep.id;
        if(!this.depIds.has(id)){//不重复添加依赖
            this.deps.push(dep);
            this.depIds.add(id);
            dep.addSub(this);
        }
    }
}