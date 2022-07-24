declare type Comparator<T> = (a: T, b: T) => number;
/**
 * 优先队列
 * 可以固定设置排序 Callback 方法
 */
declare class PQueue<T> extends Array<T> {
    protected _comparator: Comparator<T>;
    _sorted: boolean;
    constructor(_comparator?: Comparator<T>);
    sort: (comparator?: Comparator<T>) => this;
    push: (o: T) => number;
    pop: () => T;
    /**
     * 获取下标元素(默认获取最后一位元素)
     * @param index
     * @returns
     */
    peek: (index?: number) => T;
    size: () => number;
    debug: () => this;
}

/**
 * rgb三维色彩空间 VBox
 * 以 r,g,b 三色的取色范围(5位)定义 vbox 色彩空间大小
 * 即 x,y,z 三轴的上下限定义 空间大小
 * hitso 一维数组保存像素记录(长度 5*5*5)
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
     * 色彩空间体积（即 r,g,b 三维长方体体积）
     * @param force 强制重算
     * @returns
     */
    volume: (force?: boolean) => number;
    /**
     * 获取 vbox 内的总像素数
     * @param force 强制重算
     * @returns
     */
    count: (force?: boolean) => number;
    copy: () => VBox;
    /**
     * 色彩空间平均颜色
     * @param force
     * @returns
     */
    avg: (force?: boolean) => Pixel;
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
    /**
     * 色彩空间 默认比较函数
     */
    static _compare: (a: VBoxItem, b: VBoxItem) => 1 | -1 | 0;
    /**
     * 色彩空间队列，以 CMap._compare 排序
     */
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
    map: (color: Pixel) => Pixel | undefined;
    /**
     * 获取当前颜色近似值
     * @param color
     * @returns
     */
    nearest: (color: Pixel) => Pixel | undefined;
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
