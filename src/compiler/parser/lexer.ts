const SELF_CLOSING_TAGS_SET = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
]);

export class Lexer {
    public text: string;
    public index = 0;
    public ch: string = '';
    public stack = new Array<ASTElement>();
    public lastTag = '';
    public root: ASTElement | null = null;

    constructor(text: string) {
        this.text = text;

        while (this.index < this.text.length) {
            this.ch = this.text.charAt(this.index);

            if (this.isWhitespace(this.ch)) {
                this.index++;
            } else if (this.ch === '<') {
                this.LFHandler();
            }else {
                this.charHandler();
            }
        }
    }
    private charHandler(){
        while( this.index < this.text.length){
            this.ch = this.text.charAt(this.index);
            if(this.ch === '>'){
                this.getContent();
                if( SELF_CLOSING_TAGS_SET.has(this.stack[this.stack.length -1].tag) ){
                    this.stack.pop();
                }
                break;
            }else if(this.ch === '<'){
                return this.LFHandler();
            }else if(this.ch === ':'){
                //使用模板的属性绑定
                this.getAttr('binding');
            }else if(this.ch === '@'){
                //事件绑定
            }else if(this.ch === 'l' && this.peek() === '-'){
                //l- 开头的为指令
            }else{
                //普通属性
                this.getAttr();
            }   
        }
    }

    private LFHandler(){
        const peek = this.peek();
        const nextPeek = this.peek(2);

        if(peek === '!'){
            if(nextPeek === '-' && this.peek(3) === '-'){//comment                
                this.index += 4;
                this.commentHandler();
            }else if(nextPeek === '['){
                //cdata
            }else{
                //DocType
            }
        }else if(peek === '/'){//tag close    
            this.index += 2;   
            this.tagClose();
        }else{//tag open     
            this.index ++;
            this.tagOpen();     
        }        
    }

    private commentHandler(){
        let index = 1;

        while(this.index + index < this.text.length){
            if(this.peek(index) === '-' && this.peek(index + 1) === '-' 
                    && this.peek(index + 2) === '>'){
                this.index += index + 3;
                return;
            }
            index++;
        }

        throw new Error('注释闭合错误！');
    }

    private tagClose(){     
        const tag = this.getTagName();
        const node = this.stack.pop();
        if(!node || node.tag !== tag){
            throw new Error("标签闭合错误！");
        }
        this.index++;
    }

    private tagOpen(){
        let parent;
        if(this.stack.length > 0){
            parent = this.stack[this.stack.length - 1];
        }
        const node = new ASTElement(this.getTagName(), [], parent);
        if(!this.root){            
            this.root = node;
        }
        this.stack.push(node);
        this.lastTag = node.tag;

        if(this.ch === '>'){//开始标签后面可能夹了内容  
            this.getContent();
        }
    }

    private getTagName() {
        const charList = [];

        while( this.index < this.text.length){
            this.ch = this.text.charAt(this.index);
            if(this.isWhitespace(this.ch) || this.ch === '>'){
                break;
            }
            this.index++;
            charList.push(this.ch);
        }
        return charList.join('');
    }    

    private getContent(){
        let index = 1;
        const temArr = [];
        let isExpression = false;
        
        const lastNode = this.stack[this.stack.length -1];
        //自闭合便签不会包裹内容
        if( !SELF_CLOSING_TAGS_SET.has(lastNode.tag) ){
            while( this.index + index < this.text.length){
                const peek = this.peek(index);
                if(peek === '<'){
                    break;
                }
                if(peek === '{' && this.peek(index + 1 ) === '{'){
                    isExpression = true;
                }
                temArr.push(peek);
                index++;
            }
            lastNode.text = temArr.join('');
            //获取表达式
            if(isExpression){
                this.getExpression(lastNode);
            }
        }

        this.index += index;
    }

