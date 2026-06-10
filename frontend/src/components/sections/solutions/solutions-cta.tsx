// @/components/sections/solutions/solutions-cta.tsx
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function SolutionsCTA() {
    return (
        <section className="py-24 md:py-48">
            <div className="mx-auto max-w-5xl px-6 text-center">
                <h2 className="text-balance text-4xl font-semibold lg:text-5xl tracking-tight italic">Shorten the path to the purchase order.</h2>
                <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
                    Stop hoping they fill out a contact form. Identify the industrial firms that are actively researching your specifications. Deploy AuraWorks today.
                </p>
                <div className="mt-12 flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="rounded-xl px-10 shadow-xl shadow-primary/10">
                        <Link href="/book-demo">Book Demo</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-xl px-10">
                        <Link href="/vsl">Watch Video</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}