import { createAppApi } from "../runtime-core";

function createElement(type) {
    return document.createElement(type)
}

// 获取当前节点的新旧props值，props有可能是事件也有可能是属性，但是需要更新
function patchProp(el, key, oldValue, value) {

    const isOn = (key) => /^on[A-Z]/.test(key);

    // on + 事件名称则认为是一个事件
    if (isOn(key)) {
        // 如果当前key是onclick就为当前el注册一个click时间
        el.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
        // 如果元素更新阶段新的属性值为null或undefined则移除这个属性
        if(value == undefined || value == null) {
            el.removeAttribute(key)
        } else {
            // 否则直接将key，value设置到元素上
            el.setAttribute(key, value);
        }
    }
}
// anchor插入的指定位置
function insert(el, parent, insertPlace) {
    parent.insertBefore(el, insertPlace || null)
}

// 节点移除
function remove(child) {
    const parent = child.parentNode 
    if(parent) {
        parent.removeChild(child)
    }
}

// 设置节点内容
function setElementText(el, text) {
    el.textContent = text
}

const render = {
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
}

export function createApp(root, option) {
    option = option ? option : render
    
    return createAppApi(option)(root)
}

export * from "../runtime-core";


