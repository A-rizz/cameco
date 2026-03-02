# ATS Public Job Postings Page - Implementation Plan

**Feature:** Public Job Postings & Application Portal  
**Route:** `/job-postings` (Public, no authentication required)  
**Landing Page Update:** Add "Careers" button on `/` root page  
**Priority:** HIGH  
**Estimated Duration:** 3-4 days  
**Current Status:** ⏳ PLANNING - No public job postings page exists yet

---

## 📋 Executive Summary

Implement a public-facing job postings portal where external candidates can:
- Browse all open job positions without authentication
- View detailed job descriptions and requirements
- Submit applications with resume upload
- Applications automatically flow into the ATS system

The main landing page (`/`) will include a prominent "Careers" or "Job Openings" button that navigates to `/job-postings`.

---

## 🎯 Goals & Requirements

### Primary Goals:
1. ✅ Allow public access to job postings (no login required)
2. ✅ Display only "open" status job postings
3. ✅ Enable candidates to apply online with resume upload
4. ✅ Automatically create candidate and application records in ATS
5. ✅ Add navigation from root page (`/`) to job postings
6. ✅ Responsive design for mobile and desktop
7. ✅ SEO-friendly for search engine indexing

### Security Requirements:
- ✅ Public routes bypass authentication middleware
- ✅ Validate all application submissions server-side
- ✅ Sanitize uploaded files (resume validation)
- ✅ Rate limiting on application submissions
- ✅ CSRF protection on forms

---

## 📊 Current State Analysis

### ✅ Already Exists:
- ✅ `JobPosting` model with relationships
- ✅ `Application` model
- ✅ `Candidate` model
- ✅ HR job posting management at `/hr/ats/job-postings`
- ✅ Database tables: `job_postings`, `candidates`, `applications`

### ⚠️ Needs Implementation:
- ❌ Public job postings controller (separate from HR controller)
- ❌ Public routes for `/job-postings`
- ❌ Public job postings page UI
- ❌ Job detail page with application form
- ❌ Application submission endpoint
- ❌ Resume upload handling
- ❌ Update welcome page with "Careers" button

---

## Phase 1: Backend - Public Job Postings Controller

**Duration:** 0.5 days

### Task 1.1: Create Public Job Postings Controller

**Goal:** Create a controller to serve public job postings without authentication.

**Implementation Steps:**

1. **Generate Controller:**
   ```bash
   php artisan make:controller Public/JobPostingsController
   ```

2. **Controller Implementation:**

Create file: `app/Http/Controllers/Public/JobPostingsController.php`

