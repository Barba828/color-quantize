/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * 优先队列
 */
var PQueue = /** @class */ (function (_super) {
    __extends(PQueue, _super);
    function PQueue(comparator) {
        if (comparator === void 0) { comparator = function (a, b) { return Number(a) - Number(b); }; }
        var _this = _super.call(this) || this;
        _this.comparator = comparator;
        _this._sorted = false;
        _this.sort = function (comparator) {
            _this._sorted = true;
            return _super.prototype.sort.call(_this, comparator || _this.comparator);
        };
        _this.push = function (o) {
            _this._sorted = false;
            return _super.prototype.push.call(_this, o);
        };
        _this.pop = function () {
            if (!_this._sorted)
                _this.sort();
            return _super.prototype.pop.call(_this);
        };
        _this.peek = function (index) {
            if (!_this._sorted)
                _this.sort();
            if (index === undefined)
                index = _this.length - 1;
            return _this[index];
        };
        _this.size = function () {
            return _this.length;
        };
        _this.debug = function () {
            if (!_this._sorted)
                _this.sort();
            return _this;
        };
        return _this;
    }
    return PQueue;
}(Array));

/**
 * rgb三维色彩空间 Box
 */
var VBox = /** @class */ (function () {
    function VBox(r1, // min red
    r2, // max red
    g1, g2, b1, b2, histo) {
        var _this = this;
        this.r1 = r1;
        this.r2 = r2;
        this.g1 = g1;
        this.g2 = g2;
        this.b1 = b1;
        this.b2 = b2;
        this.histo = histo;
        this._count = -1;
        /**
         * 像素空间相对值
         * @param force
         * @returns
         */
        this.volume = function (force) {
            if (_this._volume && !force) {
                return _this._volume;
            }
            _this._volume =
                (_this.r2 - _this.r1 + 1) *
                    (_this.g2 - _this.g1 + 1) *
                    (_this.b2 - _this.b1 + 1);
            return _this._volume;
        };
        /**
         * 获取 histo 的像素数
         * @param force
         * @returns
         */
        this.count = function (force) {
            if (_this._count > -1 && !force) {
                return _this._count;
            }
            _this._count = _this.histo.reduce(function (p, t) { return p + (t || 0); }, 0);
            return _this._count;
        };
        this.copy = function () {
            return new VBox(_this.r1, _this.r2, _this.g1, _this.g2, _this.b1, _this.b2, _this.histo);
        };
        this.avg = function (force) {
            if (_this._avg && force) {
                return _this._avg;
            }
            var ntot = 0, mult = 1 << (8 - sigbits), rsum = 0, gsum = 0, bsum = 0, hval, i, j, k, histoindex;
            for (i = _this.r1; i <= _this.r2; i++) {
                for (j = _this.g1; j <= _this.g2; j++) {
                    for (k = _this.b1; k <= _this.b2; k++) {
                        histoindex = getColorIndex(i, j, k);
                        hval = _this.histo[histoindex] || 0;
                        ntot += hval;
                        rsum += hval * (i + 0.5) * mult;
                        gsum += hval * (j + 0.5) * mult;
                        bsum += hval * (k + 0.5) * mult;
                    }
                }
            }
            if (ntot) {
                _this._avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
            }
            else {
                //console.log('empty box');
                _this._avg = [
                    ~~((mult * (_this.r1 + _this.r2 + 1)) / 2),
                    ~~((mult * (_this.g1 + _this.g2 + 1)) / 2),
                    ~~((mult * (_this.b1 + _this.b2 + 1)) / 2),
                ];
            }
            return _this._avg;
        };
        this.contains = function (pixel) {
            var rval = pixel[0] >> rshift;
            var gval = pixel[1] >> rshift;
            var bval = pixel[2] >> rshift;
            return (rval >= _this.r1 &&
                rval <= _this.r2 &&
                gval >= _this.g1 &&
                gval <= _this.g2 &&
                bval >= _this.b1 &&
                bval <= _this.b2);
        };
    }
    return VBox;
}());

var sigbits = 5;
var rshift = 8 - sigbits;
var maxIterations = 1000;
var fractByPopulations = 0.75;
var pv = {
    naturalOrder: function (a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    },
    sum: function (array, f) {
        return array.reduce(function (p, t) {
            return p + (f ? f.call(array, t) : t);
        }, 0);
    },
    max: function (array, f) {
        return Math.max.apply(null, f ? array.map(f) : array);
    },
    size: function (array) {
        return array.reduce(function (p, t) { return (t ? p + 1 : p); }, 0);
    }
};
/**
 * 获取[reg, green, blue]颜色空间像素对应的 histo 下标
 * @returns index
 */
