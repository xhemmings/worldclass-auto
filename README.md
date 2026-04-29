# WorldClass Auto Booking Platform

This repository contains a basic scaffold for the WorldClass Auto booking platform built with Next.js, TypeScript and Tailwind CSS. It includes:

- A responsive home page with a call to action.
- A booking form that posts to an API route.
- An API route that stores booking data in a Neon Postgres database (table must exist).
- Tailwind configuration using primary (red) and secondary (orange) colours.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill out the values:

   - `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` – Neon database connection.
   - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` – Google OAuth credentials (not used yet but reserved for authentication).
   - `RESEND_API_KEY` – Resend API key for email notifications.

3. Run the development server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` in your browser to see the app.

## Database

This scaffold uses Neon Postgres via the `@neondatabase/serverless` package. You must create a `bookings` table in your database to match the columns used in `app/api/bookings/route.ts`:

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  service_type TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  description TEXT
);
```

## Notes

* Google OAuth and Resend integrations are not implemented yet. They require additional configuration in `app/api/auth` and appropriate email routes.
* Tailwind CSS uses custom colours defined in `tailwind.config.js`. Adjust as needed.