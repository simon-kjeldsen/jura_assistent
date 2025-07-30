'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Chat {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    isLoading?: boolean;
}

interface ChatSidebarProps {
    onLoadChat: (chatId: string) => void;
    onNewChat: () => void;
    currentChatId?: string;
    newChatId?: string;
    newChatTitle?: string;
}

export default function ChatSidebar({ onLoadChat, onNewChat, currentChatId, newChatId, newChatTitle }: ChatSidebarProps) {
    const { data: session } = useSession();
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (session?.user) {
            loadChats();
        }
    }, [session]);

    // Add new chat optimistically
    useEffect(() => {
        if (newChatId && newChatTitle) {
            const newChat: Chat = {
                id: newChatId,
                title: newChatTitle,
                createdAt: new Date(),
                updatedAt: new Date(),
                isLoading: true
            };
            setChats(prev => {
                // Remove any existing chat with same ID to avoid duplicates
                const filteredChats = prev.filter(chat => chat.id !== newChatId);
                return [newChat, ...filteredChats];
            });
        }
    }, [newChatId, newChatTitle]);

    const loadChats = async () => {
        try {
            const response = await fetch('/api/chats');
            if (response.ok) {
                const data = await response.json();
                // Merge with existing chats and remove loading state
                setChats(prev => {
                    const existingChats = prev.filter(chat => chat.isLoading);
                    const serverChats = data.chats.map((chat: Chat) => ({
                        ...chat,
                        isLoading: false
                    }));

                    // Remove duplicates by ID
                    const allChats = [...serverChats, ...existingChats];
                    const uniqueChats = allChats.filter((chat, index, self) =>
                        index === self.findIndex(c => c.id === chat.id)
                    );

                    return uniqueChats;
                });
            }
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteChat = async (chatId: string) => {
        try {
            const response = await fetch(`/api/chats/${chatId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setChats(chats.filter(chat => chat.id !== chatId));
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('da-DK', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    const truncateTitle = (title: string) => {
        return title.length > 30 ? title.substring(0, 30) + '...' : title;
    };

    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={onNewChat}
                    className=" cursor-pointer w-full bg-slate-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                    Ny chat
                </button>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Indlæser chats...</p>
                    </div>
                ) : chats.length === 0 ? (
                    <div className="p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ingen gemte chats</p>
                    </div>
                ) : (
                    <div className="p-2">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`group relative p-3 rounded-lg mb-1 cursor-pointer transition-colors ${currentChatId === chat.id
                                    ? 'bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                onClick={() => onLoadChat(chat.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {truncateTitle(chat.title || 'Uden titel')}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {chat.isLoading ? (
                                                <span className="text-blue-500 dark:text-blue-400"></span>
                                            ) : (
                                                formatDate(chat.createdAt)
                                            )}
                                        </p>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteChat(chat.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                                        title="Slet chat"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
} 