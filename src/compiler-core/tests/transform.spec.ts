import { NodeTypes } from "../src/ast"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('transform', ()=>{
    it('happy pass',()=>{
        const ast = baseParse("<div>hi,{{message}}</div>")
        const plugin = (node) => {
            if(node.type == NodeTypes.TEXT) {
                // 如果当前节点是text，更新下内容
                node.content = node.content + ' miniVue'
            }
        }
        transform(ast, {
            nodeTransforms: [plugin] // 提供一个插件数组，遇到解析的时候回去执行里面的函数
        })
        const nodeText = ast.children[0].children[0]
        expect(nodeText.content).toStrictEqual('hi, miniVue')
    })
    
})