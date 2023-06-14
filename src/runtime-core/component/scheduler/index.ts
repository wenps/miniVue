// nextTicket 就是将更新任务都加到队列中

const queue:any = [] // 创建一个队列

let isFlushPending = false

export function nextTicker(fn) {
    return fn ? Promise.resolve().then(fn()):Promise.resolve()
}

export function queueJobs(job) {
    if (!queue.includes(job)) { // 如果不存在则添加
        queue.push(job) // 往队列中加入更新任务
    }
    promiseFlush()
}
function promiseFlush() {

    // 创建开关，防止多次创建promise
    if(isFlushPending) return

    isFlushPending = true

     // 创建一个微任务，将队列中的更新任务一个一个拿出来执行
     nextTicker(flushJob)
}

function flushJob() {
    // 执行微任务之后，把创建promise的开关重新打开
    isFlushPending = false

    console.log('执行更新任务')

    let job;
    while (job = queue.shift()) {
        job && job()
    }
}