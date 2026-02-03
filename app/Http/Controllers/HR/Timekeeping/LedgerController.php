<?php

namespace App\Http\Controllers\HR\Timekeeping;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class LedgerController extends Controller
{
    /**
     * Display the RFID ledger page with event stream.
     * 
     * Implements MVC pattern returning Inertia response (not part of API endpoints).
     * 
     * @param Request $request
     * @return Response
     */
    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 20);
        $page = $request->get('page', 1);
        
        // Generate mock time logs
        $allLogs = $this->generateMockTimeLogs();
        
        // Apply filters from request
        $filteredLogs = $this->applyFilters($allLogs, $request);
        
        // Paginate results
        $logs = collect($filteredLogs)
            ->forPage($page, $perPage)
            ->values()
            ->toArray();
        
        // Generate pagination meta
        $total = count($filteredLogs);
        $lastPage = ceil($total / $perPage);
        
        return Inertia::render('HR/Timekeeping/Ledger', [
            'logs' => [
                'data' => $logs,
                'current_page' => (int) $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
                'from' => ($page - 1) * $perPage + 1,
                'to' => min($page * $perPage, $total),
                'next_page_url' => $page < $lastPage ? route('timekeeping.ledger.index', ['page' => $page + 1]) : null,
                'prev_page_url' => $page > 1 ? route('timekeeping.ledger.index', ['page' => $page - 1]) : null,
            ],
            'ledgerHealth' => $this->generateMockLedgerHealth(),
            'devices' => $this->generateMockDeviceStatus(),
            'filters' => [
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'device_id' => $request->get('device_id'),
                'event_type' => $request->get('event_type'),
                'employee_rfid' => $request->get('employee_rfid'),
                'employee_search' => $request->get('employee_search'),
            ],
        ]);
    }

    /**
     * Show a single event detail by sequence ID.
     * 
     * Subtask 4.3.3: Return single ledger entry (Inertia response for page view)
     * Subtask 4.3.4: Permission check applied in routes (timekeeping.attendance.view)
     * 
     * @param int $sequenceId
     * @return Response
     */
    public function show(int $sequenceId): Response
    {
        // Permission check is handled by middleware in routes (4.3.4)
        
        $allLogs = $this->generateMockTimeLogs();
        $event = collect($allLogs)->firstWhere('sequence_id', $sequenceId);
        
        if (!$event) {
            abort(404, 'Event not found');
        }
        
        // Generate linked attendance_events record (4.3.5)
        $attendanceEvent = $this->generateLinkedAttendanceEvent($event);
        
        return Inertia::render('HR/Timekeeping/EventDetail', [
            'event' => $event,
            'attendanceEvent' => $attendanceEvent, // Linked attendance_events record
            'relatedEvents' => $this->getRelatedEvents($event),
        ]);
    }

    /**
     * API: Return ledger events as JSON (paginated).
     * 
     * Subtask 4.3.1: Pagination with 20 events per page
     * Subtask 4.3.2: Filtering by employee_rfid, device_id, date_range, event_type
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function events(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 20); // Default 20 per page (4.3.1)
        $page = $request->get('page', 1);
        
        // Generate mock time logs
        $allLogs = $this->generateMockTimeLogs();
        
        // Apply filters from request (4.3.2: employee_rfid, device_id, date_range, event_type)
        $filteredLogs = $this->applyFilters($allLogs, $request);
        
        // Paginate results
        $logs = collect($filteredLogs)
            ->forPage($page, $perPage)
            ->values()
            ->toArray();
        
        // Generate pagination meta
        $total = count($filteredLogs);
        $lastPage = ceil($total / $perPage);
        
        return response()->json([
            'data' => $logs,
            'meta' => [
                'current_page' => (int) $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
                'from' => ($page - 1) * $perPage + 1,
                'to' => min($page * $perPage, $total),
            ],
            'links' => [
                'first' => route('timekeeping.api.ledger.events', ['page' => 1]),
                'last' => route('timekeeping.api.ledger.events', ['page' => $lastPage]),
                'next' => $page < $lastPage ? route('timekeeping.api.ledger.events', ['page' => $page + 1]) : null,
                'prev' => $page > 1 ? route('timekeeping.api.ledger.events', ['page' => $page - 1]) : null,
            ],
            'filters' => [
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
                'device_id' => $request->get('device_id'),
                'event_type' => $request->get('event_type'),
                'employee_rfid' => $request->get('employee_rfid'),
                'employee_search' => $request->get('employee_search'),
            ],
        ]);
    }

    /**
     * API: Get a single event by sequence ID (JSON response).
     * 
     * Subtask 4.3.3: Return single ledger entry as JSON
     * Subtask 4.3.4: Permission check applied in routes (timekeeping.attendance.view)
     * Subtask 4.3.5: Return JSON with ledger fields + linked attendance_events record
     * 
     * @param int $sequenceId
     * @return JsonResponse
     */
    public function eventDetail(int $sequenceId): JsonResponse
    {
        // Permission check is handled by middleware in routes (4.3.4)
        
        $allLogs = $this->generateMockTimeLogs();
        $event = collect($allLogs)->firstWhere('sequence_id', $sequenceId);
        
        if (!$event) {
            return response()->json([
                'message' => 'Event not found',
                'error' => 'EVENT_NOT_FOUND',
            ], 404);
        }
        
        $relatedEvents = $this->getRelatedEvents($event);
        
        // Generate linked attendance_events record (4.3.5)
        $attendanceEvent = $this->generateLinkedAttendanceEvent($event);
        
        return response()->json([
            'success' => true,
            'data' => [
                'ledger_event' => $event, // Full ledger fields (4.3.5)
                'attendance_event' => $attendanceEvent, // Linked attendance_events record (4.3.5)
            ],
            'related' => [
                'previous' => $relatedEvents['previous'] ?? null,
                'next' => $relatedEvents['next'] ?? null,
                'employee_today' => array_values($relatedEvents['employee_today'] ?? []),
            ],
            'links' => [
                'self' => route('timekeeping.api.ledger.event', ['sequenceId' => $sequenceId]),
                'previous' => isset($relatedEvents['previous']) 
                    ? route('timekeeping.api.ledger.event', ['sequenceId' => $relatedEvents['previous']['sequence_id']]) 
                    : null,
                'next' => isset($relatedEvents['next']) 
                    ? route('timekeeping.api.ledger.event', ['sequenceId' => $relatedEvents['next']['sequence_id']]) 
                    : null,
            ],
        ]);
    }

    /**
     * Generate mock time logs (50+ events).
     * 
     * @return array
     */
    private function generateMockTimeLogs(): array
    {
        $logs = [];
        $employees = [
            ['id' => 'EMP-001', 'name' => 'Juan Dela Cruz'],
            ['id' => 'EMP-002', 'name' => 'Maria Santos'],
            ['id' => 'EMP-003', 'name' => 'Pedro Garcia'],
            ['id' => 'EMP-004', 'name' => 'Ana Reyes'],
            ['id' => 'EMP-005', 'name' => 'Jose Mendoza'],
            ['id' => 'EMP-006', 'name' => 'Rosa Martinez'],
            ['id' => 'EMP-007', 'name' => 'Carlos Lopez'],
            ['id' => 'EMP-008', 'name' => 'Linda Torres'],
            ['id' => 'EMP-009', 'name' => 'Miguel Rivera'],
            ['id' => 'EMP-010', 'name' => 'Sofia Flores'],
        ];
        
        $devices = [
            ['id' => 'GATE-01', 'location' => 'Gate 1 - Main Entrance'],
            ['id' => 'GATE-02', 'location' => 'Gate 2 - Side Entrance'],
            ['id' => 'CAFETERIA-01', 'location' => 'Cafeteria'],
            ['id' => 'WAREHOUSE-01', 'location' => 'Warehouse Entry'],
            ['id' => 'OFFICE-01', 'location' => 'Office Floor'],
        ];
        
        $eventTypes = ['time_in', 'time_out', 'break_start', 'break_end'];
        
        $sequenceId = 12345;
        $baseTime = now()->startOfDay()->addHours(7); // Start at 7 AM
        
        // Generate 60 events over the course of a day
        for ($i = 0; $i < 60; $i++) {
            $employee = $employees[array_rand($employees)];
            $device = $devices[array_rand($devices)];
            $eventType = $eventTypes[array_rand($eventTypes)];
            
            // Distribute events throughout the day
            $timestamp = $baseTime->copy()->addMinutes($i * 15 + rand(-5, 5));
            
            $logs[] = [
                'id' => $i + 1,
                'sequence_id' => $sequenceId++,
                'employee_id' => $employee['id'],
                'employee_name' => $employee['name'],
                'event_type' => $eventType,
                'timestamp' => $timestamp->toISOString(),
                'device_id' => $device['id'],
                'device_location' => $device['location'],
                'verified' => rand(1, 100) > 5, // 95% verified
                'rfid_card' => '****-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'hash_chain' => bin2hex(random_bytes(16)),
                'latency_ms' => rand(50, 500),
                'source' => 'edge_machine',
            ];
        }
        
        return $logs;
    }

    /**
     * Generate mock ledger health status.
     * 
     * @return array
     */
    private function generateMockLedgerHealth(): array
    {
        return [
            'status' => 'healthy',
            'last_sequence_id' => 12404,
            'events_today' => 247,
            'devices_online' => 4,
            'devices_offline' => 1,
            'last_sync' => now()->subMinutes(2)->toISOString(),
            'avg_latency_ms' => 125,
            'hash_verification' => [
                'total_checked' => 247,
                'passed' => 247,
                'failed' => 0,
            ],
            'performance' => [
                'events_per_hour' => 31,
                'avg_processing_time_ms' => 45,
                'queue_depth' => 0,
            ],
            'alerts' => [],
        ];
    }

    /**
     * Generate mock device status.
     * 
     * @return array
     */
    private function generateMockDeviceStatus(): array
    {
        return [
            [
                'device_id' => 'GATE-01',
                'device_name' => 'Gate 1 Reader',
                'location' => 'Gate 1 - Main Entrance',
                'status' => 'online',
                'last_heartbeat' => now()->subMinutes(1)->toISOString(),
                'events_today' => 87,
                'uptime_percentage' => 99.8,
            ],
            [
                'device_id' => 'GATE-02',
                'device_name' => 'Gate 2 Reader',
                'location' => 'Gate 2 - Side Entrance',
                'status' => 'online',
                'last_heartbeat' => now()->subMinutes(1)->toISOString(),
                'events_today' => 45,
                'uptime_percentage' => 99.5,
            ],
            [
                'device_id' => 'CAFETERIA-01',
                'device_name' => 'Cafeteria Reader',
                'location' => 'Cafeteria',
                'status' => 'online',
                'last_heartbeat' => now()->subMinutes(2)->toISOString(),
                'events_today' => 62,
                'uptime_percentage' => 98.9,
            ],
            [
                'device_id' => 'WAREHOUSE-01',
                'device_name' => 'Warehouse Reader',
                'location' => 'Warehouse Entry',
                'status' => 'online',
                'last_heartbeat' => now()->subMinutes(3)->toISOString(),
                'events_today' => 34,
                'uptime_percentage' => 97.2,
            ],
            [
                'device_id' => 'OFFICE-01',
                'device_name' => 'Office Reader',
                'location' => 'Office Floor',
                'status' => 'offline',
                'last_heartbeat' => now()->subHours(2)->toISOString(),
                'events_today' => 19,
                'uptime_percentage' => 85.3,
            ],
        ];
    }

    /**
     * Apply filters to logs collection.
     * 
     * Subtask 4.3.2: Support filtering by employee_rfid, device_id, date_range, event_type
     * 
     * @param array $logs
     * @param Request $request
     * @return array
     */
    private function applyFilters(array $logs, Request $request): array
    {
        $filtered = $logs;
        
        // Date range filter (date_range: date_from and date_to)
        if ($request->has('date_from')) {
            $dateFrom = \Carbon\Carbon::parse($request->get('date_from'))->startOfDay();
            $filtered = array_filter($filtered, function ($log) use ($dateFrom) {
                return \Carbon\Carbon::parse($log['timestamp'])->gte($dateFrom);
            });
        }
        
        if ($request->has('date_to')) {
            $dateTo = \Carbon\Carbon::parse($request->get('date_to'))->endOfDay();
            $filtered = array_filter($filtered, function ($log) use ($dateTo) {
                return \Carbon\Carbon::parse($log['timestamp'])->lte($dateTo);
            });
        }
        
        // Device filter (device_id)
        if ($request->has('device_id') && $request->get('device_id') !== 'all' && $request->get('device_id') !== '') {
            $deviceId = $request->get('device_id');
            $filtered = array_filter($filtered, function ($log) use ($deviceId) {
                return $log['device_id'] === $deviceId;
            });
        }
        
        // Event type filter (event_type)
        if ($request->has('event_type') && $request->get('event_type') !== '' && $request->get('event_type') !== 'all') {
            $eventType = $request->get('event_type');
            $filtered = array_filter($filtered, function ($log) use ($eventType) {
                return $log['event_type'] === $eventType;
            });
        }
        
        // Employee RFID filter (employee_rfid) - NEW for 4.3.2
        if ($request->has('employee_rfid') && $request->get('employee_rfid') !== '' && $request->get('employee_rfid') !== 'all') {
            $employeeRfid = $request->get('employee_rfid');
            $filtered = array_filter($filtered, function ($log) use ($employeeRfid) {
                return $log['employee_id'] === $employeeRfid;
            });
        }
        
        // Employee search filter (for backward compatibility and free-text search)
        if ($request->has('employee_search') && $request->get('employee_search')) {
            $search = strtolower($request->get('employee_search'));
            $filtered = array_filter($filtered, function ($log) use ($search) {
                return str_contains(strtolower($log['employee_name']), $search) ||
                       str_contains(strtolower($log['employee_id']), $search) ||
                       str_contains(strtolower($log['rfid_card']), $search);
            });
        }
        
        return array_values($filtered);
    }

    /**
     * Get related events for a specific event.
     * 
     * @param array $event
     * @return array
     */
    private function getRelatedEvents(array $event): array
    {
        $allLogs = $this->generateMockTimeLogs();
        
        // Get previous and next events in sequence
        $currentIndex = array_search($event['sequence_id'], array_column($allLogs, 'sequence_id'));
        
        $related = [];
        
        if ($currentIndex > 0) {
            $related['previous'] = $allLogs[$currentIndex - 1];
        }
        
        if ($currentIndex < count($allLogs) - 1) {
            $related['next'] = $allLogs[$currentIndex + 1];
        }
        
        // Get same employee events today
        $related['employee_today'] = array_filter($allLogs, function ($log) use ($event) {
            return $log['employee_id'] === $event['employee_id'] &&
                   \Carbon\Carbon::parse($log['timestamp'])->isToday();
        });
        
        return $related;
    }

    /**
     * Generate linked attendance_events record for a ledger event.
     * 
     * Subtask 4.3.5: Generate mock attendance_events record linked to ledger entry.
     * In production, this would query the attendance_events table using ledger_sequence_id.
     * 
     * @param array $ledgerEvent
     * @return array|null
     */
    private function generateLinkedAttendanceEvent(array $ledgerEvent): ?array
    {
        // Simulate processing: not all ledger events have been processed into attendance_events yet
        $isProcessed = $ledgerEvent['verified'] && rand(1, 100) > 10; // 90% processed if verified
        
        if (!$isProcessed) {
            return null; // Event not yet processed into attendance_events
        }
        
        return [
            'id' => rand(1000, 9999),
            'ledger_sequence_id' => $ledgerEvent['sequence_id'], // Links back to ledger
            'employee_id' => $ledgerEvent['employee_id'],
            'employee_name' => $ledgerEvent['employee_name'],
            'event_type' => $ledgerEvent['event_type'],
            'recorded_at' => $ledgerEvent['timestamp'],
            'device_id' => $ledgerEvent['device_id'],
            'device_location' => $ledgerEvent['device_location'],
            'source' => $ledgerEvent['source'],
            'is_deduplicated' => false,
            'ledger_hash_verified' => $ledgerEvent['verified'],
            'attendance_date' => \Carbon\Carbon::parse($ledgerEvent['timestamp'])->toDateString(),
            'processed_at' => \Carbon\Carbon::parse($ledgerEvent['timestamp'])->addSeconds(rand(5, 300))->toISOString(),
            'notes' => $ledgerEvent['verified'] ? 'Automatically processed from ledger' : 'Manual verification required',
            'created_at' => \Carbon\Carbon::parse($ledgerEvent['timestamp'])->addSeconds(rand(1, 60))->toISOString(),
            'updated_at' => \Carbon\Carbon::parse($ledgerEvent['timestamp'])->addSeconds(rand(1, 60))->toISOString(),
        ];
    }
}