```php
<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\JobPosting;
use App\Models\Candidate;
use App\Models\Application;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class JobPostingsController extends Controller
{
    /**
     * Display a listing of open job postings (public access).
     */
    public function index(Request $request): Response
    {
        $department = $request->input('department');
        $search = $request->input('search');
        
        $jobPostings = JobPosting::with('department')
            ->where('status', 'open')
            ->when($department, fn($q) => $q->where('department_id', $department))
            ->when($search, fn($q) => $q->where('title', 'like', "%{$search}%"))
            ->orderBy('posted_at', 'desc')
            ->get()
            ->map(fn($job) => [
                'id' => $job->id,
                'title' => $job->title,
                'department_name' => $job->department?->name,
                'department_id' => $job->department_id,
                'description' => $job->description,
                'requirements' => $job->requirements,
                'posted_at' => $job->posted_at?->format('F d, Y'),
                'applications_count' => $job->applications()->count(),
            ]);
        
        $departments = JobPosting::where('status', 'open')
            ->with('department:id,name')
            ->get()
            ->pluck('department')
            ->unique('id')
            ->filter()
            ->values();
        
        return Inertia::render('Public/JobPostings/Index', [
            'jobPostings' => $jobPostings,
            'departments' => $departments,
            'filters' => [
                'department' => $department,
                'search' => $search,
            ],
        ]);
    }
    
    /**
     * Display the specified job posting (public access).
     */
    public function show(int $id): Response
    {
        $jobPosting = JobPosting::with('department')
            ->where('status', 'open')
            ->findOrFail($id);
        
        return Inertia::render('Public/JobPostings/Show', [
            'jobPosting' => [
                'id' => $jobPosting->id,
                'title' => $jobPosting->title,
                'department_name' => $jobPosting->department?->name,
                'description' => $jobPosting->description,
                'requirements' => $jobPosting->requirements,
                'posted_at' => $jobPosting->posted_at?->format('F d, Y'),
            ],
        ]);
    }
    
    /**
     * Store a new application submission (public access).
     */
    public function apply(Request $request, int $jobId)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
            'cover_letter' => 'nullable|string|max:2000',
        ]);
        
        // Verify job exists and is open
        $jobPosting = JobPosting::where('status', 'open')->findOrFail($jobId);
        
        DB::beginTransaction();
        
        try {
            // Check if candidate already exists by email
            $candidate = Candidate::whereHas('profile', function($q) use ($validated) {
                $q->where('email', $validated['email']);
            })->first();
            
            if (!$candidate) {
                // Create profile
                $profile = \App\Models\Profile::create([
                    'first_name' => $validated['first_name'],
                    'last_name' => $validated['last_name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                ]);
                
                // Create candidate
                $candidate = Candidate::create([
                    'profile_id' => $profile->id,
                    'source' => 'job_board',
                    'status' => 'new',
                    'applied_at' => now(),
                ]);
            }
            
            // Check if candidate already applied to this job
            $existingApplication = Application::where('candidate_id', $candidate->id)
                ->where('job_id', $jobPosting->id)
                ->first();
            
            if ($existingApplication) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'You have already applied to this position.',
                ], 422);
            }
            
            // Upload resume
            $resumePath = null;
            if ($request->hasFile('resume')) {
                $resumePath = $request->file('resume')->store('resumes', 'public');
            }
            
            // Create application
            $application = Application::create([
                'candidate_id' => $candidate->id,
                'job_id' => $jobPosting->id,
                'status' => 'submitted',
                'resume_path' => $resumePath,
                'cover_letter' => $validated['cover_letter'],
                'applied_at' => now(),
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Your application has been submitted successfully!',
                'application_id' => $application->id,
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your application. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
```

**Files to Create:**
- `app/Http/Controllers/Public/JobPostingsController.php`

**Verification:**
- ✅ Controller methods handle public access
- ✅ Only "open" job postings are displayed
- ✅ Application submission creates candidate + application records
- ✅ Resume upload and validation works
- ✅ Duplicate application detection

---

## Phase 2: Routes Configuration

**Duration:** 0.25 days

### Task 2.1: Add Public Routes

**Goal:** Configure public routes for job postings (no authentication).

**Implementation Steps:**

Update `routes/web.php` - Add these routes:

```php
<?php

use App\Http\Controllers\Public\JobPostingsController;

// ... existing routes ...

// PUBLIC JOB POSTINGS (No Authentication Required)
Route::prefix('job-postings')->name('public.job-postings.')->group(function () {
    Route::get('/', [JobPostingsController::class, 'index'])
        ->name('index');
    
    Route::get('/{id}', [JobPostingsController::class, 'show'])
        ->name('show');
    
    Route::post('/{id}/apply', [JobPostingsController::class, 'apply'])
        ->middleware('throttle:5,1') // Rate limit: 5 applications per minute
        ->name('apply');
});
```

**Files to Modify:**
- `routes/web.php`

**Verification:**
- ✅ Routes are publicly accessible (no auth middleware)
- ✅ Rate limiting prevents spam applications
- ✅ Route names follow convention: `public.job-postings.*`

---

## Phase 3: Frontend - Public Job Postings Index Page

**Duration:** 1 day

### Task 3.1: Create Public Job Postings Index Page

**Goal:** Create a public-facing page listing all open job postings.

**Implementation Steps:**

1. **Create Directory:**
   ```bash
   mkdir -p resources/js/pages/Public/JobPostings
   ```

2. **Create Index Page:**

Create file: `resources/js/pages/Public/JobPostings/Index.tsx`

