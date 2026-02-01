import NextAuth, { type NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60, // 24 hours
      // Development mode: log magic link to console instead of sending email
      async sendVerificationRequest({ identifier: email, url }) {
        if (process.env.NODE_ENV === 'development') {
          console.log('\n' + '━'.repeat(80))
          console.log('🔗 MAGIC LINK (dev mode):')
          console.log('📧 Email:', email)
          console.log('🔗 Link:', url)
          console.log('⏰ Expires in: 24 hours')
          console.log('━'.repeat(80) + '\n')
          return
        }

        // Production: send actual email via nodemailer
        // TODO: Configure Resend in production
        const { createTransport } = await import('nodemailer')
        const transport = createTransport(process.env.EMAIL_SERVER)

        const result = await transport.sendMail({
          to: email,
          from: process.env.EMAIL_FROM,
          subject: 'Zaloguj się do ETF Portfolio Tracker',
          text: `Kliknij link aby się zalogować:\n${url}\n\nLink jest ważny przez 24 godziny.`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Zaloguj się do ETF Portfolio Tracker</h2>
              <p>Kliknij poniższy link aby się zalogować:</p>
              <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #0967D2; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Zaloguj się
              </a>
              <p style="color: #666; font-size: 14px;">Link jest ważny przez 24 godziny.</p>
              <p style="color: #999; font-size: 12px;">Jeśli nie prosiłeś o ten email, zignoruj go.</p>
            </div>
          `,
        })

        console.log('✅ Email sent:', result)
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Add user ID to session
        session.user.id = token.sub

        // Fetch user from DB to get role and tier
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, tier: true },
        })

        if (user) {
          session.user.role = user.role
          session.user.tier = user.tier
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.tier = user.tier
      }
      return token
    },
  },
}

export default NextAuth(authOptions)
