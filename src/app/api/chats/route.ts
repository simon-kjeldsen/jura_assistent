import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/chats - Get user's chats
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: chats, error } = await supabase
            .from('Chat')
            .select('id, title, createdAt, updatedAt')
            .eq('userId', session.user.id)
            .order('updatedAt', { ascending: false });

        if (error) {
            console.error('Error fetching chats:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        return NextResponse.json({ chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/chats - Create new chat
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title } = await request.json();

        const { data: chat, error } = await supabase
            .from('Chat')
            .insert({
                userId: session.user.id,
                title: title || 'Ny chat',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating chat:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }

        return NextResponse.json({ chat }, { status: 201 });
    } catch (error) {
        console.error('Error creating chat:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 