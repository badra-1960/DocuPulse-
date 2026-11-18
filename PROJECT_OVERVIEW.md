# DOCUPULSE SAAS — BILAN D'INGÉNIERIE & VUE D'ENSEMBLE DU PROJET (v2.5)

---

## 1. Architecture Globale du Système

DocuPulse est une plateforme SaaS de traitement, de conversion et d'analyse documentaire conçue selon les principes de **Confidentialité à la source (*Privacy by Design*)**, de **Souveraineté Serveur (*Server Authority*)** et de **Zéro Confiance Navigateur (*Zero Trust Browser*)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CLIENT BROWSER (Vite + React 19)                      │
│                                                                             │
│  ┌───────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │   UI / UX & Pages     │  │   Client-Side Processing Engine (Local)    │  │
│  │   • Landing & Tools   │  │   • pdf-lib (Merge, Split, Rotate, Stamp)  │  │
│  │   • Dashboard & Quotas│  │   • Canvas (Render PDF pages to images)    │  │
│  │   • Decoupled Checkout│  │   • Mammoth.js (.docx raw text extract)    │  │
│  │   • Pages Légales FR  │  │   • SheetJS (Excel workbook generation)    │  │
│  └───────────────────────┘  └────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / TLS 1.3 (Payloads jusqu'à 50 Mo)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    BACKEND EXPRESS SERVER (Node.js 22 LTS)                  │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ Security & Middlewares  │  │ Sovereign Quota & Protection Engine      │  │
│  │ • Strict CORS & CSP     │  │ • QuotaStore (IP / HMAC User Auth)       │  │
│  │ • Magic Bytes Binary    │  │ • Global Circuit Breaker (1000 IA/j max) │  │
│  │ • Rate Limiting (DoS)   │  │ • Dedicated Daily AI Quotas              │  │
│  │ • Raw Body Webhooks     │  │ • Purge automatique mémoire (24h)        │  │
│  └─────────────────────────┘  └──────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ Decoupled Payment Engine│  │ Ephemeral AI Engine (Google Cloud)       │  │
│  │ • StripeProvider        │  │ • Gemini 3.7 Flash OCR & Translation     │  │
│  │ • MerchantOfRecord (MoR)│  │ • Zero Disk Storage / Ephemeral Memory   │  │
│  │ • MobileMoney (CinetPay)│  │ • Zero Model Training on User Data       │  │
│  │ • Idempotency Store     │  │ • 100k chars & 25MB Base64 ceilings      │  │
│  │ • 72h Grace Period      │  │                                          │  │
│  └─────────────────────────┘  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Matrice et Statut Exhaustif des 15 Outils Documentaires

| # | Outil | Moteur d'Exécution | Statut de Production | Robustesse & Traitement des Cas Limites |
| :-: | :--- | :--- | :---: | :--- |
| **1** | **Fusionner PDF** (`merge-pdf`) | `pdf-lib` (Local) | **Fonctionnel** | Vérification binaire `%PDF-`, gestion multi-fichiers jusqu'à 20 documents, rejet explicite des fichiers corrompus avec toast français. |
| **2** | **Diviser PDF** (`split-pdf`) | `pdf-lib` (Local) | **Fonctionnel** | Validation syntaxique stricte des plages de pages (ex: `1-5, 8`), protection contre les dépassements d'index. |
| **3** | **Compresser PDF** (`compress-pdf`) | `pdf-lib` + Canvas | **Fonctionnel** | **Garantie anti-gonflement :** si `taille_nouvelle >= taille_originale`, le fichier d'origine est conservé avec notification explicite. |
| **4** | **PDF en Word** (`pdf-to-word`) | `pdfEngine` (Local) | **Fonctionnel** | Extraction textuelle native des glyphes sans perte, export `.docx` standard. |
| **5** | **PDF en Excel** (`pdf-to-excel`) | `pdfEngine` + `xlsx` | **Fonctionnel** | Détection tabulaire par expressions régulières et délimiteurs, export `.xlsx` formatté. |
| **6** | **PDF en Image** (`pdf-to-image`) | Canvas (Local) | **Fonctionnel** | Rendu HD page par page en PNG / JPEG, compression ZIP automatique si plusieurs pages. |
| **7** | **Image en PDF** (`image-to-pdf`) | `pdf-lib` (Local) | **Fonctionnel** | Prise en charge PNG, JPEG, WebP avec conservation des proportions et orientation dynamique. |
| **8** | **Word en PDF** (`word-to-pdf`) | `mammoth` + `jsPDF` | **Fonctionnel** | Analyse structurée des `.docx`, rejet clair des anciens `.doc` binaires (Word 97) avec invitation à réenregistrer en `.docx`. |
| **9** | **Excel en PDF** (`excel-to-pdf`) | `xlsx` + `jsPDF` | **Fonctionnel** | Rendu paginé auto-adaptatif multi-colonnes en mode paysage/portrait. |
| **10** | **Filiigrane PDF** (`watermark-pdf`) | `pdf-lib` (Local) | **Fonctionnel** | Rendu vectoriel incliné à 45°, transparence alpha configurable, positionnement mathématique précis. |
| **11** | **Numéroter PDF** (`page-numbers`) | `pdf-lib` (Local) | **Fonctionnel** | Pagination dynamique `Page X sur Y`, positionnement haut/bas et centré/droite. |
| **12** | **Faire pivoter PDF** (`rotate-pdf`) | `pdf-lib` (Local) | **Fonctionnel** | Rotation angulaire normalisée (90°, 180°, 270°) sur tout ou partie des pages. |
| **13** | **OCR & Transcription IA** (`ocr-pdf`) | Gemini 3.7 Flash | **Fonctionnel** | Pré-vérification binaire serveur, streaming transitoire, extraction multilingue de haute fidélité. |
| **14** | **Convertisseur d'Images** (`image-converter`) | Canvas / ImageEngine | **Fonctionnel** | Conversion croisée PNG, JPG, WebP avec curseur de qualité sans perte. |
| **15** | **Redimensionner Image** (`resize-image`) | Canvas (Local) | **Fonctionnel** | Redimensionnement pixel-perfect avec préservation du ratio d'aspect. |

---

## 3. Variables d'Environnement (Noms Uniquement — Zéro Secret en Dur)

| Variable d'Environnement | Description & Usage |
| :--- | :--- |
| `PORT` | Port d'écoute dynamique du serveur Node.js (injecté par Cloud Run ou 3000 par défaut). |
| `NODE_ENV` | Environnement d'exécution (`development` ou `production`). |
| `APP_URL` | URL publique de production du service pour la configuration CORS et les retours de paiement. |
| `SESSION_SECRET` | Clé secrète de signature cryptographique des jetons de session HMAC SHA-256. |
| `ADMIN_EMAIL` | Adresse électronique de l'administrateur système autorisée. |
| `ADMIN_PASSWORD_HASH` | Empreinte cryptographique SHA-256 du mot de passe administrateur (zéro mot de passe en clair). |
| `GEMINI_API_KEY` | Clé d'API Google Cloud / Vertex AI pour les modules d'IA (OCR et analyse de texte). |
| `GLOBAL_GEMINI_DAILY_LIMIT` | Plafond global quotidien de protection de l'infrastructure IA pour tout le serveur (défaut : 1000). |
| `BILLING_PROVIDER` | Sélecteur du fournisseur de paiement actif (`stripe`, `lemonsqueezy`, `paddle`, `cinetpay`, `sandbox`). |
| `STRIPE_SECRET_KEY` | Clé secrète d'API Stripe (mode test ou live). |
| `STRIPE_WEBHOOK_SECRET` | Clé secrète de vérification cryptographique des webhooks Stripe (`whsec_...`). |
| `LEMONSQUEEZY_API_KEY` | Clé d'API marchande Lemon Squeezy (Merchant of Record international). |
| `LEMONSQUEEZY_STORE_ID` | Identifiant du Store Lemon Squeezy. |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Clé de signature HMAC des webhooks Lemon Squeezy. |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | Identifiant du variant d'abonnement Pro sur Lemon Squeezy. |
| `LEMONSQUEEZY_BUSINESS_VARIANT_ID`| Identifiant du variant d'abonnement Business sur Lemon Squeezy. |
| `CINETPAY_SITE_ID` | Identifiant de site CinetPay (Orange Money Guinée, MTN Mobile Money). |
| `CINETPAY_API_KEY` | Clé d'API CinetPay. |

---

## 4. Procédure de Déploiement

### Déploiement Conteneurisé Google Cloud Run (Recommandé)
1. **Construction de l'image Docker de production :**
   ```bash
   docker build -t gcr.io/[PROJECT_ID]/docupulse:v2.5 .
   ```
2. **Déploiement sur Cloud Run avec variables et santé :**
   ```bash
   gcloud run deploy docupulse \
     --image gcr.io/[PROJECT_ID]/docupulse:v2.5 \
     --platform managed \
     --region europe-west3 \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2 \
     --min-instances 0 \
     --max-instances 10 \
     --set-env-vars NODE_ENV=production,BILLING_PROVIDER=lemonsqueezy
   ```
3. **Vérification de la sonde de disponibilité :**
   ```bash
   curl -f https://[VOTRE_DOMAINE]/health
   ```

### Procédure de Retour en Arrière (Rollback) en 3 Lignes
```bash
# 1. Lister les révisions récentes
gcloud run revisions list --service=docupulse --region=europe-west3
# 2. Rétablir instantanément 100% du trafic vers la dernière révision stable
gcloud run services update-traffic docupulse --region=europe-west3 --to-revisions=docupulse-00042=100
# 3. Vérifier le retour à la normale
curl -f https://[VOTRE_DOMAINE]/health
```

---

## 5. Risques Restants Classés par Gravité

| Niveau de Risque | Description du Risque | Impact | Mesure d'Atténuation en Place & Action Requise |
| :---: | :--- | :--- | :--- |
| **Bloquant** | **Aucun risque bloquant identifié.** | N/A | Tous les tests d'audit, de typage (`tsc --noEmit`) et de build sont validés. |
| **Majeur** | **Absence de clés réelles de paiement en production** | Impossibilité pour un utilisateur d'effectuer un paiement par carte réel sans injecter les clés. | Le mode Sandbox est actif et fonctionnel par défaut. L'administrateur doit renseigner `LEMONSQUEEZY_API_KEY` ou `STRIPE_SECRET_KEY` dans le panneau de configuration Cloud Run. |
| **Majeur** | **Vulnérabilité amont SheetJS (`xlsx`)** | Vulnérabilité de prototype pollution connue sur SheetJS dans les dépendances npm. | L'accès à `xlsx` est restreint à l'analyse de tableaux pré-validés. Aucune entrée utilisateur non nettoyée n'est exécutée côté serveur. |
| **Mineur** | **Fichiers Word binaires pré-2007 (`.doc`)** | Les vieux fichiers Word 97 ne sont pas convertibles par `mammoth` (qui exige du XML `.docx`). | Rejet propre et bienveillant avec message explicite invitant l'utilisateur à enregistrer en `.docx`. |
| **Mineur** | **Temps de démarrage à froid (*Cold Start*) Cloud Run** | Si `min-instances=0`, la première requête après une période d'inactivité peut prendre 2 à 3 secondes. | Configurable à `min-instances=1` si le trafic commercial justifie un coût fixe minimal (~5 €/mois). |

---

## 6. Liste des Fonctionnalités Manquantes pour une Version 1.0 Commerciale

1. **Signature Électronique Certifiée (eIDAS / Cryptographique) :**
   - Implémentation d'un module de signature avec certificat numérique horodaté (X.509 PAdES) au-delà de la simple apposition d'image de signature.
2. **Intégration Directe Cloud Drive (Google Drive / Dropbox / OneDrive) :**
   - Sélecteur de fichiers distant pour importer et exporter directement vers Google Drive sans transiter par le disque local.
3. **Web Workers Déportés pour Gros PDF sur Mobile :**
   - Déportation de l'intégralité du calcul `pdf-lib` dans un Web Worker d'arrière-plan pour éviter tout gel imperceptible de l'interface utilisateur sur les smartphones d'entrée de gamme lors de la manipulation de fichiers de 50 Mo.
4. **Base de Données Persistante Déportée (Cloud SQL PostgreSQL / Firestore) :**
   - Migration du store de quotas en mémoire (`quotaStore`) vers une base PostgreSQL ou Firestore pour persister les sessions au-delà du redémarrage des conteneurs.

---

## 7. GO_LIVE_CHECKLIST (Checklist d'Ouverture Publique)

### Produit
- [x] **Aucun bloquant dans l'audit technique** (Audit Prompt 1 validé sans réserve).
- [x] **Gestion des 10 types de fichiers critiques** (Fichiers volumineux 50 Mo, 100+ pages, scans, PDF protégés par mot de passe avec alerte française, fichiers corrompus rejetés avant parsing).
- [x] **Outils fiabilisés avec garanties de résultat** (Compression PDF garantie sans gonflement, extraction textuelle native).
- [x] **Testé et optimisé sur mobile & Android** (Interface responsive Tailwind, téléchargements blobs opérationnels, absence de popups bloquantes `window.alert`).

### Sécurité
- [x] **Zéro secret dans le code ni dans les variables `VITE_`** (Recherche `grep` vérifiée : 0 secret exposé au frontend).
- [x] **Clés de production découplées et isolées côté serveur** (`server.ts` strict, `.env.example` sans valeurs par défaut sensibles).
- [x] **Limites de taille, de débit et de coûts IA en place** (50 Mo global, 25 Mo base64, rate-limiting DoS, disjoncteur IA global à 1 000 requêtes/jour).
- [x] **Quotas vérifiés avec autorité souveraine côté serveur** (Zero Trust Browser sur les permissions et le forfait).
- [x] **`npm audit` audité et corrigé** (0 vulnérabilité critique, fix exécuté).

### Paiement
- [x] **Solution de paiement compatible avec la domiciliation du titulaire** (Lemon Squeezy MoR avec reversement Payoneer/Wise, Mobile Money Orange/MTN Guinée, et Stripe).
- [x] **Parcours d'abonnement complet testé** (Achat initial, échec de prélèvement avec délai de grâce de 72h, renouvellement et résiliation en 1 clic).
- [x] **Webhooks cryptographiquement vérifiés sur corps brut (`rawBody`) et idempotents** (Rejet HTTP 400 sans signature, déduplication active via `WebhookIdempotencyStore`).

### Légal
- [x] **Politique de confidentialité en ligne et conforme RGPD** (Transparence sur l'architecture locale sans rétention et l'IA éphémère).
- [x] **Conditions Générales d'Utilisation (CGU / CGV) en ligne** (Quotas, SLA, responsabilité sur les fichiers, résiliation).
- [x] **Mentions légales complètes avec encadrés personnalisables pour l'éditeur** (Google Cloud hébergeur, Badra Ali Camara directeur de publication).
- [x] **Check-list de validation formalisée pour l'avocat conseil**.

### Infrastructure
- [x] **Port dynamique respecté** (`process.env.PORT` avec fallback 3000).
- [x] **Route de santé liveness & readiness `/health` et `/api/health` opérationnelle**.
- [x] **Dockerfile de production multi-stage avec utilisateur non-root prêt à l'emploi**.
- [x] **Procédure de retour en arrière (Rollback) opérationnelle documentée**.

### Lancement
- [x] **Serveur de développement stable et validé sur le port 3000**.
- [x] **Bannières, FAQ et parcours utilisateur vérifiés sans régression**.
