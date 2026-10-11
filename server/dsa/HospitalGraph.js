/**
 * Hospital Department Graph Representation
 * Implemented using an Adjacency List.
 * Represents simulated hospital wings, wards, labs, and clinics for route finding.
 *
 * Traversal Algorithms:
 * - Breadth-First Search (BFS): Shortest path in unweighted graph (fewest corridor hops)
 * - Depth-First Search (DFS): Deep branch exploration
 *
 * Complexities:
 * - Time: O(V + E) where V = Departments, E = Corridors/Connections
 * - Space: O(V) for visited set and queue/recursion stack
 *
 * Note: Labeled as a simulated hospital navigation model for educational demonstration.
 */
class HospitalGraph {
  constructor() {
    this.adjacencyList = new Map();
  }

  addDepartment(deptName) {
    if (!this.adjacencyList.has(deptName)) {
      this.adjacencyList.set(deptName, []);
    }
  }

  addCorridor(dept1, dept2, bidirectional = true) {
    this.addDepartment(dept1);
    this.addDepartment(dept2);

    if (!this.adjacencyList.get(dept1).includes(dept2)) {
      this.adjacencyList.get(dept1).push(dept2);
    }
    if (bidirectional && !this.adjacencyList.get(dept2).includes(dept1)) {
      this.adjacencyList.get(dept2).push(dept1);
    }
  }

  getDepartments() {
    return Array.from(this.adjacencyList.keys());
  }

  getAdjacencyList() {
    const obj = {};
    for (const [dept, neighbors] of this.adjacencyList.entries()) {
      obj[dept] = neighbors;
    }
    return obj;
  }

  /**
   * Breadth-First Search (BFS):
   * Explores level by level using a Queue.
   * Finds path with minimum department transitions.
   */
  bfsShortestPath(startDept, targetDept) {
    if (!this.adjacencyList.has(startDept) || !this.adjacencyList.has(targetDept)) {
      return { path: [], visitedOrder: [], hops: -1, found: false };
    }

    const queue = [[startDept]];
    const visited = new Set([startDept]);
    const visitedOrder = [];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      visitedOrder.push(current);

      if (current === targetDept) {
        return {
          path,
          visitedOrder,
          hops: path.length - 1,
          found: true,
          algorithm: 'BFS (Breadth-First Search)',
          timeComplexity: 'O(V + E)',
          spaceComplexity: 'O(V)'
        };
      }

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return {
      path: [],
      visitedOrder,
      hops: -1,
      found: false,
      algorithm: 'BFS (Breadth-First Search)',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)'
    };
  }

  /**
   * Depth-First Search (DFS):
   * Explores as deep as possible along each branch before backtracking.
   */
  dfsPath(startDept, targetDept) {
    if (!this.adjacencyList.has(startDept) || !this.adjacencyList.has(targetDept)) {
      return { path: [], visitedOrder: [], found: false };
    }

    const visited = new Set();
    const visitedOrder = [];
    const path = [];

    const dfs = (current) => {
      visited.add(current);
      visitedOrder.push(current);
      path.push(current);

      if (current === targetDept) {
        return true;
      }

      const neighbors = this.adjacencyList.get(current) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        }
      }

      path.pop(); // backtrack
      return false;
    };

    const found = dfs(startDept);

    return {
      path: found ? path : [],
      visitedOrder,
      hops: found ? path.length - 1 : -1,
      found,
      algorithm: 'DFS (Depth-First Search)',
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)'
    };
  }

  /**
   * Factory method: Seeds standard hospital layout model
   */
  static createDefaultHospitalLayout() {
    const graph = new HospitalGraph();
    // Departments
    graph.addCorridor('Main Entrance / Triage', 'Emergency Trauma Center');
    graph.addCorridor('Main Entrance / Triage', 'Registration & Billing');
    graph.addCorridor('Registration & Billing', 'Outpatient Clinics (OPD)');
    graph.addCorridor('Emergency Trauma Center', 'Intensive Care Unit (ICU)');
    graph.addCorridor('Emergency Trauma Center', 'Radiology & CT Scan');
    graph.addCorridor('Outpatient Clinics (OPD)', 'Pathology Lab');
    graph.addCorridor('Radiology & CT Scan', 'Operating Theatres (OT)');
    graph.addCorridor('Pathology Lab', 'Central Pharmacy');
    graph.addCorridor('Intensive Care Unit (ICU)', 'General Inpatient Ward A');
    graph.addCorridor('Operating Theatres (OT)', 'Post-Op Recovery & Ward B');
    graph.addCorridor('General Inpatient Ward A', 'Pediatric Wing');
    graph.addCorridor('Post-Op Recovery & Ward B', 'Central Pharmacy');
    return graph;
  }
}

module.exports = HospitalGraph;
