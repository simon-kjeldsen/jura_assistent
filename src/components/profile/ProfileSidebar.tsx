'use client';

import { useSession, signOut } from 'next-auth/react';

interface ProfileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
    const { data: session } = useSession();

    const handleSignOut = () => {
        signOut({ callbackUrl: '/auth/signin' });
    };

    return (
        <>
            {/* Sidebar */}
            <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {/* Din Profil Section */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                                Din Profil
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl font-medium">
                                        {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-medium text-gray-900">
                                        {session?.user?.name || 'Bruger'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {session?.user?.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Abonnement Section */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                                Abonnement
                            </h3>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">Gratis Plan</p>
                                        <p className="text-xs text-blue-700">Begrænset adgang til Juridisk AI</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Indstillinger Section */}
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                                Indstillinger
                            </h3>
                            <div className="space-y-2">
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sm text-gray-700">Præferencer</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2zM10 7h10V5H10v2zM10 11h10V9H10v2zM10 15h10v-2H10v2z" />
                                    </svg>
                                    <span className="text-sm text-gray-700">Chat Historik</span>
                                </button>
                                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm text-gray-700">Hjælp & Support</span>
                                </button>
                            </div>
                        </div>

                        {/* Log ud Section */}
                        <div className="p-6">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-left text-red-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="text-sm font-medium cursor-pointer">Log ud</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 