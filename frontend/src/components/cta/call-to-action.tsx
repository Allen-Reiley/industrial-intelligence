import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Turn anonymous traffic into paying clients.</h2>
                    <p className="mt-4">Stop letting high-value interest leave without a trace. Get a curated, weekly digest of unmasked corporate leads delivered straight to your inbox. No complex software to learn—just raw pipeline.</p>

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
                            <Link href="/vsl">
                                <span>Watch Video</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}