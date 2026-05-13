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
use Illuminate\Support\Facades\Storage;

class ProcessBackupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 600; // 10 minutes

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
            // Ensure disks are configured
            if (!empty($this->disks)) {
                config(['backup.backup.destination.disks' => $this->disks]);
            }

            // Capture output for debugging
            $exitCode = Artisan::call('backup:run', [
                '--only-db' => true,
                '--no-interaction' => true,
            ]);

            $output = Artisan::output();
            
            // Check if any file was actually created in the local disk
            $appName = config('backup.backup.name');
            $files = Storage::disk('local')->files($appName);
            
            // If exit code is not 0, it failed
            if ($exitCode !== 0) {
                 throw new \Exception("Backup command failed with exit code {$exitCode}. Output: " . $output);
            }

            // Verify if a new file appeared (rough check)
            if (empty($files)) {
                // If it's empty, maybe it's only on S3? But we usually expect it on local too.
                // Let's check S3 if it was requested.
                $foundOnAny = false;
                foreach ($this->disks as $disk) {
                    if (!empty(Storage::disk($disk)->files($appName))) {
                        $foundOnAny = true;
                        break;
                    }
                }
                
                if (!$foundOnAny) {
                    throw new \Exception("Backup command finished but no files were found on the requested disks. Output: " . $output);
                }
            }

            $this->backupLog->update([
                'status' => 'completed',
                'completed_at' => now(),
                'metadata' => array_merge($this->backupLog->metadata ?? [], [
                    'artisan_output' => $output,
                    'exit_code' => $exitCode
                ]),
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
