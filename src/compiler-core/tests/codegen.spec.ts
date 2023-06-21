import { generate } from "../src/codegen"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('codegen', ()=>{
    it('happy pass',()=>{
        const ast = baseParse('hi')

        transform(ast)

        const { code } = generate(ast)

        // 快照测试
        expect(code).toMatchSnapshot()
    })
})