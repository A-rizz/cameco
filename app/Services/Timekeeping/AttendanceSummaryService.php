<?php

namespace App\Services\Timekeeping;

use App\Models\AttendanceEvent;
use App\Models\DailyAttendanceSummary;
use App\Models\Employee;
use App\Models\WorkSchedule;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * AttendanceSummaryService
 * 
 * Computes daily attendance summaries from ledger events and applies business rules.
 * Task 5.3.1 & 5.3.2: Attendance summary computation and business rule application
 * 
 * Business Rules:
 * - Late: time_in > scheduled_start + grace_period (default 15 minutes)
 * - Absent: no time_in event by scheduled end time
 * - Overtime: time_out > scheduled_end + overtime_threshold
 * - Present: employee clocked in within grace period
 */
class AttendanceSummaryService
{
    /**
     * Grace period for "on-time" arrival in minutes
     * Default: 15 minutes
     */
    const GRACE_PERIOD_MINUTES = 15;

    /**
     * Overtime threshold in minutes
     * Default: 0 (any time after scheduled end is overtime)
     */
    const OVERTIME_THRESHOLD_MINUTES = 0;

    /**
     * Task 5.3.1: Compute daily attendance summary for employee on specific date.
     * 
     * Fetches all attendance events for the date, calculates time metrics,
     * and determines attendance status (present, late, absent, etc).
     * 
     * @param int $employeeId Employee ID
     * @param \Carbon\Carbon $date Attendance date
     * @return array Summary data including times, durations, and status flags
     * 
     * @example
     * $summary = $this->computeDailySummary(1, Carbon::parse('2024-01-15'));
     * // Returns:
     * // [
     * //     'employee_id' => 1,
     * //     'attendance_date' => '2024-01-15',
     * //     'time_in' => '2024-01-15 08:05:00',
     * //     'time_out' => '2024-01-15 17:30:00',
     * //     'total_hours_worked' => 9.25,
     * //     'is_present' => true,
     * //     'is_late' => true,
     * //     'late_minutes' => 5,
     * //     ...
     * // ]
     */
    public function computeDailySummary(int $employeeId, Carbon $date): array
    {
        // Fetch employee and their applicable work schedule for the date
        $employee = Employee::findOrFail($employeeId);
        
        // Get the work schedule for this employee on this date
        $workSchedule = $this->getWorkScheduleForDate($employeeId, $date);
        
        if (!$workSchedule) {
            // No schedule found - return absent status
            return $this->buildEmptySummary($employeeId, $date);
        }

        // Get all attendance events for this employee and date
        $events = AttendanceEvent::where('employee_id', $employeeId)
            ->whereDate('event_date', $date)
            ->orderBy('event_time', 'asc')
            ->get();

        if ($events->isEmpty()) {
            // No events - employee is absent
            return $this->buildEmptySummary($employeeId, $date, $workSchedule);
        }

        // Extract time_in and time_out from events
        $timeIn = $this->extractTimeIn($events);
        $timeOut = $this->extractTimeOut($events);
        $breakDuration = $this->calculateBreakDuration($events);

        // Get scheduled start/end for this day
        $scheduledStart = $this->getScheduledStart($workSchedule, $date);
        $scheduledEnd = $this->getScheduledEnd($workSchedule, $date);

        // Build summary with time values
        $summary = [
            'employee_id' => $employeeId,
            'attendance_date' => $date->toDateString(),
            'work_schedule_id' => $workSchedule->id,
            'time_in' => $timeIn?->toDateTimeString(),
            'time_out' => $timeOut?->toDateTimeString(),
            'break_duration' => $breakDuration,
            'total_hours_worked' => null,
            'regular_hours' => null,
            'overtime_hours' => null,
        ];

        // Calculate hours worked if both time_in and time_out exist
        if ($timeIn && $timeOut) {
            $totalMinutes = $timeIn->diffInMinutes($timeOut) - $breakDuration;
            $totalHours = $totalMinutes / 60;
            $summary['total_hours_worked'] = round($totalHours, 2);

            // Calculate regular vs overtime hours
            $scheduledHours = ($scheduledStart && $scheduledEnd) 
                ? $scheduledStart->diffInHours($scheduledEnd) - ($breakDuration / 60)
                : 0;

            if ($totalHours > $scheduledHours) {
                $summary['regular_hours'] = round($scheduledHours, 2);
                $summary['overtime_hours'] = round($totalHours - $scheduledHours, 2);
            } else {
                $summary['regular_hours'] = round($totalHours, 2);
                $summary['overtime_hours'] = 0;
            }
        }

        return $summary;
    }

