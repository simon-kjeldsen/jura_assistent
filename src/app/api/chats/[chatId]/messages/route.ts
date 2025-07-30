import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// POST /api/chats/[chatId]/messages - Save messages to chat
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { chatId } = await params;

        // Check if chat exists and belongs to user
        const { data: chat, error: chatError } = await supabase
            .from('Chat')
            .select('id')
            .eq('id', chatId)
            .eq('userId', session.user.id)
            .single();

        if (chatError || !chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        const { messages } = await request.json();

        // Delete existing messages for this chat
        const { error: deleteError } = await supabase
            .from('ChatMessage')
            .delete()
            .eq('chatId', chatId);

        if (deleteError) {
            console.error('Error deleting existing messages:', deleteError);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        // Create new messages
        const messagesToInsert = messages.map((msg: any, index: number) => ({
            chatId: chatId,
            content: msg.text,
            isUser: msg.isUser,
            order: index,
        }));

        const { data: createdMessages, error: insertError } = await supabase
            .from('ChatMessage')
            .insert(messagesToInsert)
            .select();

        if (insertError) {
            console.error('Error creating messages:', insertError);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        // Update chat title and timestamp
        const { error: updateError } = await supabase
            .from('Chat')
            .update({
                title: messages[0]?.text.substring(0, 50) || 'Ny chat',
                updatedAt: new Date().toISOString(),
            })
            .eq('id', chatId);

        if (updateError) {
            console.error('Error updating chat:', updateError);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        return NextResponse.json({ messages: createdMessages });
    } catch (error) {
        console.error('Error saving messages:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 