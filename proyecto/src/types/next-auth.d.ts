import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: number;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    user: User & {
      accessToken: string;
      refreshToken: string;
      role: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    role: number;
  }
}
