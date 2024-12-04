# KH360 Server

## ✅ Requirements
- Node.js (latest LTS version)
- Redis (for caching)

## 🌐 Environment Variables
Make sure to copy the `.env.example` file to `.env`, then set the variables.

## ⚙️ Running the App Locally
### 1. Clone the repository:
```
git clone https://github.com/nerubia/kh360-nodejs.git
cd kh360-nodejs
```
### 2. Install dependencies:
```
npm install
```
### 3. Start the development server:
```
npm run dev
```

## 📚 Prisma Guide
### Generating Migrations
1. Update `schema.prisma`
2. Backup your database
3. Run: `npx prisma migrate dev` and name the migration
4. Restore your database
5. Run: `npx prisma migrate deploy` & `npx prisma generate`
