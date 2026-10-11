/**
 * Frontend Client-Side DSA Engine
 * Replicates core DSA modules so interactive experiments in the DSA Lab
 * can execute both live in-browser with zero latency AND via backend API benchmarking.
 */

// 1. Binary Max-Heap Priority Queue
export class ClientPriorityQueue {
  constructor() {
    this.heap = [];
  }

  insert(item) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  bubbleUp(idx) {
    let current = idx;
    while (current > 0) {
      const parentIdx = Math.floor((current - 1) / 2);
      if (this.compare(this.heap[current], this.heap[parentIdx]) > 0) {
        [this.heap[current], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[current]];
        current = parentIdx;
      } else {
        break;
      }
    }
  }

  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return max;
  }

  sinkDown(idx) {
    let current = idx;
    const length = this.heap.length;
    while (2 * current + 1 < length) {
      let maxChildIdx = 2 * current + 1;
      const rightChildIdx = 2 * current + 2;
      if (
        rightChildIdx < length &&
        this.compare(this.heap[rightChildIdx], this.heap[maxChildIdx]) > 0
      ) {
        maxChildIdx = rightChildIdx;
      }

      if (this.compare(this.heap[current], this.heap[maxChildIdx]) < 0) {
        [this.heap[current], this.heap[maxChildIdx]] = [this.heap[maxChildIdx], this.heap[current]];
        current = maxChildIdx;
      } else {
        break;
      }
    }
  }

  compare(a, b) {
    if (a.priorityScore !== b.priorityScore) {
      return a.priorityScore - b.priorityScore;
    }
    // earlier timestamp takes precedence
    return (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0));
  }

  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  getSortedList() {
    const clone = new ClientPriorityQueue();
    clone.heap = [...this.heap];
    const res = [];
    while (clone.heap.length > 0) {
      res.push(clone.extractMax());
    }
    return res;
  }
}

// 2. Circular Queue
export class ClientCircularQueue {
  constructor(capacity = 5) {
    this.capacity = capacity;
    this.queue = new Array(capacity).fill(null);
    this.front = -1;
    this.rear = -1;
    this.size = 0;
  }

  enqueue(val) {
    if (this.size === this.capacity) return false;
    if (this.size === 0) {
      this.front = 0;
      this.rear = 0;
    } else {
      this.rear = (this.rear + 1) % this.capacity;
    }
    this.queue[this.rear] = val;
    this.size++;
    return true;
  }

  dequeue() {
    if (this.size === 0) return null;
    const item = this.queue[this.front];
    this.queue[this.front] = null;
    if (this.front === this.rear) {
      this.front = -1;
      this.rear = -1;
    } else {
      this.front = (this.front + 1) % this.capacity;
    }
    this.size--;
    return item;
  }

  toArray() {
    if (this.size === 0) return [];
    const list = [];
    let idx = this.front;
    for (let i = 0; i < this.size; i++) {
      list.push(this.queue[idx]);
      idx = (idx + 1) % this.capacity;
    }
    return list;
  }
}

// 3. Search Visualizer Algorithms
export function clientLinearSearch(arr, key) {
  const steps = [];
  for (let i = 0; i < arr.length; i++) {
    steps.push({ index: i, val: arr[i], match: arr[i] == key });
    if (arr[i] == key) {
      return { found: true, index: i, steps, iterations: i + 1 };
    }
  }
  return { found: false, index: -1, steps, iterations: arr.length };
}

export function clientBinarySearch(sortedArr, key) {
  let low = 0;
  let high = sortedArr.length - 1;
  const steps = [];
  let iterations = 0;

  while (low <= high) {
    iterations++;
    const mid = Math.floor((low + high) / 2);
    steps.push({ low, high, mid, val: sortedArr[mid], target: key });

    if (sortedArr[mid] == key) {
      return { found: true, index: mid, steps, iterations };
    }
    if (sortedArr[mid] < key) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return { found: false, index: -1, steps, iterations };
}

// 4. Sorting Algorithms Visualizer
export function clientBubbleSort(arr, keyProp = 'priority') {
  const list = [...arr];
  let comparisons = 0;
  let swaps = 0;
  for (let i = 0; i < list.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < list.length - i - 1; j++) {
      comparisons++;
      if (list[j][keyProp] < list[j + 1][keyProp]) {
        [list[j], list[j + 1]] = [list[j + 1], list[j]];
        swaps++;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return { sorted: list, comparisons, swaps };
}

export function clientMergeSort(arr, keyProp = 'priority') {
  let comparisons = 0;

  function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      comparisons++;
      if (left[i][keyProp] >= right[j][keyProp]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
  }

  function sort(items) {
    if (items.length <= 1) return items;
    const mid = Math.floor(items.length / 2);
    return merge(sort(items.slice(0, mid)), sort(items.slice(mid)));
  }

  const sorted = sort([...arr]);
  return { sorted, comparisons };
}
