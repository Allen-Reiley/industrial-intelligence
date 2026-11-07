// dashboard/src/lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

function createDatabasePool(): Pool | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error("🚨 [Better Auth]: DATABASE_URL is not defined in environment variables! Better Auth database operations will fail.");
    return undefined;
  }

  // Normalize protocol: if someone configured postgresql+asyncpg:// from backend, fix to postgresql://
  const connectionString = rawUrl.replace(/^postgresql\+asyncpg:\/\//, "postgresql://");

  const isProduction = process.env.NODE_ENV === "production";
  const isRemoteHost = !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1");
  const needsSsl = isProduction || isRemoteHost || connectionString.includes("sslmode=require") || connectionString.includes("ssl=require");

  const poolInstance = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  poolInstance.on("error", (err) => {
    console.error("🚨 [PostgreSQL Pool Error]: Unexpected client error on idle connection:", err);
  });

  return poolInstance;
}

const pool = createDatabasePool();

const isProduction = process.env.NODE_ENV === "production";
const cookieDomain = process.env.COOKIE_DOMAIN || (isProduction ? ".auraworks.co.za" : undefined);
const isCrossSubdomainEnabled = Boolean(cookieDomain && (isProduction || process.env.COOKIE_DOMAIN));

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || "development-better-auth-secret-key-1234567890",
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
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
          const superAdmins = ["reitumetse@auraworks.co.za", "rsethabela@auraworks.co.za"];
          if (superAdmins.includes(user.email?.toLowerCase() || "")) {
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
