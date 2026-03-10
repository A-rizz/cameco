<?php

namespace App\Console\Commands\Timekeeping;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * CleanupDeduplicationCacheCommand
 * 
 * Removes expired entries from the event deduplication cache.
 * Scheduled to run every 5 minutes.
 * 
 * Phase 6, Task 6.1.2: Supporting scheduled command
 * 
 * @package App\Console\Commands\Timekeeping
 */
class CleanupDeduplicationCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'timekeeping:cleanup-deduplication-cache
                            {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up expired deduplication cache entries from the database';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting deduplication cache cleanup...');

        try {
            // Delete entries older than 1 hour (well past the 15-second window)
            $expirationThreshold = Carbon::now()->subHour();

            $deletedCount = DB::table('attendance_events')
                ->where('is_deduplicated', true)
                ->where('created_at', '<', $expirationThreshold)
                ->delete();

            if ($deletedCount > 0) {
                $this->info("✓ Cleaned up {$deletedCount} expired deduplication entries");
            } else {
                $this->comment('No expired entries found to clean up');
            }

            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Failed to clean up deduplication cache: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
