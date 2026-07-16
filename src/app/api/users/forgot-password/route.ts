import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendResetEmail } from '@/src/lib/utils/mailer';
import { connectDB } from '@/src/lib/mongoose'; // Ensure this path matches your project
import { UserModel } from '@/src/models/user.model';
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    // 1. Connect to your database using your custom Mongoose utility
    await connectDB();

    // 2. Find the user by email using your TypeScript UserModel
    const user = await UserModel.findOne({ email }).select('+password_hash');

    // 3. Security Check: Prevent Email Enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If that email exists, a reset link has been sent.' }, 
        { status: 200 }
      ); 
    }

    // 4. The Google Account Check
    // If the user lacks a password_hash, they signed up with Google.
    if (!user.password_hash) {
      return NextResponse.json(
        { message: 'This account uses Google Sign-In. Please log in directly with Google.' },
        { status: 400 }
      );
    }

    // 5. Generate a secure, random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 6. Save this token and an expiration time to the user's database document
    user.resetPasswordToken = resetToken;
    // TypeScript/Mongoose expects a Date object here, so we wrap the timestamp
    user.resetPasswordExpires = new Date(Date.now() + 900000); // 15 minuts from now
    
    await user.save();

    // 7. Send the actual email using our Nodemailer utility
    await sendResetEmail(email, resetToken);

    return NextResponse.json(
      { message: 'Password reset link sent to your email.' }, 
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request.' }, 
      { status: 500 }
    );
  }
}