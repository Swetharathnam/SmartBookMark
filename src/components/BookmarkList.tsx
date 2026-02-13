'use client'

import { createClient } from '@/utils/supabase/client'
import { Bookmark } from '@/types'
import { Trash2, ExternalLink, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BookmarkList({ refreshTrigger }: { refreshTrigger?: number }) {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = useState(() => createClient())[0]

    const fetchBookmarks = async () => {
        const { data, error } = await supabase
            .from('bookmarks')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching bookmarks:', error)
        } else {
            setBookmarks(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchBookmarks()
    }, [refreshTrigger]) // Refetch when parent triggers

    useEffect(() => {
        // Real-time subscription
        const channel = supabase
            .channel('bookmarks-channel') // Named channel for stability
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookmarks',
                },
                (payload) => {
                    console.log('Realtime event received:', payload.eventType, payload)
                    if (payload.eventType === 'INSERT') {
                        setBookmarks((prev) => {
                            // Check if already exists to avoid duplicates
                            if (prev.some(b => b.id === payload.new.id)) return prev
                            return [payload.new as Bookmark, ...prev]
                        })
                    } else if (payload.eventType === 'DELETE') {
                        setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id))
                    } else if (payload.eventType === 'UPDATE') {
                        setBookmarks((prev) =>
                            prev.map((b) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
                        )
                    }
                }
            )
            .subscribe((status) => {
                console.log('Realtime subscription status:', status)
            })

        return () => {
            console.log('Cleaning up realtime subscription...')
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const handleDelete = async (id: string) => {
        // Optimistic update
        const previousBookmarks = [...bookmarks]
        setBookmarks((prev) => prev.filter((b) => b.id !== id))

        const { error } = await supabase.from('bookmarks').delete().eq('id', id)
        if (error) {
            console.error('Error deleting bookmark:', error)
            setBookmarks(previousBookmarks) // Rollback
            alert('Failed to delete bookmark')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
                {bookmarks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-12 text-center text-gray-500 bg-white/5 rounded-2xl border border-dashed border-white/10"
                    >
                        No bookmarks yet. Add your first one to get started!
                    </motion.div>
                ) : (
                    bookmarks.map((bookmark) => (
                        <motion.div
                            key={bookmark.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm hover:bg-white/10 transition-all hover:border-indigo-500/50 shadow-lg relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-semibold text-white truncate pr-4 text-lg">
                                    {bookmark.title}
                                </h3>
                                <div className="flex gap-2">
                                    <a
                                        href={bookmark.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-gray-400 hover:text-indigo-400 transition-all border border-white/5"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(bookmark.id)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all border border-white/5"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 truncate mb-1">{bookmark.url}</p>
                            <p className="text-[10px] text-gray-600 font-mono">
                                {new Date(bookmark.created_at).toLocaleDateString()}
                            </p>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-all"></div>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
        </div>
    )
}
