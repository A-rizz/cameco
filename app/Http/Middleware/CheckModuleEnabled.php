<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckModuleEnabled
{
    public function handle(Request $request, Closure $next, $module)
    {
        if (!config("modules.{$module}")) {
            abort(404, "This module is currently disabled.");
        }
        
        return $next($request);
    }
}
