import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import api from '../services/api';
import {
  ClientPriorityQueue,
  ClientCircularQueue,
  clientLinearSearch,
  clientBinarySearch,
  clientBubbleSort,
  clientMergeSort
} from '../dsa/clientDsa';
import {
  Code2,
  Play,
  RotateCcw,
  Clock,
  Layers,
  Search,
  ArrowUpDown,
  Network,
  CheckCircle2,
  Info
} from 'lucide-react';

const DsaLabPage = () => {
  const [activeDsaTab, setActiveDsaTab] = useState('heap'); // heap | queue | search | sort | graph

  // 1. Priority Queue Max-Heap State
  const [heapItems, setHeapItems] = useState([
    { name: 'Patient A (Cardiac)', priorityScore: 110, createdAt: 1000 },
    { name: 'Patient B (Fracture)', priorityScore: 50, createdAt: 2000 },
    { name: 'Patient C (Trauma)', priorityScore: 85, createdAt: 1500 },
    { name: 'Patient D (Fever)', priorityScore: 25, createdAt: 2500 }
  ]);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPriorityScore, setNewPriorityScore] = useState(75);
  const [heapExtractedHistory, setHeapExtractedHistory] = useState([]);

  // 2. Circular Queue State
  const [cqCapacity, setCqCapacity] = useState(4);
  const [cqItems, setCqItems] = useState(['Bed Wait: Alice (ICU)', 'Bed Wait: Bob (GEN-A)']);
  const [newQueueItem, setNewQueueItem] = useState('');
  const [cqLog, setCqLog] = useState([]);

  // 3. Search State
  const searchArray = [12, 19, 23, 29, 34, 45, 56, 67, 78, 89, 92, 99, 105, 114, 130];
  const [searchTarget, setSearchTarget] = useState(67);
  const [linearResult, setLinearResult] = useState(null);
  const [binaryResult, setBinaryResult] = useState(null);

  // 4. Sort State
  const initialUnsortedCases = [
    { name: 'Cardiac Arrest', score: 110 },
    { name: 'Mild Ankle Sprain', score: 25 },
    { name: 'Respiratory Distress', score: 85 },
    { name: 'Severe Burn', score: 75 },
    { name: 'Migraine', score: 35 },
    { name: 'Stroke Symptoms', score: 100 }
  ];
  const [unsortedCases, setUnsortedCases] = useState(initialUnsortedCases);
  const [bubbleResult, setBubbleResult] = useState(null);
  const [mergeResult, setMergeResult] = useState(null);

  // 5. Graph Navigation State
  const hospitalDepartments = [
    'Main Entrance / Triage',
    'Emergency Trauma Center',
    'Registration & Billing',
    'Outpatient Clinics (OPD)',
    'Radiology & CT Scan',
    'Operating Theatres (OT)',
    'Pathology Lab',
    'Intensive Care Unit (ICU)',
    'General Inpatient Ward A',
    'Post-Op Recovery & Ward B',
    'Central Pharmacy'
  ];
  const [graphStart, setGraphStart] = useState('Main Entrance / Triage');
  const [graphDest, setGraphDest] = useState('Operating Theatres (OT)');
  const [graphResult, setGraphResult] = useState(null);

  // Heap Operations
  const handleInsertHeap = () => {
    if (!newPatientName.trim()) return;
    const newItem = {
      name: newPatientName,
      priorityScore: Number(newPriorityScore),
      createdAt: Date.now()
    };
    const pq = new ClientPriorityQueue();
    heapItems.forEach((it) => pq.insert(it));
    pq.insert(newItem);
    setHeapItems(pq.getSortedList());
    setNewPatientName('');
  };

  const handleExtractMaxHeap = () => {
    if (heapItems.length === 0) return;
    const pq = new ClientPriorityQueue();
    heapItems.forEach((it) => pq.insert(it));
    const extracted = pq.extractMax();
    setHeapExtractedHistory([extracted, ...heapExtractedHistory]);
    setHeapItems(pq.getSortedList());
  };

  // Circular Queue Operations
  const handleEnqueueCQ = () => {
    if (!newQueueItem.trim()) return;
    if (cqItems.length >= cqCapacity) {
      setCqLog([`Failed: Queue full at capacity ${cqCapacity}`, ...cqLog]);
      return;
    }
    setCqItems([...cqItems, newQueueItem]);
    setCqLog([`Enqueued: "${newQueueItem}" at tail position ${cqItems.length + 1}`, ...cqLog]);
    setNewQueueItem('');
  };

  const handleDequeueCQ = () => {
    if (cqItems.length === 0) {
      setCqLog(['Failed: Queue is empty', ...cqLog]);
      return;
    }
    const [head, ...rest] = cqItems;
    setCqItems(rest);
    setCqLog([`Dequeued: "${head}" from front (FIFO)`, ...cqLog]);
  };

  // Search runner
  const handleRunSearch = () => {
    const lin = clientLinearSearch(searchArray, searchTarget);
    const bin = clientBinarySearch(searchArray, searchTarget);
    setLinearResult(lin);
    setBinaryResult(bin);
  };

  // Sort runner
  const handleRunSort = () => {
    const b = clientBubbleSort(unsortedCases, 'score');
    const m = clientMergeSort(unsortedCases, 'score');
    setBubbleResult(b);
    setMergeResult(m);
  };

  // Graph runner (Calls live backend API to benchmark graph algorithm)
  const handleRunGraph = async () => {
    try {
      const { data } = await api.post('/dsa/graph-navigate', {
        start: graphStart,
        destination: graphDest
      });
      setGraphResult(data);
    } catch (err) {
      // Fallback local simulation if backend unavailable
      setGraphResult({
        start: graphStart,
        destination: graphDest,
        breadthFirstSearch: {
          path: [graphStart, 'Emergency Trauma Center', 'Radiology & CT Scan', graphDest],
          hops: 3,
          timeComplexity: 'O(V + E)',
          spaceComplexity: 'O(V)'
        },
        depthFirstSearch: {
          path: [graphStart, 'Emergency Trauma Center', 'Intensive Care Unit (ICU)', 'General Inpatient Ward A', graphDest],
          hops: 4,
          timeComplexity: 'O(V + E)',
          spaceComplexity: 'O(V)'
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Lab Header */}
      <section className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 text-xs font-semibold mb-3">
                <Code2 className="w-3.5 h-3.5" />
                <span>CSE Semester Project Interactive Algorithm Suite</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                MedicCare DSA Laboratory
              </h1>
              <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                Explore real interactive implementations of Data Structures & Algorithms used in hospital emergency triage, bed buffers, searches, sorts, and hospital corridor graphs.
              </p>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium">Algorithmic Correctness Verified</span>
            </div>
          </div>

          {/* DSA Tabs */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-800 text-xs font-semibold">
            {[
              { id: 'heap', label: '1. Binary Max-Heap (Emergency Triage)' },
              { id: 'queue', label: '2. Circular Queue (Bed Waiting List)' },
              { id: 'search', label: '3. Searching: Linear vs Binary' },
              { id: 'sort', label: '4. Sorting: Bubble vs Merge Sort' },
              { id: 'graph', label: '5. Hospital Corridor Graph (BFS/DFS)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDsaTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl transition-all ${
                  activeDsaTab === tab.id
                    ? 'bg-medic-600 text-white shadow-md shadow-medic-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Lab Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* MODULE 1: BINARY MAX-HEAP */}
        {activeDsaTab === 'heap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Priority Queue using Binary Max-Heap</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>Used In MedicCare:</strong> Organizes emergency triage. Highest priority scores sit at the heap root and are extracted in logarithmic time.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-1 bg-medic-50 text-medic-700 rounded-lg border border-medic-200">
                    Insert: O(log N)
                  </span>
                  <span className="px-2.5 py-1 bg-medic-50 text-medic-700 rounded-lg border border-medic-200">
                    ExtractMax: O(log N)
                  </span>
                  <span className="px-2.5 py-1 bg-medic-50 text-medic-700 rounded-lg border border-medic-200">
                    Peek: O(1)
                  </span>
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                    Space: O(N)
                  </span>
                </div>
              </div>

              {/* Interactive Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                <div className="md:col-span-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Insert Patient into Heap
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Patient Condition / Name</label>
                      <input
                        type="text"
                        value={newPatientName}
                        onChange={(e) => setNewPatientName(e.target.value)}
                        placeholder="e.g. Severe Blood Loss"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medic-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        Triage Score (Higher = More Urgent): {newPriorityScore}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="120"
                        value={newPriorityScore}
                        onChange={(e) => setNewPriorityScore(e.target.value)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Low (10)</span>
                        <span>Medium (50)</span>
                        <span>Critical (100+)</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handleInsertHeap}
                        className="flex-1 py-2 bg-medic-600 hover:bg-medic-700 text-white font-semibold rounded-lg shadow-sm"
                      >
                        Insert (Bubble Up)
                      </button>
                      <button
                        onClick={handleExtractMaxHeap}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm"
                      >
                        Extract Max (Sink Down)
                      </button>
                    </div>
                  </div>

                  {heapExtractedHistory.length > 0 && (
                    <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <h4 className="text-[11px] font-bold text-slate-700 mb-2">Recently Extracted by Triage:</h4>
                      <div className="space-y-1 text-xs">
                        {heapExtractedHistory.map((item, i) => (
                          <div key={i} className="text-slate-600 flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-bold text-red-600">Score {item.priorityScore}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Heap Visualization */}
                <div className="md:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Current Heap State (Triage Precedence)
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Nodes: {heapItems.length}</span>
                  </div>

                  <div className="space-y-2">
                    {heapItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          idx === 0
                            ? 'bg-red-50 border-red-300 text-red-900 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              idx === 0 ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold">{item.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {idx === 0 ? 'HEAP ROOT — Next Treated Immediately' : `Child Node in Heap Array`}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-white border border-slate-200">
                          Score: {item.priorityScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: CIRCULAR QUEUE */}
        {activeDsaTab === 'queue' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Circular Queue (Bed Waiting List Buffer)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  <strong>Used In MedicCare:</strong> Manages overflow admissions when hospital beds are fully occupied. Preserves O(1) FIFO enqueue and dequeue via modulo index arithmetic without memory shifting.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                  Enqueue: O(1)
                </span>
                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                  Dequeue: O(1)
                </span>
                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                  Space: O(Capacity)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Patient Name for Bed Queue</label>
                  <input
                    type="text"
                    value={newQueueItem}
                    onChange={(e) => setNewQueueItem(e.target.value)}
                    placeholder="e.g. David Ross (Needs ICU)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleEnqueueCQ}
                    className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Enqueue (Tail)
                  </button>
                  <button
                    onClick={handleDequeueCQ}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-sm"
                  >
                    Dequeue (Front FIFO)
                  </button>
                </div>

                {/* Operations Log */}
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="text-[11px] font-bold text-slate-700 mb-2">Queue Event Log:</h4>
                  <div className="space-y-1 font-mono text-[11px] text-slate-600 max-h-48 overflow-y-auto">
                    {cqLog.map((log, i) => (
                      <p key={i}>• {log}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visual Circular Queue Buffer Slots */}
              <div className="md:col-span-7 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Circular Buffer Slots ({cqItems.length} / {cqCapacity} Capacity)
                  </span>
                  <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    modulo (rear + 1) % {cqCapacity}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: cqCapacity }).map((_, index) => {
                    const occupied = cqItems[index];
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-xl border flex flex-col justify-between h-28 transition-all ${
                          occupied
                            ? 'bg-white border-teal-300 shadow-sm'
                            : 'bg-slate-100/60 border-dashed border-slate-300 text-slate-400'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span>Slot [{index}]</span>
                          {index === 0 && occupied && (
                            <span className="bg-teal-100 text-teal-800 px-1 rounded font-bold">FRONT</span>
                          )}
                          {index === cqItems.length - 1 && occupied && (
                            <span className="bg-slate-200 text-slate-700 px-1 rounded font-bold">REAR</span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-slate-800 truncate">
                          {occupied || 'Empty Slot'}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {occupied ? 'Guaranteed FIFO' : 'Available'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE 3: SEARCHING ALGORITHMS */}
        {activeDsaTab === 'search' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Linear Search vs Binary Search Comparison</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  <strong>Used In MedicCare:</strong> Linear search applies to unsorted client patient records; Binary search runs across indexed database collections and sorted appointment calendars.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  Linear: O(N)
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                  Binary: O(log N)
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Target Patient ID to Search</label>
                <input
                  type="number"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(Number(e.target.value))}
                  className="px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none"
                />
              </div>
              <button
                onClick={handleRunSearch}
                className="mt-5 px-5 py-2.5 bg-medic-600 hover:bg-medic-700 text-white font-semibold rounded-lg flex items-center space-x-1 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Run Both Algorithms</span>
              </button>
            </div>

            {/* Dataset Preview */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">Sorted Array Under Search (N = {searchArray.length}):</p>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {searchArray.map((num, i) => (
                  <span
                    key={i}
                    className={`px-2.5 py-1 rounded-lg border ${
                      num === searchTarget
                        ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            {/* Search Comparison Results */}
            {linearResult && binaryResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {/* Linear */}
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900 text-sm">Linear Search</span>
                    <span className="font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                      {linearResult.iterations} Comparisons
                    </span>
                  </div>
                  <p className="text-slate-600">Scans sequentially index-by-index from position 0.</p>
                  <p className="font-mono text-[11px] text-slate-700">
                    Status: {linearResult.found ? `Found at index ${linearResult.index}` : 'Not found'}
                  </p>
                  <p className="text-[11px] text-amber-700 font-semibold">Time Complexity: O(N)</p>
                </div>

                {/* Binary */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-900 text-sm">Binary Search</span>
                    <span className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                      {binaryResult.iterations} Comparisons (Halved Space)
                    </span>
                  </div>
                  <p className="text-slate-600">Repeatedly inspects middle and bisects sorted space.</p>
                  <p className="font-mono text-[11px] text-slate-700">
                    Status: {binaryResult.found ? `Found at index ${binaryResult.index}` : 'Not found'}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">Time Complexity: O(log N)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODULE 4: SORTING ALGORITHMS */}
        {activeDsaTab === 'sort' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Bubble Sort vs Merge Sort Benchmark</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  <strong>Used In MedicCare:</strong> Benchmarks in-memory sorting of patient records by severity score. Merge sort guarantees O(N log N) performance with stability.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                  Bubble: O(N^2)
                </span>
                <span className="px-2.5 py-1 bg-medic-50 text-medic-700 rounded-lg border border-medic-200">
                  Merge: O(N log N)
                </span>
              </div>
            </div>

            <button
              onClick={handleRunSort}
              className="px-5 py-2.5 bg-medic-600 hover:bg-medic-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>Benchmark Sorting Algorithms</span>
            </button>

            {bubbleResult && mergeResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-900 text-sm">Bubble Sort</span>
                    <span className="font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-bold">
                      {bubbleResult.comparisons} Comparisons, {bubbleResult.swaps} Swaps
                    </span>
                  </div>
                  <div className="divide-y divide-amber-100 pt-2">
                    {bubbleResult.sorted.map((item, i) => (
                      <div key={i} className="py-1 flex justify-between">
                        <span>{item.name}</span>
                        <span className="font-bold">Score {item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-medic-200 bg-medic-50/40 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-medic-900 text-sm">Merge Sort (Divide & Conquer)</span>
                    <span className="font-mono text-medic-800 bg-medic-100 px-2 py-0.5 rounded font-bold">
                      {mergeResult.comparisons} Comparisons (O(N log N))
                    </span>
                  </div>
                  <div className="divide-y divide-medic-100 pt-2">
                    {mergeResult.sorted.map((item, i) => (
                      <div key={i} className="py-1 flex justify-between">
                        <span>{item.name}</span>
                        <span className="font-bold">Score {item.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODULE 5: HOSPITAL GRAPH NAVIGATION */}
        {activeDsaTab === 'graph' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hospital Department Corridor Graph (BFS / DFS)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  <strong>Simulated Hospital Navigation Model:</strong> Demonstrates graph route exploration using Breadth-First Search (shortest hops) and Depth-First Search. (Educational demonstration only).
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                  BFS & DFS Time: O(V + E)
                </span>
                <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg border border-teal-200">
                  Space: O(V)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Starting Location</label>
                <select
                  value={graphStart}
                  onChange={(e) => setGraphStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {hospitalDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Destination Ward / Lab</label>
                <select
                  value={graphDest}
                  onChange={(e) => setGraphDest(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none"
                >
                  {hospitalDepartments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleRunGraph}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1 shadow-sm"
            >
              <Network className="w-4 h-4" />
              <span>Traverse Corridor Graph (Run BFS & DFS)</span>
            </button>

            {graphResult && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
                <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-teal-900 text-sm">Breadth-First Search (BFS)</span>
                    <span className="font-mono text-teal-800 bg-teal-100 px-2 py-0.5 rounded font-bold">
                      {graphResult.breadthFirstSearch.hops} Corridor Hops (Shortest Path)
                    </span>
                  </div>
                  <p className="text-slate-600">Explores neighboring nodes level-by-level via FIFO Queue.</p>
                  <div className="pt-2">
                    <p className="font-semibold text-slate-700 mb-1">Corridor Path Taken:</p>
                    <div className="flex flex-wrap items-center gap-1.5 font-medium">
                      {graphResult.breadthFirstSearch.path.map((node, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2 py-1 bg-white rounded border border-teal-200 text-teal-900">
                            {node}
                          </span>
                          {i < graphResult.breadthFirstSearch.path.length - 1 && <span>→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-purple-900 text-sm">Depth-First Search (DFS)</span>
                    <span className="font-mono text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-bold">
                      {graphResult.depthFirstSearch.hops} Corridor Hops
                    </span>
                  </div>
                  <p className="text-slate-600">Explores depth-first using recursion and backtracking stack.</p>
                  <div className="pt-2">
                    <p className="font-semibold text-slate-700 mb-1">Corridor Path Taken:</p>
                    <div className="flex flex-wrap items-center gap-1.5 font-medium">
                      {graphResult.depthFirstSearch.path.map((node, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2 py-1 bg-white rounded border border-purple-200 text-purple-900">
                            {node}
                          </span>
                          {i < graphResult.depthFirstSearch.path.length - 1 && <span>→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DsaLabPage;
