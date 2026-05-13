<?php

namespace App\Services\System;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * SigNoz APM Query Client
 *
 * Fetches application performance metrics from the SigNoz Query Service API.
 * SigNoz must be deployed and SIGNOZ_ENABLED=true for this to return real data.
 * When disabled or unreachable it returns safe null-state defaults so the
 * Health dashboard still renders without crashing.
 */
class SigNozClient
{
    protected string $baseUrl;
    protected string $serviceName;
    protected int    $timeout;
    protected bool   $enabled;
    protected bool   $mock;

    public function __construct()
    {
        $this->baseUrl     = rtrim(config('signoz.url', 'http://localhost:8080'), '/');
        $this->serviceName = config('signoz.service_name', 'cameco-api');
        $this->timeout     = (int) config('signoz.timeout', 5);
        $this->enabled     = (bool) config('signoz.enabled', false);
        $this->mock        = (bool) env('SIGNOZ_MOCK', false);
    }

    /**
     * Returns true when SigNoz is enabled and reachable.
     */
    public function isAvailable(): bool
    {
        if ($this->mock) {
            return true;
        }

        if (!$this->enabled) {
            return false;
        }

        try {
            $response = Http::timeout(2)->get("{$this->baseUrl}/api/v1/health");
            return $response->successful();
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * P50/P90/P99 latency for all endpoints over the last N hours.
     *
     * @param  int  $hours  Look-back window (default 24h)
     * @return array{p50: float, p90: float, p99: float, unit: string}
     */
    public function getLatencyPercentiles(int $hours = 24): array
    {
        $defaults = ['p50' => null, 'p90' => null, 'p99' => null, 'unit' => 'ms'];

        if (!$this->enabled) {
            return $defaults;
        }

        try {
            $end   = now()->timestamp * 1000;
            $start = now()->subHours($hours)->timestamp * 1000;

            $response = $this->get('/api/v1/query_range', [
                'query' => "latency({$this->serviceName})",
                'start' => $start,
                'end'   => $end,
                'step'  => 3600,
            ]);

            $data = $response['data']['result'] ?? [];

            return [
                'p50'  => $this->extractPercentile($data, 'p50'),
                'p90'  => $this->extractPercentile($data, 'p90'),
                'p99'  => $this->extractPercentile($data, 'p99'),
                'unit' => 'ms',
            ];
        } catch (\Throwable $e) {
            Log::channel('daily')->warning('SigNoz latency fetch failed', ['error' => $e->getMessage()]);
            return $defaults;
        }
    }

    /**
     * Error rate (%) for the service over the last N hours.
     *
     * @return array{rate: float|null, total_errors: int|null, total_requests: int|null, period_hours: int}
     */
    public function getErrorRate(int $hours = 24): array
    {
        $defaults = ['rate' => null, 'total_errors' => null, 'total_requests' => null, 'period_hours' => $hours];

        if (!$this->enabled) {
            return $defaults;
        }

        try {
            $end   = now()->timestamp * 1000;
            $start = now()->subHours($hours)->timestamp * 1000;

            $response = $this->get('/api/v1/query_range', [
                'query' => "error_rate({$this->serviceName})",
                'start' => $start,
                'end'   => $end,
                'step'  => 3600,
            ]);

            $data   = $response['data']['result'] ?? [];
            $latest = collect($data)->last();

            return [
                'rate'            => isset($latest['value'][1]) ? round((float) $latest['value'][1], 2) : null,
                'total_errors'    => $response['data']['total_errors'] ?? null,
                'total_requests'  => $response['data']['total_requests'] ?? null,
                'period_hours'    => $hours,
            ];
        } catch (\Throwable $e) {
            Log::channel('daily')->warning('SigNoz error rate fetch failed', ['error' => $e->getMessage()]);
            return $defaults;
        }
    }

    /**
     * Top N slowest endpoints by average latency.
     *
     * @return array<array{endpoint: string, method: string, avg_latency_ms: float, calls: int}>
     */
    public function getTopSlowEndpoints(int $limit = 10, int $hours = 24): array
    {
        if (!$this->enabled) {
            return [];
        }

        try {
            $end   = now()->timestamp * 1000;
            $start = now()->subHours($hours)->timestamp * 1000;

            $response = $this->get('/api/v1/top_operations', [
                'service' => $this->serviceName,
                'start'   => $start,
                'end'     => $end,
                'limit'   => $limit,
                'orderBy' => 'latency',
            ]);

            return collect($response['data'] ?? [])
                ->map(fn($op) => [
                    'endpoint'        => $op['name'] ?? $op['operation'] ?? 'unknown',
                    'method'          => $op['spanKind'] ?? '',
                    'avg_latency_ms'  => round((float) ($op['avgDuration'] ?? 0) / 1_000_000, 2), // ns → ms
                    'calls'           => (int) ($op['numCalls'] ?? 0),
                ])
                ->sortByDesc('avg_latency_ms')
                ->values()
                ->toArray();
        } catch (\Throwable $e) {
            Log::channel('daily')->warning('SigNoz slow endpoints fetch failed', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Host-level infrastructure metrics (CPU, Memory, Storage) from SigNoz.
     *
     * @return array{cpu: float|null, memory: float|null, storage: float|null}
     */
    public function getHostMetrics(): array
    {
        $defaults = ['cpu' => null, 'memory' => null, 'storage' => null];

        if (!$this->enabled && !$this->mock) {
            return $defaults;
        }

        if ($this->mock) {
            return [
                'cpu'     => round(25.4 + (sin(now()->timestamp / 100) * 5), 2),
                'memory'  => round(62.1 + (cos(now()->timestamp / 100) * 2), 2),
                'storage' => 42.8,
            ];
        }

        try {
            // These PromQL-like queries depend on the 'hostmetrics' receiver being active in the OTEL collector
            return [
                'cpu'     => $this->queryInstantValue("avg(system_cpu_utilization) * 100"),
                'memory'  => $this->queryInstantValue("(avg(system_memory_usage{state='used'}) / avg(system_memory_usage)) * 100"),
                'storage' => $this->queryInstantValue("avg(system_filesystem_utilization) * 100"),
            ];
        } catch (\Throwable $e) {
            Log::channel('daily')->warning('SigNoz host metrics fetch failed', ['error' => $e->getMessage()]);
            return $defaults;
        }
    }

    protected function queryInstantValue(string $query): ?float
    {
        $response = $this->get('/api/v1/query', ['query' => $query]);
        $value = $response['data']['result'][0]['value'][1] ?? null;
        return $value !== null ? round((float) $value, 2) : null;
    }

    /**
     * Overall service summary for the health dashboard.
     */
    public function getServiceSummary(): array
    {
        if ($this->mock) {
            return [
                'available'      => true,
                'service'        => $this->serviceName . ' (Mock Mode)',
                'dashboard_url'  => '#',
                'latency'        => ['p50' => 42.5, 'p90' => 156.2, 'p99' => 892.4, 'unit' => 'ms'],
                'error_rate'     => ['rate' => 0.45, 'total_errors' => 12, 'total_requests' => 2650, 'period_hours' => 24],
                'slow_endpoints' => [
                    ['endpoint' => '/api/v1/assets/search', 'method' => 'GET', 'avg_latency_ms' => 1240.5, 'calls' => 156],
                    ['endpoint' => '/api/v1/reports/compliance', 'method' => 'POST', 'avg_latency_ms' => 890.2, 'calls' => 42],
                    ['endpoint' => '/api/v1/employees/profile', 'method' => 'GET', 'avg_latency_ms' => 450.1, 'calls' => 890],
                ],
            ];
        }

        return [
            'available'      => $this->isAvailable(),
            'service'        => $this->serviceName,
            'dashboard_url'  => str_replace(':8080', ':3301', $this->baseUrl),
            'latency'        => $this->getLatencyPercentiles(),
            'error_rate'     => $this->getErrorRate(),
            'slow_endpoints' => $this->getTopSlowEndpoints(),
        ];
    }

    // ── Private helpers ────────────────────────────────────────────────────

    protected function get(string $path, array $params = []): array
    {
        $apiKey = config('signoz.api_key');

        $request = Http::timeout($this->timeout)
            ->baseUrl($this->baseUrl);

        if ($apiKey) {
            $request = $request->withToken($apiKey);
        }

        $response = $request->get($path, $params);
        $response->throw();

        return $response->json();
    }

    protected function extractPercentile(array $data, string $percentile): ?float
    {
        $series = collect($data)->firstWhere('metric.quantile', match ($percentile) {
            'p50' => '0.5',
            'p90' => '0.9',
            'p99' => '0.99',
            default => null,
        });

        if (!$series) {
            return null;
        }

        $latest = collect($series['values'] ?? [])->last();

        return $latest ? round((float) $latest[1], 2) : null;
    }
}
