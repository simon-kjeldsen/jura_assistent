# 🚀 Juridisk AI - Setup Guide

## 📋 Environment Variables

Opret en `.env.local` fil i root mappen med følgende variabler:

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-this-in-production"
```

## 🗄️ Database Setup

### 1. Supabase Database
1. Gå til [supabase.com](https://supabase.com)
2. Opret et nyt projekt
3. Gå til Settings > Database
4. Kopier connection string og opdater `DATABASE_URL`

### 2. Database Migration
```bash
# Generer Prisma client
npx prisma generate

# Kør migration
npx prisma db push

# (Valgfrit) Åbn Prisma Studio
npx prisma studio
```

## 🔐 NextAuth Secret
Generer en sikker secret:
```bash
openssl rand -base64 32
```

## 🚀 Start Applikationen
```bash
npm run dev
```

## 📱 Features Implementeret

### ✅ Authentication System
- [x] NextAuth.js integration
- [x] User registration/login
- [x] Password hashing med bcrypt
- [x] Session management
- [x] Protected routes

### ✅ Database Integration
- [x] Prisma ORM setup
- [x] User model
- [x] Chat history model
- [x] PostgreSQL med Supabase

### ✅ UI/UX
- [x] Login/Signup forms
- [x] User profile i header
- [x] Logout functionality
- [x] Loading states
- [x] Error handling

## 🔄 Næste Steps

### Chat History Integration
- [ ] Gem chat sessions i database
- [ ] Load tidligere chats
- [ ] Chat history sidebar

### Advanced Features
- [ ] User preferences
- [ ] Chat export
- [ ] Analytics dashboard
- [ ] Admin panel 