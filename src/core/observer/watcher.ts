import { ViewModel } from '../instance/index';
import { Dep} from '../observer/dep';
import { parsePath } from '../util/index';

let _watcherUid = 0;

export class Watcher { 

    public id : number;
    public vm : ViewModel;
    public cb : Function;

    public deps : Array<Dep> = [];      
    public newDeps: Array<Dep> = [];  
    public depIds = new Set();
    public newDepIds = new Set();

    public expression : string = '';

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
        this.expression = expOrFn.toString();;
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
        this.cleanupDeps();
        return value;
    }

    public update(){
        const oldValue = this.value;
        this.value = this.get();
        this.cb.call(this.vm, this.value, oldValue);
    }

    public addDep(dep : Dep){
        const id = dep.id;
        if(!this.newDepIds.has(id)){//不重复添加依赖
            this.newDepIds.add(id)
            this.newDeps.push(dep);
            if(!this.depIds.has(id)){
                dep.addSub(this);
            }
        }
    }

    /**
     * 清除已经不需要的依赖
     */
    public cleanupDeps () {
        for(let i = this.deps.length - 1; i > 0; i--){
            const dep = this.deps[i];
            if (!this.newDepIds.has(dep.id)) {
              dep.removeSub(this)
            }
        }

        //将新增的dep记到deps里，并重置newDepIds及newDeps
        const tmp1 = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = tmp1;
        this.newDepIds.clear();

        const tmp2 = this.deps;
        this.deps = this.newDeps;
        this.newDeps = tmp2;
        this.newDeps.length = 0;
    }
}