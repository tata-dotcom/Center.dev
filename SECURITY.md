# Security & Best Practices Guide

## 🔒 Database Security (RLS Policies)

### Row Level Security Implementation
All tables have RLS enabled with role-based policies:

- **Admin**: Full access to all data
- **Secretary/Teacher**: Access only to assigned groups and related students
- **Authentication**: All policies require valid Supabase session

### Key Security Features
- JWT token verification for QR codes
- Single-use QR code validation
- Session expiry enforcement (4h for group sessions, 24h for student QR)
- Automatic session deduction via database triggers
- Duplicate attendance prevention

## 🛡️ API Security

### Authentication
- All API routes require valid Supabase session
- Role-based access control using `requireRole()` utility
- Group access validation for secretary/teacher roles

### Input Validation
- Required field validation on all POST/PUT endpoints
- Data type validation (amounts, dates, UUIDs)
- Business logic validation (session balance, group capacity)

### Error Handling
- Generic error messages to prevent information leakage
- Proper HTTP status codes
- Structured error responses for frontend handling

## 🔐 Environment Variables

### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...  # Server-side only!

# JWT Secret for QR codes
JWT_SECRET=your-secure-random-string-min-32-chars
```

### Security Notes
- Never expose `SUPABASE_SERVICE_KEY` to client
- Use strong random `JWT_SECRET` (minimum 32 characters)
- Rotate secrets regularly in production

## 📊 Performance Optimizations

### Database Indexes
- Phone number lookups: `idx_students_phone`
- Date range queries: `idx_payments_created_at`, `idx_attendances_date`
- Foreign key relationships: All junction tables indexed
- Status filtering: `idx_students_status`, `idx_groups_status`

### Query Optimization
- Use `select()` to limit returned columns
- Implement pagination on all list endpoints
- Use `count: 'exact'` only when needed
- Batch operations for multiple enrollments

## 🚀 Production Deployment

### Supabase Configuration
1. **Enable RLS**: Run `database/rls-policies.sql`
2. **Set up backups**: Configure automated daily backups
3. **Monitor usage**: Set up alerts for API limits
4. **Configure CORS**: Restrict to your domain only

### Security Headers
Add to `next.config.js`:
```javascript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
]
```

### Rate Limiting
Implement rate limiting for:
- QR code generation: 10 requests/minute per user
- Attendance scanning: 30 requests/minute per user
- Payment processing: 5 requests/minute per user

## 🔍 Monitoring & Logging

### Key Metrics to Monitor
- Failed authentication attempts
- QR code generation/scan rates
- Payment processing errors
- Database connection pool usage
- API response times

### Audit Trail
The system automatically logs:
- All payment transactions with processor ID
- Attendance records with scanner ID
- Group session creation with creator ID
- Student enrollment changes

## 🛠️ Maintenance Tasks

### Daily
- Monitor error logs
- Check payment reconciliation
- Verify backup completion

### Weekly
- Review user access patterns
- Clean up expired QR codes
- Analyze attendance trends

### Monthly
- Rotate JWT secrets
- Update dependencies
- Performance optimization review
- Security audit

## 🚨 Incident Response

### Security Breach Protocol
1. Immediately rotate all secrets
2. Disable affected user accounts
3. Review audit logs for unauthorized access
4. Notify affected users if data compromised
5. Update security measures to prevent recurrence

### Data Recovery
- Supabase provides point-in-time recovery
- Daily automated backups retained for 30 days
- Critical data (payments, attendance) backed up to external storage

## ✅ Security Checklist

- [x] RLS policies implemented and tested
- [x] JWT tokens properly signed and verified
- [x] Input validation on all endpoints
- [x] Role-based access control enforced
- [x] Sensitive data encrypted at rest
- [x] API rate limiting configured
- [x] Security headers implemented
- [x] Error handling prevents information leakage
- [x] Audit logging enabled
- [x] Backup and recovery procedures tested