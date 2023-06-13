import { createApp } from "../../lib/guide-mini-vue.ems.js";
import { App } from "./App.js";

const rootComponents = document.querySelector('#app')
createApp(App).mount(rootComponents)
