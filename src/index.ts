export * from "./quantize";

// import { quantize } from "../src/quantize";
// const arrayOfPixels = [
//   [190, 197, 190],
//   [202, 204, 200],
//   [207, 214, 210],
//   [211, 214, 211],
//   [205, 207, 207],
//   [103, 23, 211],
//   [23, 45, 122],
//   [245, 67, 203],
//   [98, 89, 102],
// ];
// // for (let index = 0; index < 2000 * 2000; index++) {
// //   const r = Math.floor(Math.random() * 255);
// //   const g = Math.floor(Math.random() * 255);
// //   const b = Math.floor(Math.random() * 255);
// //   arrayOfPixels.push([r, g, b]);
// // }

// const time = new Date().getTime();

// const colorMap = quantize(arrayOfPixels, 2);
// console.log("palette colors", colorMap.palette());

// const time2 = new Date().getTime();
// console.log("lnz time", time2 - time);
