import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Alle felter er påkrævet' },
                { status: 400 }
            );
        }

        console.log('Checking if user exists...');

        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('User')
            .select('id')
            .eq('email', email)
            .single();

        if (checkError) {
            console.error('Error checking existing user:', checkError);
        }

        if (existingUser) {
            return NextResponse.json(
                { error: 'En bruger med denne email findes allerede' },
                { status: 400 }
            );
        }

        console.log('Creating new user...');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const { data: user, error: createError } = await supabase
            .from('User')
            .insert({
                name,
                email,
                password: hashedPassword,
            })
            .select()
            .single();

        if (createError) {
            console.error('Error creating user:', createError);
            console.error('Error details:', {
                code: createError.code,
                message: createError.message,
                details: createError.details,
                hint: createError.hint
            });
            return NextResponse.json(
                { error: 'Der opstod en fejl ved oprettelse af bruger' },
                { status: 500 }
            );
        }

        // Remove password from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                message: 'Bruger oprettet succesfuldt',
                user: userWithoutPassword
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Der opstod en fejl ved oprettelse af bruger' },
            { status: 500 }
        );
    }
} 