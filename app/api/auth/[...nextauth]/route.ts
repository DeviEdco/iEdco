// // import { PrismaAdapter } from "@next-auth/prisma-adapter";
// // import { NextAuthOptions } from "next-auth";
// // import NextAuth from "next-auth/next";
// // import GoogleProvider from "next-auth/providers/google";
// // import CredentialsProvider from "next-auth/providers/credentials";
// // import { prisma } from "@/lib/prisma";
// // import bcrypt from "bcryptjs";

// // export const authOptions: NextAuthOptions = {
// //   adapter: PrismaAdapter(prisma),
// //   providers: [
// //     GoogleProvider({
// //       clientId: process.env.GOOGLE_CLIENT_ID as string,
// //       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
// //     }),
// //     CredentialsProvider({
// //       name: "credentials",
// //       credentials: {
// //         email: { label: "Email", type: "email" },
// //         password: { label: "Password", type: "password" },
// //       },
// //       async authorize(credentials) {
// //         if (!credentials?.email || !credentials?.password) {
// //           throw new Error("Invalid credentials");
// //         }

// //         const user = await prisma.user.findUnique({
// //           where: {
// //             email: credentials.email,
// //           },
// //         });

// //         if (!user || !user.password) {
// //           throw new Error("Invalid credentials");
// //         }

// //         const isCorrectPassword = await bcrypt.compare(
// //           credentials.password,
// //           user.password
// //         );

// //         if (!isCorrectPassword) {
// //           throw new Error("Invalid credentials");
// //         }

// //         return user;
// //       },
// //     }),
// //   ],
// //   pages: {
// //     signIn: "/auth/signin",
// //     error: "/auth/error",
// //   },
// //   debug: process.env.NODE_ENV === "development",
// //   session: {
// //     strategy: "jwt",
// //   },
// //   secret: process.env.NEXTAUTH_SECRET,
// //   callbacks: {
// //     async jwt({ token, user, account }) {
// //       if (user) {
// //         token.id = user.id;
// //         token.role = user.role;
// //         token.emailVerified = user.emailVerified;
// //       }

// //       // Auto-verify Google users
// //       if (account?.provider === "google" && !token.emailVerified) {
// //         await prisma.user.update({
// //           where: { id: token.id as string },
// //           data: { emailVerified: new Date() },
// //         });
// //         token.emailVerified = new Date();
// //       }

// //       return token;
// //     },
// //     async session({ session, token }) {
// //       if (token) {
// //         session.user.id = token.id as string;
// //         session.user.role = token.role as string;
// //         session.user.emailVerified = token.emailVerified as Date | null;
// //       }
// //       return session;
// //     },
// //     async signIn({ user, account }) {
// //       // Auto-verify Google users
// //       if (account?.provider === "google" && user.id) {
// //         await prisma.user.update({
// //           where: { id: user.id },
// //           data: { emailVerified: new Date() },
// //         });
// //       }
// //       return true;
// //     },
// //   },
// // };

// // const handler = NextAuth(authOptions);

// // export { handler as GET, handler as POST };

// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { NextAuthOptions } from "next-auth";
// import NextAuth from "next-auth/next";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";

// export const authOptions: NextAuthOptions = {
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//     }),
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error("Invalid credentials");
//         }

//         const user = await prisma.user.findUnique({
//           where: {
//             email: credentials.email,
//           },
//         });

//         if (!user || !user.password) {
//           throw new Error("Invalid credentials");
//         }

//         const isCorrectPassword = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );

//         if (!isCorrectPassword) {
//           throw new Error("Invalid credentials");
//         }

//         return user;
//       },
//     }),
//   ],
//   pages: {
//     signIn: "/auth/signin",
//     error: "/auth/error",
//   },
//   debug: process.env.NODE_ENV === "development",
//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account?.provider === "google") {
//         // Check if user exists
//         const existingUser = await prisma.user.findUnique({
//           where: { email: user.email! },
//         });

//         if (!existingUser) {
//           // Create new user for Google sign in
//           await prisma.user.create({
//             data: {
//               email: user.email!,
//               name: user.name,
//               image: user.image,
//               emailVerified: new Date(), // Auto-verify Google users
//             },
//           });
//         } else if (!existingUser.emailVerified) {
//           // Update existing user to verify email if signing in with Google
//           await prisma.user.update({
//             where: { id: existingUser.id },
//             data: { emailVerified: new Date() },
//           });
//         }
//       }
//       return true;
//     },
//     async jwt({ token, user, account }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.emailVerified = user.emailVerified;
//       }

//       // Auto-verify Google users
//       if (account?.provider === "google" && !token.emailVerified) {
//         token.emailVerified = new Date();
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as string;
//         session.user.emailVerified = token.emailVerified as Date | null;
//       }
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow OAuth providers without restriction
      if (account?.provider === "google") {
        return true;
      }

      // For credentials, check if user exists and has password
      if (account?.provider === "credentials") {
        return true;
      }

      return false;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }

      // Auto-verify Google users
      if (account?.provider === "google" && !token.emailVerified) {
        token.emailVerified = new Date();
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
