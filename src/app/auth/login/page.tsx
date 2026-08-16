'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Triangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                router.push('/');
                router.refresh();
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-4">
            <div className="sharp-card w-full max-w-md bg-white dark:bg-black p-8">
                {/* Triangle Header */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="flex h-12 w-12 items-center justify-center border-2 border-black dark:border-white mb-4 bg-black/5 dark:bg-white/5">
                        <Triangle className="h-5 w-5 fill-black text-black dark:fill-white dark:text-white" />
                    </div>
                    <h1 className="font-mono-sharp text-2xl font-black text-black dark:text-white uppercase tracking-wider">
                        {isSignUp ? 'REGISTER_ACCOUNT' : 'AUTHENTICATION'}
                    </h1>
                    <p className="font-mono-sharp text-xs text-zinc-500 mt-1">
                        {isSignUp ? '[CREATE YOUR TRACKING DATABASE]' : '[ACCESS YOUR TRACKING DATABASE]'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 border border-red-500 bg-red-500/10 p-3 text-xs font-mono-sharp text-red-500">
                        [ERROR]: {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5 font-mono-sharp">
                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                            EMAIL_ADDRESS
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@domain.com"
                            className="w-full border border-black/20 dark:border-white/20 bg-black/5 dark:bg-zinc-950 px-4 py-2.5 text-xs text-black dark:text-white placeholder-zinc-500 focus:border-black dark:focus:border-white focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1">
                            SECURITY_PASSWORD
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-black/20 dark:border-white/20 bg-black/5 dark:bg-zinc-950 px-4 py-2.5 text-xs text-black dark:text-white placeholder-zinc-500 focus:border-black dark:focus:border-white focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="sharp-btn w-full bg-black text-white dark:bg-white dark:text-black py-3 text-xs font-mono-sharp font-bold uppercase tracking-widest hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isSignUp ? 'SUBMIT_REGISTRATION' : 'AUTHENTICATE'}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs font-mono-sharp text-zinc-500 border-t border-black/10 dark:border-white/10 pt-4">
                    {isSignUp ? 'ALREADY_HAVE_ACCOUNT?' : "NEED_AN_ACCOUNT?"}{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                        }}
                        className="text-black dark:text-white font-bold underline ml-1 hover:opacity-75"
                    >
                        {isSignUp ? '[SIGN_IN]' : '[CREATE_ONE]'}
                    </button>
                </div>
            </div>
        </div>
    );
}