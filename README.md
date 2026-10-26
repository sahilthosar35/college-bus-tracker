# Smart College Bus-Tracking & Safety System Using Real-Time GPS Tracking and ETA Prediction

[![Jhulelal Institute of Technology, Nagpur](https://img.shields.io/badge/Institution-JIT%20Nagpur-blue.svg)](https://jitnagpur.edu.in)
[![RTMNU Affiliation](https://img.shields.io/badge/Affiliation-RTMNU%20Session%202026--27-indigo.svg)](https://www.nagpuruniversity.ac.in)
[![Project Group](https://img.shields.io/badge/Project%20Group-G6%20--%20III%20Sem%20B.Tech%20CSE-emerald.svg)](#academic-credits--group-g6)
[![Guide](https://img.shields.io/badge/Guide-Ms.%20Shubhangi%20Nagpure-amber.svg)](#project-mentorship)
[![Tech Stack](https://img.shields.io/badge/Tech%20Stack-React%2018%20|%20Node.js%20|%20Socket.io%20|%20Leaflet-blueviolet.svg)](#tech-stack-specification)

---

## 1. Academic Information & Credits

* **Project Title:** Smart College Bus-Tracking & Safety System Using Real-Time GPS Tracking and ETA Prediction
* **Department & Institution:** Department of Computer Science and Engineering, Jhulelal Institute of Technology (JIT), Lonara, Nagpur
* **University Affiliation:** Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU)
* **Academic Session:** 2026–27
* **Semester / Branch:** III Semester, B.Tech Computer Science and Engineering
* **Project Guide & Mentor:** **Ms. Shubhangi Nagpure** (Assistant Professor, Dept. of CSE, JIT Nagpur)

### Group G6 Team Members

| Sr. No. | Student Name | Roll Number | Academic Role & Module Ownership |
|:---:|:---|:---:|:---|
| 1 | **Muskan Khiyaldasani** | **H-21** | Real-Time Telemetry & Socket.io Pipeline |
| 2 | **Narayani Kohale** | **H-22** | Dynamic ETA Prediction Engine & Haversine Math |
| 3 | **Palaash Belekar** | **H-26** | Geofence Guardian & Proximity Ring Trigger |
| 4 | **Rajlaxmi Lokhande** | **H-48** | Touch-Optimized In-Cab Driver Console UI |
| 5 | **Sahil Thosar** | **H-62** | Full-Stack Architecture, REST APIs & Leaflet Integration |
| 6 | **Krutika Dhage** | **H-02** | Fleet Admin Dispatch Command & Incident Console |

---

## 2. Problem Statement & Mission

Conventional college transport systems suffer from a severe lack of real-time visibility. Students face unpredictable waiting times at pickup points, parents experience anxiety over transport safety, and campus administrators are blind to highway traffic bottlenecks or mechanical breakdowns.

This platform provides an end-to-end web-first, mobile-responsive, real-time solution:
1. **Drivers** transmit live GPS coordinates, vehicle velocity, and trip milestones directly via standard mobile browsers using the HTML5 Geolocation API without installing native mobile applications.
2. **Students & Parents** view smooth vehicle motion along Nagpur corridors on interactive OpenStreetMap tiles, live ETA countdowns adjusted for traffic, and automated 1.0 km geofence approach alerts.
3. **Transport Administrators** oversee the global fleet from a bird's-eye map, inspect driver registries, and resolve emergencies via real-time incident streams.

---

## 3. Mathematical & Algorithmic Foundations

### A. Haversine Great-Circle Distance
Used to compute the shortest geodesic distance between live vehicle coordinates $(\text{lat}_1, \text{lon}_1)$ and scheduled bus stop coordinates $(\text{lat}_2, \text{lon}_2)$:

$$\Delta\text{lat} = \text{lat}_2 - \text{lat}_1, \quad \Delta\text{lon} = \text{lon}_2 - \text{lon}_1$$

$$a = \sin^2\left(\frac{\Delta\text{lat}}{2}\right) + \cos(\text{lat}_1)\cos(\text{lat}_2)\sin^2\left(\frac{\Delta\text{lon}}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$

$$d = R \cdot c \quad \text{where } R = 6371.0\text{ km}$$

### B. Speed-Adjusted Dynamic ETA Calculation
Unlike static distance-over-speed calculations, our dynamic engine incorporates nominal urban speed thresholds, intermediate passenger boarding dwell times, and live traffic congestion penalties:

$$\text{Effective Speed } (v) = \max(v_{\text{current}}, 25.0\text{ km/h})$$

$$\text{ETA (minutes)} = \left(\frac{d_{\text{route}}}{v}\right) \times 60 + \left(N_{\text{stops}} \times 1.5\text{ mins}\right) + \text{Penalty}_{\text{traffic}}$$

* **Dwell Time:** 1.5 minutes allocated per intermediate stop for safe passenger boarding.
* **Traffic Penalty:** 8 to 12 minutes appended automatically when driver reports congestion or low highway velocity (< 15 km/h).

### C. Geofence 1.0 km Proximity Ring
Continuously monitors distance from the oncoming bus to the student's designated stop:
$$\text{If } d_{\text{bus} \to \text{stop}} \le 1.0\text{ km} \implies \text{Trigger In-App Push Banner: "Bus is approaching your stop!"}$$

---

## 4. Nagpur Fleet Corridors & Geography

All routes converge at the final destination: **Jhulelal Institute of Technology (JIT), Lonara Campus, Nagpur** (`21.2330° N, 79.0880° E`).

1. **Route 1 (`R-01`) — Sitabuldi - Sadar - Koradi Rd Express:**
   * Stops: Sitabuldi Zero Mile (`21.1458, 79.0882`) $\to$ RBI Square $\to$ Sadar Residency Rd $\to$ Mankapur Stadium $\to$ Koradi Naka $\to$ JIT Campus Gate #1.
   * Vehicle: Bus #01 (`MH-31-FC-2021`, Driver: Suresh Meshram).
2. **Route 2 (`R-02`) — Dharampeth - Seminary Hills - Katol Rd:**
   * Stops: Dharampeth Coffee House $\to$ Law College Square $\to$ Ravi Nagar $\to$ Seminary Hills $\to$ Katol Road $\to$ JIT Campus Gate #1.
   * Vehicle: Bus #02 (`MH-31-FC-2045`, Driver: Pravin Wankhede).
3. **Route 3 (`R-03`) — Wardha Rd - Medical Sq - Automotive Sq:**
   * Stops: Chatrapati Sq $\to$ Rahate Colony $\to$ Medical Square GMC $\to$ Kamal Chowk $\to$ Automotive Sq $\to$ JIT Campus Gate #1.
   * Vehicle: Bus #03 (`MH-31-FC-2088`, Driver: Santosh Sharma).

---

## 5. Technology Stack Specification

* **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide React Icons.
* **Mapping:** Leaflet.js (`react-leaflet`), OpenStreetMap tiles, Animated SVG vehicle markers with dynamic compass bearing rotation, 1 km Geofence circular overlays, Route polylines.
* **Backend:** Node.js, Express.js (TypeScript), Socket.io (WebSocket duplex telemetry streaming), CORS.
* **Database Layer:** Dual-Mode Resilient Database — supports MongoDB with Mongoose GeoJSON schemas AND an embedded persistent in-memory repository pre-loaded with Nagpur college fleet data (runs out-of-the-box even without a local MongoDB service).
* **State Management & Custom Hooks:** `useSocket`, `useDriverGPS` (HTML5 Geolocation + Route Simulator), `useETA`.

---

## Deploying a Public Demo

The repository includes deployment configuration for Netlify (frontend) and Render (API and Socket.IO backend). MongoDB Atlas is recommended for data that must persist; without it, the server uses its in-memory fallback, which resets when the service restarts.

1. Push this project to a GitHub repository.
2. Create a MongoDB Atlas cluster and obtain its connection string. Keep the username and password private.
3. In Render, create a Blueprint from the GitHub repository and provide `MONGODB_URI` and `CLIENT_URL` when prompted. Set `CLIENT_URL` to the Netlify site origin, such as `https://your-site.netlify.app`. Render will provide the backend URL after deployment.
4. In Netlify, import the same GitHub repository. The included `netlify.toml` supplies the build settings. Set these build environment variables to your Render backend URL:
   * `VITE_API_URL`: `https://your-backend.onrender.com/api`
   * `VITE_SOCKET_URL`: `https://your-backend.onrender.com`
5. Deploy or redeploy the Netlify site. Check that `https://your-backend.onrender.com/api/health` returns JSON with `"status": "ONLINE"`, then open the Netlify site URL.

The client variables are embedded during the frontend build. If either backend URL changes, update the Netlify variables and redeploy. Never commit database credentials or share them publicly.

## 6. Project Architecture

```
college-bus-tracker/
├── package.json               # Root workspace scripts
├── tsconfig.json              # Root TypeScript config
├── tailwind.config.js         # Shared design tokens & college colors
├── .env.example               # Environment variables template
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── dist/                  # Compiled JavaScript server build
│   └── src/
│       ├── server.ts          # Express + HTTP + Socket.io entrypoint
│       ├── config/
│       │   ├── config.ts      # Typed environment configurations
│       │   └── db.ts          # Dual-Mode Mongo / In-Memory connection pool
│       ├── models/
│       │   ├── Bus.ts         # Bus model & repository
│       │   ├── Route.ts       # Route model & Nagpur stop schemas
│       │   ├── Telemetry.ts   # High-frequency GPS position logs
│       │   └── Alert.ts       # SOS & delay incident logs
│       ├── controllers/
│       │   ├── busController.ts
│       │   ├── routeController.ts
│       │   └── alertController.ts
│       ├── routes/
│       │   ├── busRoutes.ts
│       │   ├── routeRoutes.ts
│       │   └── alertRoutes.ts
│       ├── sockets/
│       │   └── socketHandler.ts # Room management & telemetry broadcast
│       └── services/
│           ├── etaService.ts    # Haversine distance & dynamic ETA engine
│           └── geofenceService.ts # 1 km circular proximity guardian
└── client/
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    ├── src/
        ├── main.tsx           # React DOM root entry
        ├── App.tsx            # State synchronization & role coordinator
        ├── index.css          # Tailwind base & radar pulse animations
        ├── types/
        │   └── index.ts       # Comprehensive TypeScript interfaces
        ├── data/
        │   └── mockData.ts    # Pre-seeded Nagpur college routes & stops
        ├── hooks/
        │   ├── useSocket.ts   # WebSocket client connection hook
        │   ├── useDriverGPS.ts # HTML5 watchPosition + Route Simulator
        │   └── useETA.ts      # Live dynamic ETA calculation hook
        └── components/
            ├── common/
            │   ├── Header.tsx     # Branding, role switcher & socket pill
            │   ├── Footer.tsx     # Full academic attribution & credits
            │   ├── SOSModal.tsx   # Emergency hotline dialer & SOS trigger
            │   └── AboutModal.tsx # Project overview & group details modal
            ├── student/
            │   ├── StudentView.tsx  # Mobile-responsive student portal
            │   ├── MapContainer.tsx # Leaflet map with bus bearing & stops
            │   ├── ETABadge.tsx     # Arrival countdown & speed telemetry
            │   └── StopSelector.tsx # Route & boarding stop selector
            ├── driver/
            │   ├── DriverConsole.tsx # In-cab driver control dashboard
            │   ├── GPSStatus.tsx     # High-contrast live GPS readout
            │   ├── TripControls.tsx  # Start/Pause/End trip + Incident buttons
            │   └── StopChecklist.tsx # Sequential stop reach & skip toggles
            └── admin/
                ├── AdminDashboard.tsx # Comprehensive fleet manager view
                ├── FleetOverview.tsx  # KPI cards (Active, On-Time %, SOS)
                ├── LiveFleetMap.tsx   # Multi-bus Nagpur bird's-eye map
                └── IncidentLog.tsx    # Live incident dispatch stream
```

---

## 7. Setup & Execution Guide

### Prerequisites
* Node.js v18+ (tested on Node v24 LTS)
* npm (v9+)

### Step 1: Install Dependencies
```bash
# In the project root, or individually:
cd server && npm install
cd ../client && npm install
```

### Step 2: Start the Backend Server
```bash
cd server
npm run dev
```
* The HTTP REST API will listen on: `http://localhost:5000`
* WebSocket Telemetry will listen on: `ws://localhost:5000`
* Health & Academic Meta Endpoint: `http://localhost:5000/api/health`

### Step 3: Start the Frontend Client
In a new terminal window:
```bash
cd client
npm run dev
```
* Access the web interface at: `http://localhost:5173`

---

## 8. Role Walkthrough & Features

### 1. Student & Parent View (`/student`)
* **Live Corridor Map:** Real-time marker of the college bus moving smoothly with heading direction, along with route polyline and stop indicators.
* **Dynamic ETA Card:** Reads `Arriving at Your Stop in 8 mins • 2.1 km away` with status badge (`On Time` / `Moderate Delay` / `Heavy Traffic`), vehicle speed, and last updated timestamp.
* **1.0 km Geofence Guardian:** When the bus enters within 1.0 km of the student's selected stop, an in-app approach banner activates automatically.
* **Emergency Bar:** Instant access to JIT Campus Security (`+91 712 266 7400`), Transport Coordinator (`+91 98221 45012`), Police (`112`), and Women Helpline (`1090`).

### 2. In-Cab Driver Console (`/driver`)
* **High-Contrast Touch Controls:** Designed for mobile touch screens in vehicle cabs.
* **GPS Transmitter Engine:** Dual-mode transmitter featuring:
  * **HTML5 Hardware GPS:** Streams device coordinates via `navigator.geolocation.watchPosition` (high accuracy enabled).
  * **Route Simulator:** Auto-drives along the selected route with realistic velocity and directional bearing for effortless evaluation and desktop demonstrations.
* **Trip Lifecycle:** `START JOURNEY`, `PAUSE TRIP`, and `END JOURNEY`.
* **Sequential Stop Checklist:** Driver can advance through stops with `Depart` or `Skip`.
* **One-Tap Incident Dispatch:** Report `Traffic Jam`, `Vehicle Breakdown`, or `Accident / SOS` with immediate broadcast to fleet admin.

### 3. Transport Admin Dashboard (`/admin`)
* **Fleet KPI Cards:** Real-time tally of Total Fleet, Active En-Route Vehicles, On-Time Score %, and Active Delay/SOS incidents.
* **Multi-Bus Bird's-Eye Map:** Unified map tracking all college buses simultaneously across Nagpur.
* **Fleet Operational Status Table:** Comprehensive registry with vehicle numbers, driver phone hotlines, live speed, coordinates, and passenger occupancies.
* **Live Incident Stream:** Streaming console showing traffic jams and SOS triggers with one-click `Resolve` actions.

---

## 9. Academic Attribution

This system was designed and implemented for the **Academic Session 2026–27** by:

**Group G6 — Department of Computer Science and Engineering**  
**Jhulelal Institute of Technology, Lonara, Nagpur**  
*(Affiliated to Rashtrasant Tukadoji Maharaj Nagpur University - RTMNU)*  

* **Project Guide:** Ms. Shubhangi Nagpure
* **Team:** Muskan Khiyaldasani, Narayani Kohale, Palaash Belekar, Rajlaxmi Lokhande, Sahil Thosar, Krutika Dhage.
