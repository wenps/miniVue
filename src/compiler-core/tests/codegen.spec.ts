import { generate } from "../src/codegen"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"
import { transformElement } from "../src/transforms/transformElement"
import { transformExpression } from "../src/transforms/transformExpression"
import { transformText } from "../src/transforms/transformText"

describe('codegen', ()=>{
    it('happy pass, string',()=>{
        const ast = baseParse('hi')

        transform(ast)

        const { code } = generate(ast)

        // 快照测试
        expect(code).toMatchSnapshot()
    })
    it('happy pass, 插值',()=>{
        const ast = baseParse('{{message}}')

        transform(ast, {
            nodeTransforms: [transformExpression] // 加上一个插件，设置插值类型下，普通表达式的 render函数格式 , 这里是加了_ctx.
        })

        // console.log(ast);
        

        const { code } = generate(ast)

        // 快照测试
        expect(code).toMatchSnapshot()
    })
    it('happy pass, 元素',()=>{
        const ast: any = baseParse('<div>hi,{{message}}</div>')

        transform(ast, {
            nodeTransforms: [transformExpression, transformElement, transformText] // 加上一个插件，处理元素类型的依赖
        })
        
        

        const { code } = generate(ast)

        // 快照测试
        expect(code).toMatchSnapshot()
    })
})