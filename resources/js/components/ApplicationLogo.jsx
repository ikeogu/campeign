/**
 * ApplicationLogo
 *
 * Props:
 *   className  – Tailwind sizing classes (e.g. "h-12 w-auto")
 *   inverse    – render in white (for use on brand-600 / dark backgrounds)
 *   compact    – icon-mark only (48×48 square)
 */
export default function ApplicationLogo({ className = '', inverse = false, compact = false, ...props }) {
    const orange  = inverse ? '#ffffff' : '#CC5500';
    const navy    = inverse ? '#ffffff' : '#1a1a4e';
    const iconBg  = inverse ? 'rgba(255,255,255,0.25)' : '#CC5500';
    const iconFg  = inverse ? '#CC5500' : '#ffffff';

    if (compact) {
        return (
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
                <rect width="48" height="48" rx="12" fill={iconBg} />
                <text x="24" y="34" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="22" fill={iconFg} textAnchor="middle">GC</text>
            </svg>
        );
    }

    return (
        <svg
            viewBox="0 0 260 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            {/* Icon mark */}
            <rect x="0" y="2" width="60" height="60" rx="14" fill={iconBg} />
            <text
                x="30" y="44"
                fontFamily="'Arial Black', Arial, sans-serif"
                fontWeight="900"
                fontSize="28"
                fill={iconFg}
                textAnchor="middle"
            >GC</text>

            {/* Three dots */}
            <circle cx="76"  cy="32" r="4.5" fill={orange} />
            <circle cx="89"  cy="32" r="4.5" fill={orange} />
            <circle cx="102" cy="32" r="4.5" fill={orange} />

            {/* Wordmark */}
            <text
                x="114" y="24"
                fontFamily="'Arial Black', Arial, sans-serif"
                fontWeight="900"
                fontSize="14"
                fill={navy}
                letterSpacing="2"
            >GIGS &amp;</text>
            <text
                x="114" y="44"
                fontFamily="'Arial Black', Arial, sans-serif"
                fontWeight="900"
                fontSize="14"
                fill={orange}
                letterSpacing="2"
            >CAMPAIGNS</text>
        </svg>
    );
}
