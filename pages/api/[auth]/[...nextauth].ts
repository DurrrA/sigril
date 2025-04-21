// import NextAuth, { AuthOptions } from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcrypt";
// import prisma from "@/lib/prisma"; // Adjust path if different
// import { PrismaAdapter } from "@next-auth/prisma-adapter";

// export const authOptions: AuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//       authorization: {
//         params: {
//           prompt: "consent",
//           redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL!,
//           access_type: "offline",
//           response_type: "code",
//           scope: "openid email profile",
//         },
//       },
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Email and password are required.");
//         }

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user || !user.password) {
//           throw new Error("Email does not exist or password is incorrect.");
//         }

//         const isPasswordCorrect = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!isPasswordCorrect) {
//           throw new Error("Invalid password.");
//         }

//         return {
//           id: user.id.toString(),
//           email: user.email,
//           name: user.username,
//         };
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/auth/login", // Correct path to your login page
//   },
//   debug: true,
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async jwt({ token, user, account }) {
//       console.log("JWT Callback - Token (Before):", token);
//       console.log("JWT Callback - User:", user);
//       console.log("JWT Callback - Account:", account);
    
//       if (account?.provider === "google" && user) {
//         let dbUser = await prisma.user.findUnique({
//           where: { email: user.email },
//         });
    
//         if (!dbUser) {
//           dbUser = await prisma.user.create({
//             data: {
//               email: user.email || "",
//               username: user.name || user.email?.split("@")[0] || "",
//               password: "", 
//               is_blacklisted: false,
//               remember_token: null,
//               role_id: 1,
//               no_telp: "",
//               alamat: "",
//             },
//           });
//         }
    
//         token.id = dbUser.id.toString();
//       }
    
//       if (user) {
//         token.id = user.id || user.sub || ""; 
//         token.email = user.email || "";
//         token.name = user.name || "";
//       }
    
//       console.log("JWT Callback - Token (After):", token);
//       return token;
//     },
//     async session({ session, token }) {
//       console.log("Session Callback - Token:", token);
    
//       if (token) {
//         session.user = {
//           id: token.id as string,
//           email: token.email as string,
//           name: token.name as string,
//         };
//       }
    
//       console.log("Session Callback - Session:", session);
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };

// export default NextAuth(authOptions);