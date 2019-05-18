import { Lexer, ASTElement } from './lexer'

/**
 * 将html字符串转换成AST
 */
export function parse(template: string) : ASTElement | null{
    return new Lexer(template).root;
}