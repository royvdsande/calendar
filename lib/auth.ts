import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const hasGoogleAuth = Boolean(googleClientId && googleClientSecret);

const providers = [
  ...(hasGoogleAuth
    ? [
        GoogleProvider({
          clientId: googleClientId as string,
          clientSecret: googleClientSecret as string,
          authorization: {
            params: {
              scope:
                "openid email profile https://www.googleapis.com/auth/calendar.readonly"
            }
          }
        })
      ]
    : []),
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password || !prisma) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user?.passwordHash) return null;

      const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
      if (!isValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      };
    }
  })
];

export const authOptions: NextAuthOptions = {
  ...(prisma ? { adapter: PrismaAdapter(prisma) } : {}),
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) session.user.id = token.sub;
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
};
