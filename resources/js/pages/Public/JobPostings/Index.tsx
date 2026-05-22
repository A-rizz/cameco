import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, MapPin, Calendar, Users, Search, Home, 
  Building2, ArrowRight, Sparkles, Filter, ChevronRight, UserPlus 
} from 'lucide-react';

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
      <Head title="Careers - Cathay Metal Corporation" />
      
      <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-600">
        {/* Technical Grid Pattern Background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-60 pointer-events-none" />

        {/* Decorative Glowing Orb */}
        <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-[130px] pointer-events-none" />

        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 shadow-md">
                  <img src="/favicon.ico" alt="Cameco Logo" className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase font-outfit">
                    Cathay Metal <span className="text-blue-600">Corporation</span>
                  </h1>
                  <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-jakarta">
                    Talent Acquisition Gateway
                  </p>
                </div>
              </div>
              <Link href="/">
                <Button variant="outline" className="gap-2 rounded-xl shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm transition-transform active:scale-95 duration-150">
                  <Home className="h-4 w-4 text-slate-500" />
                  <span>Corporate Home</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Premium Recruiter Hero Section */}
        <section className="relative overflow-hidden py-20 bg-slate-950 text-white">
          {/* Internal Grid pattern for hero */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
          <div className="absolute left-1/3 top-0 h-64 w-96 rounded-full bg-blue-500/10 blur-[80px]" />
          <div className="absolute right-1/4 bottom-0 h-48 w-80 rounded-full bg-indigo-500/10 blur-[60px]" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-6 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>We Are Actively Hiring</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 font-outfit">
              Build the Future of Steel Engineering
            </h2>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-jakarta leading-relaxed">
              Explore exciting career tracks at one of the premier steel manufacturing corporations in the Philippines. Join our engineering, operations, or administrative teams today.
            </p>
          </div>
        </section>

        {/* Search and Filters Block (Glassmorphic) */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-16 relative z-20">
          <Card className="shadow-xl border-slate-200/80 backdrop-blur-md bg-white/95 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Search box */}
                <div className="lg:col-span-6 relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search job titles (e.g. Engineer, Manager)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition-all shadow-inner placeholder-slate-400 font-medium"
                  />
                </div>
                
                {/* Department drop */}
                <div className="lg:col-span-4">
                  <div className="relative">
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium text-slate-700">
                        <SelectValue placeholder="All Departments" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit button */}
                <div className="lg:col-span-2">
                  <Button 
                    onClick={handleSearch} 
                    className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-transform active:scale-95 duration-150"
                  >
                    Find Positions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200/60 pb-4">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-outfit">
                Open Opportunities
              </h3>
              <p className="text-sm text-slate-500 font-jakarta mt-1">
                Showing {jobPostings.length} matching job listing(s)
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 rounded-lg px-3 py-1">
              <Filter className="h-3 w-3" />
              <span>Real-Time Listings</span>
            </div>
          </div>

          {jobPostings.length === 0 ? (
            <Card className="text-center py-20 border-dashed border-2 border-slate-200 bg-white/40 rounded-2xl backdrop-blur-sm">
              <CardContent>
                <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Briefcase className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-outfit">
                  No Matching Vacancies
                </h3>
                <p className="text-slate-500 font-jakarta max-w-md mx-auto">
                  We currently do not have any job listings matching your specific parameters. Adjust your keyword search or selected department filter.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDepartment('all');
                    window.location.href = '/job-postings';
                  }}
                  className="mt-6 rounded-xl border-slate-200 bg-white"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobPostings.map((job) => (
                <Card 
                  key={job.id} 
                  className="group hover:shadow-xl hover:border-blue-200/80 transition-all duration-300 bg-white rounded-2xl overflow-hidden border border-slate-200/60 flex flex-col shadow-sm"
                >
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Department Badge */}
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 text-blue-700 px-3 py-1 text-xs font-bold mb-4 font-jakarta">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{job.department_name}</span>
                        </div>
                        
                        <CardTitle className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors font-outfit mb-3">
                          {job.title}
                        </CardTitle>
                        
                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 tracking-wide uppercase font-jakarta">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>Posted {job.posted_at}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span>{job.applications_count} Applicants</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-between">
                    <CardDescription className="mb-6 text-sm text-slate-600 leading-relaxed font-jakarta">
                      {truncateText(job.description, 180)}
                    </CardDescription>
                    
                    <Link href={`/job-postings/${job.id}`} className="mt-auto">
                      <Button className="w-full h-11 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all duration-300 flex items-center justify-center gap-1 group-hover:bg-blue-600">
                        <span>View Position & Apply</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-200" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm font-medium text-slate-400 font-jakarta">
              © {new Date().getFullYear()} Cathay Metal Corporation. All rights reserved.
            </p>
            <p className="text-xs text-slate-400 font-jakarta mt-2">
              Corporate Careers Gateway • Secure Remote Portal
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
