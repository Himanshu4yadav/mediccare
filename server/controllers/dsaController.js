const PriorityQueue = require('../dsa/PriorityQueue');
const CircularQueue = require('../dsa/CircularQueue');
const { linearSearch, binarySearch } = require('../dsa/SearchAlgorithms');
const { bubbleSort, mergeSort } = require('../dsa/SortingAlgorithms');
const { SinglyLinkedList } = require('../dsa/SinglyLinkedList');
const HospitalGraph = require('../dsa/HospitalGraph');
const EmergencyRequest = require('../models/EmergencyRequest');

/**
 * @desc    Demonstrate and test Priority Queue (Binary Max-Heap)
 * @route   POST /api/dsa/priority-queue
 */
exports.testPriorityQueue = async (req, res) => {
  const { cases } = req.body;
  const pq = new PriorityQueue();

  const sampleCases = cases && cases.length > 0 ? cases : [
    { patientName: 'John Doe', condition: 'Severe Asthma', priorityScore: 75, createdAt: new Date(Date.now() - 30000) },
    { patientName: 'Jane Smith', condition: 'Cardiac Arrest', priorityScore: 100, createdAt: new Date(Date.now() - 10000) },
    { patientName: 'Robert Fox', condition: 'Minor Fracture', priorityScore: 25, createdAt: new Date(Date.now() - 40000) },
    { patientName: 'Alice Young', condition: 'Stroke Symptoms', priorityScore: 100, createdAt: new Date(Date.now() - 20000) },
    { patientName: 'Carlos Ray', condition: 'Moderate Burn', priorityScore: 50, createdAt: new Date(Date.now() - 5000) }
  ];

  sampleCases.forEach((c) => pq.insert(c));
  const peeked = pq.peek();
  const sortedExtraction = pq.getSortedArray();

  res.status(200).json({
    success: true,
    algorithm: 'Binary Max-Heap Priority Queue',
    inputCount: sampleCases.length,
    highestPriorityPeek: peeked,
    triageOrder: sortedExtraction,
    complexities: {
      insertion: 'O(log N)',
      peek: 'O(1)',
      extraction: 'O(log N)',
      heapify: 'O(N)',
      space: 'O(N)'
    },
    explanation: 'Emergency triage organizes patients using a Binary Max-Heap where critical cases (score 100) are placed at the root. In case of identical scores, earlier timestamps receive precedence.'
  });
};

/**
 * @desc    Demonstrate and test Circular Queue
 * @route   POST /api/dsa/circular-queue
 */
exports.testCircularQueue = async (req, res) => {
  const { capacity = 5, operations = ['enqueue', 'enqueue', 'dequeue', 'enqueue'] } = req.body;
  const cq = new CircularQueue(capacity);
  const log = [];

  // Sample sequence
  log.push(cq.enqueue({ patientName: 'Patient 1', ward: 'General A' }));
  log.push(cq.enqueue({ patientName: 'Patient 2', ward: 'ICU' }));
  log.push(cq.enqueue({ patientName: 'Patient 3', ward: 'Pediatric' }));
  const dequeued = cq.dequeue();
  log.push({ action: 'dequeue', item: dequeued });
  log.push(cq.enqueue({ patientName: 'Patient 4', ward: 'General B' }));

  res.status(200).json({
    success: true,
    algorithm: 'Circular Queue',
    capacity,
    currentSize: cq.size(),
    queueState: cq.toArray(),
    operationLog: log,
    complexities: {
      enqueue: 'O(1)',
      dequeue: 'O(1)',
      front: 'O(1)',
      space: 'O(Capacity)'
    },
    explanation: 'The Circular Queue manages hospital bed waiting lists with FIFO guarantees and O(1) buffer reuse via modulo index arithmetic.'
  });
};

/**
 * @desc    Compare Linear Search vs Binary Search
 * @route   POST /api/dsa/search
 */
exports.testSearch = async (req, res) => {
  const { target = 45, dataset } = req.body;
  const array = dataset && dataset.length > 0 ? dataset : [12, 19, 23, 29, 34, 45, 56, 67, 78, 89, 92, 99, 105, 114, 130];
  const sortedArray = [...array].sort((a, b) => a - b);

  const linearResult = linearSearch(array, target);
  const binaryResult = binarySearch(sortedArray, target);

  res.status(200).json({
    success: true,
    target,
    arrayLength: array.length,
    linearSearch: linearResult,
    binarySearch: binaryResult,
    comparison: {
      iterationsDifference: linearResult.iterations - binaryResult.iterations,
      recommendation: 'Binary search is significantly faster on sorted lists (O(log N)), whereas linear search (O(N)) is necessary when data order cannot be guaranteed.'
    }
  });
};

/**
 * @desc    Compare Bubble Sort vs Merge Sort
 * @route   POST /api/dsa/sort
 */
exports.testSort = async (req, res) => {
  const { dataset, field = 'priorityScore', order = 'desc' } = req.body;

  const sampleData = dataset && dataset.length > 0 ? dataset : [
    { id: 1, case: 'Mild Sprain', priorityScore: 25 },
    { id: 2, case: 'Cardiac Arrest', priorityScore: 100 },
    { id: 3, case: 'Fracture', priorityScore: 50 },
    { id: 4, case: 'Respiratory Distress', priorityScore: 85 },
    { id: 5, case: 'High Fever', priorityScore: 50 },
    { id: 6, case: 'Severe Trauma', priorityScore: 100 }
  ];

  const bubbleResult = bubbleSort(sampleData, field, order);
  const mergeResult = mergeSort(sampleData, field, order);

  res.status(200).json({
    success: true,
    fieldSorted: field,
    order,
    totalRecords: sampleData.length,
    bubbleSort: bubbleResult,
    mergeSort: mergeResult,
    analysis: {
      efficiency: 'Merge Sort performs O(N log N) consistently compared to Bubble Sort O(N^2)',
      stabilityCheck: 'Both implementations maintain stable ordering for identical priorities.'
    }
  });
};

/**
 * @desc    Test Hospital Navigation Graph (BFS & DFS)
 * @route   POST /api/dsa/graph-navigate
 */
exports.testGraphNavigate = async (req, res) => {
  const { start = 'Main Entrance / Triage', destination = 'Operating Theatres (OT)' } = req.body;

  const graph = HospitalGraph.createDefaultHospitalLayout();
  const bfsResult = graph.bfsShortestPath(start, destination);
  const dfsResult = graph.dfsPath(start, destination);

  res.status(200).json({
    success: true,
    navigationModel: 'Simulated Hospital Corridor Network (Adjacency List Graph)',
    disclaimer: 'This represents a simulated topological graph for educational algorithms demonstration.',
    start,
    destination,
    departments: graph.getDepartments(),
    adjacencyList: graph.getAdjacencyList(),
    breadthFirstSearch: bfsResult,
    depthFirstSearch: dfsResult
  });
};
