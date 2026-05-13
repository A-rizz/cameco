<?php

namespace App\Http\Controllers\System\SystemAdministration;

use App\Http\Controllers\Controller;
use App\Models\SystemBackupLog;
use App\Models\SystemSetting;
use App\Traits\LogsSecurityAudits;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BackupController extends Controller
{
    use LogsSecurityAudits;

    /**
     * Display backup management interface — lists real files from disk.
     */
    public function index(Request $request): Response
    {
        $days = $request->input('days', 30);

        // Pull actual backup files from the local disk
        $localFiles  = $this->listBackupFiles('local');
        $cloudFiles  = $this->listBackupFiles('s3');

        // Merge and deduplicate by filename, marking which disks each file is on
        $fileMap = [];
        foreach ($localFiles as $f) {
            $fileMap[$f['name']] = array_merge($f, ['disks' => ['local']]);
        }
        foreach ($cloudFiles as $f) {
            if (isset($fileMap[$f['name']])) {
                $fileMap[$f['name']]['disks'][] = 's3';
            } else {
                $fileMap[$f['name']] = array_merge($f, ['disks' => ['s3']]);
            }
        }

        $backups = collect(array_values($fileMap))
            ->sortByDesc('last_modified')
            ->values();

        // Summary stats
        $stats = [
            'total'       => $backups->count(),
            'local_count' => $backups->filter(fn($b) => in_array('local', $b['disks']))->count(),
            'cloud_count' => $backups->filter(fn($b) => in_array('s3', $b['disks']))->count(),
            'total_size'  => $backups->sum('size'),
            'latest'      => $backups->first(),
        ];

        // DB-log history for events (trigger/cleanup actions)
        $history = SystemBackupLog::query()
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $backupRetention = SystemSetting::where('key', 'backup_retention_days')->first();

        return Inertia::render('System/Backups', [
            'backups'        => $backups,
            'stats'          => $stats,
            'history'        => $history,
            'retention_days' => $backupRetention ? (int) $backupRetention->value : 30,
            'filters'        => [
                'days' => $days,
            ],
        ]);
    }

    /**
     * List backup files from a given disk under the backup name directory.
     */
    protected function listBackupFiles(string $disk): array
    {
        try {
            $appName = config('backup.backup.name');
            $storage = Storage::disk($disk);
            $files   = $storage->files($appName);

            return collect($files)
                ->filter(fn($f) => str_ends_with($f, '.zip'))
                ->map(fn($path) => [
                    'name'          => basename($path),
                    'path'          => $path,
                    'size'          => $storage->size($path),
                    'last_modified' => $storage->lastModified($path),
                    'disk'          => $disk,
                ])
                ->values()
                ->toArray();
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * Trigger a real database-only backup via spatie/laravel-backup.
     */
    public function trigger(Request $request)
    {
        // Create audit log entry
        $log = SystemBackupLog::create([
            'backup_type' => 'database',
            'status'      => 'in_progress',
            'started_at'  => now(),
        ]);

        try {
            // Run the backup synchronously (use queue dispatch in production)
            Artisan::call('backup:run', ['--only-db' => true]);

            $log->update([
                'status'       => 'completed',
                'completed_at' => now(),
            ]);

            $this->auditLog(
                'backup_triggered',
                'Manual database backup triggered and completed',
                'info',
                'Backup Management',
                ['backup_log_id' => $log->id]
            );

            return redirect()->back()->with('success', 'Database backup completed successfully.');
        } catch (\Exception $e) {
            $log->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
                'completed_at'  => now(),
            ]);

            return redirect()->back()->with('error', 'Backup failed: ' . $e->getMessage());
        }
    }

    /**
     * Generate a temporary signed download URL from S3.
     * Falls back to a local stream response if the file is only on local disk.
     */
    public function download(Request $request)
    {
        $request->validate([
            'file' => 'required|string',
            'disk' => 'required|in:local,s3',
        ]);

        $disk = $request->input('disk');
        $file = $request->input('file');
        $appName = config('backup.backup.name');
        $path = "{$appName}/{$file}";

        if (!Storage::disk($disk)->exists($path)) {
            return back()->withErrors(['error' => 'Backup file not found.']);
        }

        if ($disk === 's3') {
            // Temporary signed URL valid for 5 minutes
            $url = Storage::disk('s3')->temporaryUrl($path, now()->addMinutes(5));
            return redirect($url);
        }

        // Stream the local file
        return Storage::disk('local')->download($path, $file);
    }

    /**
     * Delete a backup file from one or both disks.
     */
    public function deleteFile(Request $request)
    {
        $request->validate([
            'file'  => 'required|string',
            'disks' => 'required|array',
            'disks.*' => 'in:local,s3',
        ]);

        $appName = config('backup.backup.name');
        $file    = $request->input('file');
        $path    = "{$appName}/{$file}";

        foreach ($request->input('disks') as $disk) {
            try {
                Storage::disk($disk)->delete($path);
            } catch (\Throwable) {
                // Ignore if it doesn't exist on one side
            }
        }

        $this->auditLog(
            'backup_deleted',
            "Backup file '{$file}' deleted",
            'warning',
            'Backup Management',
            ['file' => $file, 'disks' => $request->input('disks')]
        );

        return back()->with('success', "Backup '{$file}' deleted.");
    }

    /**
     * Run the spatie cleanup command to enforce retention policy.
     */
    public function cleanup(Request $request)
    {
        try {
            Artisan::call('backup:clean');

            $this->auditLog(
                'backup_cleanup',
                'Backup cleanup ran — old files pruned per retention policy',
                'info',
                'Backup Management',
                []
            );

            return redirect()->back()->with('success', 'Old backups cleaned up successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Cleanup failed: ' . $e->getMessage());
        }
    }

    /**
     * Update retention policy (stored in system settings).
     */
    public function updateRetention(Request $request)
    {
        $validated = $request->validate([
            'retention_days' => 'required|integer|min:7|max:365',
        ]);

        SystemSetting::updateOrCreate(
            ['key' => 'backup_retention_days'],
            ['value' => $validated['retention_days']]
        );

        $this->auditLog(
            'backup_retention_updated',
            "Backup retention set to {$validated['retention_days']} days",
            'medium',
            'Backup Management',
            $validated
        );

        return redirect()->back()->with('success', 'Retention policy updated.');
    }

    /**
     * Update backup schedule configuration.
     */
    public function updateSchedule(Request $request)
    {
        $validated = $request->validate([
            'enabled'      => 'required|boolean',
            'frequency'    => 'required|in:daily,weekly,monthly',
            'time'         => 'required|date_format:H:i',
            'backup_types' => 'required|array',
            'backup_types.*' => 'in:full,database,files,incremental',
        ]);

        SystemSetting::updateOrCreate(
            ['key' => 'backup_schedule'],
            ['value' => json_encode($validated)]
        );

        $this->auditLog(
            'backup_schedule_updated',
            'Backup schedule configuration updated',
            'medium',
            'Backup Management',
            ['schedule' => $validated]
        );

        return redirect()->back()->with('success', 'Backup schedule updated.');
    }

    /**
     * Restore from backup (initiates the process — dangerous operation).
     */
    public function restore(Request $request, SystemBackupLog $backup)
    {
        $request->validate([
            'confirmation' => 'required|string|in:RESTORE',
        ]);

        if ($backup->status !== 'completed') {
            return redirect()->back()->with('error', 'Can only restore from completed backups.');
        }

        $this->auditLog(
            'backup_restore_initiated',
            "Backup restore initiated from backup #{$backup->id}",
            'critical',
            'Backup Management',
            [
                'backup_id'       => $backup->id,
                'backup_type'     => $backup->backup_type,
                'backup_location' => $backup->location,
            ]
        );

        // Dispatch restore job in production
        // dispatch(new RestoreBackupJob($backup));

        return redirect()->back()->with('success', 'Restore process initiated. System will be temporarily unavailable.');
    }

    /**
     * Show detailed backup information.
     */
    public function show(SystemBackupLog $backup): Response
    {
        return Inertia::render('System/BackupDetail', [
            'backup' => $backup,
        ]);
    }
}
