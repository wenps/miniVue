// processElement函数去对元素进行处理

import { ShareFlags } from '../../share/shareFlags';
import { patch } from '../renderer';
import { getSequence } from "../../../getSequence";

export function processElement(oldVnode, vnode, container, parentComponent, type, insertPlace) {
    if (!oldVnode) {
        mountElement(vnode, container, parentComponent, type, insertPlace); // 如果没有oldvode说明是初始化流程   
    } else {
        // 如果oldvode存在，说明subtree发生了改变
        patchElement(oldVnode, vnode, type, parentComponent, insertPlace)
    }
}

// 元素初始化
function mountElement(vnode: any, container: any, parentComponent, type, insertPlace) {
    // 创建元素节点，并且把实例化的元素节点存到vnode的el属性中
    // 注意这里的vnode是元素vnode，而不是组件vnode，这个是将元素节点挂到元素vnode的el属性中
    // vnode > element > div
    const el = (vnode.el = type.createElement(vnode.type));

    // 获取元素子节点和属性
    const { children, props } = vnode;

    // 获取vnode的类型标识
    const { shareFlag } = vnode;

    if (shareFlag & ShareFlags.TEXT_CHILDREN) {
        // children是text类型说明这个是el下的文本内容
        el.textContent = children;
    } else if (shareFlag & ShareFlags.ARRAY_CHILDREN) {
        // children是Array说明这个是el下还有其他子节点要递归去解析
        children.forEach((element) => {
            patch(null, element, el, parentComponent, insertPlace);
        });
    }
    

    // 设置元素属性，事件
    for (const key in props) {
        const value = props[key];
        type.patchProp(el, key, null, value)
    }
    
    type.insert(el, container, insertPlace)
}

// 元素更新
function patchElement(oldVnode: any, vnode: any, type: any, parentComponent: any, insertPlace: any) {
    
    const oldVnodeProps = oldVnode.props || {} // 获取老虚拟节点props
    const vnodeProps = vnode.props || {} // 获取新虚拟节点props

    // 获取挂载节点，因为el在mountelement的时候赋值，这个是初始化的操作，所以后续更新的话，新的vnode拿不到el，因此在这里要将上一个vnode的el存到新的vnode中
    const el = (vnode.el = oldVnode.el)

    patchChildren(oldVnode, vnode, type, el, parentComponent, insertPlace)
    patchProps(el, oldVnodeProps, vnodeProps, type) // 对新旧props进行遍历，获取改动(对比参数)
}

// (对比children)，子节点的交换
function patchChildren(oldVnode: any, vnode: any, type: any, el, parentComponent, insertPlace) {
    const oldshareFlag = oldVnode.shareFlag
    const shareFlag = vnode.shareFlag
    const c1 = oldVnode.children
    const c2 = vnode.children
    

    if(shareFlag & ShareFlags.TEXT_CHILDREN) {
        // 旧是array 新是text
        if(oldshareFlag & ShareFlags.ARRAY_CHILDREN) {
            // 1.清空老的children
            unmountChildren(oldVnode.children, type)
            // 2.设置text
            type.setElementText(el, c2)
        }
        // 旧是text  新是text 
        else if(oldshareFlag & ShareFlags.TEXT_CHILDREN) {
            // 比较新旧text是否相同
            if(c1 !== c2) {
                // 2.如果二者不同，设置新的text
                type.setElementText(el, c2)
            }
        }
    }
    if(shareFlag & ShareFlags.ARRAY_CHILDREN) {
        // 新的是array 旧的是text
        if(oldshareFlag & ShareFlags.TEXT_CHILDREN) {
            // 1.清空文本节点
            type.setElementText(el, '')
            // children是Array说明这个是el下还有其他子节点要递归去解析
            c2.forEach((element) => {
                patch(null, element, el, parentComponent, insertPlace);
            });
        }
        // 新的是array 旧的是array diff算法比较
        else if(oldshareFlag & ShareFlags.ARRAY_CHILDREN) {
            
            // diff算法比较，两个arrry类型的Children
            patchKeyedChildren(c1, c2, el, parentComponent, insertPlace, type)
        }
    }
}

