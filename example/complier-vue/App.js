import {
    ref
  } from "../../lib/guide-mini-vue.ems.js";
export const App = {
    name: 'App',
    template: '<div>hi, {{count.value}}</div>',
    setup() {
        const count = window.count = ref(1)
        return {
            message: 'mini-vue',
            count
        }
    }
}