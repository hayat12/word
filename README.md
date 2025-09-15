# Language Learning App

A production-ready fullstack Next.js application for language learning with modern features and best practices.

## 🚀 Features

- **Next.js 14** with App Router
- **Material-UI (MUI v5)** with custom theme
- **NextAuth.js** for authentication (Email + OAuth)
- **PostgreSQL** database with Prisma ORM
- **React Query (TanStack Query)** for state management
- **React Hook Form** for form handling
- **TypeScript** for type safety
- **Dark/Light mode** toggle
- **Protected routes** with session management
- **Jest + React Testing Library** for testing
- **Vercel-ready** deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Material-UI v5, Emotion
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form
- **Styling**: Emotion (MUI default)
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel-ready

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd language-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/language_app"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Email Provider (optional)
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@yourdomain.com"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Database Setup

1. Install PostgreSQL on your system
2. Create a new database named `language_app`
3. Update the `DATABASE_URL` in your `.env.local` file
4. Run the Prisma migrations

### Authentication Setup

#### Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

#### Email Authentication (Optional)
1. Set up an SMTP server (Gmail recommended)
2. Update the email configuration in `.env.local`
3. For Gmail, use an App Password instead of your regular password

## 🏗️ Project Structure

```
language-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth routes
│   │   └── posts/         # Posts API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   └── ThemeToggle.tsx    # Theme toggle component
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database configuration
│   ├── query-client.ts   # React Query configuration
│   └── theme.ts          # MUI theme configuration
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Prisma schema
└── public/               # Static assets
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` (if using Google OAuth)
- `GOOGLE_CLIENT_SECRET` (if using Google OAuth)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npx prisma studio` - Open Prisma Studio
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
