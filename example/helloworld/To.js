import { h } from '../../lib/guide-mini-vue.ems.js';
import { PArrayToText} from "./PArrayToText.js";
import { PTextToText } from './PTextToText.js';
import { PArrayToArray } from "./PArrayToArray.js";
import { PTextToArray } from "./PTextToArray.js";
export const App = {
    render() {
        return h(
            'div',
            {
                Tid: 1,
            },
            [
                h('div', {}, '主页'),
                h(PArrayToArray)
            ] 
        );
    },

    setup() {
    }
};