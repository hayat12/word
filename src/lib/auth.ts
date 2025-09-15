import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      subscription?: {
        plan: string;
        status: string;
        endDate?: Date;
        trialEndDate?: Date;
      } | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // Check if user exists
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              subscription: true,
            },
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          // Verify password for existing users
          if (!user.password) {
            console.log("User has no password set:", credentials.email);
            return null;
          }
          
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }
          
          console.log("User authenticated:", user.id);
          return user;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    // Email provider is commented out for now - uncomment and configure if needed
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: process.env.EMAIL_SERVER_PORT,
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        
        // Always fetch fresh subscription data
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.sub! },
            include: {
              subscription: true,
            },
          });
          session.user.subscription = user?.subscription || null;
        } catch (error) {
          console.error('Error fetching subscription data:', error);
          session.user.subscription = null;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
        token.subscription = (user as { subscription?: { plan: string; status: string; endDate?: Date; trialEndDate?: Date } | null }).subscription;
      }
      return token;
    },
  },
}; 