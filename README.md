# KH360 Server

## Installation

### 1. Install [Node Version Manager](https://github.com/nvm-sh/nvm)

### 2. Install Node v18.18.0

```
nvm install v18.18.0
```

### 3. Use Node v18.18.0

```
nvm use v18.18.0
```

### 4. Clone this repository to your local machine using Git

```
git clone https://github.com/nerubia/kh360-nodejs.git
```

### 5. Navigate to the project directory

```
cd kh360-nodejs
```

### 6. Install the project dependencies using npm (Node Package Manager)

```
npm install
```

## Usage

### 1. Create a .env file

```
APP_ENV=local
APP_URL=http://localhost:3000

PORT=5000

DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE

GOOGLE_OAUTH_CLIENT_ID=google client id
GOOGLE_OAUTH_CLIENT_SECRET=google client secret

ACCESS_TOKEN_SECRET=access token secret here
ACCESS_TOKEN_EXPIRATION=5s

REFRESH_TOKEN_SECRET=refresh token secret here
REFRESH_TOKEN_EXPIRATION=15s

SENDGRID_API_KEY=sendgrid api key
SENDGRID_FROM_ADDRESS=from@yourdomain.com
```

### 2. Start the development server

```
npm run dev
```

### TO MAKE NEW MIGRATION

steps here 👇
This command is used for creating and applying migrations during development.

```
npx prisma migrate dev
```

### TO APPLY NEW MIGRATIONS

steps here 👇
This command is used for applying all pending migrations to the production database.

```
npx prisma migrate deploy
```

This command is used to generate the Prisma Client based on your Prisma schema. It creates the necessary client code that allows you to interact with your database using Prisma in your application.

```
npx prisma generate
```
