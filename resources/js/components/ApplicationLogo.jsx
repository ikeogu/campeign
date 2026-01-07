export default function ApplicationLogo(props) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Gradient Definition */}
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#DB2777" /> {/* pink-600 */}
                    <stop offset="100%" stopColor="#4F46E5" /> {/* indigo-600 */}
                </linearGradient>
            </defs>

            {/* Background Shape: Soft Rounded Square */}
            <rect width="100" height="100" rx="30" fill="url(#logoGradient)" />

            {/* Icon: Modern Share Node */}
            {/* Circle 1: The Payout Source */}
            <circle cx="35" cy="50" r="8" fill="white" />

            {/* Lines: The Distribution/Share paths */}
            <path
                d="M42 46L58 34M42 54L58 66"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
            />

            {/* Circle 2 & 3: The Social Circles */}
            <circle cx="65" cy="30" r="8" fill="white" fillOpacity="0.9" />
            <circle cx="65" cy="70" r="8" fill="white" fillOpacity="0.9" />

            {/* Accent Sparkle: Representing Earnings */}
            <path
                d="M80 45L82 50L87 52L82 54L80 59L78 54L73 52L78 50L80 45Z"
                fill="#FDE047"
            />
        </svg>
    );
}
