import { generateText} from 'ai';
import { google } from "@ai-sdk/google";
import { NextResponse } from 'next/server';

const generateWithRetry = async (options: any, retries = 3): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await generateText(options);
    } catch (error: any) {
      if (error?.statusCode === 503 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 1s, 2s, 3s
        continue;
      }
      throw error;
    }
  }
};

export async function POST(req: Request) {
  try {
    const { messages, noteContext, isSummarizeAction } = await req.json();

    // ==========================================
    // A: summarize
    // ==========================================
   if (isSummarizeAction) {
      const formattedHistory = Array.isArray(messages)
        ? messages.map((m: any) => `${m.role === 'user' ? 'User' : 'AI Assistant'}: ${m.content}`).join('\n')
        : '';

      const { text } = await generateWithRetry({
        model: google('gemini-2.5-flash'),
        system: `You are a professional note-taking assistant. Your job is to summarize conversations into clean, well-structured Markdown notes.`,
        messages: [
          {
            role: 'user',
            content: `Summarize the conversation below into a structured note.

            IMPORTANT: Base your summary ONLY on the conversation history. Ignore the background note unless the user explicitly discussed it.

            [Conversation History]:
            ${formattedHistory || '(empty)'}

            [Background Note - ignore unless discussed]:
            ${noteContext || '(empty)'}

            Output format:
            1. First line: title only (no # symbol, reflect what was discussed in the conversation)
            2. From second line: clean Markdown summary of the conversation`
                  }
                ],
        });

        if (!text || text.trim() === "") {
          throw new Error("Gemini returned an empty response.");
        }

        const lines = text.split('\n');
        const rawTitle = lines[0].replace(/[#*]/g, '').trim();
        const title = rawTitle ? `✦ ${rawTitle}` : '✦ AI Conversation Summary';
        const content = lines.slice(1).join('\n').trim() || text;

        return NextResponse.json({ title, content });
      }

    // ==========================================
    // B: chat only
    // ==========================================
    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages cannot be empty" }, { status: 400 });
    }

   const systemPrompt = noteContext?.trim()
  ? `You are a DashNote smart assistant. 

      IMPORTANT RULES:
      1. ALWAYS answer the user's question directly first.
      2. ONLY mention the note if the user explicitly says "this note", "summarize", "my note" etc.
      3. If the user asks about grammar, vocabulary, facts, or anything unrelated to the note — answer it as a general question. IGNORE the note content completely.
      4. The note below is provided as background context ONLY, not as the topic of conversation.

      [Background Note Context - use ONLY if user asks about it]:
      ${noteContext}`
        : `You are a DashNote smart assistant. 
            The user currently has an empty note open. 
            Answer the user's questions directly and concisely.`;

    const { text } = await generateWithRetry({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return NextResponse.json({ text: text || "" });

  } catch (error: any) {
    console.error("Backend runtime handling error:", error);
    console.error("Error details:", error?.message, error?.status, error?.cause); 
    return NextResponse.json(
      { error: error.message || "Unknown internal server error" },
      { status: 500 }
    );
  }
}
