import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // 1. Add this import
import { UserRepository } from '@/src/repositories/user.repository';
import { connectDB } from '@/src/lib/mongoose';

const userRepo = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET!; // 2. Ensure this is in your .env

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, role } = await req.json();

    if(password.length < 8){
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });  
    }
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepo.create({
      name,
      email,
      password_hash: hashedPassword,
      role: role || 'patient',
    });

    // 3. Generate the token right here
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Return the object the frontend expects
    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}