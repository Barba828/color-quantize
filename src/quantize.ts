/**
 * Basic Javascript port of the MMCQ (modified median cut quantization)
 * algorithm from the Leptonica library (http://www.leptonica.org/).
 * Returns a color map you can use to map original pixels to the reduced
 * palette. Still a work in progress.
 */

import { CMap } from "./c-map";
import { PQueue } from "./p-queue";
import {
  fractByPopulations,
  getHisto,
  maxIterations,
  medianCutApply,
  Pixel,
  pv,
  vboxFromPixels,
} from "./utils";
import { VBox } from "./v-box";

export const quantize = (pixels: Pixel[], maxcolors: number) => {
  if (!pixels.length || maxcolors < 2 || maxcolors > 256) {
    return new CMap();
  }

  const histo = getHisto(pixels);

  const nColors = pv.size(histo);
  if (nColors <= maxcolors) {
    // XXX: generate the new colors from the histo and return
  }

  // get the beginning vbox from the colors
  const vbox = vboxFromPixels(pixels, histo);
  const pq = new PQueue<VBox>((a, b) => {
    return pv.naturalOrder(a.count(), b.count());
  });
  pq.push(vbox);

  // inner function to do the iteration
  const iter = (vboxQueue: PQueue<VBox>, target: number) => {
    let vboxSize = vboxQueue.size(),
      tempIterations = 0,
      vbox: VBox;

    while (tempIterations < maxIterations) {
      // 满足数量需求
      if (vboxSize >= target) return;
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
      const [vbox1, vbox2] = medianCutApply(histo, vbox);

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
  const pq2 = new PQueue<VBox>((a, b) => {
    return pv.naturalOrder(a.count() * a.volume(), b.count() * b.volume());
  });

  while (pq.size()) {
    pq2.push(pq.pop());
  }

  // next set - generate the median cuts using the (npix * vol) sorting.
  iter(pq2, maxcolors);

  // calculate the actual colors
  const cmap = new CMap();
  while (pq2.size()) {
    cmap.push(pq2.pop());
  }

  return cmap;
};
