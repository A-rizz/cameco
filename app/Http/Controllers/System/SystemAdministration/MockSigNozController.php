<?php

namespace App\Http\Controllers\System\SystemAdministration;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Mock SigNoz API Controller
 * 
 * This controller simulates the SigNoz Query Service API for local development.
 * It allows testing the System Health dashboard integration without running
 * a full SigNoz/ClickHouse stack in Docker.
 */
class MockSigNozController extends Controller
{
    /**
     * SigNoz Health Check
     */
    public function health()
    {
        return response()->json(['status' => 'ok', 'version' => '0.50.0-mock']);
    }

    /**
     * SigNoz Query Range (Latency, Error Rate)
     */
    public function queryRange(Request $request)
    {
        $query = $request->input('query');
        $end = (int) $request->input('end', now()->timestamp * 1000);
        $start = (int) $request->input('start', $end - 3600000);
        $step = (int) $request->input('step', 60);

        $result = [];

        if (str_contains($query, 'latency')) {
            $result = $this->generateLatencySeries($start, $end, $step);
        } elseif (str_contains($query, 'error_rate')) {
            $result = $this->generateErrorRateSeries($start, $end, $step);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'resultType' => 'matrix',
                'result' => $result,
                'total_errors' => rand(5, 20),
                'total_requests' => rand(1000, 5000),
            ]
        ]);
    }

    /**
     * SigNoz Top Operations (Slow Endpoints)
     */
    public function topOperations(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                [
                    'name' => 'GET /api/v1/assets/search',
                    'p50' => 450000000,
                    'p95' => 1240000000,
                    'p99' => 2100000000,
                    'numCalls' => 156,
                    'errorCount' => 2,
                ],
                [
                    'name' => 'POST /api/v1/reports/compliance',
                    'p50' => 620000000,
                    'p95' => 890000000,
                    'p99' => 1500000000,
                    'numCalls' => 42,
                    'errorCount' => 1,
                ],
                [
                    'name' => 'GET /api/v1/employees/profile',
                    'p50' => 120000000,
                    'p95' => 450000000,
                    'p99' => 980000000,
                    'numCalls' => 890,
                    'errorCount' => 0,
                ],
                [
                    'name' => 'POST /system/backups/trigger',
                    'p50' => 180000000,
                    'p95' => 320000000,
                    'p99' => 850000000,
                    'numCalls' => 12,
                    'errorCount' => 0,
                ],
                [
                    'name' => 'POST /hr/payroll/process',
                    'p50' => 1500000000,
                    'p95' => 2100000000,
                    'p99' => 3500000000,
                    'numCalls' => 5,
                    'errorCount' => 0,
                ]
             ]
        ]);
    }

    /**
     * Generic SigNoz Instant Query (for Host Metrics)
     */
    public function query(Request $request)
    {
        $query = $request->get('query', '');
        
        $value = match(true) {
            str_contains($query, 'cpu') => 25.4 + (sin(now()->timestamp / 100) * 5),
            str_contains($query, 'memory') => 62.1 + (cos(now()->timestamp / 100) * 2),
            str_contains($query, 'filesystem') || str_contains($query, 'storage') => 42.8,
            default => 0,
        };

        return response()->json([
            'status' => 'success',
            'data' => [
                'resultType' => 'vector',
                'result' => [
                    [
                        'metric' => (object)[],
                        'value' => [now()->timestamp, (string) round($value, 2)]
                    ]
                ]
            ]
        ]);
    }

    protected function generateLatencySeries($start, $end, $step)
    {
        $series = [];
        $quantiles = ['0.5', '0.9', '0.99'];
        
        foreach ($quantiles as $q) {
            $values = [];
            for ($t = $start; $t <= $end; $t += $step * 1000) {
                $base = match($q) {
                    '0.5' => 40,
                    '0.9' => 150,
                    '0.99' => 800,
                };
                $values[] = [$t / 1000, (string) ($base + rand(-10, 20) + (sin($t / 100000) * 10))];
            }
            
            $series[] = [
                'metric' => ['quantile' => $q, 'serviceName' => 'cameco-api'],
                'values' => $values
            ];
        }

        return $series;
    }

    protected function generateErrorRateSeries($start, $end, $step)
    {
        $values = [];
        for ($t = $start; $t <= $end; $t += $step * 1000) {
            $val = rand(0, 100) > 95 ? rand(1, 5) : 0.1;
            $values[] = [$t / 1000, (string) $val];
        }

        return [
            [
                'metric' => ['serviceName' => 'cameco-api'],
                'values' => $values
            ]
        ];
    }
}
