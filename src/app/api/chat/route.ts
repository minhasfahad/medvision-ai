import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // 1. Send the message to your local Python FastAPI server
    const pythonServerUrl = "http://127.0.0.1:8000/chat";
    
    const response = await fetch(pythonServerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    // 2. Check if the Python server successfully processed it
    if (!response.ok) {
      throw new Error(`Python server responded with status: ${response.status}`);
    }

    // 3. Extract the reply and send it back to the frontend
    const data = await response.json();
    
    // The Python server returns {"reply": "..."} which perfectly matches your frontend!
    return NextResponse.json({ reply: data.reply });

  } catch (error: any) {
    // Log the error to your terminal so you can debug if the Python server is down
    console.error("CUSTOM CHATBOT ERROR DETAILS:", error);
    
    return NextResponse.json(
      { error: "Failed to connect to the custom Python chatbot." }, 
      { status: 500 }
    );
  }
}