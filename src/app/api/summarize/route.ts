import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
    try {
        const { text, conversationHistory } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: 'Ingen tekst blev sendt' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API nøgle mangler' },
                { status: 500 }
            );
        }

        // Prompt med samtalehistorik
        let prompt = `Du er ekspert i juridisk ret og skal give kort besvarelse af følgende spørgsmål. Husk konteksten fra tidligere spørgsmål i samtalen.\n\n`;

        // Tilføjelse af samtalehistorik hvis den findes
        if (conversationHistory && conversationHistory.length > 0) {
            prompt += `Tidligere samtale:\n`;
            conversationHistory.forEach((msg: any) => {
                prompt += `${msg.isUser ? 'Bruger' : 'AI'}: ${msg.text}\n`;
            });
            prompt += `\nNuværende spørgsmål: ${text}\n\nSvar:`;
        } else {
            prompt += `Spørgsmål: ${text}\n\nSvar:`;
        }

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const summary = response.data.candidates[0].content.parts[0].text;

        return NextResponse.json({ summary });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('Fejl ved opsummering:', error);

        // Hvis det er en 503 fejl (service unavailable), giv en brugervenlig besked
        if (error.response?.status === 503) {
            return NextResponse.json(
                { error: 'Gemini AI er midlertidigt utilgængelig. Prøv venligst igen om et par minutter.' },
                { status: 503 }
            );
        }

        // For andre fejl
        return NextResponse.json(
            { error: 'Der opstod en fejl ved besvarelse af spørgsmålet. Prøv venligst igen.' },
            { status: 500 }
        );
    }
} 