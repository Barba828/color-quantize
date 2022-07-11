# color-quantize

Node.js module for color quantization, based on [Leptonica](http://www.leptonica.org/).
This library references [quantize](https://github.com/olivierlesnicki/quantize) and uses typescript implementation.

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