    /**
     * Task 5.3.2: Apply business rules to compute attendance status.
     * 
     * Evaluates computed summary against business rules:
     * - Present: clocked in within grace period
     * - Late: clocked in after grace period
     * - Absent: no time_in event
     * - Undertime: worked fewer hours than scheduled
     * - Overtime: worked more than scheduled
     * 
     * @param array $summary Summary data from computeDailySummary()
     * @param \Carbon\Carbon|null $date Date for schedule lookup (optional, defaults to summary date)
     * @return array Updated summary with status flags and minutes calculations
     * 
     * @example
     * $summary = $this->computeDailySummary(1, Carbon::parse('2024-01-15'));
     * $withRules = $this->applyBusinessRules($summary);
     * // Now includes:
     * // 'is_present' => true,
     * // 'is_late' => true,
     * // 'late_minutes' => 5,
     * // 'is_undertime' => false,
     * // 'is_overtime' => true,
     * // ...
     */
    public function applyBusinessRules(array $summary, ?Carbon $date = null): array
    {
        $date = $date ?? Carbon::parse($summary['attendance_date']);
        $employeeId = $summary['employee_id'];

        // Get work schedule - either from summary or look it up
        $workSchedule = null;
        if (isset($summary['work_schedule_id']) && $summary['work_schedule_id']) {
            $workSchedule = WorkSchedule::find($summary['work_schedule_id']);
        } else {
            // If not in summary, try to get from employee
            $workSchedule = $this->getWorkScheduleForDate($employeeId, $date);
        }

        // Get scheduled start/end times - from summary or from schedule
        $scheduledStart = $summary['scheduled_start'] ?? null;
        $scheduledEnd = $summary['scheduled_end'] ?? null;
        
        if (!$scheduledStart || !$scheduledEnd) {
            $scheduledStart = $this->getScheduledStart($workSchedule, $date);
            $scheduledEnd = $this->getScheduledEnd($workSchedule, $date);
        } else {
            // Parse from strings if provided
            $scheduledStart = is_string($scheduledStart) ? Carbon::parse($scheduledStart) : $scheduledStart;
            $scheduledEnd = is_string($scheduledEnd) ? Carbon::parse($scheduledEnd) : $scheduledEnd;
        }

        // Default status flags
        $summary['is_present'] = false;
        $summary['is_late'] = false;
        $summary['is_undertime'] = false;
        $summary['is_overtime'] = false;
        $summary['late_minutes'] = null;
        $summary['undertime_minutes'] = null;

        // Parse time_in and time_out - handle both Carbon objects and strings
        $timeIn = null;
        if ($summary['time_in']) {
            if ($summary['time_in'] instanceof Carbon) {
                $timeIn = $summary['time_in'];
            } else {
                $timeIn = Carbon::parse($summary['time_in']);
            }
        }
        
        $timeOut = null;
        if ($summary['time_out']) {
            if ($summary['time_out'] instanceof Carbon) {
                $timeOut = $summary['time_out'];
            } else {
                $timeOut = Carbon::parse($summary['time_out']);
            }
        }

        // Rule 1: Check if present or absent
        if (!$timeIn) {
            // No time_in = Absent
            $summary['is_present'] = false;
            return $summary;
        }

        // Employee clocked in - mark as present
        $summary['is_present'] = true;

        // Rule 2: Check if late (time_in > scheduled_start + grace_period)
        if ($scheduledStart) {
            $graceDeadline = $scheduledStart->copy()->addMinutes(self::GRACE_PERIOD_MINUTES);
            $lateMinutes = abs($timeIn->diffInMinutes($scheduledStart));

            if ($timeIn->gt($graceDeadline)) {
                $summary['is_late'] = true;
                $summary['late_minutes'] = max(0, $lateMinutes - self::GRACE_PERIOD_MINUTES);
            }
        }

        // Rule 3: Check if undertime (worked fewer hours than scheduled)
        if ($summary['total_hours_worked'] && $scheduledStart && $scheduledEnd) {
            $breakMinutes = $summary['break_duration'] ?? 0;
            $scheduledMinutes = $scheduledStart->diffInMinutes($scheduledEnd) - $breakMinutes;
            $scheduledHours = $scheduledMinutes / 60;
            $workedHours = $summary['total_hours_worked'];

            if ($workedHours < $scheduledHours) {
                $summary['is_undertime'] = true;
                $undertimeMinutes = ($scheduledHours - $workedHours) * 60;
                $summary['undertime_minutes'] = (int)round($undertimeMinutes);
            }
        }

        // Rule 4: Check if overtime (time_out > scheduled_end + overtime_threshold)
        if ($timeOut && $scheduledEnd) {
            $overtimeDeadline = $scheduledEnd->copy()->addMinutes(self::OVERTIME_THRESHOLD_MINUTES);

            if ($timeOut->gt($overtimeDeadline)) {
                $summary['is_overtime'] = true;
            }
        }

        return $summary;
    }

    /**
     * Helper: Get work schedule for employee on specific date
     * 
     * @param int $employeeId Employee ID
     * @param \Carbon\Carbon $date Date to check
     * @return \App\Models\WorkSchedule|null
     */
    private function getWorkScheduleForDate(int $employeeId, Carbon $date): ?WorkSchedule
    {
        $employee = Employee::find($employeeId);
        if (!$employee) {
            return null;
        }

        // Try to get department schedule first (simplified)
        if ($employee->department_id) {
            return WorkSchedule::where('department_id', $employee->department_id)
                ->where('effective_date', '<=', $date)
                ->where(function ($query) use ($date) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>=', $date);
                })
                ->latest('effective_date')
                ->first();
        }

