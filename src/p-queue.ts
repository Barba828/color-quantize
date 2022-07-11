type Comparator<T> = (a: T, b: T) => number;

/**
 * 优先队列
 */
export class PQueue<T> extends Array<T> {
  _sorted: boolean = false;

  constructor(
    protected comparator: Comparator<T> = (a, b) => Number(a) - Number(b)
  ) {
    super();
  }

  sort = (comparator?: Comparator<T>) => {
    this._sorted = true;
    return super.sort(comparator || this.comparator);
  };

  push = (o: T) => {
    this._sorted = false;
    return super.push(o);
  };

  pop = () => {
    if (!this._sorted) this.sort();
    return super.pop() as T;
  };

  peek = (index?: number) => {
    if (!this._sorted) this.sort();
    if (index === undefined) index = this.length - 1;
    return this[index] as T;
  };

  size = () => {
    return this.length;
  };

  debug = () => {
    if (!this._sorted) this.sort();
    return this;
  };
}
