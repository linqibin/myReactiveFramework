import { Watcher } from './watcher';


let _depUid = 0;

export class Dep {

    public id : number;
    //用于标记当前是哪个watcher在进行添加依赖
    //如果是空的 即此次get不是由watcher发起的，则不需要添加依赖
    static target ?: Watcher;

    public subs : Array<Watcher>;

    constructor (){
        this.subs = new Array<Watcher>();
        this.id = _depUid++;
    }   

    public addSub(sub : Watcher){
        this.subs.push(sub);
    }

    public removeSub(sub : Watcher){
        if(this.subs.length){
            const index = this.subs.indexOf(sub);
            if(index !== -1){
                this.subs.splice(index ,1);
            }
        }
    }

    public depend(){
        if(Dep.target){
            Dep.target.addDep(this);
        }
    }

    public notify(){
        for(let sub of this.subs){
            sub.update();
        }
    }
}