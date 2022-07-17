# color-quantize

Node.js module for color quantization, based on [Leptonica](http://www.leptonica.org/).
This library references [quantize](https://github.com/olivierlesnicki/quantize) and uses typescript implementation.

## 原理

### 近似色算法

1. 根据所有像素点 rgb 信息获取 redMax, redMin, greenMax, greenMin, blueMax, blueMin 色彩空间信息
2. 色彩空间信息可以被划分为 n 份
3. n 份色彩空间可以获取该空间的平均色（n 个近似色）

实际上一张图片的颜色我们可以看作一张三维坐标系，其三轴从常规的 x, y, z 变为 r, g, b 。
由此，令：
length = redMax - redMin
width = greenMax - greenMin
height = blueMax - blueMin
那么色彩空间体（vbox）是一个 `length * width * height` 的长方体，该色彩空间的平均颜色即是：色彩空间内所有像素 r,g,b 分别之和除以像素数量`[redSum / pixelCount, greenSum / pixelCount, blueSum / pixelCount]`。同时，若需要对该空间进行垂直切割可以将`height` 分为`height1`和`height2`，那么：
vbox = `length * width * height` = `length * width * height1` + `length * width * height2` = vbox1 + vbox2

若需要 n 个近似色只需要

1. 按照一定的策略分割 [vbox] 为 [vbox1, vbox2]
2. 选出其中最大的 vboxn 继续分割为 [vbox1, vbox2 ..., vboxn] 直到数组长度为 n
3. 单独计算每一个 vbox 中的平均色即可

### 一维化像素压缩算法

一个图像标准的像素信息往往是这样的 pixels = [...[r, g, b]]，第一维数组顺序记录了像素点的位置信息，第二维数组记录了 r, g, b 三色的信息。那么在获取颜色的压缩中完全可以：

1. 去除掉位置信息
2. Array 表示的[r, g, b]降格以 Number 表示

由此，将 pixels = [...[r, g, b]]二维表示的像素数组压缩为一维 histo = [...num]，其中 num 表示该颜色像素的数量。

rgb 每个颜色都是由 8 位表示（2 的 8 次方即 256），若需要完整的用一维数组表示所有 rgb 的值，就需要 `256 * 256 * 256` 长度的 histo 数组，实际上这里是求取色彩空间，histo 就不需要完整的用每个下标表示单个 rgb 颜色，而是表示一定范围内的色彩，这里我们就让 histo 表达`32 * 32 * 32`长度的色彩范围，计算量可谓真正意义上的几何倍率的降低。

即 rgb 精确表示一个具体的颜色色值：
`[00000000, 00000000, 00000000]`(rgb 各 8 位)
而 色彩范围 表示一部分相似的颜色色值：
`[00000, 00000, 00000]`(rgb 各 5 位)

由此，histo 是一个 `1 << (3 * 5)` 长度的数组，每个下标代表一部分范围的色彩空间，该处下标的值记录符合该范围色值的像素点个数，例如：

> yellowgreen: [154, 205, 50]

应该属于色彩范围

> colorbox: [19, 25, 6]

转换方式：让每个色值除以 8（即右移 3 位），比如这里的 yellowgreen，实际上 red 色值 152 ～ 159 都属于 red 色彩空间 19。

显而易见，histo 的下标二进制表达为`00000 00000 00000`，前 5 位表示红色空间，中间 5 位绿色空间，最后 5 位蓝色空间，具体实现：

1. r, g, b 三色分别右移 3 位，匹配压缩后的色彩范围值

```js
const rval = r >> 3;
const gval = g >> 3;
const bval = b >> 3;
```

2. 遍历像素的 rgb，获取对应色彩范围后，根据色彩范围更新色彩范围数组

```js
// const histo = new Array(1 << 3 * 5)
const index = (rval << (2 * 5)) + (gval << 5) + bval;
histo[index]++;
```

实际上 色彩空间位数大小(5) 和 色彩空间精细度(3) 就是原像素信息色彩位数(8)的和，满足这个条件也可以根据需求设置`64 * 64 * 64`等不同大小的色彩空间

### 实现

有了 近似色算法 和 一维化像素压缩算法 后可以稍加思索推论出 quantize 的实现：

1. 根据所有像素点 rgb 压缩为色彩范围，并生成 histo 和 原 vbox
   > 概括的来说
   > histo 用于表示色彩空间内的具体的色彩的像素数量
   > vbox 用于表示色彩空间的范围
2. 根据目标近似色数量进行分割 vbox ，分割时找到 vbox 最长边，基于 histo 计算空间像素密度找到该边的分割位置，将 vbox “拦腰切断”
3. 重复切割完所有 vbox 并获取其平均色后，逆压缩算法得出该 vbox 真实的 rgb 平均色

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
