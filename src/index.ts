import { baseCompile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom";
import { registerRuntimeCompiler } from "./runtime-dom";

export * from "./runtime-dom";

function compileToFunction(template) {
    const { code } = baseCompile(template)
    // 把runtime-dom 包装
    const render = new Function("vue", code)(runtimeDom);

    return render;
}

registerRuntimeCompiler(compileToFunction)
