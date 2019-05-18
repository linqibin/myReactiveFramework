import { Observer } from '../../src/core/observer/index';
import { hasOwn } from '../../src/core/util/index';
import { ViewModel } from '../../src/core/instance/index';

test('observe a object', () => {
    const obj = {
        a : "123",
        b : {
            test : {
                text : "hello"
            }
        }
    }
    new Observer(obj);

    expect(hasOwn(obj, '__ob__')).toBe(true);
    expect(hasOwn(obj.b, '__ob__')).toBe(true);
    expect(hasOwn(obj.b.test, '__ob__')).toBe(true);
});

test('watch update property', async ()=>{
    const vm = new ViewModel({
        data: {
            text: 'hello world!'
        }
    });

    const result = await watchChanged() as any;
    
    expect(result.oldValue).toBe('hello world!');
    expect(result.value).toBe('text changed!');

    function watchChanged(){
        return new Promise((resolve)=>{            
            vm.$watch('text',(value : any, oldValue : any)=>{
                resolve({
                    value,
                    oldValue
                })
            });
            
            (vm as any)['text'] = 'text changed!';
        })
    }
})

test('watch add property', async ()=>{
    const vm = new ViewModel({
        data: {
            message : {}
        }
    });

    const result = await watchChanged() as any;
    
    expect(result.oldValue).toBe(undefined);
    expect(result.value).toBe('hello!');

    function watchChanged(){
        return new Promise((resolve)=>{            
            vm.$watch('message.a',(value : any, oldValue : any)=>{
                resolve({
                    value,
                    oldValue
                })
            });
            
            (vm as any).message.a = 'hello!';
        })
    }
})

test('watch delete property', async ()=>{
    const vm = new ViewModel({
        data: {
            message : {
                a : 'hello!'
            }
        }
    });

    const result = await watchChanged() as any;
    
    expect(result.oldValue).toBe('hello!');
    expect(result.value).toBe(undefined);

    function watchChanged(){
        return new Promise((resolve)=>{            
            vm.$watch('message.a',(value : any, oldValue : any)=>{
                resolve({
                    value,
                    oldValue
                })
            });
            
            delete (vm as any).message.a;
        })
    }
})


test('watch array push', async ()=>{
    const vm = new ViewModel({
        data: {
            message: {
                a : [1,2,3]
            },
        }
    });

    const result = await watchChanged() as any;
    
    expect(result).toEqual([1,2,3,4]);

    function watchChanged(){
        return new Promise((resolve)=>{            
            vm.$watch('message.a',(value : any, oldValue : any)=>{
                resolve(value);
            });
            
            (vm as any).message.a.push(4);
        })
    }
})