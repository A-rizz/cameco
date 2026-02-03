?# Timekeeping Module - RFID Event-Driven Integration Implementation

**Issue Type:** Feature Implementation  
**Priority:** HIGH  
**Estimated Duration:** 4-5 weeks  
**Target Users:** HR Staff, HR Manager, Employees (via RFID scan)  
**Dependencies:** FastAPI RFID Server, PostgreSQL Ledger, Event Bus, Employee Module  
**Related Modules:** Payroll, Performance Appraisal, Workforce Management, Notifications

---

## 📋 Executive Summary

Implement an event-driven Timekeeping system that pulls time logs from an append-only PostgreSQL ledger populated by a FastAPI RFID server. This system replaces manual time entry with automated RFID scanning and provides tamper-resistant, replayable event logs for payroll, performance appraisal, and compliance auditing.

**Core Objectives:**
1. Pull time logs from append-only PostgreSQL ledger (populated by FastAPI RFID server)
2. Create dedicated Ledger page for replayable event stream (separate from Overview)
3. Display overview analytics and summaries on Timekeeping Overview page
4. Implement MVC architecture with mock data in controllers (no separate API service)
5. Ensure data integrity with hash-chained, cryptographically verifiable events
6. Support ledger replay for reconciliation and audit purposes on dedicated Ledger page
7. Provide workforce coverage analytics and attendance monitoring
8. Generate attendance summaries for payroll processing

**Applied Implementation Decisions:**

**Architecture:**
- **MVC Pattern**: Controllers return Inertia responses with mock data for Phase 1
- **No Separate API**: Mock data lives in controllers, not separate service files
- **HR Routes Only**: All routes under `/hr/timekeeping/*` (no `/api` prefix)
- **Page Separation**: Overview page shows analytics/summaries, Ledger page shows full event stream with replay

**RFID Event Flow:**
- Employee scans RFID card at gate → FastAPI server receives scan → Saves to PostgreSQL ledger
- Laravel Timekeeping module polls/listens to ledger → Pulls new events → Processes into attendance records
- Event-driven dispatch to Payroll, Appraisal, and Notification modules
- Append-only ledger ensures tamper-resistance and audit trail

**Data Architecture:**
- **PostgreSQL Ledger Table**: `rfid_ledger` (append-only, hash-chained)
- **Attendance Events Table**: `attendance_events` (pulled from ledger, deduplicated)
- **Daily Summary Table**: `daily_attendance_summary` (aggregated for payroll)
- Sequence IDs ensure ordering; hash chains prevent tampering
- Replay engine for reconciliation and integrity verification

**Access Control:**
- **HR Staff**: View all attendance, manual corrections, import management
- **HR Manager**: View all attendance, approve corrections, analytics, export reports
- **Employees**: No direct access (scan RFID only; view own records via future portal)
- **System**: Automated ledger polling, event processing, and workflow gating

**Event-Driven Integration:**
- **Payroll Module**: Receives `AttendanceProcessed` events for salary calculations
- **Appraisal Module**: Receives `AttendanceViolation` events for performance scoring
- **Notification Module**: Sends alerts for late arrivals, absences, and violations
- **Workforce Module**: Coverage analytics based on real-time attendance data

**Compliance & Security:**
- DOLE labor law compliance (accurate time records for 5 years)
- Cryptographic hash chains for tamper-evidence
- Audit logging for manual corrections and ledger replay
- Automated snapshots to WORM storage for legal defensibility

---

## ✅ Implementation Decisions Applied

**FastAPI → PostgreSQL → Laravel Flow:**
1. RFID scanner captures employee card tap
2. FastAPI server receives scan, validates employee, writes to `rfid_ledger`
3. Laravel scheduled job (every 1 minute) polls `rfid_ledger` for new events
4. New events processed into `attendance_events` with deduplication
5. Daily summaries computed and stored in `daily_attendance_summary`
6. Events dispatched to Payroll, Appraisal, and Notification modules

**Ledger Schema (PostgreSQL):**
```sql
CREATE TABLE rfid_ledger (
    id BIGSERIAL PRIMARY KEY,
    sequence_id BIGINT NOT NULL UNIQUE,
    employee_rfid VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    scan_timestamp TIMESTAMP NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'time_in', 'time_out', 'break_start', 'break_end'
    raw_payload JSONB NOT NULL,
    hash_chain VARCHAR(255) NOT NULL, -- SHA-256 hash of (prev_hash || payload)
    device_signature TEXT, -- Optional Ed25519 signature
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_rfid_ledger_sequence ON rfid_ledger(sequence_id);
CREATE INDEX idx_rfid_ledger_processed ON rfid_ledger(processed);
CREATE INDEX idx_rfid_ledger_employee ON rfid_ledger(employee_rfid);
```

**Event-Driven Architecture:**
- `AttendanceEventProcessed` → Triggers daily summary recomputation
- `AttendanceSummaryUpdated` → Notifies Payroll module
- `AttendanceViolation` → Alerts HR and updates Appraisal score
- `DeviceOfflineDetected` → Triggers admin notification
- `LedgerIntegrityFailed` → Blocks payroll processing, triggers audit

**Deduplication & Replay Logic:**
- 15-second window for duplicate tap detection (same employee, same device, same event type)
- Sequence gaps trigger automated replay jobs
- Hash chain validation on every ledger read
- Manual corrections logged with user ID and reason (never modify ledger, only override computed summaries)

**Workflow Gating:**
- Payroll approval blocked if ledger health check fails (gaps, hash mismatches, processing delays)
- Performance appraisal imports attendance data only from verified ledger sequences
- Manual corrections require HR Manager approval before affecting payroll

---

## 🗄️ Database Schema Updates

### New Table: `rfid_ledger` (PostgreSQL)
Append-only ledger populated by FastAPI server. Never modified by Laravel.