```tsx
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Calendar, Users, Search, Home } from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  department_name: string;
  department_id: number;
  description: string;
  requirements: string;
  posted_at: string;
  applications_count: number;
}

interface Department {
  id: number;
  name: string;
}

interface PublicJobPostingsProps {
  jobPostings: JobPosting[];
  departments: Department[];
  filters: {
    department?: number;
    search?: string;
  };
}

export default function PublicJobPostingsIndex({
  jobPostings,
  departments,
  filters,
}: PublicJobPostingsProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    filters.department?.toString() || 'all'
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
    
    window.location.href = `/job-postings?${params.toString()}`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <Head title="Job Openings - Cathay Metal Corporation" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Cathay Metal Corporation
                </h1>
                <p className="text-gray-600 mt-1">Career Opportunities</p>
              </div>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <Home className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-4">
              Join Our Team
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover exciting career opportunities at one of the leading steel manufacturing companies in the Philippines.
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search job titles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleSearch} className="whitespace-nowrap">
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              Available Positions ({jobPostings.length})
            </h3>
          </div>

          {jobPostings.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Open Positions
                </h3>
                <p className="text-gray-600">
                  There are currently no job openings matching your search criteria.
                </p>
                <p className="text-gray-600 mt-2">
                  Please check back later or adjust your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobPostings.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {job.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.department_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Posted {job.posted_at}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job.applications_count} applicants
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      {truncateText(job.description, 200)}
                    </CardDescription>
                    <Link href={`/job-postings/${job.id}`}>
                      <Button className="w-full">
                        View Details & Apply
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Cathay Metal Corporation. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
```

**Files to Create:**
- `resources/js/pages/Public/JobPostings/Index.tsx`

**Verification:**
- ✅ Page displays all open job postings
- ✅ Search and filter functionality works
- ✅ Responsive design (mobile & desktop)
- ✅ No authentication layout (no sidebar/nav)
- ✅ Clean, professional career portal design

---

## Phase 4: Frontend - Job Detail & Application Page

**Duration:** 1 day

### Task 4.1: Create Job Detail Page with Application Form

**Goal:** Create detailed job view with inline application form.

**Implementation Steps:**

Create file: `resources/js/pages/Public/JobPostings/Show.tsx`

```tsx
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Briefcase, Building2, Calendar, FileText, Upload, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface JobPosting {
  id: number;
  title: string;
  department_name: string;
  description: string;
  requirements: string;
  posted_at: string;
}

interface JobDetailProps {
  jobPosting: JobPosting;
}

export default function JobPostingShow({ jobPosting }: JobDetailProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cover_letter: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const submitData = new FormData();
    submitData.append('first_name', formData.first_name);
    submitData.append('last_name', formData.last_name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('cover_letter', formData.cover_letter);
    
    if (resumeFile) {
      submitData.append('resume', resumeFile);
    }

    try {
      const response = await axios.post(
        `/job-postings/${jobPosting.id}/apply`,
        submitData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          cover_letter: '',
        });
        setResumeFile(null);
        
        // Scroll to success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit application. Please try again.';
      setSubmitError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head title={`${jobPosting.title} - Cathay Metal Corporation`} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Link href="/job-postings">
              <Button variant="ghost" className="gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Job Listings
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {jobPosting.title}
            </h1>
            <div className="flex flex-wrap gap-4 mt-3 text-gray-600">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {jobPosting.department_name}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Posted {jobPosting.posted_at}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Success/Error Messages */}
              {submitSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Application Submitted Successfully!</strong>
                    <p className="mt-1">
                      Thank you for applying. We will review your application and contact you if your qualifications match our requirements.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: jobPosting.description.replace(/\n/g, '<br/>') }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: jobPosting.requirements.replace(/\n/g, '<br/>') }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Application Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Apply Now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="resume">Resume (PDF, DOC, DOCX) *</Label>
                      <div className="mt-1">
                        <label
                          htmlFor="resume"
                          className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                        >
                          <Upload className="h-5 w-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {resumeFile ? resumeFile.name : 'Choose file'}
                          </span>
                        </label>
                        <input
                          id="resume"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          required
                          disabled={isSubmitting}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Max file size: 5MB
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="cover_letter">Cover Letter (Optional)</Label>
                      <Textarea
                        id="cover_letter"
                        name="cover_letter"
                        value={formData.cover_letter}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell us why you're a great fit for this role..."
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || !resumeFile}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By submitting, you agree to our processing of your personal data.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Cathay Metal Corporation. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
```

