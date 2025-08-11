import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import getRedisClient from '@/lib/redis';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        // Store user info in token
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info to session
      session.user.id = token.userId;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.picture = token.picture;
      return session;
    },
    async signIn({ user, account, profile }) {
      try {
        // Store user data in Redis
        const redisClient = getRedisClient();
        if (!redisClient.isOpen) {
          await redisClient.connect();
        }

        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.image,
          provider: account.provider,
          lastSignIn: new Date().toISOString(),
        };

        await redisClient.setEx(
          `user:${user.email}`,
          2592000, // 30 days
          JSON.stringify(userData)
        );

        return true;
      } catch (error) {
        console.error('Error storing user data:', error);
        return true; // Allow sign in even if Redis storage fails
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 