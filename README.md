# color-quantize

Node.js module for color quantization, based on [Leptonica](http://www.leptonica.org/).
This library references [quantize](https://github.com/olivierlesnicki/quantize) and uses typescript implementation.

## 原理

### 近似色算法

1. 根据所有像素点 rgb 信息获取 redMax, redMin, greenMax, greenMin, blueMax, blueMin 色彩空间信息
2. 色彩空间信息可以被划分为 n 份
3. n 份色彩空间可以获取该空间的平均色（n 个近似色）

### 一维化像素算法

将 pixels = [...[r, g, b]]二维表示的像素数组压缩为一维 histo = [...num]，其中 num 表示该颜色像素的数量。

rgb 每个颜色都是由 8 位表示（2 的 8 次方即 256），若需要完整的用一维数组表示所有 rgb 的值，就需要 `256 * 256 * 256` 长度的 histo 数组，实际上这里是求取色彩空间，histo 就不需要完整的用每个下标表示单个 rgb 颜色，而是表示一定范围内的色彩，这里我们就让 histo 表达`32 * 32 * 32`长度的色彩空间。

即 rgb 精确表示一个具体的颜色色值：
`[00000000, 00000000, 00000000]`(rgb 各 8 位)
而 色彩空间 范围表示一部分相似的颜色色值：
`[00000, 00000, 00000]`(rgb 各 5 位)

由此，histo 是一个 `1 << 15` 长度的数组，每个下标代表一部分范围的色彩空间，该处下标的值记录符合该范围色值的像素点个数，例如：

yellowgreen: [154, 205, 50]
应该属于色彩空间
colorbox: [19, 25, 6]

转换方式：让每个色值除以 8（即右移 3 位），比如这里的 yellowgreen，实际上 red 色值 152 ～ 159 都属于 red 色彩空间 19。

显而易见，histo 的下标二进制表达为`00000 00000 00000`，前 5 位表示红色空间，中间 5 位绿色空间，最后 5 位蓝色空间，具体实现：

1. r, g, b 三色分别右移 3 位，匹配压缩后的色彩空间值

```js
const rval = r >> 3;
const gval = g >> 3;
const bval = b >> 3;
```

2. 根据三色的色彩空间值，更新色彩空间数组

```js
// const histo = new Array(1 << 3 * 5)
const index = (rval << (2 * 5)) + (gval << 5) + bval;
histo[index]++;
```

实际上 色彩空间位数大小(5) 和 色彩空间精细度(3) 就是原像素信息色彩位数(8)的和，满足这个条件也可以根据需求设置`64 * 64 * 64`等不同大小的色彩空间

## Install

```
npm install color-quantize
```

## Quick Overview

### Usage

```javascript
import { quantize } from "./quantize";

const arrayOfPixels = [
  [190, 197, 190],
  [202, 204, 200],
  [207, 214, 210],
  [211, 214, 211],
  [205, 207, 207],
];
const maximumColorCount = 10;

const colorMap = quantize(arrayOfPixels, maximumColorCount);
```

- `arrayOfPixels` - An array of pixels (represented as [R,G,B arrays]) to quantize
- `maxiumColorCount` - The maximum number of colours allowed in the reduced palette

##### Reduced Palette

The `.palette()` method returns an array that contains the reduced color palette.

```javascript
// Returns the reduced palette
colorMap.palette();
// [[204, 204, 204], [208,212,212], [188,196,188], [212,204,196]]
```

##### Reduced pixel

The `.map(pixel)` method maps an individual pixel to the reduced color palette.

```javascript
// Returns the reduced pixel
colorMap.map(arrayOfPixels[0]);
// [188,196,188]
```
