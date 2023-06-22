'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// 需要加载的依赖
const TO_DISPLAY_STRING = Symbol('toDisplayString');
const CREATE_ELEMENT_VNODE = Symbol('createElementVNode');
const helperMapName = {
    [TO_DISPLAY_STRING]: 'toDisplayString',
    [CREATE_ELEMENT_VNODE]: 'createElementVNode'
};

function generate(ast) {
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
        push: function (source) {
            context.code += source;
        },
        helper(key, line = true) {
            return (line ? '_' : '') + `${helperMapName[key]}`;
        }
    };
    return context;
}
// 抽离导入资源类型代码
function genFunctionPreamble(context, ast) {
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
function genNode(node, context) {
    // 基于ast 完善render函数主体内容
    switch (node.type) {
        case "text" /* NodeTypes.TEXT */: // 处理text类型
            genText(node, context);
            break;
        case "interpolation" /* NodeTypes.INTERPOLATION */: // 处理插值类型
            genInterpolation(node, context);
            break;
        case "simple_expression" /* NodeTypes.SIMPLE_EXPRESSION */: // 处理简单表达式类型
            genSimpleExpression(node, context);
            break;
        case "element" /* NodeTypes.ELEMENT */: // 处理元素表达式类型
            genElement(node, context);
            break;
        case "compound_expression" /* NodeTypes.COMPOUND_EXPRESSION */: // 处理简单表达式类型
            genCompoundExpression(node, context);
            break;
    }
}
// render 核心节点 加入 text类型处理
function genText(node, context) {
    const { push } = context;
    push(`"${node.content}"`);
}
// render 核心节点 加入 插值类型处理
function genInterpolation(node, context) {
    const { push } = context;
    push(`_${helperMapName[TO_DISPLAY_STRING]}(`);
    genNode(node.content, context);
    push(')');
}
// render 核心节点 加入 简单表达式类型处理
function genSimpleExpression(node, context) {
    const { push } = context;
    push(`${node.content}`);
}
// render 核心节点 加入 元素表达式类型处理
function genElement(node, context) {
    const { push, helper } = context;
    const { tag, children, props } = node;
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    // if (children.length == 1) {
    //     genNode(children[0], context)
    // }
    genNodeList(genNullable([tag, props, children]), context);
    push(')');
}
// render 核心节点 加入 复合表达式类型处理
function genCompoundExpression(node, context) {
    const { children } = node;
    const { push } = context;
    for (let i = 0; i < children.length; i++) {
        const element = children[i];
        if (typeof element == 'string') {
            push(element);
        }
        else {
            genNode(element, context);
        }
    }
}
// 提供一个函数，对当前node的所有属性做转换，如果undefined '' 统一转null
function genNullable(args) {
    return args.map((arg) => arg || null);
}
// 遍历node属性再加上去，即tag, children, props一个一个处理，然后加上去
function genNodeList(nodes, context) {
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (typeof node == 'string' || node == null) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i != nodes.length - 1) {
            push(', ');
        }
    }
}

var TagType;
(function (TagType) {
    TagType[TagType["start"] = 0] = "start";
    TagType[TagType["end"] = 1] = "end";
})(TagType || (TagType = {}));
function baseParse(content) {
    // 创建一个全局上下文对象，包裹传进来的 content
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
// 封装content逻辑
function createParserContext(content) {
    return {
        source: content
    };
}
// 抽离根节点逻辑
function createRoot(children) {
    return {
        children,
        type: "root" /* NodeTypes.ROOT */
    };
}
// elementTagStack 元素标签栈，用来存储元素标签，判断标签是否闭合等关系
// 抽离children节点逻辑
function parseChildren(context, elementTagStack) {
    const nodes = []; // 创建节点列表
    // 循环解析节点内容，当context推进完之后结束 或者 如果是解析元素标签时，遇到闭合标签也要结束
    while (!isEnd(context, elementTagStack)) {
        let node;
        const s = context.source;
        // 判断是否插值类型节点
        if (s.startsWith('{{')) {
            node = parseInterpolation(context); // 解析插值类型
        }
        // 判断是否元素类型节点，是否以 < 开头，第二个字段是否a-z中的字符
        else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, elementTagStack); // 解析元素类型
            }
        }
        // 处理text类型节点，默认情况下如果没有命中元素也没有命中插值即取不到node，默认为text
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node); // 设置节点列表
    }
    return nodes;
}
// 抽离插值类型节点逻辑
function parseInterpolation(context) {
    const openDelimiter = '{{';
    const closeDelimiter = '}}';
    // 下述操作相当于 获取 {{message}} 中的 message，截取插值类型内容
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length); // 拿到 }} 下标
    advanceBy(context, openDelimiter.length); // 拿到 message}} ， 推进两位 {{
    const rawContentLength = closeIndex - openDelimiter.length;
    const rawContent = context.source.slice(0, rawContentLength); // 拿到 message, 即原始数据
    const content = rawContent.trim();
    advanceBy(context, rawContentLength + closeDelimiter.length); // 推进 message.length + 2 位 （上面推进了{{ 和 message.length + 2 位 这样子 {{message}}整体被推进完了）
    return {
        type: "interpolation" /* NodeTypes.INTERPOLATION */,
        content: {
            type: "simple_expression" /* NodeTypes.SIMPLE_EXPRESSION */,
            content: content
        }
    };
}
// 解析元素类型
function parseElement(context, elementTagStack) {
    const element = parseTag(context, TagType.start); // 处理开头标签
    // 标签入栈
    elementTagStack.push(element);
    element.children = parseChildren(context, elementTagStack); // 读取元素类型标签内容，递归解析， 如： <div>xx, {{a}}</div> 上一步推进一个标签 得到 xx, {{a}}</div>，递归解析这个字符串
    // 同时要传入当前元素的标签，用于处理children递归的结束条件
    // 递归解析完，标签出栈
    elementTagStack.pop();
    // 判断结束标签和当前标签是否相同，如果相同则，才能处理这个结束标签做推进
    if (context.source.slice(2, 2 + element.tag.length) == element.tag) {
        parseTag(context, TagType.end); // 处理结束标签
    }
    else {
        throw new Error("标签不闭合");
    }
    return element;
}
// 解析元素类型的tag
function parseTag(context, type) {
    // 1.解析tag
    const match = /^<\/?([a-z]*)/i.exec(context.source); // 标签解析正则
    const tag = match[1];
    // 2.处理后的代码推进
    advanceBy(context, match[0].length + 1); // 推进掉<div + >
    if (type == TagType.start) { // 如果是开头标签就返回
        return {
            type: "element" /* NodeTypes.ELEMENT */,
            tag,
        };
    }
}
// 解析text类型
function parseText(context) {
    let endIndex = context.source.length; // 默认整个字符串都是text类型
    let endTokens = ["<", "{{"];
    for (let i = 0; i < endTokens.length; i++) {
        let index = context.source.indexOf(endTokens[i]); // 判断当前是否出现了非text类型的标识，如果出现则0到当前下标则为text类型节点内容
        if (index != -1 && endIndex > index) { // 取最左的下标
            endIndex = index;
        }
    }
    // 1.获取text内容
    const content = context.source.slice(0, endIndex);
    // 2.推进
    advanceBy(context, content.length);
    return {
        type: "text" /* NodeTypes.TEXT */,
        content
    };
}
// 封装推进代码
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
// 循环解析节点内容结束条件
function isEnd(context, elementTagStack) {
    // 2.当遇到结束标签时，结束
    const s = context.source;
    // if(parentTag && s.startsWith(`</${parentTag}>`)) { // 动态传入结束标签
    //     return true
    // }
    // 如果当前是解析到结束标签，并匹配到闭合
    if (s.startsWith('</')) {
        // 判断当前闭合标签，是否出现元素标签栈中
        for (let i = elementTagStack.length - 1; i >= 0; i--) {
            const tag = elementTagStack[i].tag;
            if (s.slice(2, 2 + tag.length) == tag) {
                return true;
            }
        }
    }
    // 1.当context.source的内容推进完了，结束
    return !s;
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options); // 封装一个全局上下文对象
    // 遍历 - 深度优先搜索
    traverseNode(root, context);
    // root.codegenNode 基于此创建render代码
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
// 为根节点提供一个指向默认编译节点的属性
function createRootCodegen(root) {
    const child = root.children[0];
    if (child.type == "element" /* NodeTypes.ELEMENT */) {
        root.codegenNode = child.codegenNode; // 这一步只是为了拿 root.children[0] codegen element类型中处理可以看到
    }
    else {
        root.codegenNode = root.children[0];
    }
}
// 遍历 - 深度优先搜索
function traverseNode(node, context) {
    const nodeTransforms = context.nodeTransforms; // 获取全局上下文中的插件数组
    const exitFns = []; // 创建一个数组收集退出函数
    // 遍历执行插件数组
    for (let i = 0; i < nodeTransforms.length; i++) {
        const onExit = nodeTransforms[i](node, context); // 如果是退出函数那就做一层封装，将真实执行函数返回
        if (onExit)
            exitFns.push(onExit); // 存储真实执行函数
    }
    // 针对不同类型节点作操作
    switch (node.type) {
        // 插值类型
        case "interpolation" /* NodeTypes.INTERPOLATION */:
            context.helper(TO_DISPLAY_STRING); // 往全局对象上加上依赖，因为解析插值类型需要导入这个依赖
            break;
        // 元素类型和根节点类型
        case "root" /* NodeTypes.ROOT */:
        case "element" /* NodeTypes.ELEMENT */:
            // 递归子节点
            traverseChildren(node, context); // 因为元素和根节点都有children ，所有需要递归children
            break;
    }
    // 退出的时候执行一下退出函数
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
// 递归子节点
function traverseChildren(node, context) {
    const children = node.children;
    if (children) {
        for (let i = 0; i < children.length; i++) {
            const curNode = children[i];
            traverseNode(curNode, context); // 递归
        }
    }
}
// 封装一个全局上下文对象
function createTransformContext(root, options) {
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        // 封装需要加载的依赖
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        }
    };
    return context;
}

