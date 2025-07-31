'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSidebar from './chat/ChatSidebar';
import ProfileSidebar from './profile/ProfileSidebar';
import AuthGuard from './auth/AuthGuard';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string;
}

export default function ChatApp() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<string | undefined>();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileSidebarOpen, setProfileSidebarOpen] = useState(false);
    const [newChatId, setNewChatId] = useState<string | undefined>();
    const [newChatTitle, setNewChatTitle] = useState<string | undefined>();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load dark mode preference from localStorage
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode !== null) {
            const darkMode = JSON.parse(savedDarkMode);
            console.log('Loading dark mode from localStorage:', darkMode);
            setIsDarkMode(darkMode);
            // Apply immediately
            if (darkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    // Save dark mode preference to localStorage
    useEffect(() => {
        console.log('Dark mode changed to:', isDarkMode);
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        // Apply dark mode to document
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            console.log('Added dark class to document');
        } else {
            document.documentElement.classList.remove('dark');
            console.log('Removed dark class from document');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        console.log('Toggle dark mode clicked, current state:', isDarkMode);
        setIsDarkMode(!isDarkMode);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        const userMessage: Message = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            text: message,
            isUser: true,
            timestamp: new Date().toLocaleTimeString('da-DK', {
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        // Gem chat automatisk hvis det er første besked og vis optimistisk
        if (messages.length === 0) {
            const title = message.substring(0, 50) || 'Ny chat';
            setNewChatTitle(title);
            await saveChat();
        }

        try {
            // Send samtalehistorik med forespørgslen
            const conversationHistory = messages.map(msg => ({
                text: msg.text,
                isUser: msg.isUser
            }));

            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message,
                    conversationHistory: conversationHistory
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Der opstod en fejl');
            }

            // Opret en tom AI besked
            const aiMessageId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const aiMessage: Message = {
                id: aiMessageId,
                text: '',
                isUser: false,
                timestamp: new Date().toLocaleTimeString('da-DK', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            setMessages(prev => [...prev, aiMessage]);

            // Simuler streaming effekt med smooth timing
            const lines = data.summary.split('\n');
            let currentText = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.trim()) {
                    currentText += line + '\n';
                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === aiMessageId
                                ? { ...msg, text: currentText }
                                : msg
                        )
                    );

                    // Smooth scroll til bunden efter hver opdatering
                    setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'end'
                        });
                    }, 50);

                    // Langsommere og mere smooth timing
                    const baseDelay = 80; // Minimum forsinkelse
                    const lengthDelay = Math.min(line.length * 3, 200); // Maksimal forsinkelse
                    const delay = baseDelay + lengthDelay;

                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }

            // Gem chat automatisk efter AI svar
            if (currentChatId) {
                await saveMessagesToChat(currentChatId);
            }
        } catch (error) {
            console.error('Fejl ved besvarelse:', error);

            const errorMessage: Message = {
                id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                text: 'Beklager, der opstod en fejl. Prøv venligst igen.',
                isUser: false,
                timestamp: new Date().toLocaleTimeString('da-DK', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // const handleClear = () => {
    //     setMessages([]);
    //     setCurrentChatId(undefined);
    // };

    const handleNewChat = () => {
        setMessages([]);
        setCurrentChatId(undefined);
        setNewChatId(undefined);
        setNewChatTitle(undefined);
    };

    const handleLoadChat = async (chatId: string) => {
        try {
            const response = await fetch(`/api/chats/${chatId}`);
            if (response.ok) {
                const data = await response.json();
                const chatMessages = data.chat.messages.map((msg: { id: string; content: string; isUser: boolean; createdAt: string }) => ({
                    id: msg.id,
                    text: msg.content,
                    isUser: msg.isUser,
                    timestamp: new Date(msg.createdAt).toLocaleTimeString('da-DK', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }));

                // Remove any duplicate messages by ID
                const uniqueMessages = chatMessages.filter((message: Message, index: number, self: Message[]) =>
                    index === self.findIndex((m: Message) => m.id === message.id)
                );

                setMessages(uniqueMessages);
                setCurrentChatId(chatId);
            }
        } catch (error) {
            console.error('Error loading chat:', error);
        }
    };

    const saveChat = async () => {
        if (messages.length === 0) return;

        try {
            let chatId = currentChatId;

            // Opret ny chat hvis der ikke er en currentChatId
            if (!chatId) {
                const title = messages[0]?.text.substring(0, 50) || 'Ny chat';

                const response = await fetch('/api/chats', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title }),
                });

                if (response.ok) {
                    const data = await response.json();
                    chatId = data.chat.id;
                    setCurrentChatId(chatId);
                    setNewChatId(chatId);
                }
            }

            // Gem messages til chat
            if (chatId) {
                await saveMessagesToChat(chatId);
            }
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    };

    const saveMessagesToChat = async (chatId: string) => {
        try {
            const response = await fetch(`/api/chats/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages }),
            });

            if (!response.ok) {
                console.error('Error saving messages');
            }
        } catch (error) {
            console.error('Error saving messages:', error);
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
                {/* Sidebar */}
                {sidebarOpen && (
                    <ChatSidebar
                        onLoadChat={handleLoadChat}
                        onNewChat={handleNewChat}
                        currentChatId={currentChatId}
                        newChatId={newChatId}
                        newChatTitle={newChatTitle}
                    />
                )}

                {/* Profile Sidebar */}
                <ProfileSidebar
                    isOpen={profileSidebarOpen}
                    onClose={() => setProfileSidebarOpen(false)}
                />

                {/* Main Content */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${profileSidebarOpen ? 'blur-sm' : ''
                    }`}>
                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                    {sidebarOpen ? (
                                        // Luk sidebar ikon (X)
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        // Åbn sidebar ikon (hamburger)
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Juridisk AI</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Din juridiske assistent</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {messages.length > 0 && (
                                    <button
                                        onClick={saveChat}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm cursor-pointer"
                                    >
                                        Gem chat
                                    </button>
                                )}

                                {/* Dark Mode Toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                                    title={isDarkMode ? 'Skift til lyst tema' : 'Skift til mørkt tema'}
                                >
                                    {isDarkMode ? (
                                        // Sun icon for dark mode
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    ) : (
                                        // Moon icon for light mode
                                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                        </svg>
                                    )}
                                </button>

                                {/* User Profile Button */}
                                {session?.user && (
                                    <button
                                        onClick={() => setProfileSidebarOpen(true)}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    >
                                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                                            {session.user.name || session.user.email}
                                        </span>
                                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-6">
                        <div className="max-w-4xl mx-auto">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Velkommen til Juridisk AI
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                                        Stil dit juridiske spørgsmål herunder, og få et professionelt svar baseret på dansk lovgivning.
                                    </p>

                                    {/* Chat Input - Centreret på velkomstsiden */}
                                    <div className="max-w-2xl mx-auto">
                                        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <ChatMessage
                                            key={message.id}
                                            message={message.text}
                                            isUser={message.isUser}
                                            timestamp={message.timestamp}
                                        />
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start mb-4 animate-slide-in">
                                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-2xl px-4 py-3 transition-all duration-300">
                                                <div className="flex items-center gap-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 dark:border-gray-300"></div>
                                                    <span className="text-sm">Analyserer...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Chat Input - Flyder til bunden efter første besked */}
                    {messages.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="max-w-4xl mx-auto">
                                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                            </div>
                        </div>
                    )}

                    {/* Disclaimer - I bunden */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800 px-4 py-3">
                        <div className="max-w-4xl mx-auto">
                            <p className="text-yellow-800 dark:text-yellow-200 text-xs text-center">
                                <strong>⚠️ Vigtig advarsel:</strong> Dette er et AI-værktøj til informationsformål.
                                Svar er ikke juridisk rådgivning og kan ikke erstatte professionel juridisk hjælp.
                                Kontakt altid en advokat for specifik juridisk rådgivning.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
} 