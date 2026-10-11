/**
 * Circular Queue Implementation
 * Used for MedicCare Bed Waiting List Allocation.
 *
 * Algorithm Properties:
 * - Fixed/Dynamic buffer using modulo arithmetic: (rear + 1) % capacity
 * - Strictly First-In, First-Out (FIFO) queue behavior
 * - Memory reuse without shifting elements O(1)
 *
 * Complexities:
 * - Enqueue: O(1)
 * - Dequeue: O(1)
 * - Front: O(1)
 * - IsEmpty: O(1)
 * - IsFull: O(1)
 * - Space: O(Capacity)
 */
class CircularQueue {
  constructor(capacity = 20) {
    this.capacity = capacity;
    this.queue = new Array(capacity);
    this.frontIdx = -1;
    this.rearIdx = -1;
    this.currentSize = 0;
  }

  isFull() {
    return this.currentSize === this.capacity;
  }

  isEmpty() {
    return this.currentSize === 0;
  }

  enqueue(item) {
    if (this.isFull()) {
      return { success: false, message: 'Queue is full. Bed waiting list maximum capacity reached.' };
    }

    if (this.isEmpty()) {
      this.frontIdx = 0;
      this.rearIdx = 0;
    } else {
      this.rearIdx = (this.rearIdx + 1) % this.capacity;
    }

    this.queue[this.rearIdx] = item;
    this.currentSize++;
    return { success: true, item, position: this.currentSize };
  }

  dequeue() {
    if (this.isEmpty()) {
      return null;
    }

    const removedItem = this.queue[this.frontIdx];
    this.queue[this.frontIdx] = null;

    if (this.frontIdx === this.rearIdx) {
      // Last item removed
      this.frontIdx = -1;
      this.rearIdx = -1;
    } else {
      this.frontIdx = (this.frontIdx + 1) % this.capacity;
    }

    this.currentSize--;
    return removedItem;
  }

  front() {
    if (this.isEmpty()) return null;
    return this.queue[this.frontIdx];
  }

  size() {
    return this.currentSize;
  }

  toArray() {
    if (this.isEmpty()) return [];
    const elements = [];
    let idx = this.frontIdx;
    for (let count = 0; count < this.currentSize; count++) {
      elements.push(this.queue[idx]);
      idx = (idx + 1) % this.capacity;
    }
    return elements;
  }

  clear() {
    this.queue = new Array(this.capacity);
    this.frontIdx = -1;
    this.rearIdx = -1;
    this.currentSize = 0;
  }
}

module.exports = CircularQueue;