```sql
CREATE TABLE rfid_ledger (
    id BIGSERIAL PRIMARY KEY,
    sequence_id BIGINT NOT NULL UNIQUE,
    employee_rfid VARCHAR(255) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    scan_timestamp TIMESTAMP NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    raw_payload JSONB NOT NULL,
    hash_chain VARCHAR(255) NOT NULL,
    device_signature TEXT,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Updated Table: `attendance_events`
Existing table modified to reference ledger and track processing status.

```sql
ALTER TABLE attendance_events ADD COLUMN ledger_sequence_id BIGINT REFERENCES rfid_ledger(sequence_id);
ALTER TABLE attendance_events ADD COLUMN is_deduplicated BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance_events ADD COLUMN duplicate_of_event_id BIGINT REFERENCES attendance_events(id);
ALTER TABLE attendance_events ADD COLUMN ledger_hash_verified BOOLEAN DEFAULT TRUE;
```

### Updated Table: `daily_attendance_summary`
Add ledger integrity tracking.

```sql
ALTER TABLE daily_attendance_summary ADD COLUMN ledger_sequence_start BIGINT;
ALTER TABLE daily_attendance_summary ADD COLUMN ledger_sequence_end BIGINT;
ALTER TABLE daily_attendance_summary ADD COLUMN ledger_verified BOOLEAN DEFAULT TRUE;
```

### New Table: `ledger_health_logs`
Track integrity checks and replay operations.

```sql
CREATE TABLE ledger_health_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    check_timestamp TIMESTAMP NOT NULL,
    last_sequence_id BIGINT NOT NULL,
    gaps_detected BOOLEAN DEFAULT FALSE,
    gap_details JSON,
    hash_failures BOOLEAN DEFAULT FALSE,
    hash_failure_details JSON,
    replay_triggered BOOLEAN DEFAULT FALSE,
    status ENUM('healthy', 'warning', 'critical') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📦 Implementation Phases

### **Phase 1: Frontend Mockup - Overview Analytics & Ledger Page (Week 1)**

**Objective:** Create two distinct pages:
1. **Overview Page** (`/hr/timekeeping/overview`): High-level analytics, summary cards, ledger health widget
2. **Ledger Page** (`/hr/timekeeping/ledger`): Full replayable event stream, replay controls, device status

Mock data stored in controllers (MVC pattern), rendered via Inertia responses. No separate API service.

#### **Task 1.1: Create Time Logs Stream Component (For Ledger Page)**
**File:** `resources/js/components/timekeeping/time-logs-stream.tsx` (NEW)

**Purpose:** Display full chronological event stream on **Ledger page only** (not on Overview).

**Subtasks:**
- [x] **1.1.1** Create `TimeLogsStream` component showing chronological list of RFID tap events
- [x] **1.1.2** Display each log entry with:
  - Employee photo/avatar
  - Employee name and ID
  - Event type badge (🟢 Time In, 🔴 Time Out, ☕ Break Start, ▶️ Break End)
  - Timestamp (e.g., "8:05 AM")
  - Device location (e.g., "Gate 1 - Main Entrance")
  - Sequence ID (e.g., "#12345")
  - Verification status icon (🔒 Verified / ⚠️ Pending)
- [x] **1.1.3** Use mock data array with 50+ sample events (various employees, times, events)
- [x] **1.1.4** Add auto-scroll animation (new events appear at top with slide-in effect)
- [x] **1.1.5** Add hover effect showing full event details tooltip
- [x] **1.1.6** Style with color coding: green (time in), red (time out), amber (breaks)
- [x] **1.1.7** Add "Live" indicator dot (pulsing green) in header

**Mock Data Structure:**
```typescript
const mockTimeLogs = [
  {
    id: 1,
    sequenceId: 12345,
    employeeId: "EMP-2024-001",
    employeeName: "Juan Dela Cruz",
    employeePhoto: "/avatars/juan.jpg",
    rfidCard: "****-1234",
    eventType: "time_in",
    timestamp: "2026-01-29T08:05:23",
    deviceId: "GATE-01",
    deviceLocation: "Gate 1 - Main Entrance",
    verified: true,
    hashChain: "a3f2b9c...",
    latencyMs: 125
  },
  // ... more mock entries
];
```

**Acceptance Criteria:**
- Component renders 50+ mock time log entries
- Visual hierarchy clear (employee → event → time → location)
- Color coding distinguishes event types at a glance
- Smooth animations for new entries
- Responsive design (works on tablet/desktop)

---

#### **Task 1.2: Create Ledger Health Dashboard Widget (For Overview Page)**
**File:** `resources/js/components/timekeeping/ledger-health-widget.tsx` (NEW)

**Purpose:** Display on **Overview page** as main widget, also available on Ledger page.

**Subtasks:**
- [x] **1.2.1** Create dashboard widget showing:
  - **Status Badge**: 🟢 HEALTHY / 🟡 WARNING / 🔴 CRITICAL
  - **Last Processed**: "Sequence #12,450 - 2 seconds ago"
  - **Processing Speed**: "425 events/min"
  - **Integrity Status**: "✅ All chains verified"
  - **Device Status**: "3 online, 0 offline"
  - **Backlog**: "0 pending events"
- [x] **1.2.2** Use color-coded card backgrounds (green/yellow/red)
- [x] **1.2.3** Add mini-chart showing processing rate over last hour (line chart)
- [x] **1.2.4** Add "View Details" button (opens modal with full metrics)
- [x] **1.2.5** Mock different states (healthy, warning with lag, critical with hash failure)
- [x] **1.2.6** Add tooltip explaining each metric

**Mock States:**
```typescript
const mockHealthStates = {
  healthy: {
    status: "healthy",
    lastSequence: 12450,
    lastProcessedAgo: "2 seconds ago",
    processingRate: 425,
    integrityStatus: "verified",
    devicesOnline: 3,
    devicesOffline: 0,
    backlog: 0
  },
  warning: {
    status: "warning",
    lastSequence: 12420,
    lastProcessedAgo: "8 minutes ago",
    processingRate: 180,
    integrityStatus: "verified",
    devicesOnline: 2,
    devicesOffline: 1,
    backlog: 245
  },
  critical: {
    status: "critical",
    lastSequence: 12380,
    lastProcessedAgo: "45 minutes ago",
    processingRate: 0,
    integrityStatus: "hash_mismatch_detected",
    devicesOnline: 1,
    devicesOffline: 2,
    backlog: 1250
  }
};
```

**Acceptance Criteria:**
- Widget displays all key metrics clearly
- Visual status (color) immediately communicates health
- Mock states demonstrate different scenarios
- Mini-chart shows trend visualization
- Responsive and fits in dashboard grid

---

#### **Task 1.3: Update Timekeeping Overview Page (Analytics Only)**
**File:** `resources/js/pages/HR/Timekeeping/Overview.tsx`

**Purpose:** Overview page shows **only** high-level analytics, NOT the event stream. Event stream moved to separate Ledger page.

**Subtasks:**
- [x] **1.3.1** Add `<LedgerHealthWidget />` to top of page (full width)
- [x] **1.3.2** Keep existing summary cards (Present, Late, Absent, On Leave)
- [x] **1.3.3** Add "View Full Ledger" button linking to `/hr/timekeeping/ledger`
- [x] **1.3.4** Remove event stream from this page (moved to Ledger page)
- [x] **1.3.5** Add attendance analytics charts (daily trends, department breakdown)
- [x] **1.3.6** Add quick actions: "View Attendance Records", "Import Timesheets", "Manage Overtime"
- [x] **1.3.7** Display recent violations/alerts (last 5, with "View All" link)
- [x] **1.3.8** Show device status summary (X online, Y offline)

