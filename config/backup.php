<?php

return [

    'backup' => [

        /*
         * The name of this application. You can use this name to monitor
         * the backups.
         */
        'name' => env('APP_NAME', 'cameco'),

        'source' => [

            'files' => [

                /*
                 * The list of directories and files that will be included in the backup.
                 * We only back up the database — no file inclusions.
                 */
                'include' => [],

                /*
                 * Directories and files excluded from the backup.
                 */
                'exclude' => [
                    base_path('vendor'),
                    base_path('node_modules'),
                ],

                'follow_links' => false,
                'ignore_unreadable_directories' => false,
                'relative_path' => null,
            ],

            /*
             * The names of the connections to the databases that should be backed up.
             * Only the PostgreSQL database is backed up.
             */
            'databases' => ['pgsql'],
        ],

        'database_dump_compressor' => null,
        'database_dump_file_extension' => '',

        'destination' => [

            /*
             * The filename prefix used for the backup zip file.
             */
            'filename_prefix' => 'backup-',

            /*
             * The disk(s) to which the backups will be written.
             * Writes to local first, then syncs to cloud (S3-compatible).
             */
            'disks' => [
                'local',
            ],
        ],

        /*
         * The directory where the temporary files will be stored.
         */
        'temporary_directory' => storage_path('app/backup-temp'),

        /*
         * The password to be used for archive encryption.
         * Set to null to disable encryption.
         */
        'password' => env('BACKUP_ARCHIVE_PASSWORD') ?: null,

        'encryption' => 'default',

        'tries' => 1,
        'retry_delay' => 0,
    ],

    'notifications' => [

        'notifications' => [
            \Spatie\Backup\Notifications\Notifications\BackupHasFailedNotification::class          => ['mail'],
            \Spatie\Backup\Notifications\Notifications\UnhealthyBackupWasFoundNotification::class  => ['mail'],
            \Spatie\Backup\Notifications\Notifications\CleanupHasFailedNotification::class         => ['mail'],
            \Spatie\Backup\Notifications\Notifications\BackupWasSuccessfulNotification::class      => ['mail'],
            \Spatie\Backup\Notifications\Notifications\HealthyBackupWasFoundNotification::class    => ['mail'],
            \Spatie\Backup\Notifications\Notifications\CleanupWasSuccessfulNotification::class     => ['mail'],
        ],

        'notifiable' => \Spatie\Backup\Notifications\Notifiable::class,

        'mail' => [
            'to' => env('BACKUP_NOTIFY_EMAIL', 'superadmin@cameco.com'),
            'from' => [
                'address' => env('MAIL_FROM_ADDRESS', 'noreply@cameco.com'),
                'name'    => env('MAIL_FROM_NAME', 'Cameco Backups'),
            ],
        ],

        'slack' => [
            'webhook_url' => '',
            'channel'     => null,
            'username'    => null,
            'icon'        => null,
        ],

        'discord' => [
            'webhook_url' => '',
            'username'    => null,
            'avatar_url'  => null,
        ],
    ],

    'monitor_backups' => [
        [
            'name'          => env('APP_NAME', 'cameco'),
            'disks'         => ['local'],
            'health_checks' => [
                \Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumAgeInDays::class         => 1,
                \Spatie\Backup\Tasks\Monitor\HealthChecks\MaximumStorageInMegabytes::class => 5000,
            ],
        ],
    ],

    'cleanup' => [
        'strategy' => \Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy::class,

        'default_strategy' => [
            'keep_all_backups_for_days' => 7,
            'keep_daily_backups_for_days' => 16,
            'keep_weekly_backups_for_weeks' => 8,
            'keep_monthly_backups_for_months' => 4,
            'keep_yearly_backups_for_years' => 2,
            'delete_oldest_backups_when_using_more_megabytes_than' => 5000,
        ],

        'tries' => 1,
        'retry_delay' => 0,
    ],

];
