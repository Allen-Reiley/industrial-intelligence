// frontend/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : undefined;

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || "development-better-auth-secret-key-1234567890",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  trustedOrigins: [
    "http://localhost:3000",
    "https://auraworks.co.za",
    "https://www.auraworks.co.za",
    "https://industrial-intelligence-xi.vercel.app",
    "https://industrial-intelligence-git-main-allen-reileys-projects.vercel.app",
    "https://industrial-intelligence-lttxeot8z-allen-reileys-projects.vercel.app"
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".auraworks.co.za"
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "unassigned",
      },
      is_active: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      job_title: {
        type: "string",
        required: false,
      },
      client_id: {
        type: "string",
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (user.email?.toLowerCase() === "reitumetse@auraworks.co.za") {
            return {
              data: {
                ...user,
                role: "admin",
                is_active: true,
              },
            };
          }
        },
      },
    },
  },
});
