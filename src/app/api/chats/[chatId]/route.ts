import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/chats/[chatId] - Get specific chat with messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { chatId } = await params;

        // Get chat
        const { data: chat, error: chatError } = await supabase
            .from('Chat')
            .select('*')
            .eq('id', chatId)
            .eq('userId', session.user.id)
            .single();

        if (chatError || !chat) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
        }

        // Get messages
        const { data: messages, error: messagesError } = await supabase
            .from('ChatMessage')
            .select('*')
            .eq('chatId', chatId)
            .order('order', { ascending: true });

        if (messagesError) {
            console.error('Error fetching messages:', messagesError);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            chat: {
                ...chat,
                messages: messages || []
            }
        });
    } catch (error) {
        console.error('Error fetching chat:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/chats/[chatId] - Delete chat
export async function DELETE(
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

        // Delete chat (messages will be deleted automatically due to cascade)
        const { error: deleteError } = await supabase
            .from('Chat')
            .delete()
            .eq('id', chatId);

        if (deleteError) {
            console.error('Error deleting chat:', deleteError);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting chat:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 