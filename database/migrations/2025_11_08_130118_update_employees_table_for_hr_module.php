<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use safe, idempotent operations so migrations are resilient across environments

        // Add email field if not present
        if (!Schema::hasColumn('employees', 'email')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->string('email')->unique()->nullable()->after('employee_number');
            });
        }

        // Convert `position` -> `position_id` if position exists and position_id doesn't
        if (Schema::hasColumn('employees', 'position') && !Schema::hasColumn('employees', 'position_id')) {
            // Some DB drivers (sqlite) do not support dropping columns or adding foreign keys in-place.
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                Schema::table('employees', function (Blueprint $table) {
                    $table->dropColumn('position');
                    $table->foreignId('position_id')->nullable()->after('department_id')->constrained('positions')->onDelete('set null');
                });
            } else {
                // For sqlite, only add position_id column (skip dropping position and foreign key creation)
                Schema::table('employees', function (Blueprint $table) {
                    $table->unsignedBigInteger('position_id')->nullable()->after('department_id');
                });
            }
        }

        // Add employment_type only if it does not exist yet. We avoid dropping existing columns to prevent sqlite issues.
        if (!Schema::hasColumn('employees', 'employment_type')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->enum('employment_type', ['regular', 'probationary', 'contractual', 'project-based', 'part-time'])->nullable()->after('position_id');
            });
        }

        // Rename date columns safely
        if (Schema::hasColumn('employees', 'date_employed') && !Schema::hasColumn('employees', 'date_hired')) {
            // renameColumn can fail on sqlite without doctrine/dbal; try only when supported
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                Schema::table('employees', function (Blueprint $table) {
                    $table->renameColumn('date_employed', 'date_hired');
                });
            } else {
                // For sqlite we'll add the new column and copy data from the old one
                Schema::table('employees', function (Blueprint $table) {
                    $table->date('date_hired')->nullable();
                });
                // copy values from date_employed -> date_hired
                try {
                    \DB::table('employees')->whereNotNull('date_employed')->update(['date_hired' => \DB::raw('date_employed')]);
                } catch (\Throwable $e) {
                    // be tolerant of odd sqlite states
                }
            }
        }

        if (Schema::hasColumn('employees', 'date_regularized') && !Schema::hasColumn('employees', 'regularization_date')) {
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                Schema::table('employees', function (Blueprint $table) {
                    $table->renameColumn('date_regularized', 'regularization_date');
                });
            } else {
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

        // Update status column - add only when missing to protect sqlite
        if (!Schema::hasColumn('employees', 'status')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->enum('status', ['active', 'on_leave', 'suspended', 'terminated', 'archived'])->default('active')->after('immediate_supervisor_id');
            });
        }

        // Make audit fields nullable where supported
        if (Schema::hasColumn('employees', 'created_by')) {
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                Schema::table('employees', function (Blueprint $table) {
                    $table->foreignId('created_by')->nullable()->change();
                });
            }
        }

        if (Schema::hasColumn('employees', 'updated_by')) {
            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                Schema::table('employees', function (Blueprint $table) {
                    $table->foreignId('updated_by')->nullable()->change();
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('email');
            $table->dropForeign(['position_id']);
            $table->dropColumn('position_id');
            $table->string('position')->nullable();
            $table->dropColumn('employment_type');
            $table->enum('employment_type', ['regular', 'contractual', 'probationary', 'consultant'])->nullable();
            $table->renameColumn('date_hired', 'date_employed');
            $table->renameColumn('regularization_date', 'date_regularized');
            $table->dropColumn('status');
            $table->enum('status', ['active', 'archived', 'terminated', 'on_leave', 'suspended'])->default('active');
            $table->foreignId('created_by')->nullable(false)->change();
        });
    }
};
