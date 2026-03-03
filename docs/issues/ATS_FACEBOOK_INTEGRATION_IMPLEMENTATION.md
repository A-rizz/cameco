# ATS Facebook Integration - Implementation Plan

**Feature:** Facebook Job Posting Integration  
**Module:** ATS (Applicant Tracking System)  
**Priority:** MEDIUM  
**Estimated Duration:** 3-4 days  
**Current Status:** ⏳ PLANNING - JobPosting system exists, Facebook integration to be added

---

## 📋 Overview

Integrate Facebook Graph API to allow HR staff to automatically post job openings to the company's Facebook Page directly from the HRIS. This reduces manual work and ensures all job postings are tracked in the ATS while reaching candidates on social media.

### Current State
- ✅ Job postings managed at `/hr/ats/job-postings`
- ✅ CRUD operations functional with real database
- ✅ Status workflow (draft → open → closed)
- ❌ No Facebook integration
- ❌ No social media tracking
- ❌ Manual Facebook posting required

### Target State
- ✅ One-click Facebook posting from HR dashboard
- ✅ Automatic cross-posting when job is published
- ✅ Facebook post tracking (post ID, link, engagement)
- ✅ Facebook post preview before publishing
- ✅ Link back to public job postings page
- ✅ Activity log for Facebook posts

---

## � Development vs Production Setup

### ⚡ Quick Development Setup (No Business URL Required)

For local development, you **do not need** your official business domain. However, **Facebook requires a proper domain format with TLD (.com, .org, .local, etc.) - `localhost:8000` alone will not work.**

**Option 1: Local Domain with .local TLD (Recommended)**

1. **Add to your hosts file:**
   
   **Windows (`C:\Windows\System32\drivers\etc\hosts`):**
   ```
   127.0.0.1 cameco.local
   ```
   
   **Mac/Linux (`/etc/hosts`):**
   ```
   127.0.0.1 cameco.local
   ```

2. **Facebook App Settings:**
   - Site URL: `http://cameco.local:8000`
   - Privacy Policy URL: `http://cameco.local:8000/privacy`
   - Terms of Service URL: `http://cameco.local:8000/terms`
   - App Mode: `Development`

3. **Laravel Configuration:**
   ```env
   APP_URL=http://cameco.local:8000
   ```

4. **Access locally:**
   - Open browser: `http://cameco.local:8000`
   - Facebook will accept this domain format

**Option 3: ngrok (Public Tunnel to Localhost)**

If you need a real HTTPS domain temporarily:

```bash
# 1. Install ngrok from https://ngrok.com/
# 2. Run ngrok to expose localhost
ngrok http 8000

# 3. You'll get a URL like: https://abc1234.ngrok.io
# 4. Use in Facebook App:
#    - Site URL: https://abc1234.ngrok.io
#    - Privacy/Terms: https://abc1234.ngrok.io/privacy
```

**Option 4: Test Domain (.test TLD)**

Use a test-reserved domain:

1. **Add to hosts file:**
   ```
   127.0.0.1 cameco.test
   ```

2. **Facebook App Settings:**
   - Site URL: `http://cameco.test:8000`
   - Privacy Policy: `http://cameco.test:8000/privacy`
   - Terms of Service: `http://cameco.test:8000/terms`

### Environment Detection

The config automatically detects your environment:

```php
// config/facebook.php
'development_mode' => env('APP_ENV') === 'local',  // Auto-detected
'site_url' => env('APP_ENV') === 'local' 
    ? env('APP_URL', 'http://cameco.local:8000')      // Dev: use .local domain
    : env('APP_URL'),                                // Prod: your business domain
```

**Important:** Update `APP_URL` in .env.local to match your hosts file entry:

```env
# .env.local
APP_ENV=local
APP_URL=http://cameco.local:8000
```

### Quick Setup with Caddy

**All Platforms (Windows/Mac/Linux):**
```bash
# 1. Install Caddy (choose your OS above)

# 2. Create Caddyfile in your project root with:
# cameco.local {
#     reverse_proxy localhost:8000
#     handle_path /@vite* {
#         reverse_proxy localhost:5173
#     }
# }

# 3. Run from project root
caddy run

# 4. Access at http://cameco.local
```

⚠️ **Why localhost:8000 doesn't work:** Facebook's URL validator requires a properly formatted domain with TLD to prevent abuse. Development mode doesn't bypass this validation. Caddy eliminates the need to modify your system's hosts file!

---

## �📊 Database Schema Extensions

### New Migration: Add Facebook Tracking to job_postings

```sql
ALTER TABLE job_postings ADD COLUMN:
- facebook_post_id (string, nullable) - Facebook post ID
- facebook_post_url (string, nullable) - Direct link to Facebook post
- facebook_posted_at (timestamp, nullable) - When posted to Facebook
- auto_post_facebook (boolean, default false) - Auto-post when published
```

### New Table: facebook_post_logs

