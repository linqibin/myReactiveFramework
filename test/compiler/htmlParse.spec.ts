import { parse } from '../../src/compiler/parser/index';


test('parse html', () => {
    const ast = parse(`    <div id="hello">
    <!-- 我是一个注释节点 -->
    <span id="test" test="abc" :t="message.a">a{{ message.a }}b</span>  
    <span test-attr>123</span>  
    <input type="text"/>              
    </div> `);

    if(ast != null){
        expect(ast.tag).toBe('div');
        expect(ast.children[0].tag).toBe('span');
        expect(ast.children[0].text).toBe('a{{ message.a }}b');
        expect(ast.children[0].expression).toBe(`"a"+_s(message.a)+"b"`);
        expect(ast.children[0].attrsList.length).toBe(3);
        expect((ast.children[0].attrsMap as any)['test']).toBe('abc');
    
    
        expect(ast.children[1].tag).toBe('span');
        expect('test-attr' in ast.children[1].attrsMap).toBe(true);
    
        expect(ast.children[2].tag).toBe('input');
    }else{
        throw new Error('ast不应该为空');
    }

});
