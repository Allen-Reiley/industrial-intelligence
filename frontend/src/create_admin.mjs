import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({ connectionString: "postgresql://postgres:postgres@localhost:5433/industrial_db" });

const auth = betterAuth({
  database: pool,
  secret: "development-better-auth-secret-key-1234567890",
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "sales" },
      is_active: { type: "boolean", defaultValue: true },
      client_id: { type: "string" },
    },
  },
});

async function run() {
  console.log("Creating admin user...");
  try {
    // This will hash the password and insert into the db
    const res = await auth.api.signUpEmail({
      body: {
        email: "reitumetse@auraworks.co.za",
        password: "SETHABELA.company123!",
        name: "Reitumetse Sethabela",
      }
    });
    console.log("Response:", res);

    // Now update the role to admin
    console.log("Promoting to admin...");
    await pool.query("UPDATE \"user\" SET role = 'admin' WHERE email = $1", ["reitumetse@auraworks.co.za"]);
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