var getColorIndex = function (r, g, b) {
    return (r << (2 * sigbits)) + (g << sigbits) + b;
};
/**
 * 通过数组 [reg, green, blue] 获取该像素在 histo 下标
 * histo每个元素保存 对应颜色空间像素 的数量
 * @param pixels
 * @returns histo 一维数组，给出颜色空间每个量化区域的像素数
 */
var getHisto = function (pixels) {
    var histosize = 1 << (3 * sigbits), histo = new Array(histosize), // 一维空间数组
    index, rval, gval, bval;
    pixels.forEach(function (pixel) {
        var _a;
        _a = pixel.map(function (num) { return num >> rshift; }), rval = _a[0], gval = _a[1], bval = _a[2];
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
var vboxFromPixels = function (pixels, histo) {
    var rmin = 1000000, rmax = 0, gmin = 1000000, gmax = 0, bmin = 1000000, bmax = 0, rval, gval, bval;
    // find min/max, 根据最值生成符合该色彩空间的 vbox
    pixels.forEach(function (pixel) {
        var _a;
        _a = pixel.map(function (num) { return num >> rshift; }), rval = _a[0], gval = _a[1], bval = _a[2];
        if (rval < rmin)
            rmin = rval;
        else if (rval > rmax)
            rmax = rval;
        if (gval < gmin)
            gmin = gval;
        else if (gval > gmax)
            gmax = gval;
        if (bval < bmin)
            bmin = bval;
        else if (bval > bmax)
            bmax = bval;
    });
    return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
};
/**
 * 根据 histo 中位数，切分色彩空间 vbox
 * @param histo
 * @param vbox
 * @returns
 */
var medianCutApply = function (histo, vbox) {
    // no pixel, return
    if (!vbox.count())
        return [];
    // only one pixel, no split
    if (vbox.count() == 1) {
        return [vbox.copy()];
    }
    var rw = vbox.r2 - vbox.r1 + 1, gw = vbox.g2 - vbox.g1 + 1, bw = vbox.b2 - vbox.b1 + 1, maxw = pv.max([rw, gw, bw]), // 最长色彩空间跨度
    partialsum = [];
    var total = 0, // 像素总数量
    i, j, k, sum, index;
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
    }
    else if (maxw === gw) {
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
    }
    else {
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
    var doCut = function (color) {
        var dim1 = color + "1", dim2 = color + "2", i = vbox[dim1], left, right, vbox1, vbox2, cutIndex;
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
            if (left <= right)
                cutIndex = Math.min(vbox[dim2] - 1, ~~(i + right / 2));
            else
                cutIndex = Math.max(vbox[dim1], ~~(i - 1 - left / 2));
            // avoid 0-count boxes
            while (!partialsum[cutIndex])
                cutIndex++;
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

var CMap = /** @class */ (function () {
    function CMap() {
        var _this = this;
        this.push = function (vbox) {
            _this.vboxes.push({
                vbox: vbox,
                color: vbox.avg()
            });
        };
        /**
         * 获取所有色彩空间颜色
         * @returns
         */
        this.palette = function () {
            return _this.vboxes.map(function (vb) { return vb.color; });
        };
        /**
         * 色彩空间size
         * @returns
         */
        this.size = function () {
            return _this.vboxes.size();
        };
        /**
         * 匹配当前色彩空间近似值
         * @param color
         * @returns
         */
        this.map = function (color) {
            // 当前有色彩空间 包括匹配值
            for (var i = 0; i < _this.vboxes.size(); i++) {
                if (_this.vboxes.peek(i).vbox.contains(color)) {
                    return _this.vboxes.peek(i).color;
                }
            }
            // 无匹配，取近似值
            return _this.nearest(color);
        };
        /**
         * 获取当前颜色近似值
         * @param color
         * @returns
         */
        this.nearest = function (color) {
            var i, d1, d2, pColor;
            for (i = 0; i < _this.vboxes.size(); i++) {
                d2 = Math.sqrt(Math.pow(color[0] - _this.vboxes.peek(i).color[0], 2) +
                    Math.pow(color[1] - _this.vboxes.peek(i).color[1], 2) +
                    Math.pow(color[2] - _this.vboxes.peek(i).color[2], 2));
                if (d2 < d1 || d1 === undefined) {
                    d1 = d2;
                    pColor = _this.vboxes.peek(i).color;
                }
            }
            return pColor;
        };
        /**
         * 当色彩空间接近极值时，直接取纯黑白色
         */
        this.forcebw = function () {
            // XXX: won't  work yet
            _this.vboxes.sort(function (a, b) {
                return pv.naturalOrder(pv.sum(a.color), pv.sum(b.color));
            });
            // force darkest color to black if everything < 5
            var lowest = _this.vboxes[0].color;
            if (lowest[0] < 5 && lowest[1] < 5 && lowest[2] < 5)
                _this.vboxes[0].color = [0, 0, 0];
            // force lightest color to white if everything > 251
            var idx = _this.vboxes.length - 1, highest = _this.vboxes[idx].color;
            if (highest[0] > 251 && highest[1] > 251 && highest[2] > 251)
                _this.vboxes[idx].color = [255, 255, 255];
        };
        this.vboxes = new PQueue(function (a, b) {
            return pv.naturalOrder(a.vbox.count() * a.vbox.volume(), b.vbox.count() * b.vbox.volume());
        });
    }
    return CMap;
}());

/**
 * Basic Javascript port of the MMCQ (modified median cut quantization)
 * algorithm from the Leptonica library (http://www.leptonica.org/).
 * Returns a color map you can use to map original pixels to the reduced
 * palette. Still a work in progress.
 */
var quantize = function (pixels, maxcolors) {
    if (!pixels.length || maxcolors < 2 || maxcolors > 256) {
        return new CMap();
    }
    var histo = getHisto(pixels);
    pv.size(histo);
    // get the beginning vbox from the colors
    var vbox = vboxFromPixels(pixels, histo);
    var pq = new PQueue(function (a, b) {
        return pv.naturalOrder(a.count(), b.count());
    });
    pq.push(vbox);
    // inner function to do the iteration
    var iter = function (vboxQueue, target) {
        var vboxSize = vboxQueue.size(), tempIterations = 0, vbox;
        while (tempIterations < maxIterations) {
            // 满足数量需求
            if (vboxSize >= target)
                return;
            // 遍历次数过多
            if (tempIterations++ > maxIterations) {
                // console.log("infinite loop; perhaps too few pixels!");
                return;
            }
            if (!vboxQueue.peek().count()) {
                /* just put it back */
                tempIterations++;
                continue;
            }
            vbox = vboxQueue.pop();
            // do the cut
            var _a = medianCutApply(histo, vbox), vbox1 = _a[0], vbox2 = _a[1];
            if (!vbox1) {
                // console.log("vbox1 not defined; shouldn't happen!");
                return;
            }
            vboxQueue.push(vbox1);
            if (vbox2) {
                /* vbox2 can be null */
                vboxQueue.push(vbox2);
                vboxSize++;
            }
        }
    };
    // first set of colors, sorted by population
    iter(pq, fractByPopulations * maxcolors);
    // Re-sort by the product of pixel occupancy times the size in color space.
    var pq2 = new PQueue(function (a, b) {
        return pv.naturalOrder(a.count() * a.volume(), b.count() * b.volume());
    });
    while (pq.size()) {
        pq2.push(pq.pop());
    }
    // next set - generate the median cuts using the (npix * vol) sorting.
    iter(pq2, maxcolors);
    // calculate the actual colors
    var cmap = new CMap();
    while (pq2.size()) {
        cmap.push(pq2.pop());
    }
    return cmap;
};

var arrayOfPixels = [
    [190, 197, 190],
    [202, 204, 200],
    [207, 214, 210],
    [211, 214, 211],
    [205, 207, 207],
];
new Date().getTime();
// for (let index = 0; index < 2000 * 2000; index++) {
//   const r = Math.floor(Math.random() * 255);
//   const g = Math.floor(Math.random() * 255);
//   const b = Math.floor(Math.random() * 255);
//   arrayOfPixels.push([r, g, b]);
// }
var time2 = new Date().getTime();
var maximumColorCount = 4;
var colorMap = quantize(arrayOfPixels, maximumColorCount);
console.log("lnz", colorMap.palette());
var time3 = new Date().getTime();
console.log("lnz time", time3 - time2);
// export * from "./quantize";
