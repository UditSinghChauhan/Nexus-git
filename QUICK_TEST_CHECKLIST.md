# Quick Setup & Test Checklist

## ✅ Fixes Applied
- ✅ Backend .env: Corrected `OPENAI_API_URL` → `OPENAI_API_KEY`
- ✅ Frontend .env: Verified VITE_API_URL is set
- ✅ No compilation errors found

## 🚀 Commands to Run (Copy-Paste Ready)

### Terminal 1 - Backend
```bash
cd "C:\Users\udits\OneDrive\Desktop\VCS\Github Clone\Github\backend-main"
npm install
npm run dev
```

### Terminal 2 - Frontend  
```bash
cd "C:\Users\udits\OneDrive\Desktop\VCS\Github Clone\Github\frontend-main"
npm install
npm run dev
```

Frontend URL: http://localhost:5173

---

## 🧪 AUTHENTICATION TEST
- [ ] Click Signup
- [ ] Create user (any email/password)
- [ ] Should redirect to dashboard
- [ ] Check DevTools → Application → LocalStorage
  - Should see: `token`, `userId`, `authUser`

- [ ] Click Logout
- [ ] Click Login with same credentials
- [ ] Should load dashboard again
- [ ] Check Network tab → API requests have `Authorization: Bearer ...`

---

## 🔐 ROUTE PROTECTION TEST
- [ ] Click Logout to be fully logged out
- [ ] Try to visit: http://localhost:5173/files
- [ ] Should redirect to /login
- [ ] Try to visit: http://localhost:5173/commits
- [ ] Should redirect to /login

---

## 💾 PERSISTENCE TEST
- [ ] Login with credentials
- [ ] Press F5 to refresh
- [ ] Should stay logged in (token from localStorage)

---

## 📊 PAGE LOAD TEST
Visit these pages (should load without React errors):
- [ ] http://localhost:5173/ (Dashboard)
- [ ] http://localhost:5173/files (File Explorer)
- [ ] http://localhost:5173/commits (Commit History)
- [ ] http://localhost:5173/diff (Diff Viewer)

Check browser console (F12) - should be clean

---

## 🤖 AI FEATURES TEST (if OpenAI key is valid)
- [ ] Go to /files
- [ ] Look for "Suggest Commit Message" button
- [ ] Click it - should get AI suggestion or error message
- [ ] Go to /diff
- [ ] Look for "Explain Diff" button
- [ ] Click it - should get AI explanation

---

## 🔄 REAL-TIME UPDATES TEST
- [ ] Open /commits in browser
- [ ] Open VS Code terminal
- [ ] Run: `node cli.js commit "test message"`
- [ ] Watch /commits page - should auto-update with new commit

---

## 💻 CLI TEST
```bash
cd "C:\Users\udits\OneDrive\Desktop\VCS\Github Clone\Github\backend-main"
node cli.js init
node cli.js add test.txt
node cli.js commit "initial commit"
node cli.js branch feature-test
node cli.js checkout feature-test
```

All commands should work without errors

---

## ✅ FINAL ACCEPTANCE CHECKLIST
- [ ] Signup/Login works
- [ ] Logout works
- [ ] Protected routes redirect correctly
- [ ] Token persists after refresh
- [ ] API requests have bearer token
- [ ] All pages load without crashes
- [ ] CLI commands work

**If all above pass → ✅ Ready for next phase**

---

## 📋 ISSUES FOUND
1. ✅ FIXED: Backend .env had `OPENAI_API_URL` (now `OPENAI_API_KEY`)

## ⚠️ OPTIONAL PRE-PRODUCTION IMPROVEMENTS
- Add rate limiting to prevent brute-force
- Implement API input validation
- Add centralized error logging
- Configure CORS whitelist
- Add health check endpoint
- Set up database backups

See PRODUCTION_READINESS_REPORT.md for detailed recommendations.
