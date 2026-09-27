import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { getPool } from '@/lib/mysql';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const pool = getPool();
        const [rows]: any = await pool.query(
          `SELECT u.id, u.name, u.email, u.password_hash, r.name AS role
           FROM users u JOIN roles r ON u.role_id = r.id
           WHERE u.email = ?`,
          [credentials.email]
        );

        if (rows.length === 0) return null;

        const user = rows[0];
        const valid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!valid) return null;

        return { id: user.id.toString(), name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  session: { strategy: 'jwt' },
 callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.role = (user as any).role;
      token.id = (user as any).id;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      (session.user as any).role = token.role;
      (session.user as any).id = token.id;
    }
    return session;
  }
},
  pages: {
    signIn: '/login'
  }
});

export { handler as GET, handler as POST };