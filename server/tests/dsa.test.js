/**
 * Automated Unit Test Suite for MedicCare Data Structures & Algorithms
 * Runs standalone without external test runners: `node tests/dsa.test.js`
 */

const PriorityQueue = require('../dsa/PriorityQueue');
const CircularQueue = require('../dsa/CircularQueue');
const { linearSearch, binarySearch } = require('../dsa/SearchAlgorithms');
const { bubbleSort, mergeSort } = require('../dsa/SortingAlgorithms');
const { SinglyLinkedList } = require('../dsa/SinglyLinkedList');
const HospitalGraph = require('../dsa/HospitalGraph');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('====================================================');
console.log('MedicCare DSA Test Suite Execution');
console.log('====================================================\n');

// 1. Priority Queue Tests
console.log('1. Testing Priority Queue (Binary Max-Heap for Emergency Triage):');
const pq = new PriorityQueue();
assert(pq.isEmpty() === true, 'Priority Queue starts empty');
assert(pq.peek() === null, 'Peek on empty heap returns null');

pq.insert({ id: 1, case: 'Mild Sprain', priorityScore: 25, createdAt: new Date(1000) });
pq.insert({ id: 2, case: 'Cardiac Arrest', priorityScore: 110, createdAt: new Date(2000) });
pq.insert({ id: 3, case: 'Compound Fracture', priorityScore: 75, createdAt: new Date(3000) });
pq.insert({ id: 4, case: 'Acute Stroke', priorityScore: 110, createdAt: new Date(1500) }); // Tie with earlier timestamp

assert(pq.size() === 4, 'Heap size is 4 after 4 inserts');
const highest = pq.peek();
assert(highest.id === 4, 'Highest priority extracts Acute Stroke first due to equal score & earlier timestamp');

const max1 = pq.extractMax();
assert(max1.id === 4, 'Extracted highest case is id 4');
const max2 = pq.extractMax();
assert(max2.id === 2, 'Second highest extracted case is id 2 (score 110)');
const max3 = pq.extractMax();
assert(max3.id === 3, 'Third highest extracted case is id 3 (score 75)');
assert(pq.size() === 1, 'Heap size is 1 remaining');

// 2. Circular Queue Tests
console.log('\n2. Testing Circular Queue (Bed Waiting List):');
const cq = new CircularQueue(3);
assert(cq.isEmpty() === true, 'Circular Queue starts empty');
assert(cq.isFull() === false, 'Circular Queue starts not full');

cq.enqueue({ patient: 'Patient A' });
cq.enqueue({ patient: 'Patient B' });
cq.enqueue({ patient: 'Patient C' });
assert(cq.isFull() === true, 'Circular Queue is full at capacity 3');
assert(cq.enqueue({ patient: 'Overflow' }).success === false, 'Enqueue rejects on full buffer');

const dequeued1 = cq.dequeue();
assert(dequeued1.patient === 'Patient A', 'FIFO: First dequeued is Patient A');
assert(cq.isFull() === false, 'Queue is no longer full after dequeue');

cq.enqueue({ patient: 'Patient D' }); // Reuses wrapped slot
assert(cq.size() === 3, 'Queue wrapped around and maintains size 3');

// 3. Search Algorithm Tests
console.log('\n3. Testing Linear and Binary Search:');
const numbers = [10, 25, 33, 47, 52, 68, 71, 89, 94];
const linMatch = linearSearch(numbers, 47);
assert(linMatch.found === true && linMatch.index === 3, 'Linear search finds 47 at index 3');
const linMiss = linearSearch(numbers, 999);
assert(linMiss.found === false && linMiss.index === -1, 'Linear search returns found=false on missing key');

const binMatch = binarySearch(numbers, 71);
assert(binMatch.found === true && binMatch.index === 6, 'Binary search finds 71 at index 6');
const binMiss = binarySearch(numbers, 5);
assert(binMiss.found === false && binMiss.index === -1, 'Binary search handles missing key below range');

// 4. Sorting Algorithm Tests
console.log('\n4. Testing Bubble Sort and Merge Sort:');
const unsorted = [
  { name: 'Case A', priority: 50 },
  { name: 'Case B', priority: 100 },
  { name: 'Case C', priority: 25 },
  { name: 'Case D', priority: 75 }
];

const bubbleAsc = bubbleSort(unsorted, 'priority', 'asc');
assert(bubbleAsc.sortedArray[0].priority === 25, 'Bubble sort asc places lowest (25) first');
assert(bubbleAsc.sortedArray[3].priority === 100, 'Bubble sort asc places highest (100) last');

const mergeDesc = mergeSort(unsorted, 'priority', 'desc');
assert(mergeDesc.sortedArray[0].priority === 100, 'Merge sort desc places highest (100) first');
assert(mergeDesc.sortedArray[3].priority === 25, 'Merge sort desc places lowest (25) last');

// 5. Singly Linked List Tests
console.log('\n5. Testing Singly Linked List (Status Audit Trail):');
const sll = new SinglyLinkedList();
assert(sll.isEmpty() === true, 'Linked list starts empty');
sll.append({ step: 'Registered', time: '10:00' });
sll.append({ step: 'Assigned', time: '10:15' });
sll.append({ step: 'In Treatment', time: '10:30' });
assert(sll.size() === 3, 'Linked list contains 3 nodes');
const arrFromList = sll.toArray();
assert(arrFromList[0].step === 'Registered', 'First node is Registered');
assert(arrFromList[2].step === 'In Treatment', 'Third node is In Treatment');

// 6. Hospital Navigation Graph Tests
console.log('\n6. Testing Hospital Graph (BFS and DFS Navigation):');
const graph = HospitalGraph.createDefaultHospitalLayout();
const bfs = graph.bfsShortestPath('Main Entrance / Triage', 'Operating Theatres (OT)');
assert(bfs.found === true, 'BFS finds path from Triage to Operating Theatres');
assert(bfs.path[0] === 'Main Entrance / Triage', 'BFS path begins at start node');
assert(bfs.path[bfs.path.length - 1] === 'Operating Theatres (OT)', 'BFS path ends at target node');

const dfs = graph.dfsPath('Main Entrance / Triage', 'Operating Theatres (OT)');
assert(dfs.found === true, 'DFS finds valid topological corridor path');

console.log('\n====================================================');
console.log(`Results: ${passedTests} / ${totalTests} DSA Tests Passed successfully!`);
console.log('====================================================\n');
