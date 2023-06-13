export const enum ShareFlags {
     // 0 否 1 是
     ELEMENT= 1, // 是否元素类型vnode 01
     STATEFUL_COMPONENT = 1 << 1, // 是否组件类型vnode 10
     TEXT_CHILDREN= 1 << 2, // children是否是text类型，即文本 100
     ARRAY_CHILDREN= 1 << 3, // children是否是数组类型，还有其他子节点在下面 1000
     SLOT_CHILDREN= 1 << 4 // 组件类型，children是obj意味着是slot 
}
// << 左移符

// | 或 两位为0才为0
// 0000
// | 
// 0001
// =
// 0001
// & 或 两位为1才为1
// 0001
// & 
// 0001
// =
// 0001