    private getExpression(node : ASTElement){
        const text = node.text;
        const tokens = [];

        let temArr = [];
        
        for(let i = 0; i < text.length; i++){
            if(text[i] === '{' && text[i + 1] === '{'){
                tokens.push(`"${temArr.join('')}"`);
                temArr = [];

                for(let j = i + 2; j < text.length; j++){
                    if(text[j] === "}" && text[j+1] === "}"){
                        i = j+1;
                        break;
                    }else if(!this.isWhitespace(text[j])){
                        temArr.push(text[j]);
                    }
                }
                tokens.push(`_s(${temArr.join('')})`);
                temArr = [];
            }else{
                temArr.push(text[i]);
            }

            if( i === text.length - 1){
                tokens.push(`"${temArr.join('')}"`);
            }
        }

        node.expression = tokens.join("+");
    }

    private getAttr(type : 'binding' | void){
        const isBinding = type === 'binding'? true : false;

        let index = 1;
        let attrKeyArr = [this.ch];

        const node = this.stack[this.stack.length - 1];

        while( this.index + index <= this.text.length ){
            let peek = this.peek(index);
            if(peek === '>'){
                if(attrKeyArr.length){
                    node.addAttr(attrKeyArr.join(''), "", isBinding);
                }

                this.index += index;
                break;
            }else if(peek === '='){
                const attrValueArr = new Array<string>();
                index = this.getAttrValue(index, attrValueArr);
                node.addAttr(attrKeyArr.join(''), attrValueArr.join(''), isBinding);
                attrKeyArr = [];
            }else if(peek === false){
                throw new Error(`${node.tag}标签闭合错误！`);
            }else if(attrKeyArr.length == 0 && this.isWhitespace(peek)){
                //do nothing
            }else{
                attrKeyArr.push(peek);
            }
            index++;
        }
    }

    private getAttrValue(peekIndex : number, attrValueArr : Array<string>){
        let isStart = false;

        while( this.index + peekIndex <= this.text.length ){
            let peek = this.peek(peekIndex);

            if(!isStart){
                if(peek === false){
                    const tag = this.lastTag;
                    throw new Error(`${tag}标签属性值缺失！`);
                }else if(this.isWhitespace(peek)){
                    //do nothing
                }else if(peek === '"'){
                    isStart = true;
                }
            }else{
                if(peek === '"'){
                    break;
                }else if(peek === false){
                    const tag = this.lastTag;
                    throw new Error(`${tag}标签属性引号闭合错误！`);
                }else{
                    attrValueArr.push(peek)
                }
            }

            peekIndex++;
        }
        return peekIndex;
    }
    

    private isWhitespace(ch: string) {
        return ch === ' ' || ch === '\r' || ch === '\t' ||
            ch === '\n' || ch === '\v' || ch === '\u00A0';
    }

    private peek(n ?: number) {
        n = n || 1;
        const index = this.index + n;
        if (index < this.text.length){ 
            return this.text.charAt(index);
        } else {
            return false;
        }
    }
}

export class ASTElement{
    public type : number;
    public tag : string;
    public attrsList : Array<ASTAttr>;
    public attrsMap : Object;
    public parent : ASTElement | void;
    public children : Array<ASTElement>;
    public text : string;
    public expression : string | null;
    public hasBindings : boolean;

    constructor(tag: string, atts: Array<ASTAttr>, parent: ASTElement | void){
        this.type = 1;
        this.tag = tag;
        this.attrsList = atts;
        this.attrsMap = {};
        this.parent = parent;
        this.children = [];
        this.text = "";
        this.expression = null;
        this.hasBindings = false;

        if(parent){
            parent.children.push(this);
        }
    }

    addAttr(name : string, value : string, isBinding : boolean){
        if(isBinding){
            this.hasBindings = true;
        }
        if(!((this.attrsMap as any)[name])){
            this.attrsList.push({ name, value, isBinding});
            (this.attrsMap as any)[name] = value;
        }
    }
}

interface ASTAttr{
    name : string;
    value : string;
    isBinding : boolean;
}