        return null;
    }

    /**
     * Helper: Get scheduled start time for specific date and schedule
     * 
     * @param \App\Models\WorkSchedule $schedule Work schedule
     * @param \Carbon\Carbon $date Date
     * @return \Carbon\Carbon|null
     */
    private function getScheduledStart(WorkSchedule $schedule, Carbon $date): ?Carbon
    {
        if (!$schedule) {
            return null;
        }

        $dayOfWeek = strtolower($date->format('l')); // 'monday', 'tuesday', etc
        $startColumn = $dayOfWeek . '_start';

        // Use the model's getAttribute to access dynamic attributes
        if (isset($schedule->attributes[$startColumn])) {
            $startTime = $schedule->getAttribute($startColumn);
            if ($startTime) {
                return $date->copy()->setTimeFromTimeString($startTime);
            }
        }

        return null;
    }

    /**
     * Helper: Get scheduled end time for specific date and schedule
     * 
     * @param \App\Models\WorkSchedule $schedule Work schedule
     * @param \Carbon\Carbon $date Date
     * @return \Carbon\Carbon|null
     */
    private function getScheduledEnd(WorkSchedule $schedule, Carbon $date): ?Carbon
    {
        if (!$schedule) {
            return null;
        }

        $dayOfWeek = strtolower($date->format('l')); // 'monday', 'tuesday', etc
        $endColumn = $dayOfWeek . '_end';

        // Use the model's getAttribute to access dynamic attributes
        if (isset($schedule->attributes[$endColumn])) {
            $endTime = $schedule->getAttribute($endColumn);
            if ($endTime) {
                return $date->copy()->setTimeFromTimeString($endTime);
            }
        }

        return null;
    }

    /**
     * Helper: Extract time_in from attendance events (first time_in event)
     * 
     * @param Collection $events Attendance events for the day
     * @return \Carbon\Carbon|null
     */
    private function extractTimeIn(Collection $events): ?Carbon
    {
        $timeInEvent = $events->firstWhere('event_type', 'time_in');
        return $timeInEvent ? Carbon::parse($timeInEvent->event_time) : null;
    }

    /**
     * Helper: Extract time_out from attendance events (last time_out event)
     * 
     * @param Collection $events Attendance events for the day
     * @return \Carbon\Carbon|null
     */
    private function extractTimeOut(Collection $events): ?Carbon
    {
        $timeOutEvent = $events->where('event_type', 'time_out')->last();
        return $timeOutEvent ? Carbon::parse($timeOutEvent->event_time) : null;
    }

    /**
     * Helper: Calculate total break duration from events
     * 
     * Sums all break periods (break_end - break_start) for the day
     * 
     * @param Collection $events Attendance events for the day
     * @return int Total break duration in minutes
     */
    private function calculateBreakDuration(Collection $events): int
    {
        $breakDuration = 0;
        $breakStart = null;

        foreach ($events as $event) {
            if ($event->event_type === 'break_start') {
                $breakStart = Carbon::parse($event->event_time);
            } elseif ($event->event_type === 'break_end' && $breakStart) {
                $breakEnd = Carbon::parse($event->event_time);
                $breakDuration += $breakStart->diffInMinutes($breakEnd);
                $breakStart = null;
            }
        }

        return $breakDuration;
    }

    /**
     * Helper: Build empty summary for absent employees
     * 
     * @param int $employeeId Employee ID
     * @param \Carbon\Carbon $date Attendance date
     * @param \App\Models\WorkSchedule|null $workSchedule Work schedule (optional)
     * @return array Empty summary with absent flags
     */
    private function buildEmptySummary(int $employeeId, Carbon $date, ?WorkSchedule $workSchedule = null): array
    {
        return [
            'employee_id' => $employeeId,
            'attendance_date' => $date->toDateString(),
            'work_schedule_id' => $workSchedule?->id,
            'time_in' => null,
            'time_out' => null,
            'break_duration' => 0,
            'total_hours_worked' => 0,
            'regular_hours' => 0,
            'overtime_hours' => 0,
            'is_present' => false,
            'is_late' => false,
            'is_undertime' => false,
            'is_overtime' => false,
            'late_minutes' => null,
            'undertime_minutes' => null,
        ];
    }

    /**
     * Get grace period in minutes (configurable for tests/overrides)
     * 
     * @return int Grace period in minutes
     */
    public static function getGracePeriodMinutes(): int
    {
        return self::GRACE_PERIOD_MINUTES;
    }

    /**
     * Get overtime threshold in minutes (configurable for tests/overrides)
     * 
     * @return int Overtime threshold in minutes
     */
    public static function getOvertimeThresholdMinutes(): int
    {
        return self::OVERTIME_THRESHOLD_MINUTES;
    }
}
