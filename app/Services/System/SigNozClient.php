<?php

namespace App\Services\System;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

/**
 * Client for interacting with SigNoz Query Service API.
 * 
 * Updated to use SigNoz v2 API (top_operations) which provides 
 * aggregated latency, error rates, and request counts per service.
 */
class SigNozClient
{
    protected string $baseUrl;
    protected string $serviceName;
    protected int $timeout;
    protected bool $enabled;

    public function __construct()
    {
        $this->baseUrl = config('signoz.url', 'http://localhost:8080');
        $this->serviceName = config('signoz.service_name', 'cameco-api');
        $this->timeout = config('signoz.timeout', 5);
        $this->enabled = config('signoz.enabled', false);
    }

    /**
     * Check if the SigNoz API is reachable and responding.
     */
    public function isAvailable(): bool
    {
        if (!$this->enabled) return false;

        try {
            $response = Http::timeout(2)
                ->baseUrl($this->baseUrl)
                ->withHeaders(['SIGNOZ-API-KEY' => config('signoz.api_key')])
                ->get('/api/v1/health');
            
            return $response->successful() && ($response->json()['status'] ?? '') === 'ok';
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Get aggregated service performance summary.
     */
    public function getServiceSummary(int $hours = 24): array
    {
        if (!$this->enabled) {
            return $this->getDefaultSummary();
        }

        $ops = $this->getTopOperations($hours);

        return [
            'available'      => $this->isAvailable(),
            'service'        => $this->serviceName,
            'dashboard_url'  => 'http://' . request()->getHost() . ':8080',
            'latency'        => $this->calculateLatencyMetrics($ops),
            'error_rate'     => $this->calculateErrorMetrics($ops, $hours),
            'slow_endpoints' => $this->formatSlowEndpoints($ops),
        ];
    }

    /**
     * Fetch top operations from SigNoz v2 API.
     */
    protected function getTopOperations(int $hours = 24): array
    {
        try {
            $end = now()->timestamp * 1000;
            $start = now()->subHours($hours)->timestamp * 1000;

            $response = Http::timeout($this->timeout)
                ->baseUrl($this->baseUrl)
                ->withHeaders(['SIGNOZ-API-KEY' => config('signoz.api_key')])
                ->post('/api/v2/service/top_operations', [
                    'start' => (string) $start,
                    'end' => (string) $end,
                    'service' => $this->serviceName,
                    'tags' => [],
                    'limit' => 50,
                ]);

            return $response->json()['data'] ?? [];
        } catch (\Throwable $e) {
            Log::channel('daily')->warning('SigNoz API call failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    protected function calculateLatencyMetrics(array $ops): array
    {
        $totalCalls = collect($ops)->sum('numCalls');
        if ($totalCalls === 0) {
            return ['p50' => null, 'p90' => null, 'p99' => null, 'unit' => 'ms'];
        }

        // Weighted average of latency across all operations
        $p50 = collect($ops)->sum(fn($op) => ($op['p50'] / 1000000) * $op['numCalls']) / $totalCalls;
        $p95 = collect($ops)->sum(fn($op) => ($op['p95'] / 1000000) * $op['numCalls']) / $totalCalls;
        $p99 = collect($ops)->sum(fn($op) => ($op['p99'] / 1000000) * $op['numCalls']) / $totalCalls;

        return [
            'p50' => round($p50, 2),
            'p90' => round($p95, 2), // v2 API returns p95
            'p99' => round($p99, 2),
            'unit' => 'ms',
        ];
    }

    protected function calculateErrorMetrics(array $ops, int $hours): array
    {
        $totalRequests = collect($ops)->sum('numCalls');
        $totalErrors = collect($ops)->sum('errorCount');
        $rate = $totalRequests > 0 ? ($totalErrors / $totalRequests) * 100 : 0;

        return [
            'rate' => round($rate, 2),
            'total_errors' => (int) $totalErrors,
            'total_requests' => (int) $totalRequests,
            'period_hours' => $hours,
        ];
    }

    protected function formatSlowEndpoints(array $ops, int $limit = 5): array
    {
        return collect($ops)
            // Filter out noise like internal bootstrap or broad DB queries
            ->filter(fn($op) => !in_array($op['name'], ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'app bootstrap']))
            ->sortByDesc('p95')
            ->take($limit)
            ->map(function($op) {
                $parts = explode(' ', $op['name'], 2);
                return [
                    'method' => count($parts) > 1 ? $parts[0] : 'GET',
                    'endpoint' => count($parts) > 1 ? $parts[1] : $parts[0],
                    'avg_latency_ms' => round($op['p50'] / 1000000, 2),
                    'calls' => $op['numCalls'],
                ];
            })
            ->values()
            ->toArray();
    }

    protected function getDefaultSummary(): array
    {
        return [
            'available' => false,
            'service' => $this->serviceName,
            'latency' => ['p50' => null, 'p90' => null, 'p99' => null, 'unit' => 'ms'],
            'error_rate' => ['rate' => null, 'total_errors' => null, 'total_requests' => null, 'period_hours' => 24],
            'slow_endpoints' => [],
        ];
    }

    /**
     * Infrastructure metrics (CPU/Mem/Disk) from SigNoz query service.
     */
    public function getHostMetrics(): array
    {
        if (!$this->enabled) return ['cpu' => null, 'memory' => null, 'storage' => null];

        try {
            return [
                'cpu'     => $this->queryInstantValue("avg(system_cpu_utilization) * 100"),
                'memory'  => $this->queryInstantValue("(avg(system_memory_usage{state='used'}) / avg(system_memory_usage)) * 100"),
                'storage' => $this->queryInstantValue("avg(system_filesystem_utilization) * 100"),
            ];
        } catch (\Throwable $e) {
            return ['cpu' => null, 'memory' => null, 'storage' => null];
        }
    }

    protected function queryInstantValue(string $query): ?float
    {
        try {
            $response = Http::timeout(2)
                ->baseUrl($this->baseUrl)
                ->withHeaders(['SIGNOZ-API-KEY' => config('signoz.api_key')])
                ->get('/api/v1/query', ['query' => $query]);
            
            $value = $response->json()['data']['result'][0]['value'][1] ?? null;
            return $value !== null ? round((float) $value, 2) : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