function transformElement(node, context) {
    if (node.type == "element" /* NodeTypes.ELEMENT */) {
        return () => {
            context.helper(CREATE_ELEMENT_VNODE);
            // 中间处理层
            // tag 
            const vnodeTag = `'${node.tag}'`;
            // props
            let vnodeProps;
            // children
            const children = node.children;
            let vnodeChildren = children[0];
            const vnodeElement = {
                type: "element" /* NodeTypes.ELEMENT */,
                tag: vnodeTag,
                props: vnodeProps,
                children: vnodeChildren
            };
            node.codegenNode = vnodeElement;
        };
    }
}

// 设置插值类型下，普通表达式的 render函数格式 , 这里是加了_ctx.
function transformExpression(node) {
    if (node.type == "interpolation" /* NodeTypes.INTERPOLATION */) {
        const rawContent = node.content.content;
        node.content.content = "_ctx." + rawContent;
    }
}

// 创建复合类型，将相邻text和插值类型整合起来
function transformText(node) {
    // 判断当前是否是text或插值
    function isText(node) {
        return node.type == "text" /* NodeTypes.TEXT */ || node.type == "interpolation" /* NodeTypes.INTERPOLATION */;
    }
    if (node.type == "element" /* NodeTypes.ELEMENT */) {
        return () => {
            // 获取当前元素节点的children
            const { children } = node;
            // 创建一个容器存储复合类型
            let currentContainer;
            // 遍历children
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    // 判断当前是否是text或插值，如果是开启循环判断下一个是不是，找到第一个不是的为止，再把上述的内容加到新的复合类型节点下
                    for (let j = i + 1; j < children.length; j++) {
                        const nextChild = children[j];
                        if (isText(nextChild)) {
                            // 如果是text或者插值
                            // 如果容器不存在，默认初始化一个容器，并替换掉当前节点child
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    // 替换掉当前节点
                                    type: "compound_expression" /* NodeTypes.COMPOUND_EXPRESSION */,
                                    children: [child]
                                };
                            }
                            currentContainer.children.push(' + ');
                            currentContainer.children.push(nextChild); // 将符合条件的节点加入到容器中
                            // 并且删除数组中已经被加入的节点，这样子这次循环结束结束之后，下一个必然是非text或插值类型的node
                            children.splice(j, 1);
                            // 因为删了一个之后j会指向下一个，有因为长度变了就会出现这种情况。
                            // 假设 1 2 3 4  此时 j 在 2 的 位置 即下标 1，我们 把 2 加进去又删掉 2，j ++  j就等下标 2
                            // 因为 2 没了 下标2 直接到 了4的位置，越过了 3 这显然是不正确的，因此加进去的节点 需要再 j--
                            j--;
                        }
                        else {
                            // 非 text或者插值
                            currentContainer = null; // 容器重置，跳出小循环
                            break;
                        }
                    }
                }
            }
        };
    }
}

function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText] // 加上一个插件，处理元素类型的依赖
    });
    return generate(ast);
    // console.log(code);
}

// nextTicket 就是将更新任务都加到队列中
const queue = []; // 创建一个队列
const preQueue = []; // 创建一个前置队列，在组件渲染之前执行
let isFlushPending = false;
function nextTicker(fn) {
    return fn ? Promise.resolve().then(fn()) : Promise.resolve();
}
function queueJobs(job) {
    if (!queue.includes(job)) { // 如果不存在则添加
        queue.push(job); // 往队列中加入更新任务
    }
    promiseFlush();
}
function promiseFlush() {
    // 创建开关，防止多次创建promise
    if (isFlushPending)
        return;
    isFlushPending = true;
    // 创建一个微任务，将队列中的更新任务一个一个拿出来执行
    nextTicker(flushJob);
}
function flushJob() {
    // 执行微任务之后，把创建promise的开关重新打开
    isFlushPending = false;
    // 执行组件渲染前置队列
    flushPreFlushCbs();
    // 下面开始组件渲染
    console.log('执行更新任务');
    let job;
    while (job = queue.shift()) {
        job && job();
    }
}
// 执行组件渲染前置队列
function flushPreFlushCbs() {
    for (let index = 0; index < preQueue.length; index++) {
        preQueue[index]();
    }
}

function toDisplayString(value) {
    return String(value);
}

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const isObject = (value) => {
    return value !== null && typeof value === 'object';
};
const capitalize = (value) => {
    return 'on' + value[0].toUpperCase() + value.slice(1);
};

