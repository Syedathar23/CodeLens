# Auth Service

This microservice handles user authentication, registration, and user data management for the CodeLens project. It provides endpoints to sign up, log in, and verify JWT tokens.

## Required Environment Variables

See `.env.example` for the required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (e.g., Supabase connection string).
- `JWT_SECRET`: Secret key for signing and verifying JWT tokens.
- `PORT`: Port on which the service runs (defaults to 5000).

## Database Setup

The database schema is defined in `/schema.sql` at the root of the repository. You can execute this file against your PostgreSQL database (like Supabase) to create all necessary tables.
To run it on Supabase, you can use the Supabase Dashboard's SQL Editor or the `psql` CLI:

```sh
psql -d $DATABASE_URL -f ../schema.sql
```

## How to Run

1. Navigate to the `auth-service` directory.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in the values.
4. Start the server:
   ```sh
   npm start
   ```
