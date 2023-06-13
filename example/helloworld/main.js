import { createApp } from "../../lib/guide-mini-vue.ems.js";
import { App } from "./To.js";
// vue 3
const rootComponents = document.querySelector('#app')
createApp(App).mount(rootComponents)



// import { createApp } from "../../lib/guide-mini-vue.ems.js";
// import { pixi } from "./pixi.js";

// console.log(PIXI);
// const game = new PIXI.Application({
//     width:500,
//     height: 500
// })
// document.body.append(game.view)
// // vue 3
// createApp(pixi, {
//     createElement(type){
//         if(type==='rect'){
//             const rect = new PIXI.Graphics()
//             rect.beginFill(0xff0000)
//             rect.drawRect(0,0,100,100)
//             rect.endFill()
//             return rect
//         }
//     },
//     patchProps(el,key,val){
//         el[key] = val
//     },
//     insert(el,parent){
//         parent.addChild(el)
//     }}).mount(game.stage)
