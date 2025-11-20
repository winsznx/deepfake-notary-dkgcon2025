# 🚀 Quick Start Guide

Get the Verifiable Deepfake Notary running in **5 minutes**.

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org))
- **pnpm** 8+ (install: `npm install -g pnpm`)
- **Git** (optional)

## Step 1: Clone/Navigate to Project

```bash
cd /Users/macbook/Documents/polk
```

## Step 2: Install Dependencies

```bash
# Install all workspace dependencies
pnpm install
```

This installs dependencies for:
- Root workspace
- Backend (Express + TypeScript)
- Frontend (React + Vite)
- Common (shared types)

## Step 3: Setup Database

```bash
cd backend

# Create .env file (if not exists)
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Create database and tables
pnpm db:push

# (Optional) Seed with sample data
pnpm db:seed
```

**Expected output:**
```
✔ Generated Prisma Client
🚀 Your database is now in sync with your Prisma schema
```

**After seeding (optional):**
```
🌱 Starting database seed...
✓ Created 5 guardians
✓ Created 4 media items
✓ Created 8 fact-checks
✓ Created 7 stakes
✓ Created consensus results with votes
✓ Created 3 x402 payment records
✅ Database seed completed successfully!
```

## Step 4: Start Backend Server

```bash
# From backend directory
pnpm dev
```

**Expected output:**
```
🚀 Backend server running on port 3001
📊 Environment: development
🔗 DKG Node: http://localhost:8900
```

**Backend is now running at:** `http://localhost:3001`

## Step 5: Start Frontend Server

Open a **new terminal** window:

```bash
cd frontend
pnpm dev
```

**Expected output:**
```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Frontend is now running at:** `http://localhost:5173`

## Step 6: Open in Browser

Navigate to: **http://localhost:5173**

You should see the landing page with:
- Hero section
- Feature cards (AI Detection, DKG Integration, Token Staking, Guardian Consensus)
- How It Works section

---

## 🎯 Quick Demo Flow

### 1. Upload Media

1. Click **"Upload Media"** in the sidebar or hero button
2. Drop a video/image file (or click to browse)
3. Enter a Guardian identifier (e.g., `0x123abc` or `testuser`)
4. Click **"Upload & Analyze"**

**What happens:**
- Media is hashed (SHA-256)
- Deepfake analysis runs (mock AI model)
- Fact-check note is generated
- Published to DKG as Knowledge Asset
- Results displayed with scores

### 2. View Dashboard

1. Click **"Dashboard"** in the sidebar
2. See statistics:
   - Total verified
   - Deepfakes detected
   - Authentic media
   - Pending analysis
3. View recent fact-checks (currently shows mock data)

### 3. View Fact-Check Details

From dashboard or upload results:
1. Click on a fact-check card or "View Full Details"
2. See comprehensive analysis:
   - Deepfake score & confidence
   - Media information (hash, type, upload date)
   - Analysis details (model, processing time, artifacts)
   - Guardian information (reputation, accuracy)
   - DKG publication (UAL)
   - Staking interface

### 4. Stake on Verification

On fact-check detail page:
1. Enter your Guardian identifier
2. Set stake amount (10-500 TRAC)
3. Click **"Stake"**

**What happens:**
- Stake is recorded in database
- Guardian's total stake updated
- Can later participate in consensus

---

## 🔧 Useful Commands

### Backend

```bash
cd backend

# Development server
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start

# Database commands
pnpm db:push      # Sync schema to database
pnpm db:studio    # Open Prisma Studio GUI
pnpm db:generate  # Generate Prisma client
pnpm db:seed      # Populate with sample data

# TypeScript check
npx tsc --noEmit
```

### Frontend

```bash
cd frontend

# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint
```

### Both (from root)

