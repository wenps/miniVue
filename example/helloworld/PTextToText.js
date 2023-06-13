// 新的是 text
// 老的是 text
import { h, ref } from "../../lib/guide-mini-vue.ems.js";

const prevChildren = "oldChild";
const nextChildren = "newChild";

export const PTextToText = {
  name: "PTextToText",
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
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
