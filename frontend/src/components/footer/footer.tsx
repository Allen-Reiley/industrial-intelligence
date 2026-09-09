'use client'

import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

const links = [
    {
        group: 'Product',
        items: [
            {
                title: 'Features',
                href: '/features',
            },
            {
                title: 'Industrial Solutions',
                href: '/solution',
            },
            {
                title: 'Customer Proof',
                href: '/customers',
            },
            {
                title: 'Pricing Plans',
                href: '/pricing',
            },
            {
                title: 'Book a Demo',
                href: '/book-demo',
            },
            {
                title: 'Core VSL Video',
                href: '/vsl',
            },
        ],
    },
    {
        group: 'Sectors & Stacks',
        items: [
            {
                title: 'Mining & Minerals',
                href: '/solution',
            },
            {
                title: 'Heavy Manufacturing',
                href: '/solution',
            },
            {
                title: 'Bulk Logistics & Freight',
                href: '/solution',
            },
            {
                title: 'Engineering & EPC',
                href: '/solution',
            },
            {
                title: 'Spec-Sheet Tracking',
                href: '/features',
            },
            {
                title: 'Juristic Identity Bridge',
                href: '/features',
            },
        ],
    },
    {
        group: 'Company',
        items: [
            {
                title: 'About Our Mission',
                href: '/about',
            },
            {
                title: 'Research Blog',
                href: '/blog',
            },
            {
                title: 'Contact Office',
                href: '/contact',
            },
            {
                title: 'Customer Support',
                href: '/customer-support',
            },
            {
                title: 'Book Technical Call',
                href: '/book-call',
            },
        ],
    },
    {
        group: 'Legal & Trust',
        items: [
            {
                title: 'Commercial Licence',
                href: '/license',
            },
            {
                title: 'Privacy Policy',
                href: '/privacy-policy',
            },
            {
                title: 'Cookies Telemetry',
                href: '/cookies-policy',
            },
            {
                title: 'Terms of Service',
                href: '/terms-of-service',
            },
            {
                title: 'POPIA & PAIA Manual',
                href: '/popia-manual',
            },
            {
                title: 'Juristic Disclaimer',
                href: '/disclaimer',
            },
            {
                title: 'Security & Encryption',
                href: '/security',
            },
        ],
    },
]

export default function Footer() {
    return (
        <footer className="border-b bg-white pt-20">
            <div className="mb-8 border-b md:mb-12">
                <div className="mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-6 px-6 pb-6">
                    <Link
                        href="/"
                        aria-label="go home"
                        className="block size-fit">
                        <Logo />
                    </Link>
                    <div className="flex flex-wrap justify-center gap-6 text-sm">
                        <Link
                            href="https://x.com/auraworks"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="X/Twitter"
                            className="text-muted-foreground hover:text-primary block">
                            <svg
                                className="size-6"
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"></path>
                            </svg>
                        </Link>
                        <Link
                            href="https://www.linkedin.com/company/auraworks"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="text-muted-foreground hover:text-primary block">
                            <svg
                                className="size-6"
                                xmlns="http://www.w3.org/2000/svg"
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"></path>
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 md:grid-cols-5 md:gap-0 lg:grid-cols-4">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:col-span-5 md:row-start-1 lg:col-span-3">
                        {links.map((link, index) => (
                            <div
                                key={index}
                                className="space-y-4 text-sm">
                                <span className="block font-medium">{link.group}</span>
                                {link.items.map((item, index) => (
                                    <Link
                                        key={index}
                                        href={item.href}
                                        className="text-muted-foreground hover:text-primary block duration-150">
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                    <form 
                        action="#"
                        onSubmit={(e) => {
                            e.preventDefault();
                            alert("Thank you for subscribing to AuraWorks Industrial Briefings.");
                        }}
                        className="row-start-1 border-b pb-8 text-sm md:col-span-2 md:border-none lg:col-span-1"
                    >
                        <div className="space-y-4">
                            <Label
                                htmlFor="mail"
                                className="block font-medium">
                                Intelligence Briefing
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    type="email"
                                    id="mail"
                                    name="mail"
                                    required
                                    placeholder="corporate.email@firm.co.za"
                                    className="h-8 text-sm"
                                />
                                <Button type="submit" size="sm">Subscribe</Button>
                            </div>
                            <span className="text-muted-foreground block text-xs">Weekly industrial buyer intent & POPIA telemetry analysis.</span>
                        </div>
                    </form>
                </div>
                <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
                    <small className="text-muted-foreground order-last block text-center text-sm md:order-first">© {new Date().getFullYear()} AuraWorks (Pty) Ltd. All rights reserved.</small>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Johannesburg, South Africa</span>
                        <span>•</span>
                        <span>POPIA Juristic-Compliant</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
