import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, username } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      );
    }

    // Use environment variable for AWS, fallback to localhost for development
    const pythonServerUrl =
      process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${pythonServerUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        username: username || "there"
      }),
    });

    if (!response.ok) {
      throw new Error(`Python server error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({ reply: data.reply });

  } catch (error: any) {
    console.error("CHATBOT ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to connect to MedVision AI chatbot." },
      { status: 500 }
    );
  }
}