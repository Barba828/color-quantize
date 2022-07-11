declare type Comparator<T> = (a: T, b: T) => number;
declare class PQueue<T> extends Array<T> {
    protected comparator: Comparator<T>;
    _sorted: boolean;
    constructor(comparator?: Comparator<T>);
    sort: (comparator?: Comparator<T>) => this;
    push: (o: T) => number;
    pop: () => T;
    peek: (index?: number) => T;
    size: () => number;
    debug: () => this;
}

declare type Pixel = number[];
declare type Histo = number[];

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
    private _count_set;
    private _count;
    private _volume;
    private _avg;
    constructor(r1: number, // min red
    r2: number, // max red
    g1: number, g2: number, b1: number, b2: number, histo: Histo);
    volume: (force?: boolean) => number;
    /**
     * 获取 histo 的像素数
     * @param force
     * @returns
     */
    count: (force?: boolean) => number;
    copy: () => VBox;
    avg: (force?: boolean) => number[];
    contains: (pixel: number[]) => boolean;
}

declare type VBoxItem = {
    vbox: VBox;
    color: number[];
};
declare class CMap {
    vboxes: PQueue<VBoxItem>;
    constructor();
    push: (vbox: VBox) => void;
    palette: () => number[][];
    size: () => number;
    map: (color: number[]) => any;
    nearest: (color: number[]) => any;
    forcebw: () => void;
}

declare const quantize: (pixels: Pixel[], maxcolors: number) => CMap;

export { quantize };
