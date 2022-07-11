import { getColorIndex, Histo, rshift, sigbits } from "./utils";

/**
 * rgb三维色彩空间 Box
 */
export class VBox {
  private _count_set: boolean;
  private _count: number;
  private _volume: number;
  private _avg: number[];

  constructor(
    public r1: number, // min red
    public r2: number, // max red
    public g1: number,
    public g2: number,
    public b1: number,
    public b2: number,
    public histo: Histo
  ) {}

  /**
   * 像素空间相对值
   * @param force
   * @returns
   */
  volume = (force?: boolean) => {
    if (this._volume && !force) {
      return this._volume;
    }
    this._volume =
      (this.r2 - this.r1 + 1) *
      (this.g2 - this.g1 + 1) *
      (this.b2 - this.b1 + 1);
    return this._volume;
  };

  /**
   * 获取 histo 的像素数
   * @param force
   * @returns
   */
  count = (force?: boolean) => {
    if (this._count_set && !force) {
      return this._count;
    }

    let npix = 0;
    let i, j, k, index;

    // 根据 rgb 色彩空间遍历 histo
    // TODO 这里为啥不直接遍历 histo
    for (i = this.r1; i <= this.r2; i++) {
      for (j = this.g1; j <= this.g2; j++) {
        for (k = this.b1; k <= this.b2; k++) {
          index = getColorIndex(i, j, k);
          npix += this.histo[index] || 0;
        }
      }
    }

    this._count = npix;
    this._count_set = true;
    return this._count;
  };

  copy = () => {
    return new VBox(
      this.r1,
      this.r2,
      this.g1,
      this.g2,
      this.b1,
      this.b2,
      this.histo
    );
  };

  avg = (force?: boolean) => {
    if (this._avg && force) {
      return this._avg;
    }
    let ntot = 0,
      mult = 1 << (8 - sigbits),
      rsum = 0,
      gsum = 0,
      bsum = 0,
      hval,
      i,
      j,
      k,
      histoindex;
    for (i = this.r1; i <= this.r2; i++) {
      for (j = this.g1; j <= this.g2; j++) {
        for (k = this.b1; k <= this.b2; k++) {
          histoindex = getColorIndex(i, j, k);
          hval = this.histo[histoindex] || 0;
          ntot += hval;
          rsum += hval * (i + 0.5) * mult;
          gsum += hval * (j + 0.5) * mult;
          bsum += hval * (k + 0.5) * mult;
        }
      }
    }
    if (ntot) {
      this._avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
    } else {
      //console.log('empty box');
      this._avg = [
        ~~((mult * (this.r1 + this.r2 + 1)) / 2),
        ~~((mult * (this.g1 + this.g2 + 1)) / 2),
        ~~((mult * (this.b1 + this.b2 + 1)) / 2),
      ];
    }
    return this._avg;
  };

  contains = (pixel: number[]) => {
    const rval = pixel[0] >> rshift;
    const gval = pixel[1] >> rshift;
    const bval = pixel[2] >> rshift;
    return (
      rval >= this.r1 &&
      rval <= this.r2 &&
      gval >= this.g1 &&
      gval <= this.g2 &&
      bval >= this.b1 &&
      bval <= this.b2
    );
  };
}
