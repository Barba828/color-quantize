import { getColorIndex, Histo, rshift, sigbits } from "./utils";

/**
 * rgb三维色彩空间 Box
 * 以 r,g,b 三色的取色范围定义 vbox 色彩空间大小
 * 即 x,y,z 三轴的上下限定义 空间大小
 */
export class VBox {
  private _count: number = -1;
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
   * 色彩空间体积（即 r,g,b 三维长方体体积）
   * @param force 强制重算
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
   * 获取 histo 的总像素数（ histo可能有数个 vbox ）
   * @param force 强制重算
   * @returns
   */
  count = (force?: boolean) => {
    if (this._count > -1 && !force) {
      return this._count;
    }

    this._count = this.histo.reduce((pre, tmp) => pre + (tmp || 0), 0);
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

  /**
   * 色彩空间平均颜色
   * @param force
   * @returns
   */
  avg = (force?: boolean) => {
    if (this._avg && force) {
      return this._avg;
    }
    let ntot = 0,
      mult = 1 << rshift,
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
      // empty box
      this._avg = [
        ~~((mult * (this.r1 + this.r2 + 1)) / 2),
        ~~((mult * (this.g1 + this.g2 + 1)) / 2),
        ~~((mult * (this.b1 + this.b2 + 1)) / 2),
      ];
    }
    return this._avg;
  };

  /**
   * 像素是否在vbox色彩空间内
   * @param pixel
   * @returns
   */
  contains = (pixel: number[]) => {
    const [rval, gval, bval] = pixel.map((num) => num >> rshift);
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
