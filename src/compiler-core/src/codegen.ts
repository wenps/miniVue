import { NodeTypes } from './ast';
import { CREATE_ELEMENT_VNODE, TO_DISPLAY_STRING, helperMapName } from './helpersMap';

export function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;

    // 组装成render函数

    // 抽离导入资源类型代码
    genFunctionPreamble(context, ast);

    // render函数返回部分组装
    push('return');

    const functionName = 'render';
    const args = ['_ctx', '_cache'];
    const signature = args.join(',');

    push(` function ${functionName}(${signature}){`);
    push('return ');

    genNode(ast.codegenNode, context);
    push('}');

    return {
        code: context.code
    };
}

// 创建一个code相关的全局上下文对象
function createCodegenContext() {
    const context = {
        code: '',
        push: function(source) {
            context.code += source;
        },
        helper(key, line = true) {
            return (line ? '_' : '') + `${helperMapName[key]}`;
        }
    };
    return context;
}

// 抽离导入资源类型代码
function genFunctionPreamble(context, ast: any) {
    const { push, helper } = context;

    // helperMapName 依赖资源映射表
    const vue = 'vue';

    const aliasHelpers = (s) => `${helper(s, false)}: ${helper(s)}`;

    // 判断当前是否需要导入资源，插值类型需要，但是text类型是不用的，因此这里判断一下
    if (ast.helpers.length > 0) {
        push(`const { ${ast.helpers.map(aliasHelpers).join(', ')} } = ${vue} `);
        push('\n');
    }
}

// render 核心节点 加入
function genNode(node: any, context) {
    // 基于ast 完善render函数主体内容
    switch (node.type) {
        case NodeTypes.TEXT: // 处理text类型
            genText(node, context);
            break;

        case NodeTypes.INTERPOLATION: // 处理插值类型
            genInterpolation(node, context);
            break;

        case NodeTypes.SIMPLE_EXPRESSION: // 处理简单表达式类型
            genSimpleExpression(node, context);
            break;

        case NodeTypes.ELEMENT: // 处理元素表达式类型
            genElement(node, context);
            break;

        case NodeTypes.COMPOUND_EXPRESSION: // 处理简单表达式类型
            genCompoundExpression(node, context);
            break;

        default:
            break;
    }
}

// render 核心节点 加入 text类型处理
function genText(node: any, context: any) {
    const { push } = context;
    push(`"${node.content}"`);
}

// render 核心节点 加入 插值类型处理
function genInterpolation(node: any, context: any) {
    const { push } = context;
    push(`_${helperMapName[TO_DISPLAY_STRING]}(`);
    genNode(node.content, context);
    push(')');
}

// render 核心节点 加入 简单表达式类型处理
function genSimpleExpression(node: any, context: any) {
    const { push } = context;
    push(`${node.content}`);
}

// render 核心节点 加入 元素表达式类型处理
function genElement(node: any, context: any) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    // if (children.length == 1) {
    //     genNode(children[0], context)
    // }
    genNodeList(genNullable([tag, props, children]), context)
    push(')');
}

// render 核心节点 加入 复合表达式类型处理
function genCompoundExpression(node: any, context: any) {
    const { children } = node;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const element = children[i];
        if (typeof element == 'string') {
            push(element);
        } else {
            genNode(element, context);
        }
    }
}


// 提供一个函数，对当前node的所有属性做转换，如果undefined '' 统一转null
function genNullable(args: any[]) {
    return args.map((arg)=>arg || null)
}

// 遍历node属性再加上去，即tag, children, props一个一个处理，然后加上去
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (typeof node == 'string' || node == null) {
            push(node);
        } else {
            genNode(node, context);
        }
        if(i != nodes.length - 1) {
            push(', ');
        }
    }
}

