import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function ContentSection1({ className }: { className?: string }) {
    return (
        <section className={cn("py-16 md:py-32", className)}>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">Business intelligence, not random traffic.</h2>
                <div className="grid gap-6 sm:grid-cols-2 md:gap-12 lg:gap-24">
                    <div className="relative mb-6 sm:mb-0">
                        <div className="bg-linear-to-b aspect-76/59 relative rounded-2xl from-zinc-300 to-transparent p-px dark:from-zinc-700">
                            <Image
                                src="/payments.png"
                                className="hidden rounded-[15px] dark:block"
                                alt="payments illustration dark"
                                width={1207}
                                height={929}
                            />
                            <Image
                                src="/payments-light.webp"
                                className="rounded-[15px] shadow dark:hidden"
                                alt="payments illustration light"
                                width={1207}
                                height={929}
                            />
                        </div>
                    </div>

                    <div className="relative space-y-4">
                        <p className="text-muted-foreground">
                            We filter out the noise. Our engine ignores personal traffic to show you only <span className="text-accent-foreground font-bold">real business prospects.</span> — Know which industrial firms are studying your specs before they even issue a tender.
                        </p>
                        <p className="text-muted-foreground">Our engine supports many business ecosystems — it's a plug and play system that delivers automated results for your sales team to close more deals.</p>

                        <div className="pt-6">
                            <blockquote className="border-l-4 pl-4 border-primary/20">
                                <p className="italic text-muted-foreground">"Every day, procurement officers and engineers from major industrial firms are browsing your technical specs, but they leave without a trace. Capitalize on them before your competitors do."</p>

                                <div className="mt-6 space-y-4">
                                    <cite className="block font-medium text-foreground">Reitumetse Sethabela, Founder</cite>
                                    
                                    {/* SVG Image Space */}
                                    <div className="relative h-10 w-29">
                                        <Image
                                            src="/logo.svg" // Replace with your client's light SVG
                                            alt="Client Logo"
                                            fill
                                            className="object-contain object-left dark:hidden"
                                        />
                                        <Image
                                            src="/logo-dark.svg" // Replace with your client's dark SVG
                                            alt="Client Logo"
                                            fill
                                            className="hidden object-contain object-left dark:block"
                                        />
                                    </div>
                                </div>
                            </blockquote>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}