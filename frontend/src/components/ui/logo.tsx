import Image from 'next/image'
import { cn } from '../../lib/utils'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('relative h-8 w-auto', className)}>
            <Image
                src="/logo.svg"
                alt="AuraWorks Logo"
                width={797}
                height={220}
                className="h-full w-auto object-contain"
                priority
            />
        </div>
    )
}

export const LogoIcon = ({ className }: { className?: string }) => {
    return (
        <div className={cn('relative size-8', className)}>
            {/* If your logo.svg contains both icon and text, 
                you might want a separate logo-icon.svg for this */}
            <Image
                src="/logo.svg" 
                alt="AuraWorks Icon"
                fill
                className="object-contain"
            />
        </div>
    )
}