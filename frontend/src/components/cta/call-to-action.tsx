import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CallToAction() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Own your category across search, AI, and pipeline.</h2>
                    <p className="mt-4">Stop letting high-value procurement interest leave without a trace. AuraWorks unites top Google rankings, AI engine citability, and the proprietary AuraWorks Intelligence Engine to convert anonymous industrial visitors into verified pipeline.</p>

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