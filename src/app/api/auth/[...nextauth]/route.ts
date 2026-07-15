import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "@/src/lib/mongoose";
import { UserRepository } from "@/src/repositories/user.repository";
import jwt from "jsonwebtoken";

const userRepo = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET!;

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            try {
                await connectDB();
                const existingUser = await userRepo.findByEmail(user.email!);
                if (!existingUser) {
                    await userRepo.create({
                        name: user.name!,
                        email: user.email!,
                        role: "patient",
                    });
                }
                return true;
            } catch (error) {
                console.error("Google SignIn error:", error);
                return false;
            }
        },
        async jwt({ token, user }) {
            if (user) {
                await connectDB();
                const dbUser = await userRepo.findByEmail(user.email!);
                if (dbUser) {
                    token.customToken = jwt.sign(
                        { userId: dbUser._id, role: dbUser.role },
                        JWT_SECRET,
                        { expiresIn: "1d" }
                    );
                    token.role = dbUser.role;
                    token.id = dbUser._id.toString();
                }
            }
            return token;
        },
        async session({ session, token }) {
            session.customToken = token.customToken as string;
            session.user.role = token.role as string;
            session.user.id = token.id as string;
            return session;
        },
    },
});

export { handler as GET, handler as POST };