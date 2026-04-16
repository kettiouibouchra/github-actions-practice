const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// Sur Azure, le port est injecté dynamiquement via process.env.PORT
const PORT = process.env.PORT || 8080;
const FILE = path.join(__dirname, "counter.json");

let lock = false;

// --- FONCTIONS POUR LE COMPTEUR ---
function readCounter() {
    try {
        if (!fs.existsSync(FILE)) {
            fs.writeFileSync(FILE, JSON.stringify({ count: 0 }));
        }
        const data = fs.readFileSync(FILE);
        return JSON.parse(data).count;
    } catch (err) {
        console.error("Erreur lecture JSON:", err);
        return 0;
    }
}

function writeCounter(count) {
    try {
        fs.writeFileSync(FILE, JSON.stringify({ count }, null, 2));
    } catch (err) {
        console.error("Erreur écriture JSON:", err);
    }
}

// --- ROUTE PRINCIPALE ---
app.get("/", async (req, res) => {
    // Gestion du verrou (mutex) pour éviter les erreurs d'écriture simultanée
    while (lock) {
        await new Promise(r => setTimeout(r, 10));
    }
    lock = true;

    try {
        let count = readCounter();
        count++;
        writeCounter(count);

        // Récupération des infos
        const hostname = req.hostname;
        const port = PORT;
        const serverIP = req.socket.localAddress;
        const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        // Envoi de la réponse avec un style plus moderne
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Azure Visit Counter</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f9; color: #333; display: flex; justify-content: center; padding-top: 50px; }
                .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 400px; border-top: 5px solid #0078d4; }
                h2 { color: #0078d4; margin-top: 0; }
                .counter { font-size: 2.5em; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
                hr { border: 0; border-top: 1px solid #eee; margin: 20px 0; }
                .info-label { font-weight: bold; color: #555; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2>📊 Compteur de visites</h2>
                <p>Bienvenue sur mon application Node.js déployée via GitHub Actions !</p>
                <div class="counter">${count}</div>
                
                <hr>
                <h3>🖥️ Serveur Azure</h3>
                <p><span class="info-label">Hostname :</span> ${hostname}</p>
                <p><span class="info-label">Port :</span> ${port}</p>
                <p><span class="info-label">IP Serveur :</span> ${serverIP}</p>
                
                <hr>
                <h3>👤 Visiteur</h3>
                <p><span class="info-label">Votre IP :</span> ${clientIP}</p>
            </div>
        </body>
        </html>
        `);
    } finally {
        lock = false;
    }
});

// --- DÉMARRAGE DU SERVEUR (Toujours à la fin !) ---
app.listen(PORT, () => {
    console.log(`Application démarrée sur le port ${PORT}`);
});