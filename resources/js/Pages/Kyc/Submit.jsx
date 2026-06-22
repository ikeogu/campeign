import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm, usePage } from '@inertiajs/react';

const STATUS_CONFIG = {
    approved: {
        icon: '✓',
        bg: 'bg-green-50 border-green-200',
        icon_bg: 'bg-green-500',
        text: 'text-green-800',
        label: 'Identity Verified',
    },
    pending: {
        icon: '⏳',
        bg: 'bg-amber-50 border-amber-200',
        icon_bg: 'bg-amber-500',
        text: 'text-amber-800',
        label: 'Under Review',
    },
    rejected: {
        icon: '✗',
        bg: 'bg-red-50 border-red-200',
        icon_bg: 'bg-red-500',
        text: 'text-red-800',
        label: 'Rejected — Please Resubmit',
    },
};

export default function KycSubmit({ kyc, user_role }) {
    const { flash } = usePage().props;
    const result    = flash?.kyc_result;

    const { data, setData, post, processing, errors } = useForm({
        id_type:   'bvn',
        id_number: '',
    });

    const isApproved = kyc?.status === 'approved';

    const submit = (e) => {
        e.preventDefault();
        post(route('kyc.submit'));
    };

    const statusCfg = kyc ? STATUS_CONFIG[kyc.status] : null;

    return (
        <AuthenticatedLayout header="Identity Verification">
            <div className="max-w-xl mx-auto py-12 px-4">

                {/* Result banner after submission */}
                {result && (
                    <div className={`mb-6 p-4 rounded-2xl border font-bold text-sm flex items-start gap-3 ${
                        result.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800'
                        : result.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        <span className={`mt-0.5 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0 text-xs font-black ${
                            result.status === 'approved' ? 'bg-green-500'
                            : result.status === 'pending' ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}>
                            {result.status === 'approved' ? '✓' : result.status === 'pending' ? '…' : '✗'}
                        </span>
                        {result.message}
                    </div>
                )}

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8">

                    {/* Current KYC status */}
                    {statusCfg && (
                        <div className={`mb-8 p-5 rounded-2xl border ${statusCfg.bg}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-white rounded-full w-7 h-7 flex items-center justify-center font-black text-sm ${statusCfg.icon_bg}`}>
                                    {statusCfg.icon}
                                </span>
                                <span className={`font-black text-sm ${statusCfg.text}`}>{statusCfg.label}</span>
                            </div>
                            {kyc.verified_name && (
                                <p className={`text-xs font-bold ${statusCfg.text} opacity-75`}>
                                    Verified as: <span className="uppercase">{kyc.verified_name}</span>
                                </p>
                            )}
                            <p className={`text-xs mt-1 ${statusCfg.text} opacity-60`}>
                                {kyc.id_type?.toUpperCase()} submitted on {kyc.submitted_at}
                            </p>
                        </div>
                    )}

                    {/* Explainer */}
                    {!isApproved && (
                        <>
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Why we need this</h2>
                            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                                {user_role === 'promoter'
                                    ? 'Withdrawals above ₦10,000 require identity verification. It takes under a minute.'
                                    : 'Advertisers must verify their identity before registering a payout account and withdrawing funds.'}
                            </p>

                            <form onSubmit={submit} className="space-y-6">

                                {/* ID type */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-3 ml-1">
                                        Verification Method
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['bvn', 'nin'].map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setData('id_type', type)}
                                                className={`py-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all ${
                                                    data.id_type === type
                                                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                                                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ID number */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">
                                        {data.id_type === 'bvn' ? 'Bank Verification Number (BVN)' : 'National Identification Number (NIN)'}
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="11"
                                        className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold tracking-[0.3em] text-center focus:ring-brand-500 transition-all text-xl"
                                        value={data.id_number}
                                        onChange={e => setData('id_number', e.target.value.replace(/\D/g, ''))}
                                        placeholder="00000000000"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                                        Your {data.id_type.toUpperCase()} is an 11-digit number. It is encrypted and never shared.
                                    </p>
                                    {errors.id_number && <p className="text-red-500 text-[10px] mt-1 font-bold">{errors.id_number}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || data.id_number.length !== 11}
                                    className="w-full py-5 bg-brand-600 text-white font-black rounded-2xl hover:bg-brand-700 shadow-xl transition-all active:scale-95 disabled:opacity-50 uppercase text-[10px] tracking-widest"
                                >
                                    {processing ? 'Verifying...' : `Verify my ${data.id_type.toUpperCase()}`}
                                </button>

                            </form>
                        </>
                    )}

                    {isApproved && (
                        <p className="text-sm text-gray-500 text-center">
                            Your identity is verified. You can now{' '}
                            {user_role === 'campaigner'
                                ? <a href={route('advertiser.payout-account')} className="text-brand-600 font-bold underline">set up your payout account</a>
                                : <a href={route('withdraw.create')} className="text-brand-600 font-bold underline">withdraw your earnings</a>
                            }.
                        </p>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
