/**
 * Priority Queue implemented via Binary Max-Heap
 * Used for MedicCare Emergency Triage Prioritization.
 *
 * Algorithm Properties:
 * - Complete Binary Tree stored inside a dynamic array
 * - Max-Heap Property: Parent key >= Children keys
 * - Tie-breaker: If priority scores are equal, older requests (smaller createdAt timestamp)
 *   get higher precedence (FIFO within same priority).
 *
 * Complexities:
 * - Insert (enqueue): O(log N)
 * - Extract Max (dequeue): O(log N)
 * - Peek (getMax): O(1)
 * - Heapify (Build Heap): O(N)
 * - Space Complexity: O(N)
 */
class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Helper index calculations
  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  hasParent(i) {
    return this.getParentIndex(i) >= 0;
  }

  hasLeftChild(i) {
    return this.getLeftChildIndex(i) < this.heap.length;
  }

  hasRightChild(i) {
    return this.getRightChildIndex(i) < this.heap.length;
  }

  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Compares node A and node B.
   * Returns true if node A has higher triage precedence than node B.
   */
  hasHigherPriority(a, b) {
    if (!a || !b) return false;
    if (a.priorityScore > b.priorityScore) return true;
    if (a.priorityScore < b.priorityScore) return false;

    // Tie-breaker: earlier timestamp has higher priority
    const timeA = new Date(a.createdAt || 0).getTime();
    const timeB = new Date(b.createdAt || 0).getTime();
    return timeA < timeB;
  }

  /**
   * Insert new emergency case into the priority queue
   * Complexity: O(log N)
   */
  insert(item) {
    if (!item) return;
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  bubbleUp(index) {
    let current = index;
    while (
      this.hasParent(current) &&
      this.hasHigherPriority(this.heap[current], this.heap[this.getParentIndex(current)])
    ) {
      const parentIdx = this.getParentIndex(current);
      this.swap(current, parentIdx);
      current = parentIdx;
    }
  }

  /**
   * Peek highest priority case without removing
   * Complexity: O(1)
   */
  peek() {
    if (this.heap.length === 0) return null;
    return this.heap[0];
  }

  /**
   * Extract highest priority emergency case
   * Complexity: O(log N)
   */
  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const root = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.sinkDown(0);
    return root;
  }

  sinkDown(index) {
    let current = index;
    while (this.hasLeftChild(current)) {
      let priorityChildIdx = this.getLeftChildIndex(current);
      const rightChildIdx = this.getRightChildIndex(current);

      if (
        this.hasRightChild(current) &&
        this.hasHigherPriority(this.heap[rightChildIdx], this.heap[priorityChildIdx])
      ) {
        priorityChildIdx = rightChildIdx;
      }

      if (this.hasHigherPriority(this.heap[current], this.heap[priorityChildIdx])) {
        break;
      }

      this.swap(current, priorityChildIdx);
      current = priorityChildIdx;
    }
  }

  /**
   * Batch heapify an array of items in O(N) time
   */
  heapify(items) {
    if (!Array.isArray(items)) return;
    this.heap = [...items];
    const lastParentIdx = Math.floor(this.heap.length / 2) - 1;
    for (let i = lastParentIdx; i >= 0; i--) {
      this.sinkDown(i);
    }
  }

  /**
   * Returns array sorted in priority order using repeated extraction (Heapsort approach)
   * Does not mutate original heap state.
   */
  getSortedArray() {
    const clone = new PriorityQueue();
    clone.heap = [...this.heap];
    const sorted = [];
    while (!clone.isEmpty()) {
      sorted.push(clone.extractMax());
    }
    return sorted;
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  display() {
    return [...this.heap];
  }

  clear() {
    this.heap = [];
  }
}

module.exports = PriorityQueue;
