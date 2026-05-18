import { dashboard, login } from '@/routes/index';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { 
    ArrowRight, Users, Calendar, FileText, TrendingUp, Shield, 
    Clock, UserCircle, Briefcase, Server, ShieldAlert, Cpu, 
    Lock, CheckCircle2, Network, ArrowUpRight 
} from 'lucide-react';

export default function Welcome() {
    const { auth, features } = usePage<SharedData & { features?: Record<string, boolean> }>().props;
    const isAtsEnabled = features?.ats !== false;

    return (
        <>
            <Head title="Cathay Metal Corporation - HRIS">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="relative min-h-screen font-sans selection:bg-blue-500/20 selection:text-blue-600 dark:selection:text-blue-400 overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                {/* Engineering Grid / Graph Paper Background Effect */}
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-60 dark:opacity-40" />

                {/* Decorative Glowing Orbs */}
                <div className="absolute left-1/4 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-900/10 pointer-events-none" />
                <div className="absolute right-1/4 top-1/3 -z-10 h-[300px] w-[500px] translate-x-1/2 rounded-full bg-indigo-400/20 blur-[100px] dark:bg-indigo-900/10 pointer-events-none" />

                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/70">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-100 shadow-md">
                                <img src="/favicon.ico" alt="Cameco Logo" className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-outfit uppercase">
                                    Cathay Metal <span className="text-blue-600 dark:text-blue-400">Corporation</span>
                                </h1>
                                <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400 font-jakarta">
                                    Human Resource Information System
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <AppearanceToggleDropdown />
                            {isAtsEnabled && (
                                <Link 
                                    href="/job-postings" 
                                    className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors dark:text-slate-300 dark:hover:text-blue-400"
                                >
                                    <Briefcase className="h-4 w-4" />
                                    <span>Careers</span>
                                </Link>
                            )}
                            {auth.user ? (
                                <Button asChild variant="default" className="shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-transform active:scale-95 duration-150">
                                    <Link href={dashboard()} className="gap-2">
                                        <span>Open Dashboard</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <Button variant="default" asChild className="shadow-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-slate-200 transition-transform active:scale-95 duration-150">
                                    <Link href={login()}>
                                        Sign In
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Secured Gateway Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/70 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 mb-8 backdrop-blur-sm animate-fade-in shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <Shield className="h-3.5 w-3.5 text-blue-500" />
                            <span>Cathay Metal Secure Enterprise Network</span>
                        </div>

                        {/* Logo Container */}
                        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-xl dark:from-slate-100 dark:to-slate-200">
                            <div className="absolute inset-0 rounded-3xl bg-blue-500/10 blur-lg dark:bg-blue-400/20" />
                            <img src="/favicon.ico" alt="Cameco Logo" className="h-16 w-16 relative z-10" />
                        </div>
                        
                        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-6xl font-outfit">
                            Unlock Efficiency with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400">Cameco</span>
                        </h1>
                        
                        <p className="mx-auto mb-10 max-w-3xl text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-jakarta leading-relaxed">
                            The intelligent human resource information gateway for Cathay Metal Corporation.
                            Empowering teams, securing personnel records, and optimizing operational workflows on-premise or remotely.
                        </p>
                        
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            {!auth.user ? (
                                <Button size="lg" asChild className="px-8 py-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-transform active:scale-95 duration-150">
                                    <Link href={login()} className="text-base font-semibold">
                                        <UserCircle className="mr-2 h-5 w-5" />
                                        Access System Gateway
                                    </Link>
                                </Button>
                            ) : (
                                <Button size="lg" asChild className="px-8 py-6 rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 transition-transform active:scale-95 duration-150">
                                    <Link href={dashboard()} className="text-base font-semibold">
                                        Go to Core Dashboard
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                            )}
                            {isAtsEnabled && (
                                <Button size="lg" variant="outline" asChild className="px-8 py-6 rounded-xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-transform active:scale-95 duration-150">
                                    <Link href="/job-postings" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                                        <Briefcase className="mr-2 h-5 w-5 text-slate-500" />
                                        Explore Careers
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Interactive Enterprise Architecture Status Section */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col p-6 rounded-2xl border border-slate-200/60 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                    <Server className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 font-outfit">Centralized HR Core</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                                Hosted securely inside Cathay Metal Corporation's corporate records system. Benefit from absolute data governance, physical storage sovereignty, and secure local audit trails.
                            </p>
                        </div>
                        <div className="flex flex-col p-6 rounded-2xl border border-slate-200/60 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                    <Network className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 font-outfit">Seamless Connectivity</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                                Access the platform securely and reliably from any corporate branch or division. Optimized for both desktop and mobile networks to ensure reliable daily operations.
                            </p>
                        </div>
                        <div className="flex flex-col p-6 rounded-2xl border border-slate-200/60 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm transition-transform duration-300 hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 font-outfit">Corporate Data Security</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                                Protected by enterprise-grade TLS encryption, strict role-based access rules, automated system transaction logs, and daily security snapshots.
                            </p>
                        </div>
                    </div>

                    {/* System Information Banner - Upgraded to elegant warning banner */}
                    <div className="mt-12 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5 p-6 dark:border-amber-900/50 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="mb-1 font-bold text-slate-900 dark:text-slate-100 font-outfit tracking-wide uppercase text-xs">
                                    Authorized Administrative Operations Notice
                                </h3>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed">
                                    This human resource gateway is private and exclusively designated for authorized Cathay Metal Corporation employees, managers, and system auditors. 
                                    By accessing this system, you acknowledge that all activities, audits, and access points are strictly monitored for data security compliance.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Feature Grid - HR Modules */}
                    <div className="mt-24">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 font-outfit tracking-tight">
                                Integrated HR Solutions
                            </h2>
                            <p className="mt-2 text-slate-600 dark:text-slate-400 font-jakarta max-w-xl mx-auto">
                                Discover the dynamic, enterprise-grade capabilities built into the Cameco core engine.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Card 1 */}
                            <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 hover:-translate-y-0.5">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
                                    Employee Profiles
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                                    Complete digital workplace files. Securely record personal details, history of employment promotions, files, and emergency contacts.
                                </p>
                            </div>
                            
                            {/* Card 2 */}
                            <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 hover:-translate-y-0.5">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
                                    Timekeeping & RFID
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                                    Integrate factory shift schedules, track missing card punches, and monitor real-time daily work logs directly on the HR portal.
                                </p>
                            </div>
                            
                            {/* Card 3 */}
                            <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 hover:-translate-y-0.5">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
                                    Leave Management
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                                    Empower staff to submit vacation requests, track exact remaining leave credits, and manage department holiday calendars.
                                </p>
                            </div>
                            
                            {/* Card 4 */}
                            <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 hover:-translate-y-0.5">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
                                    Workforce Metrics
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                                    Automated business rules compliance. Set departmental performance indicators, compile reviewer feedback, and log audit trails.
                                </p>
                            </div>
                            
                            {/* Card 5 */}
                            <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/80 hover:-translate-y-0.5">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
                                    Statutory Payroll
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta">
                                    Handle statutory SSS, PhilHealth, Pag-IBIG calculations, process secure bank wires, and issue detailed dynamic salary payslips.
                                </p>
                            </div>
                            
                            {/* Card 6 / ATS Careers Portal */}
                            {isAtsEnabled && (
                                <div className="group relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-blue-900/40 dark:from-blue-950/30 dark:to-indigo-950/10 hover:-translate-y-0.5">
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100 font-outfit">
                                        Careers Portal
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-jakarta mb-4">
                                        Public talent acquisition module. Post active job openings, accept candidate files, and review application statuses online.
                                    </p>
                                    <Link 
                                        href="/job-postings"
                                        className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all duration-200"
                                    >
                                        <span>Browse Openings</span>
                                        <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                
                {/* Footer */}
                <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-950/60 mt-20">
                    <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 font-jakarta">
                                © {new Date().getFullYear()} Cathay Metal Corporation. All rights reserved.
                            </p>
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400 font-jakarta uppercase tracking-wider">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                <span>Secured Enterprise Portal</span>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <span>Internal Network Protected</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
} 