```bash
# Run both servers in parallel
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

---

## 📂 Key Files & Locations

**Backend:**
- API Routes: `backend/src/api/`
- Services (Agents): `backend/src/services/`
- Database Schema: `backend/prisma/schema.prisma`
- Config: `backend/src/config/index.ts`
- Database File: `backend/dev.db` (auto-created)
- Uploads: `backend/uploads/` (auto-created)

**Frontend:**
- Pages: `frontend/src/pages/`
- Components: `frontend/src/components/`
- Styles: `frontend/src/styles/index.css`
- Config: `frontend/tailwind.config.js`

**Documentation:**
- Architecture: `docs/ARCHITECTURE.md`
- API Reference: `docs/API.md`
- DKG Setup: `docs/DKG_SETUP.md`
- Commits: `COMMIT_HISTORY.md`

---

## 🐛 Troubleshooting

### Port Already in Use

**Backend (3001):**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
PORT=3002
```

**Frontend (5173):**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues

```bash
cd backend

# Reset database
rm dev.db
pnpm db:push

# Check schema
pnpm db:studio  # Opens GUI
```

### TypeScript Errors

```bash
cd backend

# Regenerate Prisma client
pnpm db:generate

# Check for type errors
npx tsc --noEmit
```

### Missing Dependencies

```bash
# From root
pnpm install

# Or rebuild node_modules
rm -rf node_modules
pnpm install
```

### Frontend Not Loading

1. Check console for errors
2. Verify backend is running (http://localhost:3001/health)
3. Check CORS settings in `backend/src/index.ts`
4. Clear browser cache

---

## 🎨 Theme Toggle

Click the **moon/sun icon** in the header to switch between:
- **Light mode**: Pale blue background
- **Dark mode**: Dark background with adjusted colors

---

## 📱 Responsive Design

The app works on:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation (planned)

---

## 🔗 API Testing

### Health Check

```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T10:30:00.000Z"
}
```

### Upload Media

```bash
curl -X POST http://localhost:3001/api/media/upload \
  -F "media=@/path/to/video.mp4"
```

### Create Fact-Check

```bash
curl -X POST http://localhost:3001/api/factcheck/create \
  -H "Content-Type: application/json" \
  -d '{
    "mediaId": "your-media-id",
    "guardianIdentifier": "0x123abc"
  }'
```

See **docs/API.md** for complete API reference.

---

## 🎯 Next Steps

1. **Explore the codebase**
   - Read `docs/ARCHITECTURE.md`
   - Review agent services in `backend/src/services/`

2. **Customize**
   - Update colors in `frontend/tailwind.config.js`
   - Add your Guardian API key in `backend/.env`
   - Configure DKG node URL

3. **Extend**
   - Add real deepfake model
   - Integrate actual DKG Edge Node
   - Deploy to production

4. **Test**
   - Upload different media types
   - Test staking flow
   - Calculate consensus with multiple verifications

---

## 💡 Demo Data

**Option 1: Seed Script (Recommended for Demo)**
```bash
cd backend
pnpm db:seed
```

This populates the database with:
- 5 Guardians with varying reputation scores
- 4 Media items (videos/images)
- 8 Fact-checks across different confidence levels
- 7 Stakes from multiple guardians
- 2 Consensus results (1 authentic, 1 deepfake)
- 3 x402 Payment records

**Option 2: Upload Your Own**
Use the Upload page to create actual fact-checks with your own media files.

**Mock Behavior:**
- Deepfake scores: Random 0-0.3 for uploaded media (simulating "mostly authentic")
- DKG Asset IDs: Generated UUIDs (mocked for demo)
- Guardian API: Returns mock reputation data

---

## 🆘 Getting Help

**Documentation:**
- [README.md](./README.md) - Project overview
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design
- [API.md](./docs/API.md) - API reference

**Common Issues:**
- Port conflicts → Change ports in .env
- Database errors → Delete dev.db and re-run db:push
- TypeScript errors → Run pnpm db:generate

---

## ✅ Success Checklist

- [ ] Both servers running (backend:3001, frontend:5173)
- [ ] Can access http://localhost:5173
- [ ] Landing page loads correctly
- [ ] Can upload media file
- [ ] See analysis results
- [ ] Dashboard shows data
- [ ] Fact-check detail page works
- [ ] Can place stakes

**All working?** You're ready to demo! 🎉

---

**Last Updated:** 2025-11-18
**Estimated Setup Time:** 5 minutes
