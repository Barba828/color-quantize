import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    plugins: [typescript({ jsx: "preserve" })],
    output: {
      file: "dist/bundle.js",
      format: "esm",
    },
  },
  {
    // 生成 .d.ts 类型声明文件
    input: "./src/index.ts",
    output: {
      file: "./index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
