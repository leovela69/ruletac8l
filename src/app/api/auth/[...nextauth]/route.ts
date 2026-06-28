import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Pass user image and name to session
      if (session.user) {
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  pages: {
    signIn: undefined, // Use default NextAuth sign-in
  },
});

export { handler as GET, handler as POST };
