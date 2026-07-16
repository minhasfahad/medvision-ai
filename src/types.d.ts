declare module 'react-gauge-chart';

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    customToken: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    customToken: string;
    role: string;
    id: string;
  }
}
declare module '*.css';