```sql
CREATE TABLE facebook_post_logs (
    id BIGINT PRIMARY KEY,
    job_posting_id BIGINT FOREIGN KEY,
    facebook_post_id STRING,
    facebook_post_url STRING,
    post_type ENUM('manual', 'auto'),
    status ENUM('pending', 'posted', 'failed'),
    error_message TEXT NULLABLE,
    engagement_metrics JSON NULLABLE,
    posted_by BIGINT FOREIGN KEY (users),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Phase 1: Facebook App Setup & Configuration

**Duration:** 0.5 days

### Task 1.1: Facebook Developer Account Setup

**Goal:** Set up Facebook App with required permissions.

**Prerequisites:**
- Company Facebook Page must exist
- Facebook Business account with Page admin access
- Developer account access

**Implementation Steps:**

1. **Create Facebook App:**
   - Go to https://developers.facebook.com/apps/
   - Click "Create App"
   - Choose "Business" type
   - App Name: "Cathay Metal HRIS"
   - Contact Email: company email
   - Business Account: Select company account

2. **Configure App Permissions:**
   - Go to App Dashboard → Settings → Basic
   - Add Platform: Website
   - **For Development:**
     - Site URL: `http://cameco.local:8000` (using .local domain from hosts file)
     - Privacy Policy URL: `http://cameco.local:8000/privacy`
     - Terms of Service URL: `http://cameco.local:8000/terms`
   - **For Production:**
     - Site URL: Your production domain (e.g., https://cameco.cathaymetal.com)
     - Privacy Policy URL: Add your privacy policy
     - Terms of Service URL: Add your terms
   - **Tip:** Set App Mode to "Development" for local testing

3. **Request Permissions:**
   - Go to App Dashboard → Permissions
   - Request these permissions:
     - `pages_manage_posts` - Publish posts to Page
     - `pages_read_engagement` - Read post engagement
     - `pages_show_list` - Access Page list
   - Submit for Facebook review (may take 3-5 days)

4. **Get Access Tokens:**
   - Go to Tools → Graph API Explorer
   - Select your app
   - Select permissions: pages_manage_posts, pages_read_engagement
   - Generate User Access Token
   - Use Access Token Tool to get Page Access Token
   - **Save Page Access Token** (long-lived)

5. **Get Page ID:**
   - Go to your Facebook Page
   - Settings → Page Info
   - Copy Page ID
   - Or use Graph API: `GET /me/accounts`

**Files Created:**
- None (external setup only)

**Credentials Needed:**
- App ID
- App Secret
- Page ID
- Page Access Token (long-lived)

**Verification:**
- ✅ Facebook App created and configured
- ✅ Permissions approved by Facebook
- ✅ Page Access Token obtained
- ✅ Can make test API calls to Graph API

---

### Task 1.2: Laravel Configuration for Facebook API

**Goal:** Store Facebook credentials securely in Laravel environment.

**Implementation Steps:**

1. **Add Environment Variables:**
   
   **Development (.env.local):**
   ```env
   # For local development
   FACEBOOK_INTEGRATION_ENABLED=false  # Enable after app setup
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   FACEBOOK_PAGE_ID=your_page_id
   FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_token
   FACEBOOK_API_VERSION=v18.0
   APP_URL=http://localhost:8000  # Auto-detected for dev
   ```
   
   **Production (.env):**
   ```env
   # For production
   FACEBOOK_INTEGRATION_ENABLED=true
   FACEBOOK_APP_ID=your_app_id
   FACEBOOK_APP_SECRET=your_app_secret
   FACEBOOK_PAGE_ID=your_page_id
   FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_token
   FACEBOOK_API_VERSION=v18.0
   APP_URL=https://hris.cathaymetal.com
   ```

2. **Create Facebook Config File:**
   ```php
   <?php
   // config/facebook.php
   
   return [
       'app_id' => env('FACEBOOK_APP_ID'),
       'app_secret' => env('FACEBOOK_APP_SECRET'),
       'page_id' => env('FACEBOOK_PAGE_ID'),
       'page_access_token' => env('FACEBOOK_PAGE_ACCESS_TOKEN'),
       'api_version' => env('FACEBOOK_API_VERSION', 'v18.0'),
       'graph_url' => 'https://graph.facebook.com',
       
       // Feature flags
       'enabled' => env('FACEBOOK_INTEGRATION_ENABLED', false),
       'auto_post' => env('FACEBOOK_AUTO_POST_ENABLED', false),
       
       // Development mode detection
       'development_mode' => env('APP_ENV') === 'local',
       
       // Environment-aware site URL
       'site_url' => env('APP_ENV') === 'local' 
           ? env('APP_URL', 'http://localhost:8000')
           : env('APP_URL'),
       
       // Job posting settings
       'job_post_template' => env('FACEBOOK_JOB_POST_TEMPLATE', 'default'),
       'include_link' => env('FACEBOOK_INCLUDE_LINK', true),
   ];
   ```

3. **Create Placeholder Privacy/Terms Pages (Development Only):**
   
   Create simple local pages for Facebook App validation:
   ```php
   // routes/web.php
   Route::get('/privacy', function () {
       return 'Privacy Policy - Development Version';
   });
   
   Route::get('/terms', function () {
       return 'Terms of Service - Development Version';
   });
   ```

4. **Install Facebook SDK (Optional but Recommended):**
   ```bash
   composer require facebook/graph-sdk
   ```
   
   If not using SDK, use Laravel HTTP client for API calls.

**Files to Create:**
- `config/facebook.php`

**Files to Modify:**
- `.env.local` (development credentials)
- `.env.example` (add Facebook placeholders)
- `routes/web.php` (add privacy/terms routes for development)

**Development Setup:**
```bash
# 1. Install and run Caddy (recommended)
brew install caddy  # or choco install caddy (Windows) or apt-get install caddy (Linux)

# 2. Create Caddyfile in project root
cat > Caddyfile << 'EOF'
cameco.local {
    reverse_proxy localhost:8000
    
    handle_path /@vite* {
        reverse_proxy localhost:5173
    }
}
EOF

# 3. Run Caddy
caddy run

# 4. Create .env.local for development
cp .env .env.local

# 5. Add to .env.local
FACEBOOK_INTEGRATION_ENABLED=false  # Change to true after Facebook App setup
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_token
APP_URL=http://cameco.local

# 6. In browser, access: http://cameco.local (no port needed!)
```

**Verification:**
- ✅ Caddy installed and running
- ✅ Caddyfile created in project root
- ✅ Config file created
- ✅ Environment variables set in .env.local
- ✅ Laravel accessible at `http://cameco.local`
- ✅ Vite hot reload accessible at `http://cameco.local/@vite`
- ✅ Config values accessible: `config('facebook.app_id')`
- ✅ Development mode detected: `config('facebook.development_mode')`
- ✅ Privacy/Terms pages accessible at cameco.local
- ✅ Facebook SDK installed (if using)

---

## Phase 2: Database Schema Updates

**Duration:** 0.5 days

### Task 2.1: Create Migration for Facebook Tracking Fields

**Goal:** Add Facebook tracking columns to job_postings table.

**Implementation Steps:**

1. **Generate Migration:**
   ```bash
   php artisan make:migration add_facebook_tracking_to_job_postings_table
   ```

2. **Migration Content:**
   ```php
   <?php
   
   use Illuminate\Database\Migrations\Migration;
   use Illuminate\Database\Schema\Blueprint;
   use Illuminate\Support\Facades\Schema;
   
   return new class extends Migration
   {
       public function up(): void
       {
           Schema::table('job_postings', function (Blueprint $table) {
               // Facebook Integration Fields
               $table->string('facebook_post_id')->nullable()
                   ->comment('Facebook post ID from Graph API');
               $table->string('facebook_post_url')->nullable()
                   ->comment('Direct URL to Facebook post');
               $table->timestamp('facebook_posted_at')->nullable()
                   ->comment('Timestamp when posted to Facebook');
               $table->boolean('auto_post_facebook')->default(false)
                   ->comment('Automatically post to Facebook when published');
               
               // Indexes
               $table->index('facebook_post_id', 'idx_job_postings_facebook_post');
           });
       }
       
       public function down(): void
       {
           Schema::table('job_postings', function (Blueprint $table) {
               $table->dropIndex('idx_job_postings_facebook_post');
               $table->dropColumn([
                   'facebook_post_id',
                   'facebook_post_url',
                   'facebook_posted_at',
                   'auto_post_facebook',
               ]);
           });
       }
   };
   ```

3. **Run Migration:**
   ```bash
   php artisan migrate
   ```

**Files to Create:**
- `database/migrations/YYYY_MM_DD_HHMMSS_add_facebook_tracking_to_job_postings_table.php`

**Verification:**
- ✅ Migration runs without errors
- ✅ Columns added to job_postings table
- ✅ Index created on facebook_post_id

---

### Task 2.2: Create facebook_post_logs Table

**Goal:** Create table to track all Facebook posting activity.

**Implementation Steps:**

1. **Generate Migration:**
   ```bash
   php artisan make:migration create_facebook_post_logs_table
   ```

2. **Migration Content:**
   ```php
   <?php
   
   use Illuminate\Database\Migrations\Migration;
   use Illuminate\Database\Schema\Blueprint;
   use Illuminate\Support\Facades\Schema;
   
   return new class extends Migration
   {
       public function up(): void
       {
           Schema::create('facebook_post_logs', function (Blueprint $table) {
               // Primary Key
               $table->id();
               
               // Job Posting Reference
               $table->foreignId('job_posting_id')
                   ->constrained('job_postings')
                   ->onDelete('cascade')
                   ->comment('Reference to job posting');
               
               // Facebook Data
               $table->string('facebook_post_id')->nullable()
                   ->comment('Facebook post ID from API response');
               $table->string('facebook_post_url')->nullable()
                   ->comment('Direct URL to Facebook post');
               
               // Post Metadata
               $table->enum('post_type', ['manual', 'auto'])
                   ->default('manual')
                   ->comment('How post was triggered');
               $table->enum('status', ['pending', 'posted', 'failed'])
                   ->default('pending')
                   ->comment('Post status');
               $table->text('error_message')->nullable()
                   ->comment('Error message if posting failed');
               
               // Engagement Metrics (updated periodically)
               $table->json('engagement_metrics')->nullable()
                   ->comment('Likes, shares, comments, reach');
               $table->timestamp('metrics_updated_at')->nullable()
                   ->comment('Last time engagement metrics were fetched');
               
               // Audit Fields
               $table->foreignId('posted_by')
                   ->constrained('users')
                   ->comment('User who triggered the post');
               $table->timestamps();
               
               // Indexes
               $table->index('job_posting_id', 'idx_fb_logs_job_posting');
               $table->index('status', 'idx_fb_logs_status');
               $table->index('created_at', 'idx_fb_logs_created_at');
               
               // Table Comment
               $table->comment('Log of all Facebook job posting activity');
           });
       }
       
       public function down(): void
       {
           Schema::dropIfExists('facebook_post_logs');
       }
   };
   ```

3. **Run Migration:**
   ```bash
   php artisan migrate
   ```

**Files to Create:**
- `database/migrations/YYYY_MM_DD_HHMMSS_create_facebook_post_logs_table.php`

**Verification:**
- ✅ Migration runs without errors
- ✅ facebook_post_logs table created
- ✅ Foreign keys reference job_postings and users

---

### Task 2.3: Update JobPosting Model

**Goal:** Add Facebook-related fields and relationships to model.

**Implementation Steps:**

1. **Update JobPosting Model:**
   ```php
   <?php
   
   namespace App\Models;
   
   use Illuminate\Database\Eloquent\Model;
   use Illuminate\Database\Eloquent\Relations\HasMany;
   
   class JobPosting extends Model
   {
       protected $fillable = [
           'title',
           'department_id',
           'description',
           'requirements',
           'status',
           'posted_at',
           'closed_at',
           'created_by',
           // Facebook fields
           'facebook_post_id',
           'facebook_post_url',
           'facebook_posted_at',
           'auto_post_facebook',
       ];
       
       protected $casts = [
           'posted_at' => 'datetime',
           'closed_at' => 'datetime',
           'facebook_posted_at' => 'datetime',
           'auto_post_facebook' => 'boolean',
       ];
       
       // Existing relationships...
       
       /**
        * Relationship: JobPosting has many Facebook post logs
        */
       public function facebookPostLogs(): HasMany
       {
           return $this->hasMany(FacebookPostLog::class)->orderBy('created_at', 'desc');
       }
       
       /**
        * Check if job has been posted to Facebook
        */
       public function isPostedToFacebook(): bool
       {
           return !is_null($this->facebook_post_id);
       }
       
       /**
        * Get the latest Facebook post log
        */
       public function latestFacebookPost()
       {
           return $this->facebookPostLogs()->where('status', 'posted')->latest()->first();
       }
       
       /**
        * Scope: Jobs with Facebook posts
        */
       public function scopePostedToFacebook($query)
       {
           return $query->whereNotNull('facebook_post_id');
       }
   }
   ```

**Files to Modify:**
- `app/Models/JobPosting.php`

**Verification:**
- ✅ Model updated with new fields
- ✅ Casts configured correctly
- ✅ Helper methods work
- ✅ Relationship methods defined

---

### Task 2.4: Create FacebookPostLog Model

**Goal:** Create Eloquent model for Facebook post logs.

**Implementation Steps:**

1. **Generate Model:**
   ```bash
   php artisan make:model FacebookPostLog
   ```

2. **Model Implementation:**
   ```php
   <?php
   
   namespace App\Models;
   
   use Illuminate\Database\Eloquent\Model;
   use Illuminate\Database\Eloquent\Relations\BelongsTo;
   use Illuminate\Database\Eloquent\Factories\HasFactory;
   
   /**
    * FacebookPostLog Model
    * 
    * @property int $id
    * @property int $job_posting_id
    * @property string|null $facebook_post_id
    * @property string|null $facebook_post_url
    * @property string $post_type
    * @property string $status
    * @property string|null $error_message
    * @property array|null $engagement_metrics
    * @property \Carbon\Carbon|null $metrics_updated_at
    * @property int $posted_by
    * @property \Carbon\Carbon $created_at
    * @property \Carbon\Carbon $updated_at
    * 
    * @property-read JobPosting $jobPosting
    * @property-read User $postedBy
    */
   class FacebookPostLog extends Model
   {
       use HasFactory;
       
       protected $fillable = [
           'job_posting_id',
           'facebook_post_id',
           'facebook_post_url',
           'post_type',
           'status',
           'error_message',
           'engagement_metrics',
           'metrics_updated_at',
           'posted_by',
       ];
       
       protected $casts = [
           'engagement_metrics' => 'array',
           'metrics_updated_at' => 'datetime',
           'created_at' => 'datetime',
           'updated_at' => 'datetime',
       ];
       
       /**
        * Relationship: Log belongs to job posting
        */
       public function jobPosting(): BelongsTo
       {
           return $this->belongsTo(JobPosting::class);
       }
       
       /**
        * Relationship: Log belongs to user who posted
        */
       public function postedBy(): BelongsTo
       {
           return $this->belongsTo(User::class, 'posted_by');
       }
       
       /**
        * Check if post was successful
        */
       public function isSuccessful(): bool
       {
           return $this->status === 'posted';
       }
       
       /**
        * Check if post failed
        */
       public function isFailed(): bool
       {
           return $this->status === 'failed';
       }
       
       /**
        * Scope: Successful posts
        */
       public function scopeSuccessful($query)
       {
           return $query->where('status', 'posted');
       }
       
       /**
        * Scope: Failed posts
        */
       public function scopeFailed($query)
       {
           return $query->where('status', 'failed');
       }
   }
   ```

**Files to Create:**
- `app/Models/FacebookPostLog.php`

**Verification:**
- ✅ Model loads without errors
- ✅ Relationships work correctly
- ✅ Helper methods function properly
- ✅ Casts convert types correctly

---

## Phase 3: Facebook Service Implementation

**Duration:** 1 day

### Task 3.1: Create FacebookService

**Goal:** Create service class to handle all Facebook Graph API interactions.

**Implementation Steps:**

1. **Generate Service:**
   ```bash
   mkdir -p app/Services/Social
   ```

2. **Create FacebookService:**
   ```php
   <?php
   
   namespace App\Services\Social;
   
   use App\Models\JobPosting;
   use App\Models\FacebookPostLog;
   use Illuminate\Support\Facades\Http;
   use Illuminate\Support\Facades\Log;
   use Exception;
   
   class FacebookService
   {
       protected string $graphUrl;
       protected string $pageId;
       protected string $pageAccessToken;
       protected string $apiVersion;
       protected bool $enabled;
       
       public function __construct()
       {
           $this->graphUrl = config('facebook.graph_url');
           $this->pageId = config('facebook.page_id');
           $this->pageAccessToken = config('facebook.page_access_token');
           $this->apiVersion = config('facebook.api_version');
           $this->enabled = config('facebook.enabled');
       }
       
       /**
        * Check if Facebook integration is enabled
        */
       public function isEnabled(): bool
       {
           return $this->enabled && 
                  !empty($this->pageId) && 
                  !empty($this->pageAccessToken);
       }
       
       /**
        * Post job to Facebook Page
        */
       public function postJob(JobPosting $jobPosting, int $userId, bool $isAuto = false): array
       {
           if (!$this->isEnabled()) {
               throw new Exception('Facebook integration is not enabled or configured.');
           }
           
           // Create log entry
           $log = FacebookPostLog::create([
               'job_posting_id' => $jobPosting->id,
               'post_type' => $isAuto ? 'auto' : 'manual',
               'status' => 'pending',
               'posted_by' => $userId,
           ]);
           
           try {
               // Format job posting message
               $message = $this->formatJobMessage($jobPosting);
               $link = $this->getJobPostingLink($jobPosting);
               
               // Call Facebook Graph API
               $response = Http::post("{$this->graphUrl}/{$this->apiVersion}/{$this->pageId}/feed", [
                   'message' => $message,
                   'link' => $link,
                   'access_token' => $this->pageAccessToken,
               ]);
               
               if ($response->successful()) {
                   $data = $response->json();
                   $postId = $data['id'];
                   $postUrl = "https://www.facebook.com/{$postId}";
                   
                   // Update log as successful
                   $log->update([
                       'facebook_post_id' => $postId,
                       'facebook_post_url' => $postUrl,
                       'status' => 'posted',
                   ]);
                   
                   // Update job posting
                   $jobPosting->update([
                       'facebook_post_id' => $postId,
                       'facebook_post_url' => $postUrl,
                       'facebook_posted_at' => now(),
                   ]);
                   
                   Log::info("Facebook post created successfully", [
                       'job_posting_id' => $jobPosting->id,
                       'facebook_post_id' => $postId,
                   ]);
                   
                   return [
                       'success' => true,
                       'post_id' => $postId,
                       'post_url' => $postUrl,
                       'log_id' => $log->id,
                   ];
               } else {
                   throw new Exception($response->body());
               }
               
           } catch (Exception $e) {
               // Log error
               $log->update([
                   'status' => 'failed',
                   'error_message' => $e->getMessage(),
               ]);
               
               Log::error("Facebook post failed", [
                   'job_posting_id' => $jobPosting->id,
                   'error' => $e->getMessage(),
               ]);
               
               return [
                   'success' => false,
                   'error' => $e->getMessage(),
                   'log_id' => $log->id,
               ];
           }
       }
       
       /**
        * Format job posting message for Facebook
        */
       protected function formatJobMessage(JobPosting $jobPosting): string
       {
           $department = $jobPosting->department->name ?? 'Various Departments';
           
           $message = "🔔 We're Hiring! 🔔\n\n";
           $message .= "Position: {$jobPosting->title}\n";
           $message .= "Department: {$department}\n\n";
           $message .= "📋 Job Description:\n";
           $message .= strip_tags($jobPosting->description) . "\n\n";
           $message .= "✅ Requirements:\n";
           $message .= strip_tags($jobPosting->requirements) . "\n\n";
           $message .= "📩 Interested? Click the link below to apply online!\n";
           $message .= "#Hiring #JobOpening #CathayMetal #CareerOpportunity";
           
           return $message;
       }
       
       /**
        * Get public job posting link
        */
       protected function getJobPostingLink(JobPosting $jobPosting): string
       {
           // This will link to the public job postings page (to be created in next implementation)
           return url("/job-postings/{$jobPosting->id}");
       }
       
       /**
        * Fetch engagement metrics for a Facebook post
        */
       public function getPostEngagement(string $postId): ?array
       {
           try {
               $response = Http::get("{$this->graphUrl}/{$this->apiVersion}/{$postId}", [
                   'fields' => 'likes.summary(true),comments.summary(true),shares',
                   'access_token' => $this->pageAccessToken,
               ]);
               
               if ($response->successful()) {
                   $data = $response->json();
                   
                   return [
                       'likes' => $data['likes']['summary']['total_count'] ?? 0,
                       'comments' => $data['comments']['summary']['total_count'] ?? 0,
                       'shares' => $data['shares']['count'] ?? 0,
                       'fetched_at' => now()->toISOString(),
                   ];
               }
           } catch (Exception $e) {
               Log::error("Failed to fetch Facebook engagement", [
                   'post_id' => $postId,
                   'error' => $e->getMessage(),
               ]);
           }
           
           return null;
       }
       
       /**
        * Update engagement metrics for job posting
        */
       public function updateEngagementMetrics(JobPosting $jobPosting): bool
       {
           if (!$jobPosting->isPostedToFacebook()) {
               return false;
           }
           
           $log = $jobPosting->latestFacebookPost();
           if (!$log) {
               return false;
           }
           
           $metrics = $this->getPostEngagement($log->facebook_post_id);
           
           if ($metrics) {
               $log->update([
                   'engagement_metrics' => $metrics,
                   'metrics_updated_at' => now(),
               ]);
               return true;
           }
           
           return false;
       }
       
       /**
        * Delete Facebook post
        */
       public function deletePost(string $postId): bool
       {
           try {
               $response = Http::delete("{$this->graphUrl}/{$this->apiVersion}/{$postId}", [
                   'access_token' => $this->pageAccessToken,
               ]);
               
               return $response->successful();
           } catch (Exception $e) {
               Log::error("Failed to delete Facebook post", [
                   'post_id' => $postId,
                   'error' => $e->getMessage(),
               ]);
               return false;
           }
       }
       
       /**
        * Test Facebook connection
        */
       public function testConnection(): array
       {
           try {
               $response = Http::get("{$this->graphUrl}/{$this->apiVersion}/{$this->pageId}", [
                   'fields' => 'name,id',
                   'access_token' => $this->pageAccessToken,
               ]);
               
               if ($response->successful()) {
                   return [
                       'success' => true,
                       'page_name' => $response->json()['name'],
                       'page_id' => $response->json()['id'],
                   ];
               } else {
                   return [
                       'success' => false,
                       'error' => $response->body(),
                   ];
               }
           } catch (Exception $e) {
               return [
                   'success' => false,
                   'error' => $e->getMessage(),
               ];
           }
       }
   }
   ```

**Files to Create:**
- `app/Services/Social/FacebookService.php`

**Verification:**
- ✅ Service class can be instantiated
- ✅ `isEnabled()` returns correct status
- ✅ `testConnection()` successfully connects to Facebook
- ✅ Message formatting works correctly

---

### Task 3.2: Register FacebookService in Container

**Goal:** Make FacebookService available throughout the application.

**Implementation Steps:**

1. **Register in AppServiceProvider:**
   ```php
   <?php
   
   namespace App\Providers;
   
   use Illuminate\Support\ServiceProvider;
   use App\Services\Social\FacebookService;
   
   class AppServiceProvider extends ServiceProvider
   {
       public function register(): void
       {
           // Register FacebookService as singleton
           $this->app->singleton(FacebookService::class, function ($app) {
               return new FacebookService();
           });
       }
       
       public function boot(): void
       {
           //
       }
   }
   ```

**Files to Modify:**
- `app/Providers/AppServiceProvider.php`

**Verification:**
- ✅ Service can be resolved: `app(FacebookService::class)`
- ✅ Service is singleton (same instance)
- ✅ Service methods accessible

---

## Phase 4: Controller Integration

**Duration:** 0.75 days

### Task 4.1: Add Facebook Methods to JobPostingController

**Goal:** Add controller methods to handle Facebook posting actions.

**Implementation Steps:**

1. **Add Facebook Methods:**
   ```php
   <?php
   
   namespace App\Http\Controllers\HR\ATS;
   
   use App\Services\Social\FacebookService;
   use Illuminate\Support\Facades\Auth;
   
   class JobPostingController extends Controller
   {
       protected FacebookService $facebookService;
       
       public function __construct(FacebookService $facebookService)
       {
           $this->facebookService = $facebookService;
       }
       
       // ... existing methods ...
       
       /**
        * Post job to Facebook Page
        */
       public function postToFacebook(JobPosting $jobPosting)
       {
           // Check if already posted
           if ($jobPosting->isPostedToFacebook()) {
               return response()->json([
                   'success' => false,
                   'message' => 'This job has already been posted to Facebook.',
               ], 400);
           }
           
           // Post to Facebook
           $result = $this->facebookService->postJob($jobPosting, Auth::id(), false);
           
           if ($result['success']) {
               return response()->json([
                   'success' => true,
                   'message' => 'Job posted to Facebook successfully!',
                   'data' => $result,
               ]);
           } else {
               return response()->json([
                   'success' => false,
                   'message' => 'Failed to post to Facebook: ' . $result['error'],
               ], 500);
           }
       }
       
       /**
        * Preview Facebook post message
        */
       public function previewFacebookPost(JobPosting $jobPosting)
       {
           $reflectionClass = new \ReflectionClass($this->facebookService);
           $method = $reflectionClass->getMethod('formatJobMessage');
           $method->setAccessible(true);
           
           $message = $method->invoke($this->facebookService, $jobPosting);
           $link = url("/job-postings/{$jobPosting->id}");
           
           return response()->json([
               'success' => true,
               'preview' => [
                   'message' => $message,
                   'link' => $link,
               ],
           ]);
       }
       
       /**
        * Get Facebook post logs for a job
        */
       public function getFacebookLogs(JobPosting $jobPosting)
       {
           $logs = $jobPosting->facebookPostLogs()
               ->with('postedBy:id,name')
               ->get()
               ->map(fn($log) => [
                   'id' => $log->id,
                   'facebook_post_id' => $log->facebook_post_id,
                   'facebook_post_url' => $log->facebook_post_url,
                   'post_type' => $log->post_type,
                   'status' => $log->status,
                   'error_message' => $log->error_message,
                   'engagement_metrics' => $log->engagement_metrics,
                   'posted_by' => $log->postedBy->name,
                   'created_at' => $log->created_at->format('Y-m-d H:i:s'),
               ]);
           
           return response()->json([
               'success' => true,
               'logs' => $logs,
           ]);
       }
       
       /**
        * Refresh engagement metrics
        */
       public function refreshEngagementMetrics(JobPosting $jobPosting)
       {
           if (!$jobPosting->isPostedToFacebook()) {
               return response()->json([
                   'success' => false,
                   'message' => 'Job has not been posted to Facebook.',
               ], 400);
           }
           
           $updated = $this->facebookService->updateEngagementMetrics($jobPosting);
           
           if ($updated) {
               $log = $jobPosting->latestFacebookPost();
               return response()->json([
                   'success' => true,
                   'message' => 'Engagement metrics updated successfully.',
                   'metrics' => $log->engagement_metrics,
               ]);
           } else {
               return response()->json([
                   'success' => false,
                   'message' => 'Failed to update engagement metrics.',
               ], 500);
           }
       }
       
       /**
        * Modified publish method with Facebook auto-post
        */
       public function publish(JobPosting $jobPosting)
       {
           $jobPosting->update([
               'status' => 'open',
               'posted_at' => now(),
           ]);
           
           // Auto-post to Facebook if enabled
           if ($this->facebookService->isEnabled() && $jobPosting->auto_post_facebook) {
               $this->facebookService->postJob($jobPosting, Auth::id(), true);
           }
           
           return redirect()->back()->with('success', 'Job posting published.');
       }
   }
   ```

**Files to Modify:**
- `app/Http/Controllers/HR/ATS/JobPostingController.php`

**Verification:**
- ✅ Facebook methods added to controller
- ✅ Dependency injection works
- ✅ Methods return correct responses

---

### Task 4.2: Add Routes for Facebook Actions

**Goal:** Add routes for Facebook posting actions.

**Implementation Steps:**

1. **Add Routes:**
   ```php
   // routes/web.php
   
   Route::middleware(['auth'])
       ->prefix('hr/ats')
       ->name('hr.ats.')
       ->group(function () {
           
           // ... existing routes ...
           
           // Facebook Integration Routes
           Route::post('job-postings/{jobPosting}/post-to-facebook', 
               [JobPostingController::class, 'postToFacebook'])
               ->name('job-postings.post-to-facebook');
           
           Route::get('job-postings/{jobPosting}/facebook-preview', 
               [JobPostingController::class, 'previewFacebookPost'])
               ->name('job-postings.facebook-preview');
           
           Route::get('job-postings/{jobPosting}/facebook-logs', 
               [JobPostingController::class, 'getFacebookLogs'])
               ->name('job-postings.facebook-logs');
           
           Route::post('job-postings/{jobPosting}/refresh-facebook-metrics', 
               [JobPostingController::class, 'refreshEngagementMetrics'])
               ->name('job-postings.refresh-facebook-metrics');
       });
   ```

**Files to Modify:**
- `routes/web.php`

**Verification:**
- ✅ Routes registered: `php artisan route:list | grep facebook`
- ✅ Routes accessible with authentication
- ✅ Route names work correctly

---

## Phase 5: Frontend Integration

**Duration:** 1 day

### Task 5.1: Update JobPosting Index Page with Facebook UI

**Goal:** Add Facebook posting buttons and status indicators to job postings list.

**Implementation Steps:**

1. **Update Index.tsx:**
   ```tsx
   // Add Facebook button handler
   const handlePostToFacebook = async (job: JobPosting) => {
     if (job.facebook_post_id) {
       alert('This job has already been posted to Facebook.');
       return;
     }
     
     if (!confirm(`Post "${job.title}" to Facebook?`)) {
       return;
     }
     
     try {
       const response = await axios.post(`/hr/ats/job-postings/${job.id}/post-to-facebook`);
       
       if (response.data.success) {
         alert('Posted to Facebook successfully!');
         window.location.reload();
       }
     } catch (error: any) {
       const message = error.response?.data?.message || 'Failed to post to Facebook';
       alert(message);
     }
   };
   
   // Add Facebook status badge to job card
   {job.facebook_post_id && (
     <Badge variant="secondary" className="gap-1">
       <Facebook className="h-3 w-3" />
       Posted to Facebook
     </Badge>
   )}
   
   // Add Facebook button to actions
   {job.status === 'open' && !job.facebook_post_id && (
     <Button
       variant="outline"
       size="sm"
       onClick={() => handlePostToFacebook(job)}
       className="gap-2"
     >
       <Facebook className="h-4 w-4" />
       Post to Facebook
     </Button>
   )}
   
   // Show Facebook URL if posted
   {job.facebook_post_url && (
     <a 
       href={job.facebook_post_url} 
       target="_blank" 
       rel="noopener noreferrer"
       className="text-blue-600 hover:underline text-sm"
     >
       View on Facebook →
     </a>
   )}
   ```

**Files to Modify:**
- `resources/js/pages/HR/ATS/JobPostings/Index.tsx`

---

### Task 5.2: Add Facebook Preview Modal

**Goal:** Create modal to preview Facebook post before publishing.

**Implementation Steps:**

1. **Create FacebookPreviewModal Component:**
   ```tsx
   // resources/js/components/ats/FacebookPreviewModal.tsx
   
   import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
   import { Button } from '@/components/ui/button';
   import { Facebook } from 'lucide-react';
   import { useState, useEffect } from 'react';
   import axios from 'axios';
   
   interface FacebookPreviewModalProps {
     isOpen: boolean;
     onClose: () => void;
     jobPosting: JobPosting;
     onConfirm: () => void;
   }
   
   export function FacebookPreviewModal({
     isOpen,
     onClose,
     jobPosting,
     onConfirm,
   }: FacebookPreviewModalProps) {
     const [preview, setPreview] = useState<{message: string, link: string} | null>(null);
     const [loading, setLoading] = useState(false);
     
     useEffect(() => {
       if (isOpen && jobPosting) {
         fetchPreview();
       }
     }, [isOpen, jobPosting]);
     
     const fetchPreview = async () => {
       setLoading(true);
       try {
         const response = await axios.get(`/hr/ats/job-postings/${jobPosting.id}/facebook-preview`);
         setPreview(response.data.preview);
       } catch (error) {
         console.error('Failed to fetch preview:', error);
       } finally {
         setLoading(false);
       }
     };
     
     return (
       <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Facebook className="h-5 w-5 text-blue-600" />
               Facebook Post Preview
             </DialogTitle>
           </DialogHeader>
           
           {loading ? (
             <div className="py-8 text-center">Loading preview...</div>
           ) : preview ? (
             <div className="space-y-4">
               {/* Facebook Post Mockup */}
               <div className="bg-white border rounded-lg p-4 shadow-sm">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                     <Facebook className="h-6 w-6 text-white" />
                   </div>
                   <div>
                     <div className="font-semibold">Cathay Metal Corporation</div>
                     <div className="text-xs text-gray-500">Just now · Public</div>
                   </div>
                 </div>
                 
                 <div className="whitespace-pre-wrap text-sm mb-3">
                   {preview.message}
                 </div>
                 
                 <div className="border rounded bg-gray-50 p-3">
                   <div className="text-xs text-gray-500 uppercase mb-1">Link Preview</div>
                   <div className="font-medium text-blue-600">{preview.link}</div>
                 </div>
               </div>
               
               {/* Actions */}
               <div className="flex justify-end gap-2">
                 <Button variant="outline" onClick={onClose}>
                   Cancel
                 </Button>
                 <Button onClick={onConfirm} className="gap-2">
                   <Facebook className="h-4 w-4" />
                   Post to Facebook
                 </Button>
               </div>
             </div>
           ) : (
             <div className="py-8 text-center text-gray-500">
               Failed to load preview
             </div>
           )}
         </DialogContent>
       </Dialog>
     );
   }
   ```

**Files to Create:**
- `resources/js/components/ats/FacebookPreviewModal.tsx`

---

### Task 5.3: Update JobPosting Form with Auto-Post Option

**Goal:** Add checkbox to enable auto-posting to Facebook when publishing.

**Implementation Steps:**

1. **Update CreateEditModal.tsx:**
   ```tsx
   // Add auto_post_facebook field
   const [formData, setFormData] = useState({
     title: '',
     department_id: '',
     description: '',
     requirements: '',
     status: 'draft',
     auto_post_facebook: false, // NEW FIELD
   });
   
   // Add checkbox in form
   <div className="space-y-2">
     <label className="flex items-center gap-2 cursor-pointer">
       <input
         type="checkbox"
         checked={formData.auto_post_facebook}
         onChange={(e) => setFormData({
           ...formData,
           auto_post_facebook: e.target.checked
         })}
         className="rounded"
       />
       <span className="text-sm">
         Automatically post to Facebook when published
       </span>
     </label>
     <p className="text-xs text-gray-500 ml-6">
       When enabled, this job will be posted to your company's Facebook Page as soon as it's published.
     </p>
   </div>
   ```

**Files to Modify:**
- `resources/js/pages/HR/ATS/JobPostings/CreateEditModal.tsx`

---

### Task 5.4: Add Facebook Logs View

**Goal:** Show Facebook posting history and engagement metrics.

**Implementation Steps:**

1. **Create FacebookLogsModal Component:**
   ```tsx
   // resources/js/components/ats/FacebookLogsModal.tsx
   
   import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
   import { Badge } from '@/components/ui/badge';
   import { Button } from '@/components/ui/button';
   import { Facebook, ThumbsUp, MessageCircle, Share2, RefreshCw } from 'lucide-react';
   import { useState, useEffect } from 'react';
   import axios from 'axios';
   
   interface FacebookLog {
     id: number;
     facebook_post_id: string;
     facebook_post_url: string;
     post_type: 'manual' | 'auto';
     status: 'pending' | 'posted' | 'failed';
     error_message?: string;
     engagement_metrics?: {
       likes: number;
       comments: number;
       shares: number;
       fetched_at: string;
     };
     posted_by: string;
     created_at: string;
   }
   
   interface FacebookLogsModalProps {
     isOpen: boolean;
     onClose: () => void;
     jobPosting: JobPosting;
   }
   
   export function FacebookLogsModal({
     isOpen,
     onClose,
     jobPosting,
   }: FacebookLogsModalProps) {
     const [logs, setLogs] = useState<FacebookLog[]>([]);
     const [loading, setLoading] = useState(false);
     const [refreshing, setRefreshing] = useState(false);
     
     useEffect(() => {
       if (isOpen) {
         fetchLogs();
       }
     }, [isOpen]);
     
     const fetchLogs = async () => {
       setLoading(true);
       try {
         const response = await axios.get(`/hr/ats/job-postings/${jobPosting.id}/facebook-logs`);
         setLogs(response.data.logs);
       } catch (error) {
         console.error('Failed to fetch logs:', error);
       } finally {
         setLoading(false);
       }
     };
     
     const refreshMetrics = async () => {
       setRefreshing(true);
       try {
         await axios.post(`/hr/ats/job-postings/${jobPosting.id}/refresh-facebook-metrics`);
         await fetchLogs();
         alert('Engagement metrics updated!');
       } catch (error: any) {
         alert(error.response?.data?.message || 'Failed to refresh metrics');
       } finally {
         setRefreshing(false);
       }
     };
     
     return (
       <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-w-3xl">
           <DialogHeader>
             <DialogTitle className="flex items-center justify-between">
               <span className="flex items-center gap-2">
                 <Facebook className="h-5 w-5 text-blue-600" />
                 Facebook Post History
               </span>
               {jobPosting.facebook_post_id && (
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={refreshMetrics}
                   disabled={refreshing}
                   className="gap-2"
                 >
                   <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                   Refresh Metrics
                 </Button>
               )}
             </DialogTitle>
           </DialogHeader>
           
           {loading ? (
             <div className="py-8 text-center">Loading logs...</div>
           ) : logs.length === 0 ? (
             <div className="py-8 text-center text-gray-500">
               No Facebook posts yet
             </div>
           ) : (
             <div className="space-y-4 max-h-96 overflow-y-auto">
               {logs.map((log) => (
                 <div key={log.id} className="border rounded-lg p-4 space-y-3">
                   <div className="flex items-start justify-between">
                     <div>
                       <div className="flex items-center gap-2">
                         <Badge variant={
                           log.status === 'posted' ? 'default' :
                           log.status === 'failed' ? 'destructive' :
                           'secondary'
                         }>
                           {log.status}
                         </Badge>
                         <Badge variant="outline">{log.post_type}</Badge>
                       </div>
                       <div className="text-sm text-gray-500 mt-1">
                         Posted by {log.posted_by} · {log.created_at}
                       </div>
                     </div>
                     
                     {log.facebook_post_url && (
                       <a
                         href={log.facebook_post_url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-blue-600 hover:underline text-sm"
                       >
                         View Post →
                       </a>
                     )}
                   </div>
                   
                   {log.error_message && (
                     <div className="bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                       {log.error_message}
                     </div>
                   )}
                   
                   {log.engagement_metrics && (
                     <div className="bg-gray-50 rounded p-3">
                       <div className="text-xs text-gray-500 mb-2">
                         Engagement (as of {new Date(log.engagement_metrics.fetched_at).toLocaleString()})
                       </div>
                       <div className="flex gap-4 text-sm">
                         <div className="flex items-center gap-1">
                           <ThumbsUp className="h-4 w-4 text-blue-600" />
                           <span>{log.engagement_metrics.likes} Likes</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <MessageCircle className="h-4 w-4 text-green-600" />
                           <span>{log.engagement_metrics.comments} Comments</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <Share2 className="h-4 w-4 text-purple-600" />
                           <span>{log.engagement_metrics.shares} Shares</span>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </DialogContent>
       </Dialog>
     );
   }
   ```

**Files to Create:**
- `resources/js/components/ats/FacebookLogsModal.tsx`

**Verification:**
- ✅ Index page shows Facebook status
- ✅ Post to Facebook button works
- ✅ Preview modal displays correctly
- ✅ Auto-post checkbox saves correctly
- ✅ Logs modal shows posting history
- ✅ Engagement metrics display

---

## Phase 6: Testing & Documentation

**Duration:** 0.5 days

### Task 6.1: Manual Testing Checklist

**Goal:** Verify all Facebook integration features work correctly.

**Testing Steps:**

1. **Configuration Test:**
   - ✅ Facebook credentials in `.env`
   - ✅ `config('facebook.enabled')` returns true
   - ✅ Test connection successful

2. **Manual Facebook Posting:**
   - ✅ Navigate to job postings index
   - ✅ Click "Post to Facebook" on open job
   - ✅ Preview modal shows formatted message
   - ✅ Confirm posting
   - ✅ Success message appears
   - ✅ Job card shows Facebook badge
   - ✅ Facebook post appears on company page
   - ✅ Link in post navigates to public job page

3. **Auto-Post Feature:**
   - ✅ Create new job with auto-post enabled
   - ✅ Publish job
   - ✅ Job automatically posted to Facebook
   - ✅ Log entry created with type "auto"

4. **Engagement Metrics:**
   - ✅ Open Facebook logs modal
   - ✅ See posting history
   - ✅ Click "Refresh Metrics"
   - ✅ Metrics update with current counts
   - ✅ Metrics display correctly (likes, comments, shares)

5. **Error Handling:**
   - ✅ Try posting with invalid token (should fail gracefully)
   - ✅ Error message logged to database
   - ✅ User sees error message
   - ✅ Try posting already-posted job (should prevent)

6. **Database Verification:**
   - ✅ `facebook_post_id` saved to job_postings
   - ✅ Log entry created in facebook_post_logs
   - ✅ Engagement metrics saved as JSON
   - ✅ Timestamps recorded correctly

---

### Task 6.2: Update Documentation

**Goal:** Document Facebook integration setup and usage.

**Files to Update:**

1. **ATS_MODULE.md:**
   - Add Facebook Integration section
   - Document configuration steps
   - Add usage instructions

2. **Create FACEBOOK_INTEGRATION_SETUP.md:**
   ```markdown
   # Facebook Integration Setup Guide
   
   ## Prerequisites
   - Facebook Page with admin access
   - Facebook Business account
   - Facebook Developer account
   
   ## Setup Steps
   1. Create Facebook App...
   2. Configure permissions...
   3. Add credentials to .env...
   
   ## Usage
   - Manual posting...
   - Auto-posting...
   - Viewing engagement...
   
   ## Troubleshooting
   - Common errors...
   - Token expiration...
   ```

**Files to Create:**
- `docs/FACEBOOK_INTEGRATION_SETUP.md`

**Files to Modify:**
- `docs/ATS_MODULE.md`
- `README.md` (add link to Facebook integration docs)

---

## Summary

### Implementation Breakdown

| Phase | Duration | Tasks | Status |
|-------|----------|-------|--------|
| **Phase 1** | 0.5 days | Facebook App setup, Laravel config | ⏳ Pending |
| **Phase 2** | 0.5 days | Database migrations, models | ⏳ Pending |
| **Phase 3** | 1 day | FacebookService implementation | ⏳ Pending |
| **Phase 4** | 0.75 days | Controller integration, routes | ⏳ Pending |
| **Phase 5** | 1 day | Frontend UI components | ⏳ Pending |
| **Phase 6** | 0.5 days | Testing, documentation | ⏳ Pending |
| **Total** | **3.75 days** | 15 tasks | ⏳ Not Started |

### Key Features Summary

**Implemented:**
✅ One-click Facebook posting from HR dashboard  
✅ Auto-post option when publishing jobs  
✅ Facebook post preview before publishing  
✅ Engagement metrics tracking (likes, comments, shares)  
✅ Posting history logs  
✅ Error handling and retry logic  
✅ Facebook post status indicators  
✅ Link to public job postings page  

### Files Created (14)

**Migrations (2):**
1. `database/migrations/YYYY_MM_DD_add_facebook_tracking_to_job_postings_table.php`
2. `database/migrations/YYYY_MM_DD_create_facebook_post_logs_table.php`

**Models (1):**
3. `app/Models/FacebookPostLog.php`

**Services (1):**
4. `app/Services/Social/FacebookService.php`

**Config (1):**
5. `config/facebook.php`

**Frontend Components (3):**
6. `resources/js/components/ats/FacebookPreviewModal.tsx`
7. `resources/js/components/ats/FacebookLogsModal.tsx`

**Documentation (2):**
8. `docs/FACEBOOK_INTEGRATION_SETUP.md`

### Files Modified (7)

1. `.env` - Add Facebook credentials
2. `.env.example` - Add Facebook placeholders
3. `app/Models/JobPosting.php` - Add Facebook fields and relationships
4. `app/Providers/AppServiceProvider.php` - Register FacebookService
5. `app/Http/Controllers/HR/ATS/JobPostingController.php` - Add Facebook methods
6. `routes/web.php` - Add Facebook routes
7. `resources/js/pages/HR/ATS/JobPostings/Index.tsx` - Add Facebook UI
8. `resources/js/pages/HR/ATS/JobPostings/CreateEditModal.tsx` - Add auto-post checkbox
9. `docs/ATS_MODULE.md` - Document Facebook integration

### Success Criteria

✅ Facebook App configured with proper permissions  
✅ Credentials stored securely in .env  
✅ Database schema supports Facebook tracking  
✅ FacebookService handles API interactions  
✅ Job postings can be posted to Facebook with one click  
✅ Auto-post works when publishing jobs  
✅ Preview shows formatted post before publishing  
✅ Engagement metrics are tracked and refreshable  
✅ Posting logs are viewable with status history  
✅ Error handling prevents crashes  
✅ Facebook post links navigate to public job page  
✅ Documentation complete and accurate  

---

## Environment Variables Reference

### Development (.env.local)
```env
# Development Configuration
APP_ENV=local
APP_URL=http://cameco.local

# Facebook Integration - Development Mode
FACEBOOK_INTEGRATION_ENABLED=false  # Set to true after Facebook app setup
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_access_token
FACEBOOK_API_VERSION=v18.0

# Additional Settings
FACEBOOK_AUTO_POST_ENABLED=false
FACEBOOK_INCLUDE_LINK=true
FACEBOOK_JOB_POST_TEMPLATE=default

# Note: This file should be in .gitignore (dev credentials only)
# Also ensure Caddy is running with Caddyfile reverse proxy
```

### Production (.env)
```env
# Production Configuration
APP_ENV=production
APP_URL=https://hris.cathaymetal.com

# Facebook Integration - Production Mode
FACEBOOK_INTEGRATION_ENABLED=true
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_PAGE_ID=your_facebook_page_id
FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_access_token
FACEBOOK_API_VERSION=v18.0

# Additional Settings
FACEBOOK_AUTO_POST_ENABLED=true
FACEBOOK_INCLUDE_LINK=true
FACEBOOK_JOB_POST_TEMPLATE=default

# Note: Store securely - do not commit to repository
```

### Key Differences

| Setting | Development | Production |
|---------|-------------|-----------|
| `APP_ENV` | `local` | `production` |
| `APP_URL` | `http://cameco.local:8000` | `https://hris.cathaymetal.com` |
| Facebook Domain | `cameco.local:8000` (via hosts file) | `hris.cathaymetal.com` (real domain) |
| `FACEBOOK_INTEGRATION_ENABLED` | `false` (initially) | `true` |
| `FACEBOOK_AUTO_POST_ENABLED` | `false` (for testing) | `true` |
| Facebook App Mode | Development | Live |
| URL Validation | Proper TLD required (.local, .test, etc) | Real domain required |

### Setup Steps

1. **Install Caddy:**
   ```bash
   # Choose your OS:
   # Windows: choco install caddy
   # Mac: brew install caddy
   # Linux: sudo apt-get install caddy
   ```

2. **Create Caddyfile in project root:**
   ```
   cameco.local {
       reverse_proxy localhost:8000
   
       handle_path /@vite* {
           reverse_proxy localhost:5173
       }
   }
   ```

3. **Run Caddy:**
   ```bash
   caddy run  # Run from project root where Caddyfile is located
   ```

4. **Copy .env to .env.local:**
   ```bash
   cp .env .env.local
   ```

5. **Update .env.local with development credentials:**
   ```env
   APP_ENV=local
   APP_URL=http://cameco.local
   FACEBOOK_INTEGRATION_ENABLED=false
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_PAGE_ID=your_facebook_page_id
   FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_page_token
   ```

6. **Add to .gitignore (if not already there):**
   ```
   .env.local
   .env*.local
   Caddyfile  # Optional: keep Caddyfile in repo or ignore it
   ```

7. **Test access:**
   ```bash
   # Open browser and navigate to:
   http://cameco.local  # No port needed!
   ```

8. **Never commit .env.local** - it contains sensitive credentials!

---

## Execution Commands

### Development Setup (Local Testing)

```bash
# 1. Install Caddy (if not already installed)
# Windows: choco install caddy
# Mac: brew install caddy
# Linux: sudo apt-get install caddy

# 2. Create Caddyfile in project root
cat > Caddyfile << 'EOF'
cameco.local {
    reverse_proxy localhost:8000
    
    handle_path /@vite* {
        reverse_proxy localhost:5173
    }
}
EOF

# 3. Run Caddy (from project root)
caddy run

# 4. In a new terminal, create local environment file
cp .env .env.local

# 5. Edit .env.local with Facebook credentials and domain
nano .env.local
# Add:
# APP_URL=http://cameco.local
# FACEBOOK_APP_ID=your_app_id
# FACEBOOK_APP_SECRET=your_app_secret
# FACEBOOK_PAGE_ID=your_page_id
# FACEBOOK_PAGE_ACCESS_TOKEN=your_token

# 6. Ensure .env.local is in .gitignore
echo '.env.local' >> .gitignore

# 7. Run migrations after database schema is ready
php artisan migrate

# 8. Access application at: http://cameco.local (no port!)

# 9. Test Facebook connection in tinker
php artisan tinker
>>> $service = app(\App\Services\Social\FacebookService::class)
>>> $service->testConnection()
// Should return success with page name and ID
```

### Phase-by-Phase Execution

```bash
# Phase 1: Configuration (manual setup on Facebook Developers)
# Prerequisites: Caddy running with Caddyfile reverse proxy
# 1. Create app at https://developers.facebook.com/apps/
# 2. Set app mode to "Development"
# 3. Add Website platform with http://cameco.local (ensure Caddy is running)
# 4. Request pages_manage_posts and pages_read_engagement permissions
# 5. Copy credentials to .env.local

# Phase 2: Database
php artisan make:migration add_facebook_tracking_to_job_postings_table
php artisan make:migration create_facebook_post_logs_table
php artisan make:model FacebookPostLog
php artisan migrate

# Phase 3: Service
mkdir -p app/Services/Social
# Create FacebookService.php manually with provided code

# Phase 4: Controller & Routes
# Modify JobPostingController and routes/web.php with provided code

# Phase 5: Frontend
# Create React components (provided in implementation)

# Phase 6: Testing
php artisan tinker
>>> $service = app(\App\Services\Social\FacebookService::class)
>>> $service->testConnection()
>>> $job = \App\Models\JobPosting::first()
>>> $service->postJob($job, 1, false)

# Verify routes
php artisan route:list | grep facebook
```

### Switching to Production

```bash
# 1. Merge .env.local credentials to .env (production file)
# 2. Change APP_ENV=production
# 3. Update APP_URL to production domain
# 4. Set FACEBOOK_INTEGRATION_ENABLED=true
# 5. Update Facebook App settings with production URL
# 6. Request production permissions from Facebook
# 7. Deploy to production

# Verify production setup
php artisan tinker
>>> $service = app(\App\Services\Social\FacebookService::class)
>>> config('facebook.site_url')  // Should show production URL
>>> $service->testConnection()   // Should connect to production page
```

---

**End of Implementation Plan**
