<?php

namespace Tests\Unit\Services\Timekeeping;

use Tests\TestCase;
use App\Models\RfidLedger;
use App\Models\AttendanceEvent;
use App\Models\Employee;
use App\Services\Timekeeping\LedgerPollingService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * LedgerPollingServiceTest
 * 
 * Unit tests for LedgerPollingService
 * Tests Task 5.2.1 (polling) and Task 5.2.2 (deduplication)
 */
class LedgerPollingServiceTest extends TestCase
{
    use RefreshDatabase;

    private LedgerPollingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new LedgerPollingService();
    }

    /**
     * Task 5.2.1: Test pollNewEvents fetches unprocessed entries
     */
    public function test_poll_new_events_fetches_unprocessed_entries(): void
    {
        // Create some ledger entries: processed and unprocessed
        RfidLedger::factory()->processed()->create();
        RfidLedger::factory()->processed()->create();
        
        RfidLedger::factory()->unprocessed()->create();
        RfidLedger::factory()->unprocessed()->create();
        RfidLedger::factory()->unprocessed()->create();

        // Poll new events
        $events = $this->service->pollNewEvents();

        // Should only return unprocessed events
        $this->assertCount(3, $events);
        $this->assertTrue($events->every(fn($e) => !$e->processed));
    }

    /**
     * Task 5.2.1: Test pollNewEvents respects limit
     */
    public function test_poll_new_events_respects_limit(): void
    {
        // Create 10 unprocessed entries
        RfidLedger::factory()->unprocessed()->count(10)->create();

        // Poll with limit of 5
        $events = $this->service->pollNewEvents(5);

        $this->assertCount(5, $events);
    }

    /**
     * Task 5.2.1: Test pollNewEvents returns events in sequence order
     */
    public function test_poll_new_events_ordered_by_sequence(): void
    {
        // Create unprocessed entries with specific sequence IDs
        RfidLedger::factory()->unprocessed()->create(['sequence_id' => 100]);
        RfidLedger::factory()->unprocessed()->create(['sequence_id' => 105]);
        RfidLedger::factory()->unprocessed()->create(['sequence_id' => 101]);

        $events = $this->service->pollNewEvents();

        // Should be ordered by sequence_id ascending
        $sequences = $events->pluck('sequence_id')->toArray();
        $this->assertEquals([100, 101, 105], $sequences);
    }

    /**
     * Task 5.2.2: Test deduplicateEvents detects duplicates within window
     */
    public function test_deduplicate_events_detects_duplicates_within_window(): void
    {
        $now = Carbon::now();

        // Create two similar events within 15-second window
        $event1 = new RfidLedger([
            'sequence_id' => 1,
            'employee_rfid' => 'RFID001',
            'device_id' => 'DEVICE001',
            'event_type' => 'time_in',
            'scan_timestamp' => $now,
            'raw_payload' => [],
            'hash_chain' => 'hash1',
            'processed' => false,
        ]);

        $event2 = new RfidLedger([
            'sequence_id' => 2,
            'employee_rfid' => 'RFID001',
            'device_id' => 'DEVICE001',
            'event_type' => 'time_in',
            'scan_timestamp' => $now->copy()->addSeconds(10), // 10 seconds later
            'raw_payload' => [],
            'hash_chain' => 'hash2',
            'processed' => false,
        ]);

        $events = collect([$event1, $event2]);
        $deduped = $this->service->deduplicateEvents($events);

        // First should not be marked as duplicate
        $this->assertFalse($deduped[0]->getAttribute('is_deduplicated'));

        // Second should be marked as duplicate (within 15-second window)
        $this->assertTrue($deduped[1]->getAttribute('is_deduplicated'));
    }

    /**
     * Task 5.2.2: Test deduplicateEvents allows different employees
     */
    public function test_deduplicate_events_allows_different_employees(): void
    {
        $now = Carbon::now();

        $event1 = new RfidLedger([
            'sequence_id' => 1,
            'employee_rfid' => 'RFID001',
            'device_id' => 'DEVICE001',
            'event_type' => 'time_in',
            'scan_timestamp' => $now,
            'raw_payload' => [],
            'hash_chain' => 'hash1',
            'processed' => false,
        ]);

        $event2 = new RfidLedger([
            'sequence_id' => 2,
            'employee_rfid' => 'RFID002', // Different employee
            'device_id' => 'DEVICE001',
            'event_type' => 'time_in',
            'scan_timestamp' => $now->copy()->addSeconds(5),
            'raw_payload' => [],
            'hash_chain' => 'hash2',
            'processed' => false,
        ]);

        $events = collect([$event1, $event2]);
        $deduped = $this->service->deduplicateEvents($events);

        // Both should NOT be duplicates (different employees)
        $this->assertFalse($deduped[0]->getAttribute('is_deduplicated'));
        $this->assertFalse($deduped[1]->getAttribute('is_deduplicated'));
    }

    /**
     * Task 5.2.2: Test deduplicateEvents respects time window boundary
     */
    public function test_deduplicate_events_respects_time_window(): void
    {
        $now = Carbon::now();

        $event1 = new RfidLedger([
            'sequence_id' => 1,
            'employee_rfid' => 'RFID001',
            'device_id' => 'DEVICE001',
            'event_type' => 'time_in',
            'scan_timestamp' => $now,
            'raw_payload' => [],
            'hash_chain' => 'hash1',
            'processed' => false,
        ]);

        $event2 = new RfidLedger([
            'sequence_id' => 2,
            'employee_rfid' => 'RFID001',
            'device_id' => 'DEVICE001',
            'event_type' => 'time_in',
            'scan_timestamp' => $now->copy()->addSeconds(16), // 16 seconds later (outside window)
            'raw_payload' => [],
            'hash_chain' => 'hash2',
            'processed' => false,
        ]);

        $events = collect([$event1, $event2]);
        $deduped = $this->service->deduplicateEvents($events);

        // Both should NOT be duplicates (outside 15-second window)
        $this->assertFalse($deduped[0]->getAttribute('is_deduplicated'));
        $this->assertFalse($deduped[1]->getAttribute('is_deduplicated'));
    }

    /**
     * Task 5.2.2: Test getDeduplicationStats
     */
    public function test_get_deduplication_stats(): void
    {
        $now = Carbon::now();

        // Create events with different dedup states
        $events = collect([
            (new RfidLedger())->setAttribute('is_deduplicated', false)->setAttribute('is_already_processed', false),
            (new RfidLedger())->setAttribute('is_deduplicated', true)->setAttribute('is_already_processed', false),
            (new RfidLedger())->setAttribute('is_deduplicated', false)->setAttribute('is_already_processed', true),
            (new RfidLedger())->setAttribute('is_deduplicated', false)->setAttribute('is_already_processed', false),
        ]);

        $stats = $this->service->getDeduplicationStats($events);

        $this->assertEquals(4, $stats['total']);
        $this->assertEquals(1, $stats['duplicates']);
        $this->assertEquals(2, $stats['unique']);
        $this->assertEquals(1, $stats['already_processed']);
    }

    /**
     * Task 5.2.1 & 5.2.2: Test prepareEventsForProcessing pipeline
     */
    public function test_prepare_events_for_processing_pipeline(): void
    {
        // Create test ledger entries
        RfidLedger::factory()->unprocessed()->count(5)->create();

        $result = $this->service->prepareEventsForProcessing(10);

        $this->assertArrayHasKey('events', $result);
        $this->assertArrayHasKey('stats', $result);
        $this->assertArrayHasKey('processable_events', $result);

        $this->assertGreaterThan(0, $result['stats']['total']);
        $this->assertLessThanOrEqual($result['stats']['unique'], $result['processable_events']->count());
    }
}
