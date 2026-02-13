'use client'

import { createClient } from '@/utils/supabase/client'
import { Plus, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function BookmarkForm({ onBookmarkAdded }: { onBookmarkAdded?: () => void }) {
    const [title, setTitle] = useState('')
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = useState(() => createClient())[0]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !url) return

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error } = await supabase.from('bookmarks').insert([
                { title, url, user_id: user.id }
            ])

            if (error) throw error

            setTitle('')
            setUrl('')
            if (onBookmarkAdded) onBookmarkAdded()
        } catch (error: any) {
            console.error('Error adding bookmark:', error)
            let message = 'Failed to add bookmark.'
            if (error.code === '42P01') {
                message = 'Database table "bookmarks" not found. Please run the script in supabase_setup.sql first.'
            } else if (error.code === '42501') {
                message = 'Permission denied. Please check your RLS policies in Supabase.'
            } else if (error.message) {
                message = `Error: ${error.message}`
            }
            alert(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Add New Bookmark
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
                        Title
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Google"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-400 mb-1">
                        URL
                    </label>
                    <input
                        id="url"
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://google.com"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-2 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Add Bookmark
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
