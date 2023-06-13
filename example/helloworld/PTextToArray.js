// 新的是 array
// 老的是 text
import { ref, h } from "../../lib/guide-mini-vue.ems.js";

const prevChildren = "oldChild";
const nextChildren = [h("div", {}, "A"), h("div", {}, "B")];

export const PTextToArray =  {
  name: "PTextToArray",
  setup() {
    const isChange = ref(false)
    window.isChange = isChange
    return  {
        isChange
    }
  },
  render() {
    const self = this
    return self.isChange.value === true
      ? h("div", {id:"textToArray"}, nextChildren)
      : h("div", {id:"textToArray"}, prevChildren);
  },
};
