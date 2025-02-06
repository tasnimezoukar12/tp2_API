const express = require('express');
const cors = require('cors');  
const rateLimit = require('express-rate-limit');  
const db = require('./data');  // Importation de la base de données

const app = express();
app.use(express.json());

const PORT = 8000;

// ✅ Activation de CORS (autoriser toutes les origines)
app.use(cors());

// ✅ Configuration du Rate Limiting : max 100 requêtes en 15 minutes par IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Trop de requêtes effectuées depuis cette IP, veuillez réessayer après 15 minutes.'
});
app.use(limiter);

// ✅ Middleware de debug pour voir les requêtes reçues
app.use((req, res, next) => {
    console.log(`📩 Requête : ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log("📥 Corps de la requête :", req.body);
    }
    next();
});

// ✅ Route principale
app.get('/', (req, res) => {
    res.json({ message: "Registre de personnes! Utilisez /personnes pour voir les données." });
});

// ✅ Route pour récupérer toutes les personnes
app.get('/personnes', (req, res) => {
    db.all("SELECT * FROM personnes", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: rows });
    });
});

// ✅ Route pour récupérer une personne par ID
app.get('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM personnes WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: row });
    });
});

// ✅ Route pour ajouter une nouvelle personne
app.post('/personnes', (req, res) => {
    const { nom, adresse } = req.body;
    if (!nom || !adresse) {
        res.status(400).json({ error: "Veuillez fournir un nom et une adresse" });
        return;
    }

    db.run(`INSERT INTO personnes (nom, adresse) VALUES (?, ?)`, [nom, adresse], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: { id: this.lastID, nom, adresse } });
    });
});

// ✅ Route pour mettre à jour une personne
app.put('/personnes/:id', (req, res) => {
    const id = req.params.id;
    const { nom, adresse } = req.body;
    if (!nom || !adresse) {
        res.status(400).json({ error: "Veuillez fournir un nom et une adresse" });
        return;
    }

    db.run(`UPDATE personnes SET nom = ?, adresse = ? WHERE id = ?`, [nom, adresse, id], function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: { id, nom, adresse } });
    });
});

// ✅ Route pour supprimer une personne
app.delete('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM personnes WHERE id = ?`, id, function(err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: "success", data: { id } });
    });
});

// ✅ Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
