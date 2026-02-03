<?php

namespace App\Services\Timekeeping;

use App\Models\RfidLedger;
use App\Models\AttendanceEvent;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Builder;

/**
 * LedgerPollingService
 * 
 * Handles polling of the RFID ledger for new events and implements
 * deduplication logic to prevent duplicate event processing.
 * 
 * Task 5.2.1 & 5.2.2: Ledger polling with deduplication
 * 
 * Responsibilities:
 * - Poll unprocessed ledger entries (Task 5.2.1)
 * - Detect and mark duplicate events within 15-second window (Task 5.2.2)
 * - Validate event ordering by sequence_id
 * - Prepare events for downstream processing
 */
class LedgerPollingService
{
    /**
     * Deduplication time window in seconds.
     * Two events are considered duplicates if they occur within this window
     * from the same employee, device, and event type.
     */
    private const DEDUPLICATION_WINDOW_SECONDS = 15;

    /**
     * Task 5.2.1: Poll new unprocessed events from the RFID ledger.
     * 
     * This method fetches all unprocessed ledger entries and returns them
     * in sequence order, ready for deduplication and processing.
     * 
     * @param int|null $limit Maximum number of events to fetch per poll (default: 1000)
     * @return Collection Collection of unprocessed RfidLedger entries
     * 
     * @example
     * $events = $this->pollNewEvents(100);
     * // Returns next 100 unprocessed events in sequence order
     */
    public function pollNewEvents(?int $limit = 1000): Collection
    {
        // Query unprocessed ledger entries in sequence order
        $events = RfidLedger::unprocessed()
            ->orderBySequence()
            ->limit($limit)
            ->get();

        return $events;
    }

    /**
     * Task 5.2.1: Fetch events starting from a specific sequence ID.
     * 
     * Used for targeted polling or recovery after processing failures.
     * 
     * @param int $fromSequenceId Start from this sequence ID
     * @param int|null $limit Maximum number of events to fetch
     * @return Collection Collection of RfidLedger entries
     */
    public function pollEventsFromSequence(int $fromSequenceId, ?int $limit = 1000): Collection
    {
        $events = RfidLedger::where('sequence_id', '>=', $fromSequenceId)
            ->where('processed', false)
            ->orderBySequence()
            ->limit($limit)
            ->get();

        return $events;
    }

    /**
     * Task 5.2.2: Detect and mark duplicate events within the deduplication window.
     * 
     * A duplicate is defined as an event that matches:
     * - Same employee (employee_rfid)
     * - Same device (device_id)
     * - Same event type
     * - Within DEDUPLICATION_WINDOW_SECONDS of the original
     * 
     * Duplicates are common when employees tap their RFID card multiple times
     * or when network delays cause retransmissions.
     * 
     * @param Collection $events Collection of RfidLedger entries to check
     * @return Collection Events with deduplication flags set
     * 
     * @example
     * $events = $this->pollNewEvents(100);
     * $dedupedEvents = $this->deduplicateEvents($events);
     * // Returns events with is_deduplicated flag set for duplicates
     */
    public function deduplicateEvents(Collection $events): Collection
    {
        if ($events->isEmpty()) {
            return $events;
        }

        // Track seen events: employee_rfid:device_id:event_type => timestamp
        $seenEvents = [];

        return $events->map(function (RfidLedger $event) use (&$seenEvents) {
            $key = "{$event->employee_rfid}:{$event->device_id}:{$event->event_type}";

            if (isset($seenEvents[$key])) {
                // Check if this is within the deduplication window
                $timeDiffSeconds = abs($event->scan_timestamp->diffInSeconds($seenEvents[$key]));

                if ($timeDiffSeconds <= self::DEDUPLICATION_WINDOW_SECONDS) {
                    // Mark as deduplicated tap
                    $event->setAttribute('is_deduplicated', true);
                    $event->setAttribute('dedup_reason', 'duplicate_within_window');

                    return $event;
                }
            }

            // Update seen events with latest timestamp for this key
            $seenEvents[$key] = $event->scan_timestamp;

            // Not a duplicate
            $event->setAttribute('is_deduplicated', false);

            return $event;
        });
    }

    /**
     * Task 5.2.2: Identify duplicate events against existing attendance records.
     * 
     * Check if ledger events already exist in attendance_events table
     * to handle scenarios where events were previously processed.
     * 
     * @param Collection $events Collection of RfidLedger entries to check
     * @return Collection Events with existing_attendance_event_id if duplicate
     */
    public function findExistingAttendanceEvents(Collection $events): Collection
    {
        if ($events->isEmpty()) {
            return $events;
        }

        // Get sequence IDs from events
        $sequenceIds = $events->pluck('sequence_id')->toArray();

        // Find existing attendance events
        $existingEvents = AttendanceEvent::whereIn('ledger_sequence_id', $sequenceIds)
            ->pluck('id', 'ledger_sequence_id');

        return $events->map(function (RfidLedger $event) use ($existingEvents) {
            if (isset($existingEvents[$event->sequence_id])) {
                $event->setAttribute('existing_attendance_event_id', $existingEvents[$event->sequence_id]);
                $event->setAttribute('is_already_processed', true);
            }

            return $event;
        });
    }

