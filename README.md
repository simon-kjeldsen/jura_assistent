# Juridisk AI - Din juridiske assistent

En moderne chat-applikation bygget med Next.js, der giver dig adgang til juridisk AI-assistance. Applikationen er designet med et moderne og intuitivt interface, der minder om ChatGPT og Gemini.

## 🚀 Funktioner

- **🤖 AI Chat Interface** - Smooth, flowing AI responses med typewriter effekt
- **💾 Chat Gemning** - Gem og genåbn dine juridiske samtaler
- **👤 Authentication System** - Sikker login/register med NextAuth.js
- **🌙 Dark Mode** - Toggle mellem lyst og mørkt tema
- **📱 Responsive Design** - Fungerer perfekt på alle enheder
- **🔍 Chat Søgning** - Find dine tidligere samtaler nemt
- **⚙️ Profile Panel** - Administrer din profil og indstillinger

## 🛠️ Teknologi Stack

- **Frontend:** Next.js 15, React, TypeScript
- **Styling:** Tailwind CSS med dark mode support
- **Authentication:** NextAuth.js med credentials provider
- **Database:** Supabase (PostgreSQL) med real-time capabilities
- **AI Integration:** Google Gemini API
- **State Management:** React hooks og context
- **Deployment:** Vercel-ready

## 📦 Installation

1. **Klon repository'et:**
   ```bash
   git clone <repository-url>
   cd summarizerapp
   ```

2. **Installer dependencies:**
   ```bash
   npm install
   ```

3. **Opret `.env.local` fil:**
   ```env
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=din-secret-her

   # Google OAuth (valgfrit)
   GOOGLE_CLIENT_ID=din-google-client-id
   GOOGLE_CLIENT_SECRET=din-google-client-secret

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://din-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=din-anon-key

   # Google Gemini API
   GEMINI_API_KEY=din-gemini-api-key
   ```

4. **Opsæt Supabase Database:**
   - Opret et nyt Supabase projekt
   - Kør følgende SQL i SQL Editor:

   ```sql
   -- Create User table
   CREATE TABLE "User" (
       id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
       name TEXT NOT NULL,
       email TEXT UNIQUE NOT NULL,
       password TEXT NOT NULL,
       "emailVerified" TIMESTAMP WITH TIME ZONE,
       image TEXT,
       "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create Chat table
   CREATE TABLE "Chat" (
       id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
       "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
       title TEXT NOT NULL,
       "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create ChatMessage table
   CREATE TABLE "ChatMessage" (
       id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
       "chatId" TEXT NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
       content TEXT NOT NULL,
       "isUser" BOOLEAN NOT NULL,
       "order" INTEGER DEFAULT 0,
       "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Grant permissions to anon role
   GRANT USAGE ON SCHEMA public TO anon;
   GRANT ALL ON public."User" TO anon;
   GRANT ALL ON public."Chat" TO anon;
   GRANT ALL ON public."ChatMessage" TO anon;
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## 🎨 UI/UX Features

- **Smooth Animations** - Fade-in og slide-in effekter
- **Typewriter Effect** - AI responses vises gradvist
- **Responsive Chat Interface** - Input flytter sig til bunden efter første besked
- **Sidebar Navigation** - Hurtig adgang til saved chats
- **Profile Panel** - Slide-in panel med brugerindstillinger
- **Dark/Light Mode** - Automatisk tema detection og persistence

## 🔧 API Endpoints

- `POST /api/auth/register` - Bruger registrering
- `GET /api/chats` - Hent brugerens chats
- `POST /api/chats` - Opret ny chat
- `GET /api/chats/[chatId]` - Hent specifik chat med messages
- `DELETE /api/chats/[chatId]` - Slet chat
- `POST /api/chats/[chatId]/messages` - Gem chat messages
- `POST /api/summarize` - AI summarization endpoint

## 🗄️ Database Schema

### User Table
- `id` (TEXT, PRIMARY KEY) - Auto-genereret UUID
- `name` (TEXT) - Brugerens navn
- `email` (TEXT, UNIQUE) - Email adresse
- `password` (TEXT) - Hashed password
- `createdAt` (TIMESTAMP) - Oprettelsesdato
- `updatedAt` (TIMESTAMP) - Sidste opdatering

### Chat Table
- `id` (TEXT, PRIMARY KEY) - Auto-genereret UUID
- `userId` (TEXT, FOREIGN KEY) - Reference til User
- `title` (TEXT) - Chat titel
- `createdAt` (TIMESTAMP) - Oprettelsesdato
- `updatedAt` (TIMESTAMP) - Sidste opdatering

### ChatMessage Table
- `id` (TEXT, PRIMARY KEY) - Auto-genereret UUID
- `chatId` (TEXT, FOREIGN KEY) - Reference til Chat
- `content` (TEXT) - Message indhold
- `isUser` (BOOLEAN) - Er message fra bruger eller AI
- `order` (INTEGER) - Message rækkefølge
- `createdAt` (TIMESTAMP) - Oprettelsesdato

## 🚀 Deployment

Applikationen er klar til deployment på Vercel:

1. **Push til GitHub**
2. **Import til Vercel**
3. **Konfigurer environment variables**
4. **Deploy!**

## 🤝 Bidrag

1. Fork repository'et
2. Opret en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dine ændringer (`git commit -m 'Add some AmazingFeature'`)
4. Push til branch (`git push origin feature/AmazingFeature`)
5. Opret en Pull Request

## 📄 License

Dette projekt er under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## 🙏 Tak

Tak til alle der har bidraget til dette projekt og hjulpet med at skabe en moderne og brugervenlig juridisk AI-assistent!