// 创建emit方法 （emit）event是事件名add，对应的父组件就onAdd，
function emit(instance, event, ...argument) {
    const { props } = instance; // instance 是创建的子组件实例对象，里面有props等内容，父组件然后绑定的事件会作为props传入到子组件实例中
    // 所以这里是子组件的emit函数，但是因为props中传入了父组件的emit响应事件即onAdd，所以这里可以通过props去执行传入的props的onAdd实现emit功能
    // 获取子组件emit事件名所对应的父组件的emit响应事件名
    const rootEventName = capitalize(event);
    props[rootEventName](...argument);
}

// 创建一个组件实例对象
function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        next: null,
        // 先创建一个空的setupState，去暂存组件类型虚拟节点的setup返回值
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
        shareFlag: vnode.shareFlag,
        provide: parent ? parent.provide : {},
        parent: parent ? parent : {},
        isMounted: true, // 判断当前组件实例对象是初次init，还是后续更新
    };
    component.emit = emit.bind(null, component); //（emit）,通过bind直接把emit挂载到component上，保证执行的时候取值正确
    return component;
}

function shouldUpdateComponent(oldVnode, newVnode) {
    const { props: oldprops } = oldVnode;
    const { props: newprops } = newVnode;
    for (const key in newprops) {
        if (newprops[key] != oldprops[key]) {
            return true;
        }
    }
    return false;
}

// 创建一个全局对象activeEffect存储effect的fn，这个fn后面会被存储到依赖里面
let activeEffect;
// 创建一个全局变量shouldTrack，判断是否应该在get的时候收集依赖
let shouldTrack = true;
// 创建一个ReactiveEffect的类
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.active = true; // 防止反复调用stop方法
        this.deps = []; // 创建数组存储dep依赖关系
        // 声明一个_fn去存储传入的fn
        this._fn = fn;
    }
    // 调用run方法的时候执行传入的fn
    run() {
        // 调用过stop函数之后this.active就会变成false，如果this.active == false，说明调用了stop 那么就
        if (!this.active) {
            return this._fn(); // runner() 函数调用的时候 返回runner()函数的返回值
        }
        // 保证run的时候才进行依赖收集
        shouldTrack = true;
        // 因为run()是在_effect里面运行的，使用this指向的就是_effect（1）
        activeEffect = this; // 把this挂载在全局对象上， 用来收集依赖，到时候依赖add的就是这个activeEffect
        const result = this._fn(); // runner() 函数调用的时候 返回runner()函数的返回值 ， 注意调用_fn()的时候会触发track依赖收集
        shouldTrack = false;
        return result; // runner() 函数调用的时候 返回runner()函数的返回值
    }
    // 调用stop方法时，清空里面的dep
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
// 抽离清空dep方法
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function effect(fn, options = {}) {
    const scheduler = options.scheduler;
    const _effect = new ReactiveEffect(fn, scheduler);
    // 挂载stop等options
    Object.assign(_effect, options);
    // 创建effect的时候的需要执行传入的fn
    // 提供一个run方法，去执行（1）
    _effect.run();
    const runner = _effect.run.bind(_effect); // 处理指针 返回runner函数
    runner.effect = _effect; // 给返回的runner挂上一个effect属性，指向的创建的ReactiveEffect实例即_effect，然后这个runner上挂载了ReactiveEffect实例，执行stop的时候需要传入实例，所以就可以用这个runner下的ReactiveEffect实例
    return runner;
}
// targetMap => {target: depsMap()}
// depsMap => {key: dep()}
// dep() 是一个Set(), 里面存了fn
// 定义全局变量targetMap 存储依赖收集
const targetMap = new Map();
function isTracking() {
    // if (!activeEffect) return // 如果activeEffect不存在就结束
    // if (!shouldTrack) return // 如果shouldTrack开关没打开就结束，作用于run的时候，stop之后就关闭这个开关，后续不支持依赖收集
    return shouldTrack && activeEffect !== undefined;
}
// 依赖收集，对应完整的reactive对象
function track(target, key) {
    // 是否支持依赖收集
    if (!isTracking())
        return;
    // 处理依赖间的映射关系
    // target > key > dep
    // 存储对象和对象下key map的映射关系
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    // 依赖收集
    trackEffect(dep);
}
// 抽离实际依赖收集函数
function trackEffect(dep) {
    if (dep.has(activeEffect))
        return; // 如果这个activeEffect已存在就不需要往里面加 
    dep.add(activeEffect);
    // 推广activeEffect反向收集dep，这个数组存储了这个dep的地址引用
    activeEffect.deps.push(dep);
}
// 依赖执行
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
// 抽离实际依赖执行函数
function triggerEffect(dep) {
    for (let element of dep) {
        // scheduler逻辑，如果有scheduler就执行scheduler
        if (element.scheduler) {
            element.scheduler();
        }
        else {
            element.run();
        }
    }
}

// 初始化createdGetter()，缓存到get
const get = createdGetter();
// 初始化createSetter()，缓存到set
const set = createSetter();
// 初始化createdGetter(true)，缓存到readonlyGet
const readonlyGet = createdGetter(true);
// 初始化createdGetter(true, true)，缓存到shallowReadonlyGet
const shallowReadonlyGet = createdGetter(true, true);
// 抽离get方法
function createdGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        // 判断是否reactive
        if (key == "_v__is_reactive" /* IsType.IS_REACTIVE */) {
            return !isReadonly; // isReadonly = false 的时候是reactive
        }
        // 判断是否readonly
        if (key == "_v__is_readonly" /* IsType.IS_READONLY */) {
            return isReadonly; // isReadonly = true 的时候是readonly
        }
        // target 访问的对象， key 访问对象的值
        const res = Reflect.get(target, key);
        if (isShallow) {
            return res;
        }
        // 判断当前res是否obj，如果是则继续，则继续调用reactive，并将生成的reactive对象返回
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // isReadonly不触发依赖
        if (!isReadonly) {
            // 依赖收集
            track(target, key);
        }
        return res;
    };
}
// 抽离set方法
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 依赖触发
        trigger(target, key);
        return res;
    };
}
const reactiveHandler = {
    get,
    set // 抽离set方法
};
const readonlyHandler = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`${key}不能设置为${value}，因为是readonly`, target);
        // 不能set所以直接返回true
        return true;
    }
};
const shallowReadonlyHandler = {
    get: shallowReadonlyGet,
    set(target, key, value) {
        console.warn(`${key}不能设置为${value}，因为是shallowReadonly`, target);
        // 不能set所以直接返回true
        return true;
    }
};

// reactive实际上就是对对象的Proxy操作
function reactive(raw) {
    return createReactiveObj(raw, reactiveHandler);
}
// readonly不能set
function readonly(raw) {
    return createReactiveObj(raw, readonlyHandler);
}
// shallowReadonly表层是readonly，内层是普通对象（常用于优化，防止整个对象都是proxy消耗性能）
function shallowReadonly(raw) {
    return createReactiveObj(raw, shallowReadonlyHandler);
}
function createReactiveObj(target, handler) {
    if (!isObject(target)) {
        console.warn(`target: ${target}必须是个对象`);
        return target;
    }
    return new Proxy(target, handler);
}

// 将传入的props挂载到组件实例对象上
function initProps(instance, props) {
    instance.props = props;
}

