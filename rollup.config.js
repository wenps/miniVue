import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
export default {
    input: './src/index.ts', // 配置代码入口
    output: [
        // 1.cjs > commonjs
        // 2.esm
        {
            format: 'cjs', // 打包成commonjs类型
            file: 'lib/guide-mini-vue.cjs.js' // 打包到lib的guide-mini-vue.cjs.js
        },
        {
            format: 'es', // 打包成commonjs类型
            file: 'lib/guide-mini-vue.ems.js' // 打包到lib的guide-mini-vue.cjs.js
        }
    ],
    plugins: [
        typescript()
    ]
}