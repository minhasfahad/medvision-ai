import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. Setup Groq with your Hardcoded Key
    // (We do this to bypass the .env reading issue)
    const groq = new Groq({ 
      apiKey: process.env.GROQ_API_KEY 
    });

    // 2. Send message to the latest Llama 3.1 model
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are MedVision AI, a helpful medical assistant for a brain tumor detection system. Keep answers concise and professional. This message has been changed now."
        },
        {
          role: "user",
          content: message,
        },
      ],
      // UPDATED MODEL NAME: This is the newest, fastest one
      model: "llama-3.1-8b-instant", 
    });

    const text = chatCompletion.choices[0]?.message?.content || "No response generated.";

    return NextResponse.json({ reply: text });

  } catch (error: any) {
    // 3. Log the REAL error message to your terminal so we can see it
    console.error("GROQ ERROR DETAILS:", error);
    
    return NextResponse.json(
      { error: "Failed to process message" }, 
      { status: 500 }
    );
  }
}