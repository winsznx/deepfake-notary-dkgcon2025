# Security Best Practices

## ⚠️ Critical Security Warnings

### Private Keys

**NEVER:**
- ❌ Commit private keys to git
- ❌ Share private keys in public channels
- ❌ Use mainnet keys for testing
- ❌ Hardcode keys in source code
- ❌ Use the same key for testnet and mainnet
- ❌ Store keys in plain text files in production

**ALWAYS:**
- ✅ Use environment variables
- ✅ Add `.env` to `.gitignore` (already done)
- ✅ Use separate wallets for testing
- ✅ Rotate keys regularly
- ✅ Use secrets management in production
- ✅ Enable 2FA on all accounts

### Current Setup

The repository includes a **test wallet** for hackathon/demo purposes:
- **File**: `backend/.env`
- **Key**: `DKG_PRIVATE_KEY`
- **Network**: NeuroWeb TESTNET only
- **Value**: Contains NO real tokens
- **Status**: ⚠️ Publicly visible (intentional for demo)

## Production Security Checklist

### Before Going to Production

- [ ] Replace all test keys with production keys
- [ ] Move secrets to secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Enable monitoring and alerting
- [ ] Set up key rotation schedule
- [ ] Configure rate limiting
- [ ] Enable HTTPS/TLS
- [ ] Set up Web Application Firewall (WAF)
- [ ] Configure CORS properly
- [ ] Enable audit logging
- [ ] Set up backup/recovery procedures

### Secrets Management

#### Development (Local)
```bash
# Use .env file (already in .gitignore)
cp backend/.env.example backend/.env
# Edit with your test keys
```

#### Production (Recommended)

**Option 1: AWS Secrets Manager**
```typescript
import { SecretsManager } from 'aws-sdk';

const secrets = new SecretsManager();
const { SecretString } = await secrets.getSecretValue({
  SecretId: 'deepfake-notary/dkg-key'
}).promise();

const DKG_PRIVATE_KEY = JSON.parse(SecretString).privateKey;
```

**Option 2: HashiCorp Vault**
```bash
vault kv get secret/deepfake-notary/dkg
```

**Option 3: Environment Variables (Cloud)**
```bash
# Railway, Vercel, Heroku, etc.
# Set via dashboard UI, not in code
```

### Network Security

#### CORS Configuration

```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

**Production**:
- Set `FRONTEND_URL` to your production domain
- Never use wildcard (`*`) in production
- Validate origin header

#### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Helmet Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Wallet Security

#### Hardware Wallets (Recommended)

For production with significant value:
- Use Ledger or Trezor
- Enable passphrase protection
- Store recovery phrase securely (metal backup)
- Never take photos of seed phrase

#### Multi-Signature Wallets

For high-value deployments:
- Use Gnosis Safe or similar
- Require 2-of-3 or 3-of-5 signatures
- Distribute keys to trusted parties
- Set spending limits

#### Monitoring

Set up alerts for:
- Unusual transaction volumes
- Failed authentication attempts
- Low token balances
- Unexpected withdrawals
- DKG publishing failures

### Database Security

#### SQLite (Current Setup)
```bash
# Set file permissions
chmod 600 backend/dev.db

# Backup regularly
cp backend/dev.db backend/backups/dev-$(date +%Y%m%d).db
```

#### PostgreSQL (Production Recommended)
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

**Best Practices**:
- Enable SSL/TLS
- Use connection pooling
- Set strong passwords
- Regular backups
- Encrypt at rest
- Limit database user permissions

### API Security

#### Input Validation

```typescript
import { z } from 'zod';

const StakeSchema = z.object({
  factCheckId: z.string().uuid(),
  amount: z.number().min(10).max(500),
  tokenType: z.enum(['TRAC', 'NEURO', 'DOT']),
});

// Validate all user inputs
const validated = StakeSchema.parse(req.body);
```

#### SQL Injection Prevention

```typescript
// ✅ GOOD: Using Prisma (prevents SQL injection)
await prisma.stake.create({
  data: { factCheckId, amount }
});

// ❌ BAD: Raw SQL with string concatenation
// await db.query(`SELECT * FROM stakes WHERE id = '${id}'`);
```

#### Authentication

For production, implement:
- JWT tokens
- OAuth 2.0
- API keys with rotation
- Session management
- Logout functionality

### Frontend Security

#### XSS Prevention

```jsx
// ✅ GOOD: React escapes by default
<div>{userInput}</div>

// ❌ BAD: Using dangerouslySetInnerHTML
// <div dangerouslySetInnerHTML={{__html: userInput}} />
```

#### Environment Variables

```bash
# frontend/.env.production
VITE_API_URL=https://api.yourdomain.com
# Never include secrets in frontend env vars!
```

#### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

### Third-Party Dependencies

#### Regular Updates

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Check for outdated packages
pnpm outdated
```

#### Dependency Scanning

- Enable Dependabot (GitHub)
- Use Snyk or similar
- Review security advisories
- Pin critical dependency versions

### Logging and Monitoring

#### What to Log

```typescript
// ✅ Log important events
console.log('User authenticated:', userId);
console.log('DKG published:', ual);
console.error('Authentication failed:', { ip, timestamp });

// ❌ Never log secrets
// console.log('Private key:', privateKey); // NEVER DO THIS
```

#### Production Logging

Use structured logging:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Incident Response

#### If Private Key Compromised

1. **Immediately**:
   - Stop all services
   - Transfer remaining funds to new wallet
   - Revoke compromised credentials

2. **Next**:
   - Generate new keys
   - Update all configurations
   - Review logs for suspicious activity
   - Notify users if necessary

3. **Prevention**:
   - Audit access controls
   - Review security practices
   - Update incident response plan
   - Train team on security

### Compliance

#### GDPR (if applicable)
- Don't store unnecessary user data
- Implement data deletion
- Provide privacy policy
- Enable user data export

#### Smart Contract Security
- Audit all smart contracts
- Use OpenZeppelin libraries
- Test extensively
- Bug bounty program

## Security Audit Checklist

### Pre-Launch
- [ ] All secrets moved to secure storage
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] HTTPS/TLS enabled
- [ ] Security headers configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] Dependencies updated and scanned
- [ ] Logging configured
- [ ] Monitoring and alerts set up
- [ ] Backup procedures tested
- [ ] Incident response plan documented

### Ongoing
- [ ] Weekly dependency updates
- [ ] Monthly security reviews
- [ ] Quarterly penetration testing
- [ ] Regular backup testing
- [ ] Log analysis
- [ ] Performance monitoring
- [ ] User feedback review

## Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP API Security: https://owasp.org/www-project-api-security/
- Web3 Security: https://consensys.github.io/smart-contract-best-practices/
- OriginTrail Security: https://docs.origintrail.io/security

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email: security@yourdomain.com (set this up)
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

4. Expected response time: 24-48 hours

## Emergency Contacts

Set up and document:
- Security team contacts
- Cloud provider support
- Legal counsel
- Public relations (if needed)
- Law enforcement (if needed)

---

**Last Updated**: 2025-01-28
**Next Review**: Monthly
**Owner**: Security Team
