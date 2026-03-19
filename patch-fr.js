#!/usr/bin/env node
/**
 * patch-fr.js
 * Merges the 38 missing knowledge_base keys into messages/fr.json
 *
 * Usage:
 *   node patch-fr.js ./messages
 */

const fs   = require("fs");
const path = require("path");

const folder  = process.argv[2] || "./messages";
const frPath  = path.resolve(folder, "fr.json");
const bakPath = frPath + ".bak";

if (!fs.existsSync(frPath)) {
  console.error(`❌  File not found: ${frPath}`);
  process.exit(1);
}

// ─── Missing keys ─────────────────────────────────────────────────────────────

const missing = {
  action_col:              "Action",
  add_content:             "Ajouter du contenu",
  add_data_source:         "Ajouter une source de données",
  add_data_source_desc:    "Ajoutez du contenu à votre base de connaissances pour entraîner vos agents IA.",
  added_to_kb:             "Ajouté à la base de connaissances",
  answer:                  "Réponse",
  answer_placeholder:      "Saisissez la réponse que le bot doit fournir...",
  asked_col:               "Demandé",
  change_file:             "Changer le fichier",
  create_kb_entry:         "Créer une entrée KB",
  create_kb_entry_desc:    "Transformez cette requête sans réponse en une réponse entraînée pour votre IA.",
  create_kb_entry_title:   "Créer une entrée dans la base de connaissances",
  default_label:           "(Par défaut)",
  drop_to_replace:         "Cliquez ou faites glisser un nouveau fichier pour le remplacer",
  drop_to_upload:          "Glissez-déposez ou cliquez pour importer TXT, MD, CSV",
  failed_to_save_kb:       "Échec de l'enregistrement dans la base de connaissances",
  file_size_hint:          "Taille max : 10 Mo. Le contenu sera disponible après traitement.",
  file_upload_failed:      "Échec de l'envoi du fichier",
  import_url:              "Importer une URL",
  kb_selector_label:       "Base de connaissances",
  kb_selector_placeholder: "Sélectionnez une base de connaissances",
  last_asked_col:          "Dernière demande",
  no_unanswered:           "Aucune requête sans réponse pour l'instant. 🎉",
  plain_text:              "Texte brut",
  query_col:               "Requête",
  save_file:               "Enregistrer le fichier",
  save_text:               "Enregistrer le texte",
  save_to_kb:              "Enregistrer dans la base de connaissances",
  saving:                  "Enregistrement...",
  select_files:            "Sélectionner des fichiers",
  text_placeholder:        "Collez votre contenu ici...",
  unanswered_queries:      "Requêtes sans réponse",
  unanswered_queries_desc: "Questions auxquelles le bot n'a pas pu répondre — créez des entrées KB pour les couvrir.",
  unanswered_query_label:  "Requête sans réponse",
  upload_files:            "Importer des fichiers",
  uploading:               "Importation en cours...",
  url_hint:                "Nous allons extraire le contenu de cette page et l'indexer.",
  url_placeholder:         "https://example.com/page",
};

// ─── Patch ────────────────────────────────────────────────────────────────────

const fr = JSON.parse(fs.readFileSync(frPath, "utf8"));

// Backup
fs.copyFileSync(frPath, bakPath);
console.log(`💾  Backup saved → ${bakPath}`);

// Ensure knowledge_base section exists
if (!fr.knowledge_base || typeof fr.knowledge_base !== "object") {
  fr.knowledge_base = {};
}

let added = 0;
for (const [key, value] of Object.entries(missing)) {
  if (fr.knowledge_base[key] === undefined) {
    fr.knowledge_base[key] = value;
    console.log(`   ✚  knowledge_base.${key}`);
    added++;
  } else {
    console.log(`   ⚠️  skipped (already exists): knowledge_base.${key}`);
  }
}

fs.writeFileSync(frPath, JSON.stringify(fr, null, 2), "utf8");
console.log(`\n✅  Done — ${added} key(s) added to fr.json`);
console.log(`🏁  Run: node check-translations.js ./messages\n`);
