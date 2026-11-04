// frontend/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : undefined;

const isProduction = process.env.NODE_ENV === "production";
const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? ".auraworks.co.za" : undefined);
const isCrossSubdomainEnabled = Boolean(cookieDomain && (isProduction || process.env.COOKIE_DOMAIN));

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || "development-better-auth-secret-key-1234567890",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  trustedOrigins: [
    "http://localhost:3000",
    "https://auraworks.co.za",
    "https://www.auraworks.co.za",
    "https://dash.auraworks.co.za",
    "https://api.auraworks.co.za",
    "https://industrial-intelligence-xi.vercel.app",
    "https://industrial-intelligence-git-main-allen-reileys-projects.vercel.app",
    "https://industrial-intelligence-lttxeot8z-allen-reileys-projects.vercel.app"
  ],
  advanced: {
    crossSubDomainCookies: {
      enabled: isCrossSubdomainEnabled,
      domain: cookieDomain
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isProduction,
    }
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "1h",
      },
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
      ? {
          microsoft: {
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
          },
        }
      : {}),
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "sales",
      },
      is_active: {
        type: "boolean",
        required: false,
        defaultValue: true,
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
          return {
            data: {
              ...user,
              role: user.role && user.role !== "unassigned" ? user.role : "sales",
              is_active: user.is_active !== undefined ? user.is_active : true,
            },
          };
        },
      },
    },
  },
});
