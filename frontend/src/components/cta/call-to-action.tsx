import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Turn operational bottlenecks into calm, predictable cashflow.</h2>
                    <p className="mt-4">Stop losing margin to disconnected software and chaotic workshop handoffs. AuraWorks unites top-of-funnel discoverability (SEO, GEO & visitor intelligence) with bespoke storefronts to generate cashflow and tailored operational tools to lower the cost of fulfillment.</p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <Button
                            asChild
                            size="lg">
                            <Link href="/book-demo">
                                <span>Book Demo</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            size="lg"
                            variant="outline">
                            <Link href="/book-audit">
                                <span>Book Audit</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}