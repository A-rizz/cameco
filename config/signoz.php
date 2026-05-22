<?php

return [
    /*
    |--------------------------------------------------------------------------
    | SigNoz APM Configuration
    |--------------------------------------------------------------------------
    |
    | SigNoz is a self-hosted OpenTelemetry APM deployed on your Ubuntu server.
    | The Query Service API is used to fetch metrics for the health dashboard.
    |
    | Deploy SigNoz on Ubuntu:
    |   git clone https://github.com/SigNoz/signoz.git
    |   cd signoz/deploy && ./install.sh
    |
    | UI runs on port 3301, OTLP receiver on 4318 (HTTP) / 4317 (gRPC).
    |
    */

    'enabled'      => env('SIGNOZ_ENABLED', false),
    'url'          => env('SIGNOZ_URL', 'http://localhost:8080'),
    'api_key'      => env('SIGNOZ_API_KEY', ''),
    'service_name' => env('OTEL_SERVICE_NAME', 'cameco-api'),
    'timeout'      => env('SIGNOZ_TIMEOUT', 5), // seconds

    /*
    | OTLP exporter (for sending traces FROM Laravel TO SigNoz)
    */
    'otlp_endpoint' => env('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4318'),
];
