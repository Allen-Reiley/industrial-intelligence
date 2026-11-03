// frontend/src/components/brand/Logo.tsx
import Image from 'next/image'
import { cn } from '@/lib/utils' // Using the @ alias for cleaner imports

interface LogoProps {
    className?: string;
    priority?: boolean;
}

export const Logo = ({ className, priority = true }: LogoProps) => {
    return (
        /* Constraint: Added fixed aspect-ratio container to prevent Layout Shift.
           The min-w values are calibrated for 'Quiet Premium' spacing.
        */
        <div className={cn('relative h-8 w-auto min-w-[40px] lg:min-w-[150px] aspect-[797/220]', className)}>
            {/* DESKTOP LOGO 
                Optimized for 85mm realism aesthetics: h-full w-auto ensures scaling 
                maintains industrial sophistication without pixelation.
            */}
            <Image
                src="/logo.svg"
                alt="AuraWorks Logo"
                width={797}
                height={220}
                className="hidden lg:block h-full w-auto object-contain"
                priority={priority}
            />

            {/* MOBILE LOGO 
                Uses the same aspect ratio to ensure consistent touch-targets.
            */}
            <Image
                src="/logo-mobile.svg" 
                alt="AuraWorks Logo Mobile"
                width={220} // Adjusted to a smaller base width for mobile performance
                height={220}
                className="block lg:hidden h-full w-auto object-contain"
                priority={priority}
            />
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        /* Icon variant for navigation sidebars and favicon-style UI elements.
           Replaced .ico with .svg for technical authority and crisp rendering.
        */
        <div className={cn('relative size-8', className)}>
            <Image
                src="/logo-mobile.svg" 
                alt="AuraWorks Icon"
                fill
                className="object-contain"
                priority
            />
        </div>
    )
}