// frontend/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : undefined;

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || "development-better-auth-secret-key-1234567890",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "sales",
      },
      isActive: {
        type: "boolean",
        required: false,
        defaultValue: true,
      },
      clientId: {
        type: "string",
        required: false,
      },
    },
  },
});
