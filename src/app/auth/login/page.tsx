'use client';

import { useState } from 'react';
import { login, signup } from '@/actions/auth';
import { Clapperboard, Loader2 } from 'lucide-react';

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        try {
            const res = isSignUp ? await signup(formData) : await login(formData);
            if (res?.error) {
                setError(res.error);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-[85vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-orange-500/20 mb-3">
                        <Clapperboard className="h-6 w-6 text-black" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {isSignUp ? 'Create your LogIt account' : 'Welcome back to LogIt'}
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        {isSignUp ? 'Start tracking your movies, series & anime' : 'Sign in to access your media library'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-semibold text-black hover:opacity-95 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-zinc-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                        }}
                        className="text-amber-400 hover:underline font-medium ml-1"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}