**Overview Page Layout:**
```
+-------------------------------------------------+
|  Ledger Health Widget (green/yellow/red card)  |
|  [View Full Ledger] button                      |
+-------------------------------------------------+
|  Summary Cards (Present, Late, Absent, Leave)  |
+------------------+------------------------------+
|  Analytics Chart |  Recent Violations (last 5)  |
|  (Daily Trends)  |  - Juan: Late arrival        |
|                  |  - Maria: Missing time out   |
|                  |  [View All Violations]       |
+------------------+------------------------------+
|  Quick Actions: [Attendance] [Import] [Overtime]|
+-------------------------------------------------+
```

**Acceptance Criteria:**
- Overview page shows analytics and summaries only
- No event stream on Overview (moved to Ledger page)
- Clear navigation to Ledger page
- Responsive layout
- Existing attendance/import/overtime functionality preserved

---

#### **Task 1.3.1: Create Dedicated Ledger Page (NEW)**
**File:** `resources/js/pages/HR/Timekeeping/Ledger.tsx` (NEW)

**Purpose:** Dedicated page for full replayable event stream, replay controls, and device monitoring.

**Subtasks:**
- [x] **1.3.1.1** Create new page component `Ledger.tsx`
- [x] **1.3.1.2** Add `<LedgerHealthWidget />` at top
- [x] **1.3.1.3** Add `<TimeLogsStream />` as main content (full width)
- [x] **1.3.1.4** Add `<LogsFilterPanel />` sidebar (date, employee, device, event type filters)
- [x] **1.3.1.5** Add `<EventReplayControl />` for playback controls
- [x] **1.3.1.6** Add `<DeviceStatusDashboard />` in collapsible section
- [x] **1.3.1.7** Add "Live Mode" / "Replay Mode" toggle
- [x] **1.3.1.8** Add auto-refresh toggle (updates every 30 seconds in Live Mode)
- [x] **1.3.1.9** Add export options (CSV, JSON) for visible events

**Ledger Page Layout:**
```
+-------------------------------------------------+
|  Ledger Health Widget                           |
|  [Live Mode] / [Replay Mode] toggle             |
+--------------+----------------------------------+
|  Filters     |  Event Stream (Full Width)       |
|  - Date      |  +------------------------------+|
|  - Employee  |  | 🟢 Juan DC - Time In        ||
|  - Device    |  |    8:05 AM • Gate 1 • #12345||
|  - Event Type|  +------------------------------+|
|              |  | ☕ Maria G - Break Start    ||
|  [Apply]     |  |    10:15 AM • Caf • #12346  ||
|  [Clear]     |  +------------------------------+|
|              |  [← Prev Page] [Next Page →]     |
+--------------+----------------------------------+
|  Replay Controls (only in Replay Mode)          |
|  ▶ [Play] [2x Speed] [Jump to Violation]       |
+-------------------------------------------------+
|  Device Status Dashboard (collapsible)          |
|  Gate 1: 🟢 Online • Gate 2: 🔴 Offline        |
+-------------------------------------------------+
```

**Acceptance Criteria:**
- Ledger page accessible via `/hr/timekeeping/ledger` route
- Full event stream with pagination (20 events per page)
- Filters work correctly
- Live mode auto-refreshes, Replay mode allows playback
- Clear separation from Overview page
- Device status monitoring included

---

#### **Task 1.4: Create Event Detail Modal (Mock)**
**File:** `resources/js/components/timekeeping/event-detail-modal.tsx` (NEW)

**Subtasks:**
- [x] **1.4.1** Create modal triggered by clicking any log entry
- [x] **1.4.2** Display full event details:
  - **Employee Section**: Photo, full name, ID, department, position
  - **Event Section**: Type, timestamp, duration (if paired with previous event)
  - **Device Section**: Device ID, location, status, last maintenance
  - **Ledger Section**: Sequence ID, hash chain value, signature, verification status
  - **Processing Section**: Processed at, processing latency, summary impact
- [x] **1.4.3** Add "Event Timeline" showing sequence of events for this employee today
- [x] **1.4.4** Add "Raw Ledger Data" collapsible JSON viewer
- [x] **1.4.5** Add "Export Event" button (downloads JSON)
- [x] **1.4.6** Add "Report Issue" button (for disputed timestamps)
- [x] **1.4.7** Show related events (previous/next in sequence)

**Acceptance Criteria:**
- Modal opens smoothly with animation
- All event metadata clearly organized
- Timeline shows context of employee's day
- JSON viewer properly formatted and collapsible
- Export downloads valid JSON file

---

#### **Task 1.5: Create Employee Daily Timeline View (Mock)**
**File:** `resources/js/components/timekeeping/employee-timeline-view.tsx` (NEW)

**Subtasks:**
- [x] **1.5.1** Create visual timeline component for single employee's day:
  - Horizontal timeline (8 AM → 6 PM)
  - Event markers at each tap (in/out/break)
  - Color-coded segments (working, break, off-duty)
  - Duration labels between events
- [x] **1.5.2** Add hover tooltips on each marker (full event details)
- [x] **1.5.3** Highlight violations (late arrival, early departure, missing punch)
- [x] **1.5.4** Show scheduled vs actual time (ghost outline for scheduled)
- [x] **1.5.5** Add summary stats above timeline (total hours, break time, overtime)
- [x] **1.5.6** Mock multiple employee timelines for comparison view

**Visual Example:**
```
Juan Dela Cruz - January 29, 2026
Total: 8h 45m | Break: 1h 15m | Overtime: 45m

8:00 -----🟢------☕------▶------☕------▶------🔴------ 6:00
      8:05    12:00  12:30  3:00  3:15    5:45
      Time In  Break       Break        Time Out
      (5m late)
```

**Acceptance Criteria:**
- Timeline accurately represents events chronologically
- Visual segments clearly show work/break periods
- Violations highlighted (red borders, warning icons)
- Comparison view shows multiple employees side-by-side
- Responsive (vertical stack on mobile)

---

#### **Task 1.6: Add Filters and Controls Panel (Mock)**
**File:** `resources/js/components/timekeeping/logs-filter-panel.tsx` (NEW)

**Subtasks:**
- [x] **1.6.1** Create filter panel with:
  - Date range picker (Today, This Week, Custom)
  - Department dropdown (All, Production, Admin, Sales, etc.)
  - Event type multi-select (Time In, Time Out, All Breaks)
  - Verification status (All, Verified, Pending, Failed)
  - Device location multi-select (All Gates, Gate 1, Gate 2, etc.)
  - Employee search autocomplete
