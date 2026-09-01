
// Ce script est lancé automatiquement chaque jour par GitHub Actions.
// Il va chercher les actus économie/business du Togo et les écrit dans data.json

const fs = require('fs');

const API_KEY = process.env.NEWS_API_KEY;
const URL_GENERAL = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&country=tg&language=fr`;
const URL_PORT = `https://newsdata.io/api/1/latest?apikey=${API_KEY}&q=%22Port%20Autonome%20de%20Lom%C3%A9%22&language=fr`;

function formatArticles(json, categorieParDefaut) {
  if (!json.results) return [];
  return json.results.slice(0, 10).map(a => ({
    titre: a.title,
    resume: a.description || "(Pas de résumé disponible, clique sur \"Lire la source\")",
    lien: a.link,
    categorie: categorieParDefaut || (a.category && a.category[0]) || "Actu"
  }));
}

async function main() {
  if (!API_KEY) {
    console.error("Clé API manquante (NEWS_API_KEY).");
    process.exit(1);
  }

  const resGeneral = await fetch(URL_GENERAL);
  const jsonGeneral = await resGeneral.json();
  const articlesGeneral = formatArticles(jsonGeneral, null);

  const resPort = await fetch(URL_PORT);
  const jsonPort = await resPort.json();
  const articlesPort = formatArticles(jsonPort, "Port de Lomé");

  const liensDejaVus = new Set();
  const articles = [];
  for (const a of [...articlesPort, ...articlesGeneral]) {
    if (!liensDejaVus.has(a.lien)) {
      liensDejaVus.add(a.lien);
      articles.push(a);
    }
  }

  const data = {
    date: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Lome' }),
    articles
  };

  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  console.log(`data.json mis à jour avec ${articles.length} articles.`);
}

main();
