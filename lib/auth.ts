
import { NextAuthOptions, getServerSession } from "next-auth";
// import { useSession } from "next-auth/react";
import jwt from "jsonwebtoken";
import { redirect} from "next/navigation";
import bcrypt from "bcrypt";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import prisma from "./prisma";



export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }
    
        const { email, password } = credentials; 

        const user = await prisma.user.findUnique({
          where: { email },
        });
    
        if (!user || !user.password) {
          throw new Error("Invalid email or password.");
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password.");
        }
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      
    }),
  ],
  callbacks: {
    async signIn({ account, profile, credentials }) {
      if (account?.provider === "google") {
        const email = profile?.email;
        const name = profile?.name;

        if (!email) {
          console.error("Google account email not available");
          return false; 
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              username: name || email,
              password: "", 
              is_blacklisted: false,
              remember_token: null,
              role_id: 1,
              no_telp: "",
              alamat: "",
            },
          });
        }

        if (user.is_blacklisted) {
          console.log("Blocked blacklisted user");
          return false;
        }
      }
      if (account?.provider === "credentials") {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        const username = credentials?.username as string; // Optional: username from credentials
      
        if (!email || !password) {
          console.error("Credentials email or password not provided");
          return false;
        }
      
        let dbUser = await prisma.user.findUnique({ where: { email } });
      
        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email,
              username,
              password: await bcrypt.hash(password, 10), // ✅ now it works!
              is_blacklisted: false,
              remember_token: null,
              role_id: 1,
              no_telp: "",
              alamat: "",
            },
          });
        } else {
          const isMatch = await bcrypt.compare(password, dbUser.password); // ✅ compare correctly
          if (!isMatch) {
            console.error("Invalid password");
            return false;
          }
        }
      
        if (dbUser.is_blacklisted) {
          console.log("Blocked blacklisted user");
          return false;
        }
      }
      
      //create credential callback when user sign in and register
      return true; // Allow sign-in
    },

    async jwt({ token, account, user }) {
      if (account?.provider === "google" && user) {
        token.accessToken = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            username: user.name,
          },
          process.env.JWT_SECRET!, 
          { expiresIn: "1h" } 
        );
        token.id = user.id;
      }
    
      if (account?.provider === "credentials" && user) {
        token.accessToken = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            username: user.name,
          },
          process.env.JWT_SECRET!, 
          { expiresIn: "1h" } 
        );
        token.id = user.id;
      }
    
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  
  
};

export async function loginIsRequiredServer() {
  const session = await getServerSession(authConfig);
  if (!session) return redirect("/");
}