**Files to Create:**
- `resources/js/pages/Public/JobPostings/Show.tsx`

**Verification:**
- ✅ Job details display correctly
- ✅ Application form validation works
- ✅ Resume upload handles file size/type validation
- ✅ Success/error messages display
- ✅ Form resets after successful submission
- ✅ Responsive design

---

## Phase 5: Update Landing Page with "Careers" Button

**Duration:** 0.25 days

### Task 5.1: Add Navigation to Job Postings from Root Page

**Goal:** Update the welcome/landing page to include a prominent "Careers" button.

**Implementation Steps:**

Update or create `resources/js/pages/welcome.tsx`:

```tsx
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight } from 'lucide-react';

export default function Welcome({ canRegister }: { canRegister: boolean }) {
  return (
    <>
      <Head title="Welcome - Cathay Metal Corporation" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700">
        {/* Navigation */}
        <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Cathay Metal Corporation
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/job-postings">
                  <Button variant="outline" className="gap-2 bg-white/10 text-white border-white/30 hover:bg-white/20">
                    <Briefcase className="h-4 w-4" />
                    Careers
                  </Button>
                </Link>
                
                <Link href="/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                
                {canRegister && (
                  <Link href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Register
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h2 className="text-5xl font-extrabold text-white mb-6">
              Welcome to Cathay Metal Corporation
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Leading steel manufacturing company in the Philippines, committed to excellence and innovation.
            </p>
            
            {/* Call to Action */}
            <div className="flex justify-center gap-4">
              <Link href="/job-postings">
                <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                  <Briefcase className="h-5 w-5" />
                  Explore Career Opportunities
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">
                Join Our Team
              </h3>
              <p className="text-slate-300">
                Discover exciting career opportunities across various departments and grow with us.
              </p>
              <Link href="/job-postings">
                <Button variant="link" className="text-blue-300 hover:text-blue-200 p-0 mt-4">
                  View Open Positions →
                </Button>
              </Link>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">
                Employee Portal
              </h3>
              <p className="text-slate-300">
                Access your employee dashboard, timekeeping, payroll, and more.
              </p>
              <Link href="/login">
                <Button variant="link" className="text-blue-300 hover:text-blue-200 p-0 mt-4">
                  Employee Login →
                </Button>
              </Link>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-3">
                About Us
              </h3>
              <p className="text-slate-300">
                Learn more about our company, values, and commitment to excellence.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-black/30 backdrop-blur-md border-t border-white/10 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-slate-400">
              © {new Date().getFullYear()} Cathay Metal Corporation. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
```

