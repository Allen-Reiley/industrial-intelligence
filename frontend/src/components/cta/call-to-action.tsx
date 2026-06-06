import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Turn your website into a sales machine.</h2>
                    <p className="mt-4">Get a weekly list of high-intent B2B leads for a flat monthly/annual retainer. No complex software to learn — just results delivered to your inbox.</p>

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
                            <Link href="/book-a-call">
                                <span>Book a Call</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}