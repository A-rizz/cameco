<?php

namespace App\Console\Commands\System;

use App\Services\System\SystemHealthService;
use App\Repositories\Contracts\System\SystemHealthRepositoryInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RecordHealthMetricsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:record-health';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Record current system health metrics to the database for historical tracking';

    /**
     * Execute the console command.
     */
    public function handle(SystemHealthService $healthService, SystemHealthRepositoryInterface $repository): int
    {
        $this->info('Gathering system health metrics...');

        try {
            $server  = $healthService->getServerHealthMetrics();
            $db      = $healthService->getDatabaseMetrics();
            $storage = $healthService->getStorageMetrics();
            $queue   = $healthService->getQueueMetrics();
            $cache   = $healthService->getCacheMetrics();

            $data = [
                'cpu_usage'            => $server['cpu_usage'],
                'memory_usage'         => $server['memory_usage'],
                'disk_usage'           => $storage['usage_percentage'],
                'load_average'         => $server['load_average'],
                'uptime_seconds'       => $server['uptime'],
                'database_response_ms' => $db['response_time_ms'],
                'cache_status'         => $cache['status'],
                'queue_pending'        => $queue['pending_jobs'],
                'queue_failed'         => $queue['failed_jobs'],
                'overall_status'       => $server['status'],
            ];

            $repository->createHealthLog($data);

            $this->success('Health metrics recorded successfully.');
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to record health metrics: ' . $e->getMessage());
            Log::error('Health Metrics Recording Failed', ['error' => $e->getMessage()]);
            
            return Command::FAILURE;
        }
    }

    /**
     * Helper to output success message with color
     */
    protected function success(string $message): void
    {
        $this->line("<info>SUCCESS</info> $message");
    }
}
