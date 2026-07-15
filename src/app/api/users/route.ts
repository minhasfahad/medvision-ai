import { verifyAuth } from '@/src/lib/auth';
import { connectDB } from '@/src/lib/mongoose';
import { UserRepository } from '@/src/repositories/user.repository';
import { NextRequest, NextResponse } from 'next/server';

const userRepo = new UserRepository();

// GET /api/users - List all users (or search)
export async function GET(req: NextRequest) {
    const claims = await verifyAuth(req);

    if (claims == null)
        return NextResponse.json("Inalid token", { status: 401 })

    await connectDB();
    try {
        // Note: You might want to add a findAll method to your repo
        const users = await userRepo.findAll();
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// POST /api/users - Create a user
export async function POST(req: Request) {
    await connectDB();
    try {
        const body = await req.json();

        // Check if user exists
        const existing = await userRepo.findByEmail(body.email);
        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        const newUser = await userRepo.create(body);
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}