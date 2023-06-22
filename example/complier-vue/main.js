import { createApp } from "../../lib/guide-mini-vue.ems.js";
import { App } from "./App.js";
// vue 3
const rootComponents = document.querySelector('#app')
createApp(App).mount(rootComponents)