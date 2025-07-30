import NextAuth from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      image?: string
      name: string;
      role: 'tenant' | 'owner' | 'admin';
    };
  }

  interface User {
    id: string;
    email: string;
    image?: string
    name: string;
    role: 'tenant' | 'owner' | 'admin';

  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'tenant' | 'owner' | 'admin';
    image?: string;

  }
}

