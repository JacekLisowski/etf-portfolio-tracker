# Authentication Flow

## Magic Link Authentication

ETF Portfolio Tracker uses Magic Link authentication via NextAuth.js.

### User Flow

1. User visits `/auth/signin`
2. Enters email address
3. Clicks "Wyślij link do logowania"
4. Redirected to `/auth/verify-request`
5. **Dev mode:** Magic link logged to server console
6. **Production:** Email sent via Resend
7. User clicks magic link
8. Redirected to `/` (authenticated)
9. Session persists for 7 days

### Development Mode

In development (`NODE_ENV=development`), emails are NOT sent. Instead:
- Magic link is logged to server console (terminal where `npm run dev` runs)
- Look for output like:
  ```
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔗 MAGIC LINK (dev mode):
  📧 Email: test@example.com
  🔗 Link: http://localhost:3000/api/auth/callback/email?token=xxx&email=xxx
  ⏰ Expires in: 24 hours
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ```
- Copy the link and paste in browser to authenticate

### Session Management

- **Strategy:** JWT (stateless)
- **Max age:** 7 days
- **Stored in:** httpOnly cookie
- **Refresh:** Automatic on page load

### Protected Routes

Use `useAuth` hook to check authentication:

```typescript
import { useAuth } from '@/hooks/useAuth'

export default function ProtectedPage() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Redirecting...</div>

  return <div>Welcome {user.email}</div>
}
```

### API Route Protection

Use `withAuth` middleware:

```typescript
import { withAuth } from '@/lib/middleware/withAuth'

async function handler(req, res) {
  const user = req.user // Injected by withAuth
  // ... your logic
}

export default withAuth(handler)
```

### Error Handling

Errors are handled at `/auth/error`:
- `Configuration` - Server configuration issue
- `AccessDenied` - User doesn't have access
- `Verification` - Link expired or already used
- `Default` - Unexpected error

### Testing Checklist

- [ ] Visit http://localhost:3000
- [ ] Click "Zaloguj się"
- [ ] Enter test email (e.g., test@example.com)
- [ ] Check server console for magic link
- [ ] Copy and paste link in browser
- [ ] Verify redirect to homepage
- [ ] Verify "Zalogowany jako test@example.com" appears
- [ ] Refresh page - session should persist
- [ ] Click "Wyloguj" - should logout
- [ ] Verify "Niezalogowany" appears

### Environment Variables

Required in `.env`:
```
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generated-with-openssl>"
EMAIL_SERVER="smtp://user:pass@localhost:1025"
EMAIL_FROM="ETF Tracker <noreply@etftracker.local>"
```

For production (Resend):
```
EMAIL_SERVER="smtp://resend:re_xxxxx@smtp.resend.com:587"
EMAIL_FROM="ETF Tracker <noreply@etftracker.pl>"
```
