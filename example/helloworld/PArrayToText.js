// 老的是 array
// 新的是 text
import { h, ref } from "../../lib/guide-mini-vue.ems.js";
const nextChildren = "newChildren";
const prevChildren = [h("div", {}, "A"), h("div", {}, "B")];

export const PArrayToText = {
  name: "PArrayToText",
  setup() {
    const isChange = ref(false)
    window.isChange = isChange
    return  {
        isChange
    }
  },
  render() {
    const self = this
    console.log(self.isChange.value);
    return self.isChange.value === true
      ? h("div", {id:"arrayToText"}, nextChildren)
      : h("div", {id:"arrayToText"}, prevChildren);
  },
};
