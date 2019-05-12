import { Watcher } from '../observer/watcher';
import { initState } from './state';

let _vmUid = 0;

export class ViewModel{

    public _uid : number;
    public _data : Object = {};
    public _watchers : Array<Watcher> = [];

    public $options : ViewModelOption;

    constructor(options: ViewModelOption){
        this._uid = _vmUid++;
        this.$options = options;
        return initState(this);
    }

    public $watch(expOrFn : string | Function, cb : Function){
        const watcher = new Watcher(this, expOrFn, cb);
        this._watchers.push(watcher);
        //TODO 返回一个unwatch方法
    }
}

export interface ViewModelOption{
    data : Object;
}