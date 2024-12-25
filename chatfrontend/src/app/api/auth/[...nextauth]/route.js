import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { useUser } from ".././../../../components/Connector"; // Adjust import as necessary

export const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
        token.email = profile.email;
        token.name = profile.name;
      }
      return token;
    },
    // session starts
    async session({ session, token }) {
      // Here, we just set the session object
      session.accessToken = token.accessToken;
      session.email = token.email;
      session.name = token.name;

      return session;
    },
    // session end
  },
});

export { handler as GET, handler as POST };
