import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";
import dbConnect from "./dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        login: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;
        await dbConnect();

        const user = await User.findOne({
          $or: [
            { email: credentials.login.toLowerCase() },
            { username: credentials.login.toLowerCase() },
          ],
        }).select("+password");

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
      }
      // Check onboarding status on sign in or when triggered
      if (user || trigger === "update") {
        await dbConnect();
        const dbUser = await User.findOne({
          $or: [
            { _id: token.sub },
            { email: token.email },
          ],
        });
        if (dbUser) {
          token.onboardingComplete = dbUser.onboardingComplete || false;
          token.sub = dbUser._id.toString();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.onboardingComplete = token.onboardingComplete || false;
      }
      return session;
    },
    async signIn({ user, account }) {
      // OAuth users are auto-verified
      if (account?.provider !== "credentials") {
        await dbConnect();
        await User.findOneAndUpdate(
          { email: user.email },
          { $set: { emailVerified: new Date() } }
        );
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