    /**
     * Deduplication time window getter.
     * 
     * @return int Time window in seconds
     */
    public static function getDeduplicationWindowSeconds(): int
    {
        return self::DEDUPLICATION_WINDOW_SECONDS;
    }

    /**
     * Get deduplication statistics for a collection of events.
     * 
     * @param Collection $events Collection of deduplicated events
     * @return array Statistics including total, duplicates, unique events
     * 
     * @example
     * $stats = $this->getDeduplicationStats($dedupedEvents);
     * // Returns ['total' => 100, 'duplicates' => 5, 'unique' => 95, 'already_processed' => 2]
     */
    public function getDeduplicationStats(Collection $events): array
    {
        $duplicates = $events->filter(fn($e) => $e->getAttribute('is_deduplicated') === true)->count();
        $alreadyProcessed = $events->filter(fn($e) => $e->getAttribute('is_already_processed') === true)->count();

        return [
            'total' => $events->count(),
            'duplicates' => $duplicates,
            'unique' => $events->count() - $duplicates - $alreadyProcessed,
            'already_processed' => $alreadyProcessed,
        ];
    }

    /**
     * Prepare events for processing by running full pipeline.
     * 
     * Combines polling, deduplication, and existing event checking
     * into a single operation.
     * 
     * Task 5.2.1 + 5.2.2 Combined:
     * 
     * @param int|null $limit Maximum events to process
     * @return array Processed events ready for attendance event creation
     * 
     * @example
     * $result = $this->prepareEventsForProcessing(100);
     * // Returns [
     * //   'events' => [...],
     * //   'stats' => ['total' => 100, 'duplicates' => 5, ...],
     * //   'processable_events' => [...] // Events ready for creating AttendanceEvent
     * // ]
     */
    public function prepareEventsForProcessing(?int $limit = 1000): array
    {
        // Step 1: Poll new events
        $events = $this->pollNewEvents($limit);

        if ($events->isEmpty()) {
            return [
                'events' => collect(),
                'stats' => ['total' => 0, 'duplicates' => 0, 'unique' => 0, 'already_processed' => 0],
                'processable_events' => collect(),
            ];
        }

        // Step 2: Apply deduplication within polling batch
        $dedupedEvents = $this->deduplicateEvents($events);

        // Step 3: Check for existing attendance events
        $checkedEvents = $this->findExistingAttendanceEvents($dedupedEvents);

        // Step 4: Get statistics
        $stats = $this->getDeduplicationStats($checkedEvents);

        // Step 5: Filter to only processable events
        $processableEvents = $checkedEvents->filter(function (RfidLedger $event) {
            // Event is processable if it's:
            // - Not a duplicate within the window
            // - Not already processed as an attendance event
            return !$event->getAttribute('is_deduplicated')
                && !$event->getAttribute('is_already_processed');
        });

        return [
            'events' => $checkedEvents,
            'stats' => $stats,
            'processable_events' => $processableEvents,
        ];
    }

    /**
     * Mark events as processed in the ledger.
     * 
     * After successfully creating attendance events, update the ledger
     * to mark events as processed for next polling cycle.
     * 
     * @param Collection $events Events to mark as processed
     * @param \DateTime|null $processedAt Timestamp for processing (default: now)
     * @return int Number of events updated
     */
    public function markEventsAsProcessed(Collection $events, ?\DateTime $processedAt = null): int
    {
        if ($events->isEmpty()) {
            return 0;
        }

        $processedAt = $processedAt ?? now();
        $sequenceIds = $events->pluck('sequence_id')->toArray();

        return RfidLedger::whereIn('sequence_id', $sequenceIds)
            ->update([
                'processed' => true,
                'processed_at' => $processedAt,
            ]);
    }

    /**
     * Get processing statistics for ledger.
     * 
     * @return array Statistics including unprocessed count, processing lag, etc.
     */
    public function getLedgerStats(): array
    {
        $totalUnprocessed = RfidLedger::unprocessed()->count();
        $lastEntry = RfidLedger::orderBy('sequence_id', 'desc')->first();

        $lag = null;
        if ($lastEntry) {
            $lag = now()->diffInSeconds($lastEntry->created_at);
        }

        $unprocessedWithLag = RfidLedger::unprocessed()
            ->where('created_at', '<', now()->subMinutes(5))
            ->count();

        return [
            'total_unprocessed' => $totalUnprocessed,
            'last_sequence_id' => $lastEntry?->sequence_id,
            'last_scan_timestamp' => $lastEntry?->scan_timestamp,
            'processing_lag_seconds' => $lag,
            'stale_unprocessed_entries' => $unprocessedWithLag, // Entries unprocessed for >5 minutes
        ];
    }
}