- [x] **1.6.2** Add "Advanced Filters" collapsible section:
  - Sequence range (from/to)
  - Processing latency threshold (show only slow events)
  - Violation type (Late, Missing Punch, etc.)
- [x] **1.6.3** Add "Active Filters" chips showing current selections (with X to remove)
- [x] **1.6.4** Add "Clear All Filters" button
- [x] **1.6.5** Add "Save Filter Preset" feature (mock local storage)
- [x] **1.6.6** Apply filters to mock data and update log stream in real-time

**Acceptance Criteria:**
- All filters functional with mock data
- Filter combinations work correctly (AND logic)
- Active filters clearly visible
- Filter state preserved when navigating between tabs
- Preset filters can be saved and loaded

---

#### **Task 1.7: Create Device Status Dashboard (Mock)**
**File:** `resources/js/components/timekeeping/device-status-dashboard.tsx` (NEW)

**Subtasks:**
- [x] **1.7.1** Create grid view of all RFID devices:
  - Device card showing: ID, location, status (online/offline), last scan time
  - Event count today
  - Mini event log (last 5 scans)
- [x] **1.7.2** Add status indicators:
  - 🟢 Online (last scan < 10 min ago)
  - 🟡 Idle (last scan 10-60 min ago)
  - 🔴 Offline (last scan > 60 min ago)
  - 🔧 Maintenance mode
- [x] **1.7.3** Add "View Full Log" button per device
- [x] **1.7.4** Mock different device states (some online, some offline)
- [x] **1.7.5** Add device health metrics (uptime %, error rate)
- [x] **1.7.6** Add map view option (show devices on floor plan)

**Mock Devices:**
```typescript
const mockDevices = [
  {
    id: "GATE-01",
    location: "Gate 1 - Main Entrance",
    status: "online",
    lastScanAgo: "5 seconds ago",
    scansToday: 245,
    uptime: 99.8,
    recentScans: [/* last 5 events */]
  },
  {
    id: "GATE-02",
    location: "Gate 2 - Loading Dock",
    status: "idle",
    lastScanAgo: "25 minutes ago",
    scansToday: 87,
    uptime: 98.5,
    recentScans: [/* last 5 events */]
  },
  {
    id: "CAFETERIA-01",
    location: "Cafeteria Break Scanner",
    status: "offline",
    lastScanAgo: "2 hours ago",
    scansToday: 156,
    uptime: 85.2,
    recentScans: []
  }
];
```

**Acceptance Criteria:**
- Device grid shows all devices with current status
- Status updates reflected visually (color changes)
- Map view integrates device locations (can use simple SVG floor plan)
- Device detail view shows full history
- Offline devices clearly highlighted

---

#### **Task 1.8: Create Playback/Replay Control (Mock)**
**File:** `resources/js/components/timekeeping/event-replay-control.tsx` (NEW)

**Subtasks:**
- [x] **1.8.1** Create playback controls for replaying past events:
  - Timeline slider (drag to any point in time)
  - Play/Pause button
  - Speed control (1x, 2x, 5x, 10x)
  - Jump to controls (next event, previous event)
- [x] **1.8.2** Display "Replaying: January 28, 2026 08:00 → 18:00"
- [x] **1.8.3** Animate event stream to show events appearing in sequence
- [x] **1.8.4** Add "Jump to Violation" button (skips to next late/missing punch)
- [x] **1.8.5** Add "Export Replay" button (generates report of replayed period)
- [x] **1.8.6** Mock replay with smooth transitions between events

**Visual Example:**
```
+------------------------------------------------+
|  Replaying: Jan 28, 2026  [⏸] [2x]           |
|  ▶ 08:00 ════════🔵══════════════ 18:00        |
|          Current: 10:35 AM                     |
|  [◀◀ Prev] [Jump to Violation] [Next ▶▶]     |
+------------------------------------------------+
```

**Acceptance Criteria:**
- Timeline slider functional (scrub through time)
- Play/Pause animates event stream
- Speed control affects animation speed
- Jump controls work correctly
- Replay preserves sequence integrity

---

### **Phase 2: Controller Mock Data & Routes (Week 1-2)**

**Objective:** Create controllers with mock data following MVC pattern. No separate API service files.

#### **Task 2.1: Create Mock Data in Controllers**
**Files:** Controllers under `app/Http/Controllers/HR/Timekeeping/`

**Subtasks:**
- [x] **2.1.1** Update `AnalyticsController@overview()`: Add mock data for ledger health, summary stats, recent violations
- [x] **2.1.2** Create `LedgerController@index()`: Return Inertia response with paginated mock events (20/page)
- [x] **2.1.3** Create `LedgerController@show($sequenceId)`: Return Inertia response with single event detail
- [x] **2.1.4** Add mock data generators as private methods in controllers:
  - `generateMockTimeLogs()` → array of 50+ events
  - `generateMockLedgerHealth()` → health status object
  - `generateMockDeviceStatus()` → array of 5 devices
- [x] **2.1.5** Implement filter logic in `LedgerController@index()` (date, employee, device, event type)
- [x] **2.1.6** Implement pagination in controller (use `collect()->paginate(20)`)

**Example Mock Data Structure in Controller:**
```php
private function generateMockTimeLogs() {
    return collect([
        [
            'id' => 1,
            'sequence_id' => 12345,
            'employee_id' => 'EMP-001',
            'employee_name' => 'Juan Dela Cruz',
            'event_type' => 'time_in',
            'timestamp' => now()->subHours(2),
            'device_id' => 'GATE-01',
            'device_location' => 'Gate 1 - Main Entrance',
            'verified' => true,
        ],
        // ... more mock entries
    ]);
}
```

**Acceptance Criteria:**
- Mock data lives in controllers (not separate service files)
- Controllers return Inertia responses for pages
- Pagination and filters work server-side
- Mock data realistic (50+ events, multiple employees/devices)

---

#### **Task 2.2: Integrate Controllers with Pages (Inertia)**
**Files:** `Overview.tsx`, `Ledger.tsx`

**Subtasks:**
- [x] **2.2.1** Update `Overview.tsx` to receive props from `AnalyticsController@overview()`
- [x] **2.2.2** Create `Ledger.tsx` to receive props from `LedgerController@index()`
- [x] **2.2.3** Add loading states during page navigation (Inertia built-in)
- [x] **2.2.4** Implement client-side filtering (filter then reload page with query params)
- [x] **2.2.5** Add pagination using Inertia links (`<Link href={logs.next_page_url}>`)
- [x] **2.2.6** Add auto-refresh using Inertia polling (`router.reload({ only: ['logs'] })`)