// （slot）
// 接收组件类型的children，并将其挂载在组件实例对象上
function initSlot(instance, children) {
    // 判断当前的元素实例对象有没有slot
    if (instance.shareFlag & 16 /* ShareFlags.SLOT_CHILDREN */) {
        // children 是一个键值对类型的数据，用于确认slot的位置
        const slots = {};
        for (const key in children) {
            const value = children[key];
            slots[key] = (props) => { return Array.isArray(value(props)) ? value(props) : [value(props)]; }; // 返回一个接收传入的props的函数，执行之后可以得到一个vnode节点或vnode节点数组
        }
        instance.slots = slots;
    }
}
// slot原理，父组件render函数中接收一个子组件做其children数组中的一个值，然后往子组件的children中传入一个vnode，作为插槽的值
// 然后对子组件进行解析时，会判断是否组件虚拟节点，如果是就去initSlot，因为对子组件生成组件实例对象时传入了vnode（插槽），而vnode的children就是父组件设置的slot vnode
// 所以直接把slot vnode挂到子组件实例对象中，当调用render的时候因为this指向的是子组件实例对象，所以就可以通过this拿到父组件往子组件里面传入的slot vnode

// 当使用this.$el时，按照vue的规范，需要返回当前组件的元素实例
// 当使用this.$slots时，按照vue的规范，父组件接收子组件作为其下属vnode，slot则是接收子组件时，父组件往子组件里面传入的children值
// 当使用this.$props时，获取组件传入的props
const publicMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
    $props: (i) => i.props,
};
// 抽离组件实例对象的proxy的get操作函数
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // 如果在setup的返回值中，则返回的对应的值
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        // 如果在传入的props中，则返回的对应的值 （props）
        if (hasOwn(props, key)) {
            return props[key];
        }
        // 当使用this.$el时，按照vue的规范，需要返回当前组件的元素实例
        if (publicMap[key]) {
            return publicMap[key](instance);
        }
    }
};

let currentInstance = null; // 创建一个全局变量，用来缓存当前组件实例对象 // （2）
// 调用setupComponent，去补充组件实例对象instance上的props等属性，后续再创建一个proxy挂在组件实例对象上，当执行render函数时this会指向instance
function setupComponent(instance) {
    initProps(instance, instance.vnode.props); // 初始化组件实例的props，对于组件虚拟节点而言props是传入的props，因此将vnode.props提前到组件实例对象instance的props中
    initSlot(instance, instance.vnode.children); // 初始化组件实例的slot，对于组件虚拟节点而言children是传入的slot中的内容，因此将vnode.children中的内容提前到组件实例对象instance的slots中
    // 调用setupStatefulComponent设置组件实例状态  （我们通常写的Vue组件都是有状态的组件，而函数式组件就是没状态组件）
    setupStatefulComponent(instance);
}
// 设置组件实例的状态
function setupStatefulComponent(instance) {
    const Component = instance.type; // 因为是组件类型，所以type指代了组件渲染对象，上面有setup，render等（1），然后instance包括了组件渲染对象以及组件的props等参数
    // 创建一个proxy类型对象，挂载到组件实例对象（instance），对这个对象进行get操作的时候，去查询setupState,。
    // 将创建的proxy类型对象绑定到组件vnode的render函数中，那么执行render函数的时候this就指向了创建的proxy对象
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component; // 解构Component里面的setup
    // 如果setup存在就执行
    if (setup) {
        setCurrentInstance(instance);
        // setup会有一个返回值，可能是fn或obj， 如果是fn则认为是一个组件的render函数，如果是obj就把obj注入到组件中
        // 如果是组件虚拟节点，那么传入的props不允许改动，因此需要将props设置为shallowReadonly类型 （props）
        // 实现emit功能：emit是个函数，所以将emit挂载到事件实例对象上 （emit）, 在setup函数中返回出去，在子组件中的setup函数中去触发时，就会将传进来的父组件中对应的函数去执行，实现emit的功能
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit }); // 把props和emit传入，在setup函数中使用即可，然后render中也使用了props等则通过proxy去代理获取
        // 当这setup执行完之后，取消组件实例对象在currentInstance中的缓存
        currentInstance = null; // （2）
        // setup返回值是obj就把obj注入到组件实例中
        if (typeof setupResult === 'object') {
            instance.setupState = setupResult;
        }
        finishComponentSetup(instance);
    }
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    if (compiler && !Component.render) { //  Component.render 组件自身render优先级最高
        if (Component.template) { // 判断当前是否提供了template，如果提供了则借助compiler转成render
            Component.render = compiler(Component.template);
        }
    }
    // （1）这一步是将组件的对象里面render提前到instance里面
    instance.render = Component.render;
}
// 获取当前组件实例对象
function getCurrentInstance() {
    return currentInstance;
}
// 设置当前组件实例对象
function setCurrentInstance(instance) {
    // 创建一个全局变量，将组件实例对象存储在currentInstance中，当setup使用了getCurrentInstance的话，就可以拿到外面缓存下来的组件实例对象
    currentInstance = instance; // （2）
}
let compiler;
// 通过这个compiler全局对象去获取到 模板转render的函数
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
}

// instance 组件实例对象 container
// 注意这里传入的vnode是一个组件类型的vnode，通过render函数返回了一个元素类型 vnode > subTree, 然后在递归patch subTree的时候将实例化的元素即el挂了上去，对应： const el = (vnode.el = type.createElement(vnode.type));
function setupRenderEffect(instance, vnode, container, insertPlace) {
    // 通过依赖收集，当proxy的响应式对象发生改变时，会执行下面的代码拿到新的subtree（proxy代理的值改变了所以执行render返回的subTree也会变）然后新的subtree和老的subtree去走更新逻辑
    // 暂存当前组件更新函数
    instance.update = effect(() => {
        // instance上挂载一个isMounted属性，用来校验是否init，还是更新，instance.isMounted == true， 默认是初始化
        if (instance.isMounted) {
            console.log('init');
            // 执行render函数会返回一个虚拟节点树subTree，继续调用patch解析虚拟节点
            // 将instance.proxy绑定到render上，那么render的this.执行instance.proxy的get操作，读取返回setup的返回值
            const subTree = (instance.subTree = instance.render.call(instance.proxy, instance.proxy)); // 缓存初始化的subTree到instance上，下面更新的时候用来比较
            //递归调用patch方法处理vnode树，如果是组件就运行组件mount，如果是元素就运行元素mount
            patch(null, subTree, container, instance, insertPlace);
            // subTree是组件vnode下的虚拟节点，对其创建元素节点的时候，会将创建的元素节点作为参数el挂载到这个subTree的虚拟节点中，因此this.$el 实际上取的就是subTree.el
            vnode.el = subTree.el;
            instance.isMounted = false; // 如果isMounted是false后续就说明是更新操作
        }
        else {
            console.log('update');
            const { next, vnode } = instance; // vnode指代当前的虚拟节点，next值代表下次要更新的虚拟节点 操作：vnode > next
            if (next) {
                // 这一步其实是要将instance的vnode相关属性都替换成next上的，就相当于instance的vnode更新成了next，后面更新的时候使用的vnode就会是我们这里更新的next
                next.el = vnode.el; // 把老节点的el赋值给要更新的虚拟节点的el
                updateComponentPreRender(instance, next);
            }
            const subTree = instance.render.call(instance.proxy, instance.proxy); // 拿到新的subtree，因为执行到effect的更新了，说明当前this里面的值已经有改变了，使用render出来的树的内容和上一次是不一样的
            const preSubTree = instance.subTree; // 拿到缓存下来的初始化的subTree
            instance.subTree = subTree; // 更新缓存的subTree到instance上，下面更新的时候用来比较
            patch(preSubTree, subTree, container, instance, insertPlace); // 传入新的subtree和老的subtree
        }
    }, {
        scheduler() {
            console.log('update - scheduler');
            queueJobs(instance.update);
        }
    });
}
function updateComponentPreRender(instance, nextVnode) {
    // 更新组件实例对象的vnode 和 next， 因为next已经替代之前的vnode了，相当于：vnode next > next null
    instance.vnode = nextVnode;
    instance.next = null;
    // 更新组件实例对象的props， 因为新的虚拟节点的props值发生了改变，所以要同步到组件实例对象中去
    instance.props = nextVnode.props;
}

