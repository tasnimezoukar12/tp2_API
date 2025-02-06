const sqlite3 = require('sqlite3').verbose();

// Connexion à la base SQLite (créé automatiquement s'il n'existe pas)
const db = new sqlite3.Database('./database.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Erreur de connexion à SQLite:", err.message);
    } else {
        console.log("✅ Connecté à la base de données SQLite.");
        
        // Création de la table si elle n'existe pas
        db.run(`CREATE TABLE IF NOT EXISTS personnes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            adresse TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error("Erreur de création de table :", err.message);
            } else {
                console.log("✅ Table 'personnes' prête.");

                // Insertion de données de test (uniquement si la table est vide)
                db.get("SELECT COUNT(*) AS count FROM personnes", (err, row) => {
                    if (row.count === 0) {
                        const personnes = [
                            { nom: 'Bob', adresse: '123 Rue A' },
                            { nom: 'Alice', adresse: '456 Rue B' },
                            { nom: 'Charlie', adresse: '789 Rue C' }
                        ];
                        personnes.forEach(({ nom, adresse }) => {
                            db.run(`INSERT INTO personnes (nom, adresse) VALUES (?, ?)`, [nom, adresse]);
                        });
                        console.log("✅ Données de test insérées.");
                    }
                });
            }
        });
    }
});

module.exports = db;
