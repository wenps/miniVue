import { generate } from "../src/codegen"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"
import { transformElement } from "../src/transforms/transformElement"
import { transformExpression } from "../src/transforms/transformExpression"
import { transformText } from "../src/transforms/transformText"
export function baseCompile(template) {
    const ast: any = baseParse(template)

        transform(ast, {
            nodeTransforms: [transformExpression, transformElement, transformText] // 加上一个插件，处理元素类型的依赖
        })
        
        

        return generate(ast)

        // console.log(code);
}