function patchKeyedChildren(c1, c2, el, parentComponent, insertPlace, type) {
    let i = 0 // 定义初始指针
    let e1 = c1.length - 1 //边界，指针不能大于c1最后一个元素
    let e2 = c2.length - 1 //边界，指针不能大于c2最后一个元素

    // 左侧的对比
    while (i <= e1 && i <= e2) {
        const n1 = c1[i]
        const n2 = c2[i]
        
        // 判断新旧children，在i指针的处的虚拟节点是否相同
        if(isSameVnodeType(n1, n2)) {
            
            // 递归比较i指针处的新旧节点的children，因为他们的children有可能是数组
            patch(n1, n2, el, parentComponent, insertPlace)
        } else {
            break;
        }
        i++ 
    }

    // console.log(i);

    // 右侧的对比
    while (i <= e1 && i <= e2) {
        const n1 = c1[e1]
        const n2 = c2[e2]
        
        // 判断新旧children，在i指针的处的虚拟节点是否相同
        if(isSameVnodeType(n1, n2)) {
            // 递归比较i指针处的新旧节点的children，因为他们的children有可能是数组
            patch(n1, n2, el, parentComponent, insertPlace)
        } else {
            break;
        }
        e1--
        e2--
    }
    
    // 3. 新的比老的长
    //     创建新的
    if (i > e1) {
        if (i <= e2) {
            const nextPos = e2 + 1
            const insertEl = nextPos < c2.length ? c2[nextPos].el : null// 插入的指定位置
            while (i <= e2) {
                // 数量可能不止一个，所以循环一遍把全部加进去
                // 因为新的比老的多，所以上面加新加的部分就行，就是大于e1又小于e2的部分
                patch(null, c2[i], el, parentComponent, insertEl)
                i++
            }
        }
    } 
    // 新的比老的短
    // 删除老的
    else if (i > e2) {
        while (i <= e1) {
            // 数量可能不止一个，所以循环一遍把符合条件的都删了
            // 因为新的比老的端，所以上面原来多出来的部分都得删
            type.remove(c1[i].el)
            i++
        }
    }
    // 乱序
    else {
        // 核心两种：
        // 老的比新的多，一个一个的看，老的有没有出现过在新的里面，如果有就patch，如果没有就remove，并累计数量，如果数量大于新的，则老的后面那些全部循环删除
        // 新的比老的多，先建立一个数组，如果是0就认为没有建立映射关系，就是新的在老的里面没有出现过，说明要加上去

        // 中间对比
        let s1 = i // 老节点开始的下标
        let s2 = i // 新节点开始的下标

        let move = false // 是否需要移动
        let maxNewIndexSoFar = 0 // 判断是否递增

        const toBePatched = e2 - s2 + 1 // 记录新增节点的数量
        let patched = 0 // 记录当前老节点已经在新节点出现了多少次，然后出现次数等于toBePatched即新增节点数量之和，则说明后面的老的可以直接删除
        const keyToNewIndexMap = new Map() // 创建一个映射表存储新节点的key和对应元素的位置
        
        // 建立一个数组用来处理最长子序列
        const newIndexToOldIndexMap = new Array(toBePatched)
        for (let i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;

        // 把新节点的key和对应元素位置存到映射中
        for (let i = s2; i <= e2; i++) {  
            const nextChild = c2[i]
            keyToNewIndexMap.set(nextChild.key, i)
        }

        // 老节点的开始 s1应该小于等于e1
        for (let i = s1; i <= e1; i++) {
            
            const preChild = c1[i] // 老节点当前指针指向的元素节点

            // 判断当前已经处理的节点是否超过新增的节点数，如果超过就直接将后续的移除
            if (patched >= toBePatched) {
                type.remove(preChild.el)
                continue
            }
            

            let newIndex // 查找老节点元素在不在新节点元素里面，并且在新节点元素的哪个下标问题
            if(preChild.key != null) { // 当节点的key存在时，走映射表
                newIndex = keyToNewIndexMap.get(preChild.key) // 在老的节点在不在新节点上面
            } else { // 如果当前的key不存在，走循环遍历
                for (let j = s2; j < e2; j++) {
                    if(isSameVnodeType(preChild, c2[j])) {
                        newIndex = j
                        break
                    }
                }
            }
            
            if (newIndex == undefined) { // 如果当前节点在新的元素节点中找不到说明它被删除了
                type.remove(preChild.el)
            } else {

                // 初始化一个maxNewIndexSoFar，每一次都和映射值去比较，如果映射值比他大那就直接更新映射值，如果后一个映射值一直都比maxNewIndexSoFar大，说明这个顺序的递增的没有移动
                if(newIndex >= maxNewIndexSoFar) {
                    maxNewIndexSoFar = newIndex
                } else {
                    // 反之有顺序发生了移动
                    move = true
                }
                
                newIndexToOldIndexMap[newIndex-s2] = i + 1 // 0 意味着是新增的节点
                
                // 如果找到了就去继续递归比较两个节点
                patch(preChild, c2[newIndex], el, parentComponent, null)
                patched ++ // 说明处理完了一个新的节点
            }

        }

        // 获取最长子序列
        const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)||[]
        let j = increasingNewIndexSequence.length - 1

        for (let i = toBePatched - 1; i >= 0; i--) {
            // 获取位置
            const nextIndex = i + s2
            // 获取节点
            const nextChild = c2[nextIndex]
            // 获取节点插入位置，如果这个位置没有大于列表长度，说明就是nextIndex + 1，否则加到最后
            const anchor = nextIndex + 1 < c2.length ?c2[nextIndex + 1].el:null

            console.log(newIndexToOldIndexMap);
            
            if (newIndexToOldIndexMap[i] == 0) {
                patch(null, nextChild, el, parentComponent, anchor)
            }

            // 有元素更新了位置就触发移动逻辑
            if(move) {
                if(i != increasingNewIndexSequence[j]) {
                    // 移动位置 
                    // 因为老节点是顺序1234的递增的，而increasingNewIndexSequence是基于老节点在新节点的映射就是：
                    // 如：
                    // 老节点 abcd = 1234
                    // 新节点 bcad = 2314
                    // 得到的最长子序列increasingNewIndexSequence就是234
                    // 那么就拿一个递增的且长度不大于新节点的列表去进行比较（就是拿老节点列表去比较，但是老节点列表长度不能大于新列表，所以长度不大于新节点）
                    //  1234 比较 234
                    //  倒序比较后面的234和234一样所以不用动 因为1！=2所以1要移动，而1
                    type.insert(nextChild.el, el, anchor)
                } else {
                    j--
                }
            }
            
        }

    }
}

function isSameVnodeType(n1: any, n2: any) {
    return n1.type == n2.type && n1.key == n2.key
}



function unmountChildren(children: any, type) {
    for (let index = 0; index < children.length; index++) {
        const element = children[index].el // 获取实际字节点element
        type.remove(element)
    }
}

// 遍历新props(对比参数)
function patchProps(el, oldVnodeProps: any, vnodeProps: any, type) {
    
    for (const key in vnodeProps) {
        // 如果新旧props的值存在不同就更新，更新el下的key为nextProp（新值）
        const preProp = oldVnodeProps[key] 
        const nextProp = vnodeProps[key]
        if (preProp !== nextProp) {

            type.patchProp(el, key, preProp, nextProp)
        }
    }

    for (const key in oldVnodeProps) {
        // 遍历旧props判断旧props是否存在一些值，是新props没有的，意味着这些值被删除了
        if(!(key in vnodeProps)) {
            // 如果存在某些值旧有新没有，说明被删了，那么这个key也要在el上被删除
            type.patchProp(el, key, oldVnodeProps[key],  null)
        }
    }
}


