import { NextResponse } from 'next/server';
import { sendContactEmail } from '@/src/lib/utils/mailer'; // Adjust path if needed

export async function POST(request: Request) {
  try {
    // 1. Grab the data sent from the frontend form
    const { name, email, message } = await request.json();

    // 2. Validate that they actually filled everything out
    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Name, email, and message are all required.' },
        { status: 400 }
      );
    }

    // 3. Trigger Nodemailer to send the message to your inbox
    await sendContactEmail(name, email, message);

    // 4. Tell the frontend it was a success
    return NextResponse.json(
      { message: 'Your message has been sent successfully!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { message: 'An error occurred while sending your message. Please try again later.' },
      { status: 500 }
    );
  }
}