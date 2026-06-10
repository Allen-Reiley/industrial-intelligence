// @/components/sections/about/about-cta.tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function AboutCTA() {
    return (
        <section className="py-24 md:py-48">
            <div className="mx-auto max-w-5xl px-6 text-center">
                <h2 className="text-balance text-4xl font-semibold lg:text-5xl tracking-tight">
                    Partner with modern industrial leaders.
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
                    We restrict our client cohort to ensure premium data resolution and dedicated routing channels. Secure your slot in the engine today.
                </p>

                <div className="mt-12 flex flex-wrap justify-center gap-4">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-xl px-10 shadow-xl shadow-primary/10">
                        <Link href="/book-demo">
                            <span>Book Demo</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-xl px-10">
                        <Link href="/vsl">
                            <span>Watch Video</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}