# MedicCare – Smart Hospital & Emergency Management System
> **Computer Science & Engineering Semester Capstone Project**  
> Full-Stack MERN Architecture with Practical Data Structures & Algorithms Integration.

---

## 🏥 Project Overview
**MedicCare** is a web platform that integrates routine hospital administrative workflows with real-time algorithmic intelligence. Beyond traditional CRUD hospital management, MedicCare features a dedicated **Binary Max-Heap Emergency Triage Engine**, a **Circular Queue Bed Allocation Buffer**, an **Audit Trail via Singly Linked Lists**, and **Graph Traversal (BFS & DFS)** for simulated hospital ward navigation.

### 🛡️ Academic Disclaimer
> **Important:** This application is developed solely as an educational engineering semester project. For real-life medical emergencies, contact local emergency dispatch (e.g., 911 or 112) immediately.

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
- **Patient Portal:** Book appointments, check live bed availability, view authorized digital prescriptions and consultation notes, trigger emergency triage requests.
- **Doctor Clinic Console:** View assigned schedule, update consultation notes and prescriptions, transition emergency triage cases from 'Pending' to 'In Progress' and 'Resolved'.
- **Admin Command Center:** Real-time hospital analytics (Recharts), patient & physician directories, hospital bed inventory with status updates, and live triage heap inspection.

### 2. Practical Data Structures & Algorithms (DSA)
MedicCare implements core DSA modules in both the backend and client-side visualization:
| Algorithm / Data Structure | MedicCare Module | Target Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- |
| **Binary Max-Heap** | Emergency Triage Prioritization | Insert: `O(log N)`, ExtractMax: `O(log N)`, Peek: `O(1)` | `O(N)` |
| **Circular Queue** | Bed Allocation Waiting Buffer | Enqueue: `O(1)`, Dequeue: `O(1)` | `O(Capacity)` |
| **Singly Linked List** | Emergency Status History & Audit Trail | Append: `O(1)`, Traversal: `O(N)` | `O(N)` |
| **Linear Search** | Unindexed/Unsorted Patient Records | `O(N)` | `O(1)` |
| **Binary Search** | Sorted Appointment Calendars | `O(log N)` | `O(1)` |
| **Bubble Sort** | Demonstration sorting | `O(N^2)` | `O(1)` |
| **Merge Sort** | Stable Sorting of Emergency Cases | `O(N log N)` | `O(N)` |
| **Adjacency List Graph** | Simulated Corridor Navigation (BFS/DFS) | `O(V + E)` | `O(V)` |

---

## 📂 Project Structure

```
mediccare/
├── package.json                   # Root convenience scripts
├── README.md                      # Complete system documentation
├── server/
│   ├── .env.example               # Environment template
│   ├── package.json               # Backend dependencies
│   ├── server.js                  # Server entry point
│   ├── app.js                     # Express app configuration
│   ├── config/
│   │   └── db.js                  # MongoDB Mongoose connection
│   ├── models/                    # Data models
│   │   ├── User.js                # Auth, Patients, Doctors & Admins
│   │   ├── Appointment.js         # Slot booking & duplicate checks
│   │   ├── EmergencyRequest.js    # Priority scored triage requests
│   │   ├── Bed.js                 # Hospital ward inventory
│   │   ├── MedicalRecord.js       # Prescriptions & diagnoses
│   │   └── ActivityLog.js         # Audit log records
│   ├── middleware/
│   │   ├── auth.js                # JWT & RBAC middleware
│   │   └── error.js               # Central error handling
│   ├── dsa/                       # Production JavaScript DSA Modules
│   │   ├── PriorityQueue.js       # Binary Max-Heap with tie-breakers
│   │   ├── CircularQueue.js       # Modulo arithmetic FIFO buffer
│   │   ├── SinglyLinkedList.js    # Status transition history
│   │   ├── SearchAlgorithms.js    # Linear & Binary Search
│   │   ├── SortingAlgorithms.js   # Bubble Sort & Merge Sort
│   │   └── HospitalGraph.js       # Hospital Adjacency List + BFS/DFS
│   ├── controllers/               # Business logic controllers
│   ├── routes/                    # Express REST endpoints
│   ├── seed/
│   │   └── seedData.js            # Initial database seed script
│   └── tests/
│       └── dsa.test.js            # Automated DSA unit test suite
└── client/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.jsx                # Router & protected route guards
        ├── main.jsx               # React entry point
        ├── context/AuthContext.jsx# Reactive JWT state
        ├── services/api.js        # Axios instance with auth interceptor
        ├── dsa/clientDsa.js       # In-browser DSA engine
        ├── components/
        │   ├── common/            # Navbar, Footer, Modal, StatCard
        │   ├── forms/             # Emergency, Appointment, Bed modals
        │   └── layout/            # DashboardLayout sidebar
        └── pages/
            ├── LandingPage.jsx     # Professional SaaS landing page
            ├── LoginPage.jsx       # Auth with 1-click demo accounts
            ├── RegisterPage.jsx    # Patient onboarding
            ├── PatientDashboard.jsx# Patient portal
            ├── DoctorDashboard.jsx # Doctor clinic console
            ├── AdminDashboard.jsx  # Admin analytics & CRUD
            └── DsaLabPage.jsx      # Interactive DSA algorithm lab
```

---

## 🛠️ Installation & Setup Instructions

### Prerequisites
1. **Node.js**: v18.0.0 or higher
2. **MongoDB**: Local MongoDB community server running on port `27017` OR MongoDB Atlas connection string.

### Step 1: Install Dependencies
Open two terminals or run from root:

**Server Dependencies:**
```bash
cd mediccare/server
npm install
```

**Client Dependencies:**
```bash
cd mediccare/client
npm install
```

### Step 2: Configure Environment Variables
In `mediccare/server/`:
Create a `.env` file (copied from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/mediccare_db
JWT_SECRET=mediccare_super_secret_jwt_key_2026
JWT_EXPIRE=24h
CLIENT_URL=http://localhost:5173
```

In `mediccare/client/`:
Create a `.env` file (copied from `.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Run Automated DSA Unit Tests
Execute the standalone test suite verifying Binary Max-Heap triage, Circular Queue wrapping, Binary Search, and Graph BFS/DFS:
```bash
cd mediccare/server
npm test
```
*Expected Output:*
```
Results: 18 / 18 DSA Tests Passed successfully!
```

---

## 💾 Seed Demo Data
Populate MongoDB with demo accounts for Admin, Doctors, Patients, Beds, and Prioritized Emergencies:
```bash
cd mediccare/server
npm run seed
```

### Pre-Seeded Demo Login Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@mediccare.com` | `Admin@123` |
| **Doctor (Cardiology)** | `doctor.vance@mediccare.com` | `Doctor@123` |
| **Doctor (Emergency)** | `doctor.grant@mediccare.com` | `Doctor@123` |
| **Patient** | `patient.john@mediccare.com` | `Patient@123` |
| **Patient** | `patient.sophia@mediccare.com` | `Patient@123` |

*(Tip: The login page also contains quick "One-Click Demo Credentials" buttons for instant evaluation).*

---

## 💻 Running the Application

### Start Backend API Server
```bash
cd mediccare/server
npm run dev
# Server will run at http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

### Start Vite Frontend
```bash
cd mediccare/client
npm run dev
# Frontend will be live at http://localhost:5173
```

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create patient profile
- `POST /api/auth/login` - Authenticate and retrieve JWT token
- `POST /api/auth/logout` - Invalidate session cookie
- `GET /api/auth/me` - Retrieve logged-in user profile

### Appointments
- `GET /api/appointments` - Fetch role-scoped appointments
- `POST /api/appointments` - Book appointment (prevents slot collision)
- `GET /api/appointments/:id` - Appointment details
- `PUT /api/appointments/:id` - Update status / consultation notes
- `DELETE /api/appointments/:id` - Remove appointment (Admin)

### Emergency Management (Binary Max-Heap Triage)
- `POST /api/emergencies` - Submit emergency case into heap
- `GET /api/emergencies` - Retrieve cases sorted by Max-Heap triage
- `GET /api/emergencies/:id` - Case details with Singly Linked List history
- `PUT /api/emergencies/:id/assign` - Assign physician to case
- `PUT /api/emergencies/:id/status` - Transition status (Pending -> In Progress -> Resolved)

### Bed Inventory (Circular Queue Buffer)
- `GET /api/beds` - List beds by ward, type, and availability
- `POST /api/beds` - Add new bed (Admin)
- `PUT /api/beds/:id` - Allocate bed to patient or discharge
- `DELETE /api/beds/:id` - Delete bed (Admin)
- `POST /api/beds/waiting-list` - Enqueue patient to Circular Queue
- `POST /api/beds/waiting-list/dequeue` - Dequeue waiting patient (FIFO)

### DSA Lab Endpoints
- `POST /api/dsa/priority-queue` - Test Max-Heap rebalancing
- `POST /api/dsa/circular-queue` - Test buffer modulo operations
- `POST /api/dsa/search` - Benchmark Linear vs Binary Search
- `POST /api/dsa/sort` - Benchmark Bubble vs Merge Sort
- `POST /api/dsa/graph-navigate` - Run BFS/DFS hospital corridor navigation

---

## 🎓 College Semester Project Evaluation Notes
1. **Separation of Concerns:** Strict MVC + Service + DSA modularity across `server/` and `client/`.
2. **Deterministic Triage:** Max-Heap handles ties by prioritizing earlier arrival timestamps.
3. **Circular Queue:** Avoids array reallocation `O(1)` via index wrapping: `(rear + 1) % capacity`.
4. **Security:** Passwords never saved in plaintext (bcrypt salted hashes), routes protected with token verification, and role-based guards.
#   m e d i c c a r e - s m a r t - h o s p i t a l  
 