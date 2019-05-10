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

test('watch', async ()=>{
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
                console.log(value, oldValue);
                resolve({
                    value,
                    oldValue
                })
            });
            
            (vm as any)['text'] = 'text changed!';
        })
    }
})