// processComponent函数去对组件进行处理
// 调用setupRenderEffect函数，执行传入组件的render函数完成组件初始化
function processComponent(oldVnode, vnode, container, parentComponent, insertPlace) {
    // 当虚拟节点list里面有组件类型时，我们更新会返回新的subtree，然后就会走children的遍历，是相同的会继续递归patch，因为是组件所以patch之后就执行processComponent
    // 如果我们只有mountComponent，那么我们每次进去都是会走新建流程，然后会创建一个新的组件实例对象，oldvnode为空，创建一个新的节点，不会更新之前的组件而是创建一个传入的vnode的组件出来
    // 所以这里创建了一个updateComponent方法，继承之前的vnode的组件实例对象，props等，因为之前的实例对象状态已经更新所以，会走更新流程，并且指向的是同一个el所以会正常更新组件
    // 判断老节点是否存在，如果当前vnode没有老节点则走初始化逻辑
    // 老节点不存在时走初始化逻辑
    if (!oldVnode) {
        // mountComponent初始化组件逻辑
        mountComponent(oldVnode, vnode, container, parentComponent, insertPlace);
    }
    // 老节点存在走更新逻辑 
    else {
        updateComponent(oldVnode, vnode);
    }
}
// 调用createComponentInstance函数，对当前传入的组件的进行实例化，之后props，slots，emit等都会挂载到该实例对象上
function mountComponent(oldVnode, vnode, container, parentComponent, insertPlace) {
    // 调用createComponentInstance函数，对当前传入的组件去创建一个组件实例
    const instance = vnode.component = createComponentInstance(vnode, parentComponent); // vnode.component 将创建的组件实例挂载到当前虚拟节点中
    // 调用setupComponent设置组件属性，包括props，slot等属性
    setupComponent(instance);
    // setupRenderEffect函数用于获取 VNode 树并递归地处理，在其中首先调用组件实例对象的render函数获取 VNode 树，之后再调用patch方法递归地处理 VNode 树
    setupRenderEffect(instance, vnode, container, insertPlace);
}
// 调用updateComponent函数，对当前传入的组件的进行更新
function updateComponent(oldVnode, newVnode) {
    const instance = newVnode.component = oldVnode.component; // 读取挂载在vnode的组件实例对象下的update，即effect
    // 判断当前的节点是否需要更新，这里判断的是props
    if (shouldUpdateComponent(oldVnode, newVnode)) {
        instance.next = newVnode; // 把新的虚拟节点赋值给组件实例对象，然后调用更新函数 ，next表示下次要更新的虚拟节点
        // 通过调用effect返回的runner显式去更新页面，就是去执行一遍setupRenderEffect的effect函数
        instance.update();
    }
    else {
        // 如果当前节点不需要更新，也要重置当前的节点信息，在updateComponentPreRender函数里面做的事情这里也要拿过来
        newVnode.el = oldVnode.el;
        instance.vnode = newVnode;
    }
}

function processFragment(oldVnode, vnode, container, parentComponent, insertPlace) {
    vnode.children.forEach((element) => {
        patch(null, element, container, parentComponent, insertPlace);
    });
}
// 当解析子组件的时候renderSlot的时候，返回的是一个虚拟节点，然后slot的内容才能放在这个虚拟节点的children处
// 相当于子节点的render函数如下： h('div', {}, [btn, renderSlot(this.$slots, 'header', 1), foo, renderSlot(this.$slots, 'footer', 2)]);
// 因为slot的内容必须放在children中，所以renderSlot的返回值一定是一个vnode（1），但是由于slots[key]，存储的是一个数组，所以要套一层使得slot作为‘vnode（1）’的children属性去渲染
// 所以这里新增一种patch类型processFragment：（src\runtime-core\component\helper\renderSlots.ts）
// if(typeof slot === 'function') {
//     return createVNode('Fragment', {}, slot(props))   
// }
// 如果是Fragment，就走循环解析

// 最长递增子序列
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

