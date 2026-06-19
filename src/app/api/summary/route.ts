import {NextResponse} from 'next/server';
import {db} from '@/db/index';
import { notes } from '@/db/schema';
import { GoogleGenAI } from '@google/genai';


const ai = new GoogleGenAI({apiKey : process.env.GEMINI_API_KEY});

async function generateWithRetry(prompt: string, retries = 3, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response;
        } catch (error: any) {
            const is503 = error?.status === 503 || error?.message?.includes('503');
            if (is503 && i < retries - 1) {
                console.log(`Gemini 503, retry ${i + 1}/${retries}, waiting ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                delay *= 2; 
            } else {
                throw error; 
            }
        }
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    })
}


export async function POST(req: Request){
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        const { rawText, date } = await req.json();

        if(!rawText){
            return NextResponse.json(
                { error: "No data received" },
                { status: 400, headers: corsHeaders }
            )
        }

        const currentUserId = "116326447384599892761"; 

        const prompt = `
            You are a concise personal knowledge management assistant. Analyze the following chat logs between the user and the AI today. 
            Filter out casual small talk and lengthy, repetitive debugging code to extract high-value, core knowledge points.

            Strictly output the response in the following JSON format. Do not include any markdown code blocks (such as \`\`\`json):
            {
            "title": "A 5-10 word summary of the topic",
            "content": "Today's summary written in elegant Markdown format. Include: Today's Review, Key Conclusions, and Code/Technical Highlights (if applicable)"
            }

            The raw chat logs are as follows:
            ${rawText}
        `;

   
        const response = await generateWithRetry(prompt);

        let rawAiText = (response?.text?.trim()) ?? "";
        if (!rawAiText) {
            throw new Error("No text return from AI");
        }
        if (rawAiText.startsWith("```")) {
            rawAiText = rawAiText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        }

        const aiResult = JSON.parse(rawAiText);

        const result = await db.insert(notes)
            .values({
                userId: currentUserId, 
                title: aiResult.title,
                content: aiResult.content,
                date: date,          
                type: "ai_summary",
            })
            .onConflictDoUpdate({
                target: [notes.userId, notes.date], 
                set: {
                    title: aiResult.title,
                    content: aiResult.content,
                    lastEdit: new Date(), 
                }
            })
            .returning();

        return NextResponse.json(
            { success: true, data: result[0] }, 
            { status: 200, headers: corsHeaders }
        );

    } catch(error) {
        console.error('DashNote Sync Error:', error);
        return NextResponse.json(
            { error: 'internal error, summarise failed' }, 
            { status: 500, headers: corsHeaders }
        );
    }
}