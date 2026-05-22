<?php

require __DIR__ . '/../vendor/autoload.php';

// Prevent OpenTelemetry SDK from throwing "Invalid boolean value '1'" warnings during tests
putenv('OTEL_SDK_DISABLED=true');
$_ENV['OTEL_SDK_DISABLED'] = 'true';
$_SERVER['OTEL_SDK_DISABLED'] = 'true';