// processElement函数去对元素进行处理
function processElement(oldVnode, vnode, container, parentComponent, type, insertPlace) {
    if (!oldVnode) {
        mountElement(vnode, container, parentComponent, type, insertPlace); // 如果没有oldvode说明是初始化流程   
    }
    else {
        // 如果oldvode存在，说明subtree发生了改变
        patchElement(oldVnode, vnode, type, parentComponent, insertPlace);
    }
}
// 元素初始化
function mountElement(vnode, container, parentComponent, type, insertPlace) {
    // 创建元素节点，并且把实例化的元素节点存到vnode的el属性中
    // 注意这里的vnode是元素vnode，而不是组件vnode，这个是将元素节点挂到元素vnode的el属性中
    // vnode > element > div
    const el = (vnode.el = type.createElement(vnode.type));
    // 获取元素子节点和属性
    const { children, props } = vnode;
    // 获取vnode的类型标识
    const { shareFlag } = vnode;
    if (shareFlag & 4 /* ShareFlags.TEXT_CHILDREN */) {
        // children是text类型说明这个是el下的文本内容
        el.textContent = children;
    }
    else if (shareFlag & 8 /* ShareFlags.ARRAY_CHILDREN */) {
        // children是Array说明这个是el下还有其他子节点要递归去解析
        children.forEach((element) => {
            patch(null, element, el, parentComponent, insertPlace);
        });
    }
    // 设置元素属性，事件
    for (const key in props) {
        const value = props[key];
        type.patchProp(el, key, null, value);
    }
    type.insert(el, container, insertPlace);
}
// 元素更新
function patchElement(oldVnode, vnode, type, parentComponent, insertPlace) {
    const oldVnodeProps = oldVnode.props || {}; // 获取老虚拟节点props
    const vnodeProps = vnode.props || {}; // 获取新虚拟节点props
    // 获取挂载节点，因为el在mountelement的时候赋值，这个是初始化的操作，所以后续更新的话，新的vnode拿不到el，因此在这里要将上一个vnode的el存到新的vnode中
    const el = (vnode.el = oldVnode.el);
    patchChildren(oldVnode, vnode, type, el, parentComponent, insertPlace);
    patchProps(el, oldVnodeProps, vnodeProps, type); // 对新旧props进行遍历，获取改动(对比参数)
}
// (对比children)，子节点的交换
function patchChildren(oldVnode, vnode, type, el, parentComponent, insertPlace) {
    const oldshareFlag = oldVnode.shareFlag;
    const shareFlag = vnode.shareFlag;
    const c1 = oldVnode.children;
    const c2 = vnode.children;
    if (shareFlag & 4 /* ShareFlags.TEXT_CHILDREN */) {
        // 旧是array 新是text
        if (oldshareFlag & 8 /* ShareFlags.ARRAY_CHILDREN */) {
            // 1.清空老的children
            unmountChildren(oldVnode.children, type);
            // 2.设置text
            type.setElementText(el, c2);
        }
        // 旧是text  新是text 
        else if (oldshareFlag & 4 /* ShareFlags.TEXT_CHILDREN */) {
            // 比较新旧text是否相同
            if (c1 !== c2) {
                // 2.如果二者不同，设置新的text
                type.setElementText(el, c2);
            }
        }
    }
    if (shareFlag & 8 /* ShareFlags.ARRAY_CHILDREN */) {
        // 新的是array 旧的是text
        if (oldshareFlag & 4 /* ShareFlags.TEXT_CHILDREN */) {
            // 1.清空文本节点
            type.setElementText(el, '');
            // children是Array说明这个是el下还有其他子节点要递归去解析
            c2.forEach((element) => {
                patch(null, element, el, parentComponent, insertPlace);
            });
        }
        // 新的是array 旧的是array diff算法比较
        else if (oldshareFlag & 8 /* ShareFlags.ARRAY_CHILDREN */) {
            // diff算法比较，两个arrry类型的Children
            patchKeyedChildren(c1, c2, el, parentComponent, insertPlace, type);
        }
    }
}
function patchKeyedChildren(c1, c2, el, parentComponent, insertPlace, type) {
    let i = 0; // 定义初始指针
    let e1 = c1.length - 1; //边界，指针不能大于c1最后一个元素
    let e2 = c2.length - 1; //边界，指针不能大于c2最后一个元素
    // 左侧的对比
    while (i <= e1 && i <= e2) {
        const n1 = c1[i];
        const n2 = c2[i];
        // 判断新旧children，在i指针的处的虚拟节点是否相同
        if (isSameVnodeType(n1, n2)) {
            // 递归比较i指针处的新旧节点的children，因为他们的children有可能是数组
            patch(n1, n2, el, parentComponent, insertPlace);
        }
        else {
            break;
        }
        i++;
    }
    // console.log(i);
    // 右侧的对比
    while (i <= e1 && i <= e2) {
        const n1 = c1[e1];
        const n2 = c2[e2];
        // 判断新旧children，在i指针的处的虚拟节点是否相同
        if (isSameVnodeType(n1, n2)) {
            // 递归比较i指针处的新旧节点的children，因为他们的children有可能是数组
            patch(n1, n2, el, parentComponent, insertPlace);
        }
        else {
            break;
        }
        e1--;
        e2--;
    }
    // 3. 新的比老的长
    //     创建新的
    if (i > e1) {
        if (i <= e2) {
            const nextPos = e2 + 1;
            const insertEl = nextPos < c2.length ? c2[nextPos].el : null; // 插入的指定位置
            while (i <= e2) {
                // 数量可能不止一个，所以循环一遍把全部加进去
                // 因为新的比老的多，所以上面加新加的部分就行，就是大于e1又小于e2的部分
                patch(null, c2[i], el, parentComponent, insertEl);
                i++;
            }
        }
    }
    // 新的比老的短
    // 删除老的
    else if (i > e2) {
        while (i <= e1) {
            // 数量可能不止一个，所以循环一遍把符合条件的都删了
            // 因为新的比老的端，所以上面原来多出来的部分都得删
            type.remove(c1[i].el);
            i++;
        }
    }
    // 乱序
    else {
        // 核心两种：
        // 老的比新的多，一个一个的看，老的有没有出现过在新的里面，如果有就patch，如果没有就remove，并累计数量，如果数量大于新的，则老的后面那些全部循环删除
        // 新的比老的多，先建立一个数组，如果是0就认为没有建立映射关系，就是新的在老的里面没有出现过，说明要加上去
        // 中间对比
        let s1 = i; // 老节点开始的下标
        let s2 = i; // 新节点开始的下标
        let move = false; // 是否需要移动
        let maxNewIndexSoFar = 0; // 判断是否递增
        const toBePatched = e2 - s2 + 1; // 记录新增节点的数量
        let patched = 0; // 记录当前老节点已经在新节点出现了多少次，然后出现次数等于toBePatched即新增节点数量之和，则说明后面的老的可以直接删除
        const keyToNewIndexMap = new Map(); // 创建一个映射表存储新节点的key和对应元素的位置
        // 建立一个数组用来处理最长子序列
        const newIndexToOldIndexMap = new Array(toBePatched);
        for (let i = 0; i < toBePatched; i++)
            newIndexToOldIndexMap[i] = 0;
        // 把新节点的key和对应元素位置存到映射中
        for (let i = s2; i <= e2; i++) {
            const nextChild = c2[i];
            keyToNewIndexMap.set(nextChild.key, i);
        }
        // 老节点的开始 s1应该小于等于e1
        for (let i = s1; i <= e1; i++) {
            const preChild = c1[i]; // 老节点当前指针指向的元素节点
            // 判断当前已经处理的节点是否超过新增的节点数，如果超过就直接将后续的移除
            if (patched >= toBePatched) {
                type.remove(preChild.el);
                continue;
            }
            let newIndex; // 查找老节点元素在不在新节点元素里面，并且在新节点元素的哪个下标问题
            if (preChild.key != null) { // 当节点的key存在时，走映射表
                newIndex = keyToNewIndexMap.get(preChild.key); // 在老的节点在不在新节点上面
            }
            else { // 如果当前的key不存在，走循环遍历
                for (let j = s2; j < e2; j++) {
                    if (isSameVnodeType(preChild, c2[j])) {
                        newIndex = j;
                        break;
                    }
                }
            }
            if (newIndex == undefined) { // 如果当前节点在新的元素节点中找不到说明它被删除了
                type.remove(preChild.el);
            }
            else {
                // 初始化一个maxNewIndexSoFar，每一次都和映射值去比较，如果映射值比他大那就直接更新映射值，如果后一个映射值一直都比maxNewIndexSoFar大，说明这个顺序的递增的没有移动
                if (newIndex >= maxNewIndexSoFar) {
                    maxNewIndexSoFar = newIndex;
                }
                else {
                    // 反之有顺序发生了移动
                    move = true;
                }
                newIndexToOldIndexMap[newIndex - s2] = i + 1; // 0 意味着是新增的节点
                // 如果找到了就去继续递归比较两个节点
                patch(preChild, c2[newIndex], el, parentComponent, null);
                patched++; // 说明处理完了一个新的节点
            }
        }
        // 获取最长子序列
        const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap) || [];
        let j = increasingNewIndexSequence.length - 1;
        for (let i = toBePatched - 1; i >= 0; i--) {
            // 获取位置
            const nextIndex = i + s2;
            // 获取节点
            const nextChild = c2[nextIndex];
            // 获取节点插入位置，如果这个位置没有大于列表长度，说明就是nextIndex + 1，否则加到最后
            const anchor = nextIndex + 1 < c2.length ? c2[nextIndex + 1].el : null;
            console.log(newIndexToOldIndexMap);
            if (newIndexToOldIndexMap[i] == 0) {
                patch(null, nextChild, el, parentComponent, anchor);
            }
            // 有元素更新了位置就触发移动逻辑
            if (move) {
                if (i != increasingNewIndexSequence[j]) {
                    // 移动位置 
                    // 因为老节点是顺序1234的递增的，而increasingNewIndexSequence是基于老节点在新节点的映射就是：
                    // 如：
                    // 老节点 abcd = 1234
                    // 新节点 bcad = 2314
                    // 得到的最长子序列increasingNewIndexSequence就是234
                    // 那么就拿一个递增的且长度不大于新节点的列表去进行比较（就是拿老节点列表去比较，但是老节点列表长度不能大于新列表，所以长度不大于新节点）
                    //  1234 比较 234
                    //  倒序比较后面的234和234一样所以不用动 因为1！=2所以1要移动，而1
                    type.insert(nextChild.el, el, anchor);
                }
                else {
                    j--;
                }
            }
        }
    }
}
function isSameVnodeType(n1, n2) {
    return n1.type == n2.type && n1.key == n2.key;
}
function unmountChildren(children, type) {
    for (let index = 0; index < children.length; index++) {
        const element = children[index].el; // 获取实际字节点element
        type.remove(element);
    }
}
// 遍历新props(对比参数)
function patchProps(el, oldVnodeProps, vnodeProps, type) {
    for (const key in vnodeProps) {
        // 如果新旧props的值存在不同就更新，更新el下的key为nextProp（新值）
        const preProp = oldVnodeProps[key];
        const nextProp = vnodeProps[key];
        if (preProp !== nextProp) {
            type.patchProp(el, key, preProp, nextProp);
        }
    }
    for (const key in oldVnodeProps) {
        // 遍历旧props判断旧props是否存在一些值，是新props没有的，意味着这些值被删除了
        if (!(key in vnodeProps)) {
            // 如果存在某些值旧有新没有，说明被删了，那么这个key也要在el上被删除
            type.patchProp(el, key, oldVnodeProps[key], null);
        }
    }
}

