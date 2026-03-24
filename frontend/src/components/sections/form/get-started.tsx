// @/app/get-started/page.tsx
'use client'

import React, { useState } from 'react'
import { 
    Building2, Mail, User, Briefcase, ArrowLeft, 
    Globe, BarChart3, Tag, Database, Loader2, 
    Lock, ArrowRight, CheckCircle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function GetStartedPage() {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    
    // Unified State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        industry: '',
        website: '',
        traffic: '',
        avgPrice: '',
        crm: ''
    })

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault()
        
        // Basic Email Validation Logic
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            alert("Please enter a valid work email address.")
            return
        }
        
        setStep(2)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        
        // Final Submission Logic (e.g., your own API or PostgreSQL)
        console.log("Final Data Collected:", formData)
        
        // Simulate local processing
        setTimeout(() => {
            setIsLoading(false)
            alert("Application submitted to local infrastructure.")
        }, 1500)
    }

    return (
        <main className="relative min-h-screen flex items-center justify-center bg-background px-6 py-12 overflow-hidden">
            {/* Background Decorations */}
            <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-30 [background:radial-gradient(50%_50%_at_50%_10%_var(--color-primary)_0%,transparent_100%)] blur-3xl" />
            </div>

            <div className="w-full max-w-xl relative">
                
                {/* Navigation Header - Aligned Step Indicator here */}
                <div className="mb-8 flex items-center justify-between">
                    {step === 1 ? (
                        <Button variant="ghost" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
                            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Link>
                        </Button>
                    ) : (
                        <Button variant="ghost" onClick={() => setStep(1)} className="-ml-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous Step
                        </Button>
                    )}

                    {/* Moved inside the header flex container */}
                    <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                            <div className={cn("h-1.5 w-6 rounded-full transition-all duration-500", step === 1 ? "bg-primary" : "bg-muted")} />
                            <div className={cn("h-1.5 w-6 rounded-full transition-all duration-500", step === 2 ? "bg-primary" : "bg-muted")} />
                        </div>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            Phase 0{step}
                        </span>
                    </div>
                </div>

                {/* Sliding Viewport */}
                <div className="relative overflow-hidden rounded-3xl border bg-card/50 backdrop-blur-sm shadow-2xl">
                    <div 
                        className="flex transition-transform duration-700 ease-[cubic-bezier(0.87,_0,_0.13,_1)]" 
                        style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
                    >
                        
                        {/* STEP 1: Identification */}
                        <div className="w-full shrink-0 p-8 md:p-12">
                            <div className="mb-10">
                                <h1 className="text-3xl font-bold tracking-tight">Identity</h1>
                                <p className="text-muted-foreground mt-2 text-sm">Basic credentials for the 100-partner cohort.</p>
                            </div>

                            <form onSubmit={handleNext} className="grid gap-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="pl-10 rounded-xl bg-muted/30" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Work Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@mining.co.za" className="pl-10 rounded-xl bg-muted/30" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Company Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Rand Industrial" className="pl-10 rounded-xl bg-muted/30" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Industry</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <select required value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="flex h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                                            <option value="">Select industry...</option>
                                            <option value="mining">Mining & Resources</option>
                                            <option value="manufacturing">Manufacturing</option>
                                            <option value="logistics">Logistics</option>
                                            <option value="construction">Heavy Construction</option>
                                        </select>
                                    </div>
                                </div>
                                <Button size="lg" className="mt-4 rounded-xl font-bold group">
                                    Continue to Audit <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </form>
                        </div>

                        {/* STEP 2: Qualification */}
                        <div className="w-full shrink-0 p-8 md:p-12">
                            <div className="mb-10">
                                <h2 className="text-3xl font-bold tracking-tight">Audit</h2>
                                <p className="text-muted-foreground mt-2 text-sm">System markers for ROI calculation.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="grid gap-6">
                                <div className="space-y-2">
                                    <Label>Website Link</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input required value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." className="pl-10 rounded-xl bg-muted/30" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Monthly Traffic</Label>
                                        <div className="relative">
                                            <BarChart3 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <select required value={formData.traffic} onChange={e => setFormData({...formData, traffic: e.target.value})} className="flex h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                                                <option value="">Select range...</option>
                                                <option value="0-1k">0 - 1,000</option>
                                                <option value="1k-5k">1,000 - 5,000</option>
                                                <option value="5k+">5,000+</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Avg Product Price</Label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input required value={formData.avgPrice} onChange={e => setFormData({...formData, avgPrice: e.target.value})} placeholder="e.g. R50k" className="pl-10 rounded-xl bg-muted/30" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>CRM System</Label>
                                    <div className="relative">
                                        <Database className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <select required value={formData.crm} onChange={e => setFormData({...formData, crm: e.target.value})} className="flex h-10 w-full rounded-xl border border-input bg-muted/30 pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none">
                                            <option value="">Select CRM...</option>
                                            <option value="hubspot">HubSpot</option>
                                            <option value="salesforce">Salesforce</option>
                                            <option value="pipedrive">Pipedrive</option>
                                            <option value="zoho">Zoho</option>
                                            <option value="other">Other / Custom</option>
                                            <option value="none">No CRM</option>
                                        </select>
                                    </div>
                                </div>
                                <Button disabled={isLoading} size="lg" className="mt-4 rounded-xl font-bold shadow-xl shadow-primary/20">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Request Access"}
                                </Button>
                            </form>
                        </div>

                    </div>
                </div>

                {/* Aesthetic Footer */}
                <div className="mt-10 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground/40">
                    <Lock className="h-3 w-3" /> Secure Infrastructure Pipeline
                </div>
                <p className="text-center text-xs text-muted-foreground mt-4">
                    By requesting access, you agree to our terms of service and our systems-driven 
                    approach to B2B privacy.
                </p>
            </div>
        </main>
    )
}