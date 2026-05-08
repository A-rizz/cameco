<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HR Analytics Report</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0 0;
            color: #64748b;
            font-size: 14px;
        }
        .section-title {
            background-color: #f1f5f9;
            padding: 8px 15px;
            font-weight: bold;
            font-size: 16px;
            margin-top: 30px;
            margin-bottom: 15px;
            border-left: 4px solid #2563eb;
        }
        .stats-grid {
            width: 100%;
            margin-bottom: 30px;
        }
        .stats-card {
            width: 48%;
            display: inline-block;
            margin-bottom: 15px;
            vertical-align: top;
        }
        .stats-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: bold;
        }
        .stats-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th {
            background-color: #f8fafc;
            text-align: left;
            padding: 12px;
            border-bottom: 2px solid #e2e8f0;
            font-size: 12px;
            text-transform: uppercase;
            color: #64748b;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            padding-bottom: 20px;
        }
        .badge {
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-active { background-color: #dcfce7; color: #166534; }
        .badge-inactive { background-color: #f1f5f9; color: #475569; }
    </style>
</head>
<body>
    <div class="header">
        <h1>HR Analytics Report</h1>
        <p>Generated on {{ $date }}</p>
    </div>

    <div class="section-title">Executive Summary</div>
    <div class="stats-grid">
        <div class="stats-card">
            <div class="stats-label">Total Employees</div>
            <div class="stats-value">{{ $metrics['total_employees'] }}</div>
        </div>
        <div class="stats-card">
            <div class="stats-label">Active Employees</div>
            <div class="stats-value">{{ $metrics['active_employees'] }}</div>
        </div>
        <div class="stats-card">
            <div class="stats-label">Turnover Rate</div>
            <div class="stats-value">{{ number_format($metrics['turnover_rate'], 1) }}%</div>
        </div>
        <div class="stats-card">
            <div class="stats-label">Avg Tenure</div>
            <div class="stats-value">{{ $metrics['average_employment_duration'] }} Months</div>
        </div>
    </div>

    <div class="section-title">Department Distribution</div>
    <table>
        <thead>
            <tr>
                <th>Department</th>
                <th style="text-align: right;">Headcount</th>
                <th style="text-align: right;">Percentage</th>
            </tr>
        </thead>
        <tbody>
            @foreach($metrics['employees_by_department'] as $dept)
            <tr>
                <td>{{ $dept['name'] }} ({{ $dept['code'] }})</td>
                <td style="text-align: right;">{{ $dept['employee_count'] }}</td>
                <td style="text-align: right;">{{ $dept['percentage'] }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Employee Status Breakdown</div>
    <table>
        <thead>
            <tr>
                <th>Status</th>
                <th style="text-align: right;">Count</th>
                <th style="text-align: right;">Percentage</th>
            </tr>
        </thead>
        <tbody>
            @foreach($metrics['employee_status_breakdown'] as $status)
            <tr>
                <td>{{ $status['status'] }}</td>
                <td style="text-align: right;">{{ $status['count'] }}</td>
                <td style="text-align: right;">{{ $status['percentage'] }}%</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        Confidential - HR Department Report - Generated by Cameco HR Portal
    </div>
</body>
</html>
