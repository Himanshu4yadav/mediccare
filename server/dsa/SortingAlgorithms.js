/**
 * Sorting Algorithms Module
 * Implements Bubble Sort and Merge Sort with detailed step metrics, comparison counts,
 * swap tracking, and stability guarantees.
 */

/**
 * Bubble Sort:
 * Repeatedly steps through list, compares adjacent items, and swaps if in wrong order.
 * - Time Complexity: O(N^2) Average/Worst, O(N) Best (with early exit flag).
 * - Space Complexity: O(1) in-place.
 * - Stable: Yes (equal keys do not swap).
 */
function bubbleSort(inputArray, field = null, order = 'asc') {
  const arr = [...inputArray];
  const n = arr.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const valA = field && typeof arr[j] === 'object' ? arr[j][field] : arr[j];
      const valB = field && typeof arr[j + 1] === 'object' ? arr[j + 1][field] : arr[j + 1];

      const shouldSwap = order === 'asc' ? valA > valB : valA < valB;
      if (shouldSwap) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swaps++;
        swapped = true;
      }
    }
    if (!swapped) break; // Optimized early exit
  }

  return {
    sortedArray: arr,
    comparisons,
    swaps,
    algorithm: 'Bubble Sort',
    timeComplexity: 'O(N^2)',
    spaceComplexity: 'O(1)',
    isStable: true
  };
}

/**
 * Merge Sort:
 * Divide-and-conquer recursive sorting algorithm.
 * - Time Complexity: O(N log N) Best, Average, and Worst.
 * - Space Complexity: O(N) auxiliary space.
 * - Stable: Yes (maintains relative order of equivalent items using <= in merge).
 */
function mergeSort(inputArray, field = null, order = 'asc') {
  let comparisons = 0;

  function merge(left, right) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      comparisons++;
      const valA = field && typeof left[i] === 'object' ? left[i][field] : left[i];
      const valB = field && typeof right[j] === 'object' ? right[j][field] : right[j];

      let condition;
      if (order === 'asc') {
        condition = valA <= valB; // <= ensures stability
      } else {
        condition = valA >= valB;
      }

      if (condition) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
  }

  function sort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = sort(arr.slice(0, mid));
    const right = sort(arr.slice(mid));
    return merge(left, right);
  }

  const sortedArray = sort([...inputArray]);

  return {
    sortedArray,
    comparisons,
    algorithm: 'Merge Sort',
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)',
    isStable: true
  };
}

module.exports = {
  bubbleSort,
  mergeSort
};
