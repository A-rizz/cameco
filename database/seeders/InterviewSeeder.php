<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Candidate;
use App\Models\Application;
use App\Models\Interview;
use App\Models\JobPosting;
use App\Models\Department;
use App\Models\User;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InterviewSeeder extends Seeder
{
    public function run(): void
    {
        // -------------------------------
        // 1. Create dummy department
        // -------------------------------
        $department = Department::firstOrCreate(
            ['id' => 1],
            ['name' => 'Engineering']
        );
        $this->command->info("Department created: {$department->name}");

        // -------------------------------
        // 2. Create dummy user (creator)
        // -------------------------------
        $user = User::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('password')
            ]
        );
        $this->command->info("User created: {$user->name}");

        // -------------------------------
        // 3. Create job posting
        // -------------------------------
        $jobPosting = JobPosting::firstOrCreate(
            ['id' => 1],
            [
                'title' => 'Software Engineer',
                'department_id' => $department->id,
                'description' => 'Dummy job posting for seeder',
                'requirements' => 'PHP, Laravel, JS',
                'status' => 'open',
                'created_by' => $user->id,
                'posted_at' => now(),
            ]
        );
        $this->command->info("Job posting created: {$jobPosting->title}");

        // -------------------------------
        // 4. Create 5 real Filipino candidates
        // -------------------------------
        $candidateData = [
            [
                'first_name' => 'Steve',
                'last_name' => 'Cruz',
                'email' => 'steve.cruz@example.com',
                'phone' => '09171234567',
            ],
            [
                'first_name' => 'Maria Fe',
                'last_name' => 'Rodrigo',
                'email' => 'maria.rodrigo@example.com',
                'phone' => '09181234567',
            ],
            [
                'first_name' => 'Peter',
                'last_name' => 'Bautista',
                'email' => 'peter.bautista@example.com',
                'phone' => '09191234567',
            ],
            [
                'first_name' => 'Liza',
                'last_name' => 'Reyes',
                'email' => 'liza.reyes@example.com',
                'phone' => '09181239876',
            ],
            [
                'first_name' => 'Ramon',
                'last_name' => 'Torres',
                'email' => 'ramon.torres@example.com',
                'phone' => '09183456789',
            ],
        ];
        $candidates = collect();
        foreach ($candidateData as $data) {
            $candidates->push(
                Candidate::firstOrCreate(
                    ['email' => $data['email']],
                    $data
                )
            );
        }
        $this->command->info("Created {$candidates->count()} candidates.");

        // -------------------------------
        // 5. Create applications for candidates
        // -------------------------------
        $applications = collect();
        foreach ($candidates as $candidate) {
            $applications->push(Application::create([
                'candidate_id' => $candidate->id,
                'job_posting_id' => $jobPosting->id,
                'status' => 'applied',
            ]));
        }
        $this->command->info("Created {$applications->count()} applications.");

        // -------------------------------
        // 6. Create 10 dummy interviews
        // -------------------------------
        $validLocations = ['office', 'video_call', 'phone'];
        for ($i = 1; $i <= 10; $i++) {
            $app = $applications->random();
            Interview::create([
                'application_id' => $app->id,
                'candidate_id' => $app->candidate_id,
                'job_title' => $jobPosting->title,
                'scheduled_date' => Carbon::now()->addDays(rand(1, 10))->format('Y-m-d'),
                'scheduled_time' => Carbon::now()->addHours(rand(8, 17))->format('H:i'),
                'duration_minutes' => 60,
                'location_type' => $validLocations[array_rand($validLocations)],
                'status' => 'scheduled',
                'interviewer_name' => 'HR Manager',
            ]);
        }
        $this->command->info("Created 10 mock interviews successfully!");
    }
}
