<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use App\Actions\Fortify\CustomLoginResponse;
use App\Models\SecurityAuditLog;


class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind custom Fortify login response to perform role-aware redirects
        $this->app->singleton(LoginResponseContract::class, CustomLoginResponse::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
        
        // Allow login with email, username, or name
        Fortify::authenticateUsing(function (Request $request) {
            $loginInput = $request->input('email');
            $password = $request->input('password');
            
            // Try to find user by email, username, or name
            $user = \App\Models\User::where('email', $loginInput)
                ->orWhere('username', $loginInput)
                ->orWhere('name', $loginInput)
                ->first();

            if ($user && \Illuminate\Support\Facades\Hash::check($password, $user->password)) {
                \Log::info('User authenticated successfully', [
                    'user_id' => $user->id,
                    'username' => $user->username,
                    'login_identifier' => $loginInput,
                ]);

                // Record successful login in security audit logs
                SecurityAuditLog::create([
                    'user_id' => $user->id,
                    'event_type' => 'login',
                    'severity' => 'info',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'description' => 'User authenticated successfully',
                    'metadata' => [
                        'login_identifier' => $loginInput,
                    ],
                ]);

                return $user;
            }

            \Log::warning('Failed authentication attempt', [
                'login_identifier' => $loginInput,
                'user_found' => $user ? true : false,
            ]);

            // Record failed authentication attempt in security audit logs
            SecurityAuditLog::create([
                'user_id' => $user ? $user->id : null,
                'event_type' => 'failed_login',
                'severity' => 'warning',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'description' => 'Failed authentication attempt',
                'metadata' => [
                    'login_identifier' => $loginInput,
                    'user_found' => $user ? true : false,
                ],
            ]);

            return null;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
        ]));

        Fortify::resetPasswordView(fn (Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn (Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn (Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn () => Inertia::render('auth/register'));

        Fortify::twoFactorChallengeView(fn () => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            // Use email field for rate limiting (accepts both email and username)
            $throttleKey = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
