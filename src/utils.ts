import { VBox } from "./v-box";

export type Pixel = number[]; // [red ,green, blue] 像素数组
export type Histo = number[]; // 记录像素数量数组（下标根据 rgb 数值运算得）

export const sigbits = 5;
export const rshift = 8 - sigbits;
export const maxIterations = 1000;
export const fractByPopulations = 0.75;

export const pv = {
  naturalOrder: <T>(a: T, b: T) => {
    return a < b ? -1 : a > b ? 1 : 0;
  },
  sum: <T>(array: T[], f?: (t: T) => number) => {
    return array.reduce((p, t) => {
      return p + (f ? f.call(array, t) : t);
    }, 0);
  },
  max: <T>(array: T[], f?: (d: T) => number) => {
    return Math.max.apply(null, f ? array.map(f) : array);
  },
  size: <T>(array: T[]) => {
    return array.reduce((p, t) => (t ? p + 1 : p), 0);
  },
};

/**
 * 获取[reg, green, blue]颜色空间像素对应的 histo 下标
 * @returns index
 */
export const getColorIndex = (r: number, g: number, b: number) => {
  return (r << (2 * sigbits)) + (g << sigbits) + b;
};

/**
 * 通过数组 [reg, green, blue] 获取该像素在 histo 下标
 * histo每个元素保存 对应颜色空间像素 的数量
 * @param pixels
 * @returns histo 一维数组，给出颜色空间每个量化区域的像素数
 */
export const getHisto = (pixels: Pixel[]): Histo => {
  let histosize = 1 << (3 * sigbits),
    histo = new Array<number>(histosize), // 一维空间数组
    index,
    rval,
    gval,
    bval;
  pixels.forEach((pixel) => {
    [rval, gval, bval] = pixel.map((num) => num >> rshift);
    index = getColorIndex(rval, gval, bval); // 获取该颜色空间像素对应的 histo 下标
    histo[index] = (histo[index] || 0) + 1;
  });
  return histo;
};

/**
 * 根据像素信息分别获取 rgb 的最值，并生成 VBox
 * @param pixels
 * @param histo
 * @returns
 */
export const vboxFromPixels = (pixels: Pixel[], histo: Histo) => {
  let rmin = 1000000,
    rmax = 0,
    gmin = 1000000,
    gmax = 0,
    bmin = 1000000,
    bmax = 0,
    rval,
    gval,
    bval;
  // find min/max, 根据最值生成符合该色彩空间的 vbox
  pixels.forEach(function (pixel) {
    [rval, gval, bval] = pixel.map((num) => num >> rshift);
    if (rval < rmin) rmin = rval;
    else if (rval > rmax) rmax = rval;
    if (gval < gmin) gmin = gval;
    else if (gval > gmax) gmax = gval;
    if (bval < bmin) bmin = bval;
    else if (bval > bmax) bmax = bval;
  });
  return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
};

/**
 * 根据 histo 中位数，切分色彩空间 vbox
 * @param histo
 * @param vbox
 * @returns
 */
export const medianCutApply = (histo: Histo, vbox: VBox): VBox[] => {
  // no pixel, return
  if (!vbox.count()) return [];
  // only one pixel, no split
  if (vbox.count() == 1) {
    return [vbox.copy()];
  }

  const rw = vbox.r2 - vbox.r1 + 1,
    gw = vbox.g2 - vbox.g1 + 1,
    bw = vbox.b2 - vbox.b1 + 1,
    maxw = pv.max([rw, gw, bw]), // 最长色彩空间跨度
    partialsum: number[] = [];

  let total = 0, // 像素总数量
    i,
    j,
    k,
    sum,
    index;

  // 根据三色轴获取该轴像素数量
  if (maxw === rw) {
    for (i = vbox.r1; i <= vbox.r2; i++) {
      sum = 0;
      for (j = vbox.g1; j <= vbox.g2; j++) {
        for (k = vbox.b1; k <= vbox.b2; k++) {
          index = getColorIndex(i, j, k);
          sum += histo[index] || 0;
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  } else if (maxw === gw) {
    for (i = vbox.g1; i <= vbox.g2; i++) {
      sum = 0;
      for (j = vbox.r1; j <= vbox.r2; j++) {
        for (k = vbox.b1; k <= vbox.b2; k++) {
          index = getColorIndex(j, i, k);
          sum += histo[index] || 0;
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  } else {
    for (i = vbox.b1; i <= vbox.b2; i++) {
      // 获取 red = i 时，所有的像素数量
      sum = 0;
      for (j = vbox.r1; j <= vbox.r2; j++) {
        for (k = vbox.g1; k <= vbox.g2; k++) {
          index = getColorIndex(j, k, i);
          sum += histo[index] || 0;
        }
      }
      // red <= i时，累计像素总数
      total += sum;
      partialsum[i] = total;
    }
  }

  /**
   * 根据颜色维度获取中位数，并切分vbox
   * @param color 颜色维度
   * @returns
   */
  const doCut = (color: "r" | "g" | "b") => {
    let dim1 = color + "1",
      dim2 = color + "2",
      i = vbox[dim1],
      left,
      right,
      vbox1,
      vbox2,
      cutIndex;

    while (i <= vbox[dim2]) {
      // 获取中位数下标 i
      if (partialsum[i] < total / 2) {
        i++;
        continue;
      }

      vbox1 = vbox.copy();
      vbox2 = vbox.copy();
      // 中位数下标与两个最值的距离
      left = i - vbox[dim1];
      right = vbox[dim2] - i;
      // 获取切分点
      if (left <= right) cutIndex = Math.min(vbox[dim2] - 1, ~~(i + right / 2));
      else cutIndex = Math.max(vbox[dim1], ~~(i - 1 - left / 2));
      // avoid 0-count boxes
      while (!partialsum[cutIndex]) cutIndex++;
      // set dimensions
      vbox1[dim2] = cutIndex;
      vbox2[dim1] = cutIndex + 1;
      // console.log('vbox counts:', vbox.count(), vbox1.count(), vbox2.count());
      return [vbox1, vbox2];
    }
    return [];
  };
  // determine the cut planes
  return maxw === rw ? doCut("r") : maxw === gw ? doCut("g") : doCut("b");
};
