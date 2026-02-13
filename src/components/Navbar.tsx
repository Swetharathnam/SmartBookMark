'use client'

import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, Bookmark as BookmarkIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null)
    const supabase = useState(() => createClient())[0]

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [supabase.auth])

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/auth/callback',
            },
        })
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                            <BookmarkIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            SmartBookmark
                        </span>
                    </div>

                    <div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all text-sm font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-all text-sm font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                <LogIn className="w-4 h-4" />
                                Sign in with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
