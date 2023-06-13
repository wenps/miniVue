module.exports = {
    // npm i typescript -D 安装ts
    // npx tsc --init 集成ts
    // 安装jest npm i jest @types/jest -D

    // 由于jest运行在node环境下用commonJS，使用esmodule会报错需要安装babel转换
    // npm i babel-jest @babel/core @babel/preset-env 
    presets:[
        ["@babel/preset-env", {targets: {node:"current"}}],  // 告知babel以当前node版本转换
        '@babel/preset-typescript'  // npm i @babel/preset-typescript支持TS
    ]  
}
