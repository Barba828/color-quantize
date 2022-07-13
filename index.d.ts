declare type Comparator<T> = (a: T, b: T) => number;
/**
 * 优先队列
 */
declare class PQueue<T> extends Array<T> {
    protected _comparator: Comparator<T>;
    _sorted: boolean;
    constructor(_comparator?: Comparator<T>);
    sort: (comparator?: Comparator<T>) => this;
    push: (o: T) => number;
    pop: () => T;
    peek: (index?: number) => T;
    size: () => number;
    debug: () => this;
}

/**
 * rgb三维色彩空间 Box
 */
declare class VBox {
    r1: number;
    r2: number;
    g1: number;
    g2: number;
    b1: number;
    b2: number;
    histo: Histo;
    private _count;
    private _volume;
    private _avg;
    constructor(r1: number, // min red
    r2: number, // max red
    g1: number, g2: number, b1: number, b2: number, histo: Histo);
    /**
     * 色彩空间相对值
     * @param force
     * @returns
     */
    volume: (force?: boolean) => number;
    /**
     * 获取 histo 的像素数
     * @param force
     * @returns
     */
    count: (force?: boolean) => number;
    copy: () => VBox;
    /**
     * 色彩空间平均颜色
     * @param force
     * @returns
     */
    avg: (force?: boolean) => number[];
    /**
     * 像素是否在vbox色彩空间内
     * @param pixel
     * @returns
     */
    contains: (pixel: number[]) => boolean;
}

declare type Pixel = number[];
declare type Histo = number[];

declare type VBoxItem = {
    vbox: VBox;
    color: Pixel;
};
declare class CMap {
    vboxes: PQueue<VBoxItem>;
    constructor();
    push: (vbox: VBox) => void;
    /**
     * 获取所有色彩空间颜色
     * @returns
     */
    palette: () => Pixel[];
    /**
     * 色彩空间size
     * @returns
     */
    size: () => number;
    /**
     * 匹配当前色彩空间近似值
     * @param color
     * @returns
     */
    map: (color: number[]) => any;
    /**
     * 获取当前颜色近似值
     * @param color
     * @returns
     */
    nearest: (color: number[]) => any;
    /**
     * 当色彩空间接近极值时，直接取纯黑白色
     */
    forcebw: () => void;
}

/**
 * Basic Javascript port of the MMCQ (modified median cut quantization)
 * algorithm from the Leptonica library (http://www.leptonica.org/).
 * Returns a color map you can use to map original pixels to the reduced
 * palette. Still a work in progress.
 */

declare const quantize: (pixels: Pixel[], maxcolors: number) => CMap;

export { quantize };