**Acceptance Criteria:**
- Pages receive data via Inertia props (MVC pattern)
- No direct API calls from frontend
- Filters update via form submission or query params
- Pagination works with Inertia links
- Auto-refresh reloads data without full page refresh

---

### **Phase 3: Route Configuration & Navigation (Week 2)**

**Objective:** Set up HR routes for new Ledger page and related features.

#### **Task 3.1: Add New Routes to HR Routes File**
**File:** `routes/hr.php`

**Subtasks:**
- [x] **3.1.1** Add route: `GET /hr/timekeeping/ledger` → `LedgerController@index` (main Ledger page)
- [x] **3.1.2** Add route: `GET /hr/timekeeping/ledger/{sequenceId}` → `LedgerController@show` (event detail)
- [x] **3.1.3** Add route: `GET /hr/timekeeping/devices` → `DeviceController@index` (device dashboard)
- [x] **3.1.4** Add route: `GET /hr/timekeeping/employee/{employeeId}/timeline` → `EmployeeTimelineController@show`
- [x] **3.1.5** Update `AnalyticsController@overview()` to include ledger health widget data

**Route Structure:**
```php
Route::prefix('timekeeping')
    ->name('timekeeping.')
    ->middleware(['auth', 'permission:timekeeping.attendance.view'])
    ->group(function () {
        Route::get('/overview', [AnalyticsController::class, 'overview'])->name('overview');
        Route::get('/ledger', [LedgerController::class, 'index'])->name('ledger.index');
        Route::get('/ledger/{sequenceId}', [LedgerController::class, 'show'])->name('ledger.show');
        Route::get('/devices', [DeviceController::class, 'index'])->name('devices');
    });
```

**Acceptance Criteria:**
- All routes return Inertia responses with mock data
- Routes protected with auth and permission middleware
- No `/api` prefix (MVC pattern)
- Navigation links work from Overview to Ledger page

---

### **Phase 4: Backend API Endpoints (Week 2-3)**

**Objective:** Implement real backend API endpoints to replace mock data.

#### **Task 4.1: Create Ledger API Routes**
**File:** `routes/hr.php`

**Subtasks:**
- [x] **4.1.1** Add route: `GET /hr/timekeeping/api/ledger/health` → `LedgerHealthController@index`
- [x] **4.1.2** Add route: `GET /hr/timekeeping/api/ledger/events` → `LedgerController@events` (paginated list)
- [x] **4.1.3** Add route: `GET /hr/timekeeping/api/ledger/events/{sequenceId}` → `LedgerController@eventDetail`
- [x] **4.1.4** Add route: `POST /hr/timekeeping/api/ledger/sync` → `LedgerSyncController@trigger` (manual sync)
- [x] **4.1.5** Add route: `GET /hr/timekeeping/api/ledger/devices` → `LedgerDeviceController@index` (device list)

**Acceptance Criteria:**
- All routes protected with `auth` and `permission:hr.timekeeping.attendance.view` middleware
- Routes under `/hr/timekeeping/` with `/api/` as sub-namespace for JSON endpoints
- Route naming follows convention: `hr.timekeeping.api.ledger.*`
- Returns JSON responses for AJAX/API calls

**Implementation Pattern:**
```php
// API routes (JSON endpoints)
GET  /hr/timekeeping/api/ledger/health   ? LedgerHealthController@index
GET  /hr/timekeeping/api/ledger/events   ? LedgerController@events
POST /hr/timekeeping/api/ledger/sync     ? LedgerSyncController@trigger
```

---

#### **Task 4.2: Implement LedgerHealthController**
**File:** `app/Http/Controllers/HR/Timekeeping/LedgerHealthController.php` (NEW)

**Subtasks:**
- [x] **4.2.1** Create `index()` method returning latest ledger health status
- [x] **4.2.2** Fetch last 24 hours of health logs from `ledger_health_logs`
- [x] **4.2.3** Compute metrics: processing lag, gap count, hash failure count
- [x] **4.2.4** Return JSON with status (healthy/warning/critical) and detailed metrics
- [x] **4.2.5** Add caching (5-minute TTL) to reduce DB load

**Acceptance Criteria:**
- ✅ Endpoint returns comprehensive health data
- ✅ Response structure matches mock API
- ✅ Cached for performance with 5-minute TTL
- ✅ Cache clear endpoint available for administrators

**Implementation Note:**
- Route: `/hr/timekeeping/ledger/health` (NO `/api/` prefix)
- Returns Inertia response or JSON based on Accept header

---

#### **Task 4.3: Implement LedgerController**
**File:** `app/Http/Controllers/HR/Timekeeping/LedgerController.php` (NEW)

**Subtasks:**
- [x] **4.3.1** Create `index()` method with pagination (20 events per page)
- [x] **4.3.2** Support filtering by: employee_rfid, device_id, date_range, event_type
- [x] **4.3.3** Create `show($sequenceId)` method returning single ledger entry
- [x] **4.3.4** Add permission check: `timekeeping.attendance.view`
- [x] **4.3.5** Return JSON with ledger fields + linked `attendance_events` record

**Acceptance Criteria:**
- ✅ Paginated list matches frontend expectations (20 per page default)
- ✅ Filters work correctly (employee_rfid, device_id, date_range, event_type)
- ✅ Single entry includes full metadata (ledger event + linked attendance_events)
- ✅ Permission middleware applied to all routes (timekeeping.attendance.view)

---

#### **Task 4.4: Implement AttendanceCorrectionController**
**File:** `app/Http/Controllers/HR/Timekeeping/AttendanceCorrectionController.php` (NEW)

**Purpose:** Handle manual corrections to attendance records with audit trail and approval workflow.

**Subtasks:**
- [ ] **4.4.1** Create `store()` method to submit a new correction request:
  - Accept: `attendance_id`, `corrected_time_in`, `corrected_time_out`, `corrected_break_start`, `corrected_break_end`, `correction_reason`, `justification`
  - Validate all fields (minimum 10 characters for justification)
  - Calculate hours difference between original and corrected times
  - Create `AttendanceCorrection` record with status 'pending'
  - Dispatch `AttendanceCorrectionRequested` event
  - Return JSON response with success status
- [ ] **4.4.2** Create `approve()` method for HR Manager approval:
  - Accept: `correction_id`
  - Verify requester has `hr.timekeeping.corrections.approve` permission
  - Update correction status to 'approved'
  - Apply correction to `daily_attendance_summary` (override computed values)
  - Create audit log entry
  - Dispatch `AttendanceCorrectionApproved` event
  - Return JSON response
