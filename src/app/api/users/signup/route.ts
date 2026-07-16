import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import { UserRepository } from '@/src/repositories/user.repository';
import { connectDB } from '@/src/lib/mongoose';
// --- NEW: Import Cloudinary helper ---
import { uploadToCloudinary } from '@/src/lib/cloudinary';

const userRepo = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET!; 

// Only allow reputable email providers
const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'icloud.com', 'outlook.com', 'hotmail.com'];

function validateEmail(email: string): string | null {
  const lower = email.toLowerCase().trim();
  const domain = lower.split('@')[1];
  if (!domain || !ALLOWED_EMAIL_DOMAINS.includes(domain)) {
    return `Email must be from a trusted provider (${ALLOWED_EMAIL_DOMAINS.join(', ')})`;
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
}

export async function POST(req: Request) {
  try {
    await connectDB();
    // --- NEW: Extract image from the request body ---
    const { name, email, age, password, role, image } = await req.json();

    // Validate email domain
    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }
    
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    // --- NEW: Handle Cloudinary Upload for Signup ---
    let uploadedImageUrl = "";
    if (image && image.startsWith("data:image")) {
      uploadedImageUrl = await uploadToCloudinary(image, "medvision_avatars");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const parsedAge = age ? parseInt(age, 10) : undefined;
    const processedRole = role ? role.toLowerCase() : 'user';

    // --- NEW: Pass the uploaded URL to the repository ---
    const user = await userRepo.create({
      name,
      email,
      age: parsedAge,
      password_hash: hashedPassword,
      role: processedRole,
      image: uploadedImageUrl || undefined, // Save URL if it exists
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '5d' }
    );

    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        role: user.role,
        image: user.image // Return image so the frontend store can update
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}