import { NodeTypes } from '../ast';

// 创建复合类型，将相邻text和插值类型整合起来
export function transformText(node) {
    // 判断当前是否是text或插值
    function isText(node) {
        return node.type == NodeTypes.TEXT || node.type == NodeTypes.INTERPOLATION;
    }

    if (node.type == NodeTypes.ELEMENT) {
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
                                    type: NodeTypes.COMPOUND_EXPRESSION,
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
                        } else {
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