- [ ] **4.4.3** Create `reject()` method for HR Manager rejection:
  - Accept: `correction_id`, `rejection_reason`
  - Update correction status to 'rejected'
  - Store rejection reason
  - Dispatch `AttendanceCorrectionRejected` event
  - Return JSON response
- [ ] **4.4.4** Add permission checks:
  - `hr.timekeeping.corrections.create` for store()
  - `hr.timekeeping.corrections.approve` for approve()/reject()
- [ ] **4.4.5** Create migration for `attendance_corrections` table:
  - Fields: `id`, `attendance_event_id`, `requested_by_user_id`, `approved_by_user_id`, `original_time_in`, `original_time_out`, `corrected_time_in`, `corrected_time_out`, `corrected_break_start`, `corrected_break_end`, `hours_difference`, `correction_reason`, `justification`, `rejection_reason`, `status` (pending/approved/rejected), `requested_at`, `processed_at`
  - Indexes on `attendance_event_id`, `status`, `requested_by_user_id`

**Routes to Add in `routes/hr.php`:**
```php
// Attendance Correction API Routes (JSON endpoints)
Route::prefix('timekeeping/api/attendance/corrections')->name('timekeeping.api.attendance.corrections.')->group(function () {
    Route::post('/', [AttendanceCorrectionController::class, 'store'])
        ->middleware('permission:hr.timekeeping.corrections.create')
        ->name('store');
    
    Route::put('/{id}/approve', [AttendanceCorrectionController::class, 'approve'])
        ->middleware('permission:hr.timekeeping.corrections.approve')
        ->name('approve');
    
    Route::put('/{id}/reject', [AttendanceCorrectionController::class, 'reject'])
        ->middleware('permission:hr.timekeeping.corrections.approve')
        ->name('reject');
});
```

**Route Pattern:**
- POST `/hr/timekeeping/api/attendance/corrections` → Submit correction request (JSON)
- PUT `/hr/timekeeping/api/attendance/corrections/{id}/approve` → Approve correction (JSON)
- PUT `/hr/timekeeping/api/attendance/corrections/{id}/reject` → Reject correction (JSON)

**Frontend Integration:**
- Update `attendance-correction-modal.tsx`:
  - Replace mock `handleSaveCorrection` with axios/fetch POST request
  - Use route: `route('hr.timekeeping.api.attendance.corrections.store')`
  - Handle validation errors and success responses
  - Show success toast on submission
- Uses `/api/` sub-namespace for JSON endpoints (consistent with ledger API routes)

**Acceptance Criteria:**
- [ ] Controller created with store(), approve(), reject() methods returning JSON responses
- [ ] Migration for attendance_corrections table created and run
- [ ] Routes added to hr.php with `/api/` sub-namespace (e.g., `/hr/timekeeping/api/attendance/corrections`)
- [ ] Permission checks applied to all routes
- [ ] Frontend modal integrates with real backend API via axios/fetch
- [ ] Audit trail captured for all correction actions
- [ ] Events dispatched for downstream processing (Payroll, Notifications)

**Implementation Notes:**
- **Architecture Decision**: Manual corrections NEVER modify the ledger or attendance_events
- **Data Integrity**: Corrections stored separately in `attendance_corrections` table
- **Audit Trail**: All correction requests logged with requestor, approver, timestamps, reasons
- **Workflow Gating**: Payroll processing checks for pending corrections and blocks approval
- **Event-Driven**: Correction approval triggers summary recomputation and payroll notification

---

### **Phase 5: Backend Services & Database Integration (Week 3-4)**

**Objective:** Implement service layer for ledger processing, event handling, and summary computation.

#### **Task 5.1: Database Migrations**

**Subtasks:**
- [x] **5.1.1** Create migration for `rfid_ledger` table (PostgreSQL)
- [x] **5.1.2** Add columns to `attendance_events`: `ledger_sequence_id`, `is_deduplicated`, `ledger_hash_verified`
- [x] **5.1.3** Add columns to `daily_attendance_summary`: `ledger_sequence_start`, `ledger_sequence_end`, `ledger_verified`
- [x] **5.1.4** Create migration for `ledger_health_logs` table
- [x] **5.1.5** Add indexes for performance

**Acceptance Criteria:**
- ✅ All migrations run successfully (5.1.1-5.1.5 complete)
- ✅ Indexes created for performance (included in migrations and optimization migration)
- ✅ Foreign keys properly configured (attendance_events → import_batches, employees, users; daily_attendance_summary → work_schedules, leave_requests)

**Implementation Notes:**
- Created 5 total migrations:
  - `2026_02_03_000000_create_import_batches_table` - Bulk import tracking
  - `2026_02_03_000001_create_rfid_ledger_table` - Append-only ledger (16 columns, 6 indexes)
  - `2026_02_03_000002_create_attendance_events_table` - Processed events with ledger linking (22 columns, 7 indexes)
  - `2026_02_03_000003_create_daily_attendance_summary_table` - Daily summary with ledger tracking (Task 5.1.3, 34 columns, 8 indexes)
  - `2026_02_03_000004_create_ledger_health_logs_table` - Health monitoring logs (Task 5.1.4, 17 columns, 7 indexes)
  - `2026_02_03_000005_add_performance_indexes` - Additional composite indexes for query optimization (Task 5.1.5)

- Created 5 Eloquent models:
  - RfidLedger: Append-only ledger (sequence, hash chain, device signature, scopes for unprocessed/filtering)
  - AttendanceEvent: Processed events with ledger linking (scopes for source, deduplication, hash verification)
  - ImportBatch: Bulk import tracking (status workflow, success rate calculations)
  - DailyAttendanceSummary: Daily aggregation with ledger integrity (Task 5.1.3, scopes for attendance status/finalization)
  - LedgerHealthLog: Health monitoring (Task 5.1.4, status determination, issue summaries)

- Task 5.1.3 Implementation:
  - 8 new indexes on daily_attendance_summary for common queries
  - Ledger sequence tracking (start/end) for reconciliation
  - Ledger verification flag for integrity tracking
  - Relationships to employees, work_schedules, and leave_requests

- Task 5.1.4 Implementation:
  - Health status tracking (healthy/warning/critical)
  - Gap detection with JSON details
  - Hash failure tracking and details
  - Processing lag and queue metrics
  - Thresholds for gap_count, hash_failure_count, duplicate_count
  - Replay trigger tracking for automated remediation
  - Helper methods for status queries and issue summaries

- Task 5.1.5 Implementation:
  - Composite indexes on frequently filtered columns
  - Source/status filters optimized
  - Employee date range queries accelerated
  - Ledger sequence and health status lookups optimized
  - Total of 17 new indexes across all tables for performance

- All migrations executed successfully on PostgreSQL
- All models properly configured with relationships, scopes, and helper methods

---

