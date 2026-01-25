import { Client } from "pg";

async function testNeon() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_t5ji7FcJAEKd@ep-morning-bread-ahw80cms-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require", // assure-toi que ton .env est chargé
  });

  try {
    await client.connect();
    console.log("✅ Connexion à Neon réussie !");
   
    const res = await client.query("SELECT NOW()");
    console.log("Heure du serveur Neon :", res.rows[0]);

    await client.end();
  } catch (err) {
    console.error("❌ Échec de la connexion à Neon :", err);
  }
}

testNeon();