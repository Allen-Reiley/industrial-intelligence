// @/components/sections/get-started-modal.tsx
'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Mail, User, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface GetStartedModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function GetStartedModal({ isOpen, setIsOpen }: GetStartedModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm"
                    />

                    {/* The Modal - Using the layoutId logic from Expandable Screen */}
                    <motion.div
                        layoutId="get-started-popup"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[110] m-auto h-full w-full overflow-y-auto bg-background p-6 shadow-2xl md:h-fit md:max-h-[90vh] md:max-w-2xl md:rounded-3xl md:border"
                    >
                        <div className="relative mx-auto w-full pt-8">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="absolute right-0 top-0 rounded-full"
                            >
                                <X className="h-6 w-6" />
                            </Button>

                            <div className="space-y-2 text-center">
                                <h2 className="text-3xl font-bold tracking-tight">Join the AuraWorks Beta</h2>
                                <p className="text-muted-foreground text-sm">
                                    Capping initial access to 100 industrial partners.
                                </p>
                            </div>

                            <form className="mt-8 grid gap-5 pb-8" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="name" placeholder="John Doe" className="pl-10 rounded-xl" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Work Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" type="email" placeholder="john@company.co.za" className="pl-10 rounded-xl" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company">Company Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="company" placeholder="e.g. Rand Mining Gear" className="pl-10 rounded-xl" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="industry">Industry Vertical</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <select 
                                            id="industry"
                                            className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        >
                                            <option value="">Select industry...</option>
                                            <option value="mining">Mining & Resources</option>
                                            <option value="manufacturing">Manufacturing</option>
                                            <option value="logistics">Logistics</option>
                                            <option value="construction">Heavy Construction</option>
                                        </select>
                                    </div>
                                </div>

                                <Button size="lg" className="mt-2 w-full rounded-xl font-semibold shadow-lg shadow-primary/20">
                                    Request Access
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}