import { quantize } from "./quantize";

const arrayOfPixels = [
  [190, 197, 190],
  [202, 204, 200],
  [207, 214, 210],
  [211, 214, 211],
  [205, 207, 207],
];

const time1 = new Date().getTime();
// for (let index = 0; index < 2000 * 2000; index++) {
//   const r = Math.floor(Math.random() * 255);
//   const g = Math.floor(Math.random() * 255);
//   const b = Math.floor(Math.random() * 255);
//   arrayOfPixels.push([r, g, b]);
// }
const time2 = new Date().getTime();

const maximumColorCount = 4;

const colorMap = quantize(arrayOfPixels, maximumColorCount);

console.log("lnz", colorMap.palette());

const time3 = new Date().getTime();
console.log("lnz time", time3 - time2);

// export * from "./quantize";
