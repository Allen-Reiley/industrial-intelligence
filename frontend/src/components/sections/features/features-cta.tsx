// @/components/sections/features/features-cta.tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function FeaturesCTA() {
    return (
        <section className="py-24 md:py-48">
            <div className="mx-auto max-w-5xl px-6 text-center">
                <h2 className="text-balance text-4xl font-semibold lg:text-5xl tracking-tight">
                    Deploy the identity bridge today.
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-muted-foreground text-lg">
                    Stop letting anonymous industrial traffic leave without a trace. Turn your website into a high-intent lead generation engine.
                </p>

                <div className="mt-12 flex flex-wrap justify-center gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-xl px-10 shadow-xl shadow-primary/10">
                        <Link href="/get-started">
                            <span>Get Started</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-xl px-10">
                        <Link href="/pricing">
                            <span>View Pricing</span>
                        </Link>
                    </Button>
                </div>
                {/* 
                <p className="mt-8 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/50">
                    Industrial Sales Intelligence • AuraWorks Engine 1.1
                </p>
                */}
            </div>
        </section>
    )
}