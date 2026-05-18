import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import { UserRepository } from '@/src/repositories/user.repository';
import { connectDB } from '@/src/lib/mongoose';

const userRepo = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET!; 

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, age, password, role } = await req.json();

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });  
    }
    
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Safe parsing of age from the string input
    const parsedAge = age ? parseInt(age, 10) : undefined;

    // 2. Safe normalization of role to lowercase matching backend standards
    const processedRole = role ? role.toLowerCase() : 'user';

    const user = await userRepo.create({
      name,
      email,
      age: parsedAge,
      password_hash: hashedPassword,
      role: processedRole,
    });

    // Generate the token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return the payload back to the frontend memory mapping store
    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}