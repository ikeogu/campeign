import { useEffect, useRef, useState } from 'react';

export default function BankSelect({ banks, value, onChange, placeholder = 'Search for your bank...' }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const selectedBank = banks.find(b => b.code === value);

    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setQuery('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = query
        ? banks.filter(b => b.name.toLowerCase().includes(query.toLowerCase()))
        : banks;

    return (
        <div className="relative" ref={containerRef}>
            <input
                type="text"
                className="w-full bg-gray-50 border-gray-100 rounded-2xl px-5 py-4 font-bold focus:ring-brand-500"
                value={open ? query : (selectedBank?.name ?? '')}
                onFocus={() => setOpen(true)}
                onChange={e => {
                    setQuery(e.target.value);
                    setOpen(true);
                }}
                onKeyDown={e => {
                    if (e.key === 'Escape') {
                        setOpen(false);
                        setQuery('');
                    }
                }}
                placeholder={placeholder}
                autoComplete="off"
            />

            {open && (
                <div className="absolute z-50 mt-2 w-full max-h-64 overflow-y-auto bg-white rounded-2xl shadow-xl border border-gray-100 py-2">
                    {filtered.length === 0 && (
                        <p className="px-5 py-3 text-sm text-gray-400 font-bold">No banks found.</p>
                    )}
                    {filtered.map((bank, i) => (
                        <button
                            key={`${bank.code}-${i}`}
                            type="button"
                            onClick={() => {
                                onChange(bank.code, bank.name);
                                setOpen(false);
                                setQuery('');
                            }}
                            className={`w-full text-left px-5 py-3 font-bold text-sm transition-colors hover:bg-gray-50 ${
                                bank.code === value ? 'text-brand-600 bg-brand-50' : 'text-gray-700'
                            }`}
                        >
                            {bank.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
