<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add date_hired and regularization_date if missing and copy legacy values
        if (!Schema::hasColumn('employees', 'date_hired') && Schema::hasColumn('employees', 'date_employed')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->date('date_hired')->nullable();
            });

            try {
                \DB::table('employees')->whereNotNull('date_employed')->update(['date_hired' => \DB::raw('date_employed')]);
            } catch (\Throwable $e) {
                // ignore
            }
        }

        if (!Schema::hasColumn('employees', 'regularization_date') && Schema::hasColumn('employees', 'date_regularized')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->date('regularization_date')->nullable();
            });

            try {
                \DB::table('employees')->whereNotNull('date_regularized')->update(['regularization_date' => \DB::raw('date_regularized')]);
            } catch (\Throwable $e) {
                // ignore
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('employees', 'date_hired')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('date_hired');
            });
        }

        if (Schema::hasColumn('employees', 'regularization_date')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('regularization_date');
            });
        }
    }
};