#### **Task 5.2: Create LedgerPollingService**
**File:** `app/Services/Timekeeping/LedgerPollingService.php` (✅ COMPLETE)

**Subtasks:**
- [x] **5.2.1** Implement `pollNewEvents()` method to fetch unprocessed ledger entries ✅
- [x] **5.2.2** Implement deduplication logic (15-second window) ✅
- [x] **5.2.3** Validate hash chain on each event ✅
- [x] **5.2.4** Create `AttendanceEvent` records from ledger entries ✅
- [x] **5.2.5** Mark ledger entries as processed ✅

**Acceptance Criteria:**
- ✅ Polling processes events without errors - 17 unit tests passing
- ✅ Deduplication prevents duplicates - 15-second window verified
- ✅ Hash chain validation detects tampering and sequence gaps
- ✅ Attendance events created from ledger entries with proper linking
- ✅ Ledger entries marked as processed for next polling cycle

**Implementation Details:**
- Task 5.2.1: `pollNewEvents(limit=1000)` fetches RfidLedger entries with `unprocessed().orderBySequence()`
- Task 5.2.2: `deduplicateEvents()` detects duplicates using 15-second time window for same employee/device/event_type
- Task 5.2.3: `validateHashChain()` verifies SHA-256 hashes and detects sequence gaps; `isHashChainValid()` provides quick boolean check
- Task 5.2.4: `createAttendanceEventsFromLedger()` converts ledger entries to AttendanceEvent records with error handling
- Task 5.2.5: `markLedgerEntriesAsProcessed()` updates ledger.processed flag with timestamp
- Combined pipeline: `processLedgerEventsComplete()` handles all three steps (5.2.3-5.2.5) in sequence
- Created RfidLedgerFactory and AttendanceEventFactory for test data generation
- Fixed EmployeeFactory to remove email field (dropped in earlier migration)
- All unit tests passing: 17/17 ✅

---

#### **Task 5.3: Create AttendanceSummaryService**
**File:** `app/Services/Timekeeping/AttendanceSummaryService.php` ✅ COMPLETED

**Subtasks:**
- [x] **5.3.1** Implement `computeDailySummary($employeeId, $date)` method ✅
- [x] **5.3.2** Apply business rules (late, absent, overtime thresholds) ✅
- [ ] **5.3.3** Store/update `daily_attendance_summary` records
- [ ] **5.3.4** Dispatch `AttendanceSummaryUpdated` event

**Acceptance Criteria:**
- ✅ Summaries computed accurately - 11 unit tests passing
- ✅ Business rules applied correctly - All test scenarios covered
- Events will be dispatched in tasks 5.3.4

**Implementation Summary:**
- **computeDailySummary()**: Fetches AttendanceEvent records, extracts times, calculates hours
- **applyBusinessRules()**: Evaluates presence, lateness, undertime, overtime status
- **Business Rules**:
  - Present: Employee has time_in event
  - Late: time_in > scheduled_start + 15-minute grace period
  - Absent: No time_in event by scheduled end
  - Undertime: total_hours_worked < scheduled_hours
  - Overtime: time_out > scheduled_end
- **Test Coverage**: 11 comprehensive tests passing (28 total with Phase 5.2)
  - Full day attendance scenarios
  - Absent employee cases
  - Grace period boundaries
  - Undertime/overtime detection

---

### **Phase 6: Scheduled Jobs & Real-Time Updates (Week 4)**

**Objective:** Automate ledger polling and enable real-time updates.

#### **Task 6.1: Create ProcessRfidLedgerJob**
**File:** `app/Jobs/Timekeeping/ProcessRfidLedgerJob.php` (NEW)

**Subtasks:**
- [ ] **6.1.1** Implement `handle()` method calling `LedgerPollingService`
- [ ] **6.1.2** Configure to run every 1 minute via Laravel Scheduler
- [ ] **6.1.3** Add retry logic and failure notifications

**Acceptance Criteria:**
- Job runs automatically every minute
- Failures trigger alerts

---

#### **Task 6.2: Connect Frontend to Real API**
**Files:** All frontend components

**Subtasks:**
- [ ] **6.2.1** Replace mock API calls with real API endpoints
- [ ] **6.2.2** Test all components with live backend data
- [ ] **6.2.3** Fix any data structure mismatches
- [ ] **6.2.4** Verify real-time polling works correctly

**Acceptance Criteria:**
- All components fetch from real backend
- Live data displays correctly
- No console errors

---

### **Phase 7: Testing & Refinement (Week 4-5)**

**Objective:** Test complete system and refine based on feedback.

#### **Task 7.1: HR Staff User Testing**

**Subtasks:**
- [ ] **7.1.1** Conduct user testing sessions with HR Staff
- [ ] **7.1.2** Gather feedback on UI/UX
- [ ] **7.1.3** Document pain points and improvement suggestions
- [ ] **7.1.4** Prioritize changes based on feedback

**Acceptance Criteria:**
- At least 3 HR Staff test the system
- Feedback documented and prioritized

---

#### **Task 7.2: Performance Optimization**

**Subtasks:**
- [ ] **7.2.1** Optimize database queries (N+1 issues)
- [ ] **7.2.2** Add caching for frequently accessed data
- [ ] **7.2.3** Optimize frontend bundle size
- [ ] **7.2.4** Test with 1000+ events loaded

**Acceptance Criteria:**
- Page load < 2 seconds
- Event stream scrolls smoothly with 1000+ items

---

#### **Task 7.3: Integration Testing**

**Subtasks:**
- [ ] **7.3.1** Test end-to-end flow: RFID scan → Display in UI
- [ ] **7.3.2** Test offline device handling
- [ ] **7.3.3** Test hash chain validation
- [ ] **7.3.4** Test workflow gating (Payroll integration)

**Acceptance Criteria:**
- All integration points work correctly
- Edge cases handled gracefully
- Manual corrections clearly separated from ledger source data

---

#### **Task 1.4: Add Ledger Health Dashboard Widget**
**File:** `resources/js/components/timekeeping/ledger-health-widget.tsx` (NEW)

**Subtasks:**
- [ ] **1.4.1** Create new component `LedgerHealthWidget` showing:
  - Last sequence ID processed
  - Processing lag (seconds between scan and processing)
  - Hash chain status (✅ valid / ❌ broken)
  - Sequence gaps detected (count)
  - Replay jobs in progress (count)
- [ ] **1.4.2** Add color-coded status: Green (healthy), Yellow (lag > 5 min), Red (integrity failed)
- [ ] **1.4.3** Add "View Details" button opening ledger health logs modal
- [ ] **1.4.4** Add "Trigger Manual Sync" button for HR Manager (forces ledger poll)
- [ ] **1.4.5** Display device online/offline status (based on last scan timestamp)