// 如果是text类型虚拟节点就直接渲染上去
function processText(oldVnode, vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}

// 创建虚拟节点
// 虚拟节点有两种主要类型
// 一种是组件，其中tyep是一个对象，这种代表是组件，props是组件的props用于父子组件传值, props不允许修改
// 一种是元素，其中接受type, props?, children?，type是一个字符串，代表元素类型
// 特殊类型
const Fragment = Symbol('Fragment'); // 用于处理slot[key]中返回的是数组的情况，直接渲染返回数组
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        component: null,
        key: props && props.key,
        // 用于存储实例化的元素节点
        el: null,
        shareFlag: getShareFlags(type)
    };
    // 设置vnode 的children类型，判断是text类型还是array类型
    if (typeof children == 'string') {
        vnode.shareFlag |= 4 /* ShareFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shareFlag |= 8 /* ShareFlags.ARRAY_CHILDREN */;
    }
    if (vnode.shareFlag & 2 /* ShareFlags.STATEFUL_COMPONENT */) {
        // 如果是组件类型的vnode
        if (typeof children === 'object') {
            // children是obj类型，则说明这个vnode的children
            vnode.shareFlag |= 16 /* ShareFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
// 获取当前vnode的类型，是组件类型还是元素类型
function getShareFlags(type) {
    return typeof type == 'string' ? 1 /* ShareFlags.ELEMENT */ : 2 /* ShareFlags.STATEFUL_COMPONENT */;
}
// 用于处理text类型虚拟节点 （直接是文案那种）
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

let typeVue = '';
// 将虚拟节点vnode转换成真实节点挂载在容器container就是app根节点下
function render$1(oldVnode, vnode, container, type) {
    if (!typeVue) {
        typeVue = type;
    }
    patch(oldVnode, vnode, container, null, null);
}
// 新增一个虚拟节点oldVnode用来代表新的更新后的虚拟节点
// patch函数用来处理vnode，判断vnode是component组件类型还是element元素类型，如果是component组件则调用processComponent函数，如果是 element元素则调用processElement函数。
function patch(oldVnode, vnode, container, parentComponent, insertPlace) {
    const { type, shareFlag } = vnode;
    // Fragment ——> 只渲染 children
    if (type == Fragment) {
        // 如果vnode的类型是Fragment，只渲染children
        processFragment(oldVnode, vnode, container, parentComponent, insertPlace);
    }
    else if (type == Text) {
        // 如果vnode的类型是Text，直接渲染文本
        processText(oldVnode, vnode, container);
    }
    else {
        if (shareFlag & 1 /* ShareFlags.ELEMENT */) {
            // 如果是元素类型 去处理元素，即element
            processElement(oldVnode, vnode, container, parentComponent, typeVue, insertPlace);
        }
        else if (shareFlag & 2 /* ShareFlags.STATEFUL_COMPONENT */) {
            // 如果是组件类型 去处理组件，即component
            processComponent(oldVnode, vnode, container, parentComponent, insertPlace);
        }
    }
}

// 运行的核心流程，其中包括初始化流程和更新流程
function createAppApi(type) {
    // 实现createApp方法，接收一个根组件并对其解析，返回一个解析后的对象
    return function createApp(App) {
        // rootComponents是解析完之后内容渲染到的地方就是根节点 <div id="app"></div>
        return {
            // mount 接受一个根节点
            mount(rootComponents) {
                // 先转换成v-node
                // 先接受一个组件即rootComponents(根节点)，然后把跟节点转换成虚拟节点
                // 后续的所有操作都会基于v-node去操作
                // 这里App是一个组件类型的虚拟节点，有setup，render等
                const vnode = createVNode(App); // 生成一个组件类型的虚拟节点
                // 生成的虚拟节点是 {组件， props， children}（组件类型）
                // render函数将vnode挂到rootComponents（即根节点下）
                render$1(null, vnode, rootComponents, type);
            }
        };
    };
}

// h就是createVNode函数
function h(type, props, children) {
    return createVNode(type, props, children);
}

// 因为children每一项只能接收vnode，如果slots有多个，我们需要对其进行封装保证其是vnode
function renderSlot(slots, key, props) {
    const slot = slots[key];
    // slot是一个函数 ，用来接收父组件传入的props, 如:（props）=》{}返回带有完整的vnode并将参数设置进里面
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

// 依赖注入，依赖读取函数
function provide(key, value) {
    // 存
    // 通过getCurrentInstance拿到当前组件实例对象
    const currentInstance = getCurrentInstance();
    // 如果组件实例对象存在，则设置其provide属性
    if (currentInstance) {
        let { provide } = currentInstance;
        console.log(currentInstance);
        // 设置provide的原型链指向父级的provide
        const parentProvide = currentInstance.parent.provide;
        if (provide == parentProvide) {
            provide = currentInstance.provide = Object.create(parentProvide);
        }
        // 设置依赖值
        provide[key] = value;
    }
}
// defaultValue 默认值
function inject(key, defaultValue) {
    // 取
    // 通过getCurrentInstance拿到当前组件实例对象
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const provideContent = currentInstance.parent.provide;
        if (key in provideContent) {
            return provideContent[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === 'function') {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createElement(type) {
    return document.createElement(type);
}
// 获取当前节点的新旧props值，props有可能是事件也有可能是属性，但是需要更新
function patchProp(el, key, oldValue, value) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    // on + 事件名称则认为是一个事件
    if (isOn(key)) {
        // 如果当前key是onclick就为当前el注册一个click时间
        el.addEventListener(key.slice(2).toLowerCase(), value);
    }
    else {
        // 如果元素更新阶段新的属性值为null或undefined则移除这个属性
        if (value == undefined || value == null) {
            el.removeAttribute(key);
        }
        else {
            // 否则直接将key，value设置到元素上
            el.setAttribute(key, value);
        }
    }
}
// anchor插入的指定位置
function insert(el, parent, insertPlace) {
    parent.insertBefore(el, insertPlace || null);
}
// 节点移除
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
// 设置节点内容
function setElementText(el, text) {
    el.textContent = text;
}
const render = {
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
};
function createApp(root, option) {
    option = option ? option : render;
    return createAppApi(option)(root);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    nextTicker: nextTicker,
    createAppApi: createAppApi,
    h: h,
    renderSlot: renderSlot,
    createTextVNode: createTextVNode,
    getCurrentInstance: getCurrentInstance,
    registerRuntimeCompiler: registerRuntimeCompiler,
    provide: provide,
    inject: inject,
    toDisplayString: toDisplayString,
    createElementVNode: createVNode
});

// reactive和ref的区别：ref都是一个单值，而proxy面向的是对象，因此ref会返回一个对象，value存储了这个值，通过getter，setter的方式进行数据读取，以及依赖收集，依赖执行。
// 创建RefImpl类用于初始化ref对象
class RefImpl {
    constructor(value) {
        // __v_isRef属性用于判断当前的值是否是ref
        this.__v_isRef = true;
        // 判断value是否对象，如果是对象则用reactive包裹
        this._value = convert(value);
        // 声明一个_rawValue，用来保存value，因为_value有可能会被reactive包裹成为一个proxy，因此需要用_rawValue去暂存原始对象
        this._rawValue = value;
        this.dep = new Set();
    }
    get value() {
        if (isTracking()) {
            // 只有当执行了effect才能去进行依赖收集，因为依赖函数挂载在effect实例化的对象上，如果没有这个对象就无法收集依赖
            // 基于trackEffect去将依赖存储到dep中
            trackEffect(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        // 如果新的值和旧的值相等，就不触发依赖
        // _value有可能是一个reactive即proxy对象，那么这里比较就不能用_value来比较，而是需要用_rawValue（即之前我们暂存的原始对象去比较）
        if (Object.is(newValue, this._rawValue)) {
            return;
        }
        // 先修改值，再进行依赖触发
        // 判断newValue是否对象，如果是对象则用reactive包裹
        this._value = convert(newValue);
        this._rawValue = newValue;
        // 基于triggerEffect去将存储到dep中的依赖执行
        triggerEffect(this.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
// 调用ref函数时，给他返回一个RefImpl实例
function ref(value) {
    return new RefImpl(value);
}
// ref 的原理
// ref对于单个值的响应式，因此ref实际上是一个函数，函数里面会实例化一个对象，这个对象有get，set方法。
// 因为effect的时候会创建一个activeEffect的全局对象，上面包含了effect传入的函数，因此当effect内部的函数执行时触发ref的get的时候
// 将activeEffect传入到ref实例化的对象的dep列表即可，当set的时候执行dep依赖即可

function isReactive(value) {
    return !!value["_v__is_reactive" /* IsType.IS_REACTIVE */];
}
function isReadonly(value) {
    return !!value["_v__is_readonly" /* IsType.IS_READONLY */];
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function isRef(value) {
    return !!value['__v_isRef'];
}
// unRef用于判断当前的值，是否是ref，如果是ref就返回ref.value，反之则返回value
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
// 通常用在template里面，因为ref的话，需要.value才能用，proxyRefs可以直接用，比较方便
function proxyRefs(proxyRefsObj) {
    // 套一层proxy
    return new Proxy(proxyRefsObj, {
        get(target, key) {
            // 如果是ref类型就返回.value
            // 如果不是就返回值的本身
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 如果原来的值是ref类型，且value不是一个ref类型，那么将value设置到ref原来的value上即可
            // 类似：
            // a = ref(1)
            // a = 30
            // 因为a是个ref类型，不能说给个普通值他就不是ref了，只是将原来ref的value改成新的值而已
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                // 反之如果是同类型转换，直接替代即可
                return Reflect.set(target, key, value);
            }
        }
    });
}

class computedImpl {
    constructor(fn) {
        this.stop = true;
        this._fn = fn;
        // 因为fn缓存进去了ReactiveEffect的实例对象中（1）
        // 创建一个ReactiveEffect对象，将fn传入
        this._effect = new ReactiveEffect(fn, () => {
            // 当值改变之后set操作之后，重新打开this.stop，然后因为这个回调和fn互斥，所以后续的reactive对象变更的时候都不会走缓存在ReactiveEffect实例的fn
            // 保证了参数只有value的时候才会被更新
            if (!this.stop) {
                this.stop = true;
            }
        });
    }
    // 如果不调用computed的.value，fn是不会执行的
    get value() {
        // 如果fn依赖响应式对象的值发生改变时，这里的stop会重新打开，并计算新的_value
        // 调用完一次get转换，就不会再调用fn
        if (this.stop) {
            // 锁上
            this.stop = false;
            // 当effect执行之后activeEffect这个全局变量被赋值，赋值为（1）中实例化的对象，因此当调用fn的时候触发了proxy的get操作，开始依赖收集activeEffect被加进去
            // 将fn的执行结果缓存到_value中
            this._value = this._effect.run();
        }
        // 后续读value的时候都是拿之前缓存下来的this._value即fn（）的执行结果
        return this._value;
    }
}
function computed(fn) {
    return new computedImpl(fn);
}
// computed的实现原理
// 在computed实际上是返回了一个实例化的对象，这个对象在实例化的时候接收了一个参数就是computed内部的回调。
// 因为computed是缓存的，所以返回的实例化对象中有一个get方法，取值的时候就会将传入的回调给执行了，并且把结果设置为实例化对象的内部属性，并返回出去。
// 所以computed在取值的时候实际上就读取了存在在对象中的回调函数的执行结果。
// 因为computed会缓存所以在执行get方法的时候会做一个开关，比如说lazy默认为true，只有当lazy为true才能执行回调函数，当函数执行完lazy改成false，所以后续的取值操作都不执行函数，实现了缓存的功能。
// 因为如果computed里面的响应式对象如果发生了改变，computed的结果是需要更新的，所以需要对computed里面的响应式对象进行一个依赖设置。
// vue在进行依赖收集的时候会用一个全局的变量去存储回调函数，在响应式对象get操作的时候就会判断这个全局变量是否存在，如果存在则加到依赖中，后续set操作的时候就拿这些存储的依赖处理执行。
// 所以computed在实例化对象的时候，会构造一个这样一个全局变量然后里面的回调函数的作用是如果执行lazy置为true，即开关打开
// 然后因为去取值的时候会执行一次函数，所以响应式对象get被触发，把lazy置为true的回调存入依赖中，下次响应式对象更新值即set的时候，computed返回的实例对象内部的开关就会被打开了。
// 所以我们下一次执行computed的value的时候，因为开关是开的所以会重新执行一遍函数并更新实例化对象的值，然后开关关上缓存起来，返回新的值。

function compileToFunction(template) {
    const { code } = baseCompile(template);
    // 把runtime-dom 包装
    const render = new Function("vue", code)(runtimeDom);
    return render;
}
registerRuntimeCompiler(compileToFunction);

exports.computed = computed;
exports.createApp = createApp;
exports.createAppApi = createAppApi;
exports.createElementVNode = createVNode;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.isProxy = isProxy;
exports.isReactive = isReactive;
exports.isReadonly = isReadonly;
exports.isRef = isRef;
exports.nextTicker = nextTicker;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.renderSlot = renderSlot;
exports.shallowReadonly = shallowReadonly;
exports.toDisplayString = toDisplayString;
exports.unRef = unRef;
