<?php

namespace App\Jobs\System;

use App\Models\SystemBackupLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class ProcessBackupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public SystemBackupLog $backupLog,
        public array $disks = ['local']
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Update config dynamically for this run if needed, 
            // though spatie/laravel-backup is usually configured via config file.
            // We'll rely on the config('backup.destination.disks') being set in config/backup.php,
            // or we can try to override it if the user chose specific disks.
            
            if (!empty($this->disks)) {
                config(['backup.backup.destination.disks' => $this->disks]);
            }

            Artisan::call('backup:run', ['--only-db' => true]);

            $this->backupLog->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            Log::channel('daily')->info("Manual backup #{$this->backupLog->id} completed successfully.");
            
        } catch (\Exception $e) {
            $this->backupLog->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            Log::channel('daily')->error("Manual backup #{$this->backupLog->id} failed: " . $e->getMessage());
        }
    }
}