**Files to Modify:**
- `resources/js/pages/welcome.tsx` (create if doesn't exist)

**Verification:**
- ✅ "Careers" button prominently displayed in nav and hero
- ✅ Button links to `/job-postings`
- ✅ Responsive design
- ✅ Professional landing page design

---

## Phase 6: Database & Model Setup

**Duration:** 0.25 days

### Task 6.1: Verify Profile Model Exists

**Goal:** Ensure Profile model exists for candidate data.

**Implementation Steps:**

1. **Check if Profile model exists:**
   ```bash
   # Check app/Models/Profile.php
   ```

2. **If doesn't exist, create Profile model:**
   ```bash
   php artisan make:model Profile
   ```

3. **Profile Model Implementation:**

Create file: `app/Models/Profile.php` (if it doesn't exist)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Profile extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'date_of_birth',
    ];
    
    protected $casts = [
        'date_of_birth' => 'date',
    ];
    
    /**
     * Get full name attribute
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
```

**Files to Verify/Create:**
- `app/Models/Profile.php`

---

## Phase 7: Testing & Quality Assurance

**Duration:** 0.5 days

### Task 7.1: Manual Testing Checklist

**Public Job Postings Index:**
- ✅ Navigate to `/job-postings` without login
- ✅ Only "open" status jobs are displayed
- ✅ Search functionality filters jobs correctly
- ✅ Department filter works
- ✅ Job cards display correctly
- ✅ "View Details & Apply" button navigates to job detail
- ✅ Responsive on mobile and desktop

**Job Detail & Application:**
- ✅ Job description and requirements display
- ✅ Application form validation works
- ✅ Resume upload validates file type (PDF, DOC, DOCX)
- ✅ Resume upload validates file size (max 5MB)
- ✅ Form submission creates candidate + application records
- ✅ Success message displays after submission
- ✅ Error message displays if duplicate application
- ✅ Form resets after successful submission

**Landing Page:**
- ✅ "Careers" button visible on root page (`/`)
- ✅ Button links to `/job-postings`
- ✅ Navigation works correctly

**Database Verification:**
- ✅ Applications create `candidates` record
- ✅ Applications create `profiles` record
- ✅ Applications create `applications` record
- ✅ Resume files upload to `storage/app/public/resumes/`
- ✅ Duplicate prevention works (same email + same job)

**Security:**
- ✅ Rate limiting prevents spam (5 submissions per minute)
- ✅ File upload validation prevents malicious files
- ✅ SQL injection protection (Eloquent ORM)
- ✅ XSS protection (React sanitization)

---

### Task 7.2: Feature Tests (Optional)

**Goal:** Create automated tests for public job postings.

**Generate Test:**
```bash
php artisan make:test Feature/PublicJobPostingsTest
```

**Test Implementation:**

Create file: `tests/Feature/PublicJobPostingsTest.php`

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\JobPosting;
use App\Models\Department;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PublicJobPostingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_view_job_postings_index()
    {
        $department = Department::factory()->create();
        JobPosting::factory()->count(3)->create([
            'status' => 'open',
            'department_id' => $department->id,
        ]);

        $response = $this->get('/job-postings');

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Public/JobPostings/Index')
                ->has('jobPostings', 3)
        );
    }

    public function test_public_can_view_job_detail()
    {
        $job = JobPosting::factory()->create(['status' => 'open']);

        $response = $this->get("/job-postings/{$job->id}");

        $response->assertStatus(200);
        $response->assertInertia(fn($page) =>
            $page->component('Public/JobPostings/Show')
                ->where('jobPosting.id', $job->id)
        );
    }

    public function test_public_can_submit_application()
    {
        Storage::fake('public');
        
        $job = JobPosting::factory()->create(['status' => 'open']);
        $resume = UploadedFile::fake()->create('resume.pdf', 1000);

        $response = $this->postJson("/job-postings/{$job->id}/apply", [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '09123456789',
            'resume' => $resume,
            'cover_letter' => 'I am interested in this position.',
        ]);

        $response->assertStatus(201);
        $response->assertJson(['success' => true]);

        $this->assertDatabaseHas('profiles', [
            'email' => 'john@example.com',
        ]);

        $this->assertDatabaseHas('applications', [
            'job_id' => $job->id,
        ]);

        Storage::disk('public')->assertExists('resumes/' . $resume->hashName());
    }

    public function test_duplicate_application_prevented()
    {
        $job = JobPosting::factory()->create(['status' => 'open']);
        $resume = UploadedFile::fake()->create('resume.pdf', 1000);

        // First application
        $this->postJson("/job-postings/{$job->id}/apply", [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '09123456789',
            'resume' => $resume,
        ]);

        // Duplicate application
        $response = $this->postJson("/job-postings/{$job->id}/apply", [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '09123456789',
            'resume' => $resume,
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'You have already applied to this position.',
        ]);
    }
}
```

**Files to Create:**
- `tests/Feature/PublicJobPostingsTest.php`

**Run Tests:**
```bash
php artisan test --filter=PublicJobPostingsTest
```

---

## Phase 8: Documentation & Deployment

**Duration:** 0.25 days

### Task 8.1: Update Documentation

**Goal:** Document the public job postings feature.

**Files to Update:**

1. **Update ATS_MODULE.md:**
   - Add "Public Job Postings Portal" section
   - Document public access flow
   - Add route documentation

2. **Add to README or create separate doc:**

```markdown
# Public Job Postings Portal

## Access
- Public URL: `https://your-domain.com/job-postings`
- Landing Page: `https://your-domain.com/` (with Careers button)

## Features
- Browse all open job positions
- Search and filter by department
- View detailed job descriptions
- Apply online with resume upload
- Automatic candidate record creation

## Application Process
1. Candidate browses jobs at `/job-postings`
2. Clicks "View Details & Apply" on desired position
3. Fills out application form with:
   - Name, email, phone
   - Resume (PDF, DOC, DOCX - max 5MB)
   - Optional cover letter
4. Application submitted to ATS
5. HR reviews in `/hr/ats/applications`

## Security
- Rate limited to 5 applications per minute
- File upload validation (type and size)
- Duplicate application prevention
- CSRF protection
```

---

### Task 8.2: Deployment Checklist

**Pre-Deployment:**
- ✅ Run migrations: `php artisan migrate`
- ✅ Create storage symlink: `php artisan storage:link`
- ✅ Clear caches: `php artisan optimize:clear`
- ✅ Build frontend assets: `npm run build`
- ✅ Verify Cloudflare Tunnel configuration

**Post-Deployment:**
- ✅ Test public access to `/job-postings`
- ✅ Test application submission end-to-end
- ✅ Verify resume uploads work
- ✅ Test on mobile devices
- ✅ Verify SEO meta tags

**Monitoring:**
- ✅ Monitor application submission rate
- ✅ Check storage usage for resumes
- ✅ Monitor database growth (candidates, applications)
- ✅ Review error logs for failed submissions

---

## Summary

### Implementation Breakdown

| Phase | Duration | Tasks | Status |
|-------|----------|-------|--------|
| **Phase 1** | 0.5 days | Public Job Postings Controller | ⏳ Pending |
| **Phase 2** | 0.25 days | Routes Configuration | ⏳ Pending |
| **Phase 3** | 1 day | Public Job Postings Index Page | ⏳ Pending |
| **Phase 4** | 1 day | Job Detail & Application Page | ⏳ Pending |
| **Phase 5** | 0.25 days | Update Landing Page | ⏳ Pending |
| **Phase 6** | 0.25 days | Database & Model Setup | ⏳ Pending |
| **Phase 7** | 0.5 days | Testing & QA | ⏳ Pending |
| **Phase 8** | 0.25 days | Documentation & Deployment | ⏳ Pending |
| **Total** | **3.5 days** | 16 tasks | ⏳ Not Started |

### Key Files Summary

**Files to Create (6):**
1. `app/Http/Controllers/Public/JobPostingsController.php`
2. `resources/js/pages/Public/JobPostings/Index.tsx`
3. `resources/js/pages/Public/JobPostings/Show.tsx`
4. `resources/js/pages/welcome.tsx` (if doesn't exist)
5. `app/Models/Profile.php` (if doesn't exist)
6. `tests/Feature/PublicJobPostingsTest.php`

**Files to Modify (2):**
1. `routes/web.php` - Add public routes
2. `docs/ATS_MODULE.md` - Update documentation

### Success Criteria

✅ Public can access `/job-postings` without login  
✅ Only "open" job postings are displayed  
✅ Search and filter functionality works  
✅ Job detail page displays correctly  
✅ Application form validates input  
✅ Resume upload works (PDF, DOC, DOCX)  
✅ Applications create database records automatically  
✅ Duplicate application prevention works  
✅ "Careers" button visible on landing page  
✅ Responsive design (mobile & desktop)  
✅ Rate limiting prevents spam  
✅ SEO-friendly for search engines  

---

## Quick Start Commands

```bash
# Phase 1: Create Controller
php artisan make:controller Public/JobPostingsController

# Phase 3: Create Frontend Directory
mkdir -p resources/js/pages/Public/JobPostings

# Phase 6: Create Profile Model (if needed)
php artisan make:model Profile

# Phase 6: Run Migrations
php artisan migrate

# Phase 6: Create Storage Symlink
php artisan storage:link

# Phase 7: Run Tests
php artisan test --filter=PublicJobPostingsTest

# Build Frontend Assets
npm run build

# Clear Caches
php artisan optimize:clear
```

---

**End of Implementation Plan**
