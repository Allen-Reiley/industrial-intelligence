import Image from 'next/image'
import { cn } from '../../lib/utils'

export const Logo = ({ className }: { className?: string }) => {
    return (
        /* Added min-w-[40px] to ensure the container doesn't collapse on mobile */
        <div className={cn('relative h-8 w-auto min-w-[40px] lg:min-w-[150px]', className)}>
            {/* DESKTOP LOGO */}
            <Image
                src="/logo.svg"
                alt="AuraWorks Logo"
                width={797}
                height={220}
                className="hidden lg:block h-full w-auto object-contain"
                priority
            />

            {/* MOBILE LOGO */}
            <Image
                /* IMPORTANT: Check your /public folder. 
                   Is it 'logo-mobile.svg', 'logo-mobile.png', or just 'logo.svg'? 
                */
                src="/logo-mobile.svg" 
                alt="AuraWorks Logo Mobile"
                width={797} 
                height={220}
                className="block lg:hidden h-full w-auto object-contain"
                priority
            />
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn('relative size-8', className)}>
            <Image
                src="/logo-mobile.svg" // Changed from .ico to .svg for better scaling
                alt="AuraWorks Icon"
                fill
                className="object-contain"
            />
        </div>
    )
}