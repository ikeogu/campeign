import { Link } from "@inertiajs/react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="text-xl font-black tracking-tighter text-gray-900 uppercase">
                            GIGS & <span className="text-pink-600">CAMPAIGNS</span>
                        </Link>
                        <p className="mt-4 text-sm text-gray-500 font-medium leading-relaxed">
                            The tech-enabled marketplace for authentic brand distribution. Reach real people through real promoters.
                        </p>
                        <div className="mt-6 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Operational</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-black text-gray-900 uppercase text-[11px] tracking-[0.2em] mb-6">Marketplace</h4>
                        <ul className="space-y-4">
                            <li><Link href={route('guest.gigs')} className="text-sm text-gray-500 hover:text-pink-600 font-bold transition-colors">Browse Gigs</Link></li>
                            <li><Link href="/register" className="text-sm text-gray-500 hover:text-pink-600 font-bold transition-colors">Start Earning</Link></li>
                            <li><Link href="/login" className="text-sm text-gray-500 hover:text-pink-600 font-bold transition-colors">Brand Login</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Trust */}
                    <div>
                        <h4 className="font-black text-gray-900 uppercase text-[11px] tracking-[0.2em] mb-6">Legal & Policy</h4>
                        <ul className="space-y-4">
                            <li><Link href={route('terms')} className="text-sm text-gray-500 hover:text-pink-600 font-bold transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-pink-600 font-bold transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-sm text-gray-500 hover:text-pink-600 font-bold transition-colors">Ad Guidelines</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter/Contact */}
                    <div>
                        <h4 className="font-black text-gray-900 uppercase text-[11px] tracking-[0.2em] mb-6">Connect</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-4">Support Inquiries:</p>
                        <a href="mailto:hello@gigscampaigns.com" className="text-sm font-black text-gray-900 hover:text-pink-600 underline decoration-pink-200 underline-offset-4">
                            hello@gigscampaigns.com
                        </a>
                        <div className="flex gap-4 mt-8">
                            {/* Social Icons Placeholders */}
                            {['tw', 'ig', 'wa'].map((social) => (
                                <div key={social} className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase hover:bg-gray-900 hover:text-white transition-all cursor-pointer">
                                    {social}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        © {currentYear} GIGS & CAMPAIGNS TECHNOLOGY. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Built for Creators</span>
                        <div className="h-4 w-px bg-gray-100"></div>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">Lagos, Nigeria</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
