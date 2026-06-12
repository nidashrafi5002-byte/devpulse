import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }: any) {
      await connectDB();
      const existing = await User.findOne({ username: profile.login });
      if (!existing) {
        await User.create({
          username: profile.login,
          name: profile.name || profile.login,
          avatar: profile.avatar_url,
        });
      }
      return true;
    },
    async jwt({ token, profile }: any) {
      if (profile) {
        token.username = profile.login;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.username = token.username as string;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
