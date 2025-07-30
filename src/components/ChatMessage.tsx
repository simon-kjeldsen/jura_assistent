'use client';

interface ChatMessageProps {
    message: string;
    isUser: boolean;
    timestamp?: string;
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-slide-in`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 transition-all duration-300 ${isUser
                ? 'bg-slate-700 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                <div className="text-sm leading-relaxed transition-all duration-300">
                    {message.split('\n').map((line, index) => {
                        const trimmedLine = line.trim();

                        // Formater overskrifter der starter med ** og slutter med **
                        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                            const title = trimmedLine.slice(2, -2); // Fjern **
                            return (
                                <div key={index} className="mb-3 animate-fade-in">
                                    <strong className={`text-base font-bold block border-l-4 pl-3 py-1 ${isUser
                                        ? 'text-white border-white'
                                        : 'text-gray-900 dark:text-gray-100 border-slate-700 dark:border-slate-400'
                                        }`}>
                                        {title}:
                                    </strong>
                                </div>
                            );
                        }

                        // Formater almindelig tekst og fjern ** fra midten af linjer
                        const processedLine = line.replace(/\*\*(.*?)\*\*/g, (match, text) => {
                            return `<strong>${text}</strong>`;
                        });

                        return (
                            <div key={index} className="mb-2 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <span dangerouslySetInnerHTML={{ __html: processedLine }} />
                            </div>
                        );
                    })}
                </div>
                {timestamp && (
                    <p className={`text-xs mt-2 ${isUser ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                        {timestamp}
                    </p>
                )}
            </div>
        </div>
    );
} 