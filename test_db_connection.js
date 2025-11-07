const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://hermes:XkpKAIcOOyCW4NhJn4WSOyD3Ghmb8D6X@dpg-d468pduuk2gs73d0lmmg-a.oregon-postgres.render.com/dbaspresse",
});

(async () => {
  try {
    await client.connect();
    console.log("Connexion réussie à la base de données PostgreSQL.");
  } catch (err) {
    console.error("Erreur de connexion à la base de données :", err);
  } finally {
    await client.end();
  }
})();