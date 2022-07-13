import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";

const isDev = process.env.NODE_ENV !== "production";

export default [
  {
    // dist 文件
    input: "src/index.ts",
    plugins: [
      typescript({ jsx: "preserve" }), // ts 编译
      !isDev && terser(), // terser 压缩（prod模式下）
    ],
    output: {
      file: "dist/index.js",
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
