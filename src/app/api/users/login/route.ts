import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '@/src/repositories/user.repository';
import { connectDB } from '@/src/lib/mongoose';

const userRepo = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || '596e1eb9fb94724bc06e429208449d67d3df35cd33b118f36640269491099b65688a853c49611b3614059256fe8767cb3ebf99d029d1d235284352b4474d4883';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    // 1. Find user AND include the password_hash (which is hidden by default)
    const user = await userRepo.findByEmailWithPassword(email);
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    let claims = {
      userId: user._id,
      role: user.role
    }

    // 3. Generate JWT
    const token = jwt.sign(
      claims,
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Return user info (excluding password) and token
    return NextResponse.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}