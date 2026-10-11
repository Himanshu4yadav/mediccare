/**
 * Search Algorithms Module
 * Contains Linear Search and Binary Search implementations with step instrumentation
 * and complexity metrics.
 */

/**
 * Linear Search:
 * Scans elements one by one. Works on unsorted and sorted datasets.
 * Time Complexity: O(N) Worst/Average, O(1) Best.
 * Space Complexity: O(1).
 */
function linearSearch(arr, key, field = null) {
  const steps = [];
  let iterations = 0;

  for (let i = 0; i < arr.length; i++) {
    iterations++;
    const currentVal = field && typeof arr[i] === 'object' ? arr[i][field] : arr[i];
    steps.push({ index: i, value: currentVal, matched: currentVal == key });

    if (currentVal == key) {
      return {
        found: true,
        index: i,
        element: arr[i],
        iterations,
        steps,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)'
      };
    }
  }

  return {
    found: false,
    index: -1,
    element: null,
    iterations,
    steps,
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)'
  };
}

/**
 * Binary Search:
 * Divides sorted search space in half each iteration. Requires monotonic order.
 * Time Complexity: O(log N) Worst/Average, O(1) Best.
 * Space Complexity: O(1) Iterative.
 */
function binarySearch(sortedArr, key, field = null) {
  const steps = [];
  let iterations = 0;
  let low = 0;
  let high = sortedArr.length - 1;

  while (low <= high) {
    iterations++;
    const mid = Math.floor((low + high) / 2);
    const midVal = field && typeof sortedArr[mid] === 'object' ? sortedArr[mid][field] : sortedArr[mid];

    steps.push({ low, high, mid, value: midVal, target: key });

    if (midVal == key) {
      return {
        found: true,
        index: mid,
        element: sortedArr[mid],
        iterations,
        steps,
        timeComplexity: 'O(log N)',
        spaceComplexity: 'O(1)'
      };
    } else if (midVal < key) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return {
    found: false,
    index: -1,
    element: null,
    iterations,
    steps,
    timeComplexity: 'O(log N)',
    spaceComplexity: 'O(1)'
  };
}

module.exports = {
  linearSearch,
  binarySearch
};
