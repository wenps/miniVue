import { h } from "../../lib/guide-mini-vue.ems.js";
export default {
  name: "Child",
  setup(props, { emit }) {},
  render(proxy) {
    console.log(this.$props.msg);
    return h("div", {}, [h("div", {}, "child - props - msg: " + this.$props.msg)]);
  },
};
