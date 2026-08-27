// Ce script est lancé automatiquement chaque jour par GitHub Actions.
// Il va chercher les actus économie/business du Togo et les écrit dans data.json

const fs = require('fs');

const API_KEY = process.env.NEWS_API_KEY;
const URL = `https://newsdata.io/api/1/news?apikey=${API_KEY}&country=tg&language=fr&category=business`;

async function main() {
  if (!API_KEY) {
    console.error("Clé API manquante (NEWS_API_KEY).");
    process.exit(1);
  }

  const res = await fetch(URL);
  const json = await res.json();

  if (!json.results) {
    console.error("Pas de résultats reçus :", JSON.stringify(json).slice(0, 300));
    process.exit(1);
  }

  const articles = json.results.slice(0, 15).map(a => ({
    titre: a.title,
    resume: (a.description || "").slice(0, 220),
    lien: a.link,
    categorie: (a.category && a.category[0]) || "Actu"
  }));

  const data = {
    date: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Lome' }),
    articles
  };

  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log(`data.json mis à jour avec ${articles.length} articles.`);
}

main();
