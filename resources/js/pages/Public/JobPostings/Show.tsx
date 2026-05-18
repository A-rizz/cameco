import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, Briefcase, Building2, Calendar, FileText, 
  Upload, CheckCircle, AlertCircle, FileCheck, HelpCircle, UserPlus
} from 'lucide-react';
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
      <Head title={`${jobPosting.title} - Careers - Cathay Metal Corporation`} />
      
      <div className="relative min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-600">
        {/* Technical Grid Pattern Background */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-60 pointer-events-none" />

        {/* Decorative Glowing Orb */}
        <div className="absolute left-1/4 top-0 -z-10 h-[400px] w-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-[130px] pointer-events-none" />

        {/* Header / Hero Header */}
        <header className="bg-slate-950 text-white relative overflow-hidden border-b border-slate-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />
          <div className="absolute left-1/3 top-0 h-64 w-96 rounded-full bg-blue-500/10 blur-[80px]" />
          
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            <Link href="/job-postings">
              <Button 
                variant="ghost" 
                className="gap-2 mb-6 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-slate-800 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to All Openings</span>
              </Button>
            </Link>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit">
              {jobPosting.title}
            </h1>
            
            <div className="flex flex-wrap gap-5 mt-4 text-xs font-semibold text-slate-400 tracking-wide uppercase font-jakarta">
              <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-1.5 border border-slate-800">
                <Building2 className="h-4 w-4 text-blue-400" />
                <span>{jobPosting.department_name}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-1.5 border border-slate-800">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span>Posted {jobPosting.posted_at}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Job Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Success Alert */}
              {submitSuccess && (
                <Alert className="bg-emerald-50 border-emerald-200/80 rounded-2xl shadow-sm p-5 flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 font-outfit text-base">
                      Application Submitted Successfully!
                    </h3>
                    <AlertDescription className="text-slate-600 font-jakarta text-sm mt-1 leading-relaxed">
                      Thank you for applying to Cathay Metal Corporation. Our HR Specialists will review your credentials and contact you via email or phone should there be a fit.
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Error Alert */}
              {submitError && (
                <Alert variant="destructive" className="rounded-2xl shadow-sm p-5 flex items-start gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-950 font-outfit text-base">
                      Submission Problem
                    </h3>
                    <AlertDescription className="text-red-900 font-jakarta text-sm mt-1">
                      {submitError}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Job Description Card */}
              <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 font-outfit">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span>Job Description</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-jakarta">
                    <div dangerouslySetInnerHTML={{ __html: jobPosting.description.replace(/\n/g, '<br/>') }} />
                  </div>
                </CardContent>
              </Card>

              {/* Requirements Card */}
              <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 font-outfit">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <span>Requirements & Qualifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-jakarta">
                    <div dangerouslySetInnerHTML={{ __html: jobPosting.requirements.replace(/\n/g, '<br/>') }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Application Form */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <Card className="rounded-2xl border-slate-200/60 bg-white shadow-lg overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 font-outfit">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    <span>Apply for this Role</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name" className="text-xs font-bold text-slate-700 font-jakarta">First Name *</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="mt-1 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-10 font-medium"
                        />
                      </div>

                      <div>
                        <Label htmlFor="last_name" className="text-xs font-bold text-slate-700 font-jakarta">Last Name *</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmitting}
                          className="mt-1 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-10 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-xs font-bold text-slate-700 font-jakarta">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="mt-1 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-10 font-medium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-700 font-jakarta">Contact Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                        className="mt-1 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white h-10 font-medium"
                        placeholder="e.g. +63 917 123 4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="resume" className="text-xs font-bold text-slate-700 font-jakarta">Resume File (PDF, DOC, DOCX) *</Label>
                      <div className="mt-1.5">
                        <label
                          htmlFor="resume"
                          className="group/file flex flex-col items-center justify-center gap-2 w-full p-5 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl cursor-pointer hover:bg-blue-50/20 transition-all duration-300"
                        >
                          {resumeFile ? (
                            <div className="flex flex-col items-center text-center">
                              <FileCheck className="h-8 w-8 text-emerald-500 mb-1" />
                              <span className="text-sm font-bold text-slate-800 leading-tight">
                                {resumeFile.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">
                                File Ready to Submit
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-center">
                              <Upload className="h-8 w-8 text-slate-400 group-hover/file:text-blue-500 transition-colors mb-1" />
                              <span className="text-sm font-bold text-slate-600 group-hover/file:text-blue-600 transition-colors">
                                Choose or drag file
                              </span>
                              <span className="text-xs text-slate-400 mt-0.5">
                                PDF, DOC, or DOCX formats accepted
                              </span>
                            </div>
                          )}
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
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-1.5 text-right">
                        Maximum File Size: 5MB
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="cover_letter" className="text-xs font-bold text-slate-700 font-jakarta">Cover Letter (Optional)</Label>
                      <Textarea
                        id="cover_letter"
                        name="cover_letter"
                        value={formData.cover_letter}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Share details on why you are the perfect candidate for this role..."
                        disabled={isSubmitting}
                        className="mt-1 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white resize-none font-medium"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-transform active:scale-95 duration-150 mt-4 disabled:bg-slate-100 disabled:text-slate-400"
                      disabled={isSubmitting || !resumeFile}
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Send Application'}
                    </Button>

                    <p className="text-[10px] text-slate-400 font-semibold text-center mt-3 uppercase tracking-wider">
                      Cathay Metal handles personal data securely.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
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