**Acceptance Criteria:**
- Widget displays on Overview page and Attendance Index page
- Real-time health status updates every 30 seconds
- HR Manager can manually trigger sync

---

#### **Task 1.5: Update Attendance Filters Component**
**File:** `resources/js/components/timekeeping/attendance-filters.tsx`

**Subtasks:**
- [ ] **1.5.1** Add "Source" filter dropdown: All / RFID Ledger / Manual / Imported
- [ ] **1.5.2** Add "Ledger Verified" checkbox filter
- [ ] **1.5.3** Add "Sequence ID Range" input (for audit/replay scenarios)
- [ ] **1.5.4** Add "Device ID" dropdown (populated from `rfid_ledger.device_id`)
- [ ] **1.5.5** Update filter state management to include new ledger-specific filters

**Acceptance Criteria:**
- All ledger-specific filters functional
- Filter combinations work correctly (e.g., "RFID Ledger + Not Verified")

---

#### **Task 1.6: Update Source Indicator Component**
**File:** `resources/js/components/timekeeping/source-indicator.tsx`

**Subtasks:**
- [ ] **1.6.1** Update `edge_machine` source to display "RFID Ledger" label
- [ ] **1.6.2** Add ledger icon (e.g., 🔗 chain link) for ledger-sourced events
- [ ] **1.6.3** Add verification badge (🔒 verified / ⚠️ unverified) next to source label
- [ ] **1.6.4** Add tooltip showing device ID and sequence ID on hover

**Acceptance Criteria:**
- Source indicator clearly distinguishes ledger vs manual vs imported
- Verification status visible at a glance

---

## 📊 Success Metrics

**Technical Metrics:**
- Ledger processing lag < 2 minutes (95th percentile)
- Hash chain validation passes 100% (critical)
- Zero sequence gaps in production
- API response time < 500ms (95th percentile)
- Job failure rate < 0.1%

**Business Metrics:**
- 100% of attendance events sourced from RFID ledger (vs manual entry)
- Payroll processing time reduced by 50% (automated data)
- Attendance dispute resolution time reduced by 70% (tamper-proof audit trail)
- Zero data integrity issues in payroll calculations

**User Adoption:**
- HR Staff views ledger health dashboard daily
- HR Manager uses manual sync < 5 times per month (system is reliable)
- Zero manual attendance entry for RFID-enabled employees

---

## 🔗 Integration Points

**Payroll Module:**
- Receives `AttendanceSummaryUpdated` events
- Blocks payroll approval if `WorkflowGatingService::checkPayrollEligibility()` returns false
- Uses `daily_attendance_summary` for salary calculations

**Appraisal Module:**
- Receives `AttendanceViolation` events
- Imports attendance/punctuality scores from verified ledger sequences
- References `ledger_health_logs` when finalizing performance ratings

**Notification Module:**
- Receives `AttendanceViolation` events
- Sends alerts to employees (late arrival, absent)
- Sends alerts to HR Manager (critical ledger issues)

**Workforce Management:**
- Receives real-time attendance data for coverage analytics
- Uses attendance events to validate rotation assignments
- Triggers alerts when coverage falls below threshold

---

## 🔐 Security & Compliance

**Data Integrity:**
- Append-only ledger ensures RFID events cannot be modified
- Hash chain validation detects tampering
- Manual corrections stored separately with full audit trail

**Access Control:**
- Ledger data read-only for all users (only FastAPI server writes)
- Manual sync and verification restricted to HR Manager
- All actions logged in `activity_log` with user ID and timestamp

**Philippine Labor Law Compliance:**
- 5-year retention of all attendance records (ledger + summaries)
- Automated export to WORM storage for legal defensibility
- Audit trail meets DOLE requirements for time record accuracy

**GDPR/Privacy (if applicable):**
- Employee RFID data pseudonymized in logs
- Data export tools for employee data portability
- Retention policy enforced with automated archiving

---

## 📚 Related Documentation

- [RFID Replayable Event-Log Proposal](../workflows/integrations/patentable-proposal/rfid-replayable-event-log-proposal.md)
- [Timekeeping Module Architecture](../TIMEKEEPING_MODULE_ARCHITECTURE.md)
- [Performance Appraisal Process](../workflows/processes/performance-appraisal.md)
- [Payroll Processing Workflow](../workflows/processes/payroll-processing.md)
- [HR Manager Workflow](../workflows/03-hr-manager-workflow.md)
- [HR Staff Workflow](../workflows/04-hr-staff-workflow.md)

---

## 🗓️ Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| **Phase 1: Frontend Updates** | Week 1 | Updated pages with ledger data, real-time polling, health dashboard |
| **Phase 2: Route Configuration** | Week 1-2 | API routes for ledger access, health monitoring, manual sync |
| **Phase 3: Backend Controllers** | Week 2 | Controllers for ledger, health, verification, corrections |
| **Phase 4: Backend Services** | Week 2-3 | Polling, summary, replay, gating, mapping services |
| **Phase 5: Jobs & Listeners** | Week 3 | Scheduled jobs, event listeners, downstream integrations |
| **Phase 6: Testing** | Week 4 | Unit, integration, performance, security tests |
| **Phase 7: Deployment** | Week 4-5 | Production deployment, monitoring, operational runbook |

**Total Duration:** 4-5 weeks  
**Team Size:** 2-3 developers (1 backend, 1 frontend, 1 QA/DevOps)

---

## ✅ Pre-Implementation Checklist

- [ ] FastAPI RFID server is operational and writing to `rfid_ledger` table
- [ ] PostgreSQL database configured and accessible from Laravel
- [ ] RFID devices enrolled and assigned device IDs
- [ ] Employee RFID cards registered in `employees.rfid_card_number`
- [ ] Existing Timekeeping pages functional (baseline before changes)
- [ ] Laravel Scheduler configured with cron job
- [ ] Event bus configured (Laravel Events or external queue)
- [ ] Monitoring infrastructure ready (Grafana, Prometheus, or equivalent)
- [ ] HR Manager and HR Staff trained on new workflows
- [ ] Rollback plan prepared in case of deployment issues

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Document Owner:** Development Team  
**Approved By:** [Pending]

---

## 📝 Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-04 | 1.1 | Removed duplicate phases, cleaned up structure | AI Assistant |
| 2026-01-29 | 1.0 | Initial implementation plan created | AI Assistant |

---

**Status:** 🟡 IN PROGRESS - Phase 5 (Tasks 5.3.1-5.3.2 Complete)  
**Next Steps:** Complete Phase 5 (Tasks 5.3.3-5.3.4) → Begin Phase 6 implementation
