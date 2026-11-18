# DOCUPULSE — BROUILLONS DE DOCUMENTS LÉGAUX & CONFORMITÉ RGPD

> **AVERTISSEMENT JURIDIQUE PRÉALABLE (DISCLAIMER) :**
> Les présents documents sont des **brouillons préparatoires rédigés à titre technique et informatif** pour la plateforme SaaS DocuPulse. **Ils ne remplacent en aucun cas une consultation juridique formalisée auprès d'un avocat ou d'un juriste spécialisé en droit des technologies de l'information et RGPD.**
> Tous les passages placés entre crochets `[EXEMPLE EN MAJUSCULES]` doivent être rigoureusement adaptés et validés avec votre conseil avant exploitation commerciale.

---

## 1. POLITIQUE DE CONFIDENTIALITÉ & PROTECTION DES DONNÉES (RGPD)

### Préambule : L'Engagement « Zéro-Rétention » de DocuPulse
DocuPulse applique le principe de minimisation des données et de protection de la vie privée dès la conception (*Privacy by Design*).
**L'intégralité des opérations documentaires de base (fusion, découpage, compression, rotation, ajout de filigrane, numérotation de pages, conversion vectorielle Word/Excel) est exécutée localement et exclusivement dans la mémoire vive du navigateur web de l'utilisateur via WebAssembly et l'API Canvas.**
Aucun fichier personnel ou professionnel soumis à ces outils locaux n'est téléversé, stocké, ni analysé sur nos serveurs.

---

### Article 1 — Identité du Responsable de Traitement
Le responsable du traitement des données est :
- **Entité juridique :** `[DocuPulse Technologies / Raison Sociale à compléter]`
- **Numéro d'immatriculation :** `[RCCM Conakry GN.TCC... / SIREN à compléter]`
- **Siège social :** `[Adresse du siège social - Conakry, République de Guinée / France]`
- **Contact DPO / Délégué à la protection des données :** `[privacy@docupulse.io ou camarabadraalicamara@gmail.com]`

---

### Article 2 — Données Collectées & Finalités
Nous ne collectons que les données strictement indispensables à la fourniture du service :

1. **Données de Compte Utilisateur :**
   - Données : Adresse email, nom d'utilisateur, mot de passe haché cryptographiquement en SHA-256 (aucun mot de passe stocké en clair), jeton de session chiffré HMAC SHA-256.
   - Finalité : Authentification, sécurisation de l'accès et respect des quotas quotidiens.
   - Base légale : Exécution du contrat de service (Art. 6.1.b RGPD).

2. **Données de Facturation & Abonnements :**
   - Données : Identifiant client, historique des factures et forfaits souscrits.
   - Note de sécurité : Les coordonnées bancaires et numéros de cartes sont traités exclusivement par des prestataires de paiement tiers certifiés PCI-DSS Niveau 1 (Stripe, Lemon Squeezy ou CinetPay). DocuPulse n'a jamais accès à vos données de paiement brutes.

3. **Traitements d'Intelligence Artificielle (OCR & Extraction textuelle) :**
   - Données : Contenu textuel ou images extraites transmis expressément par l'utilisateur pour transcription OCR via l'API Google Gemini 3.7 Flash.
   - Traitement : Le flux est transmis de manière chiffrée TLS 1.3 vers les serveurs européens de Google Cloud, traité de manière volatile en mémoire vive, **sans aucune persistance sur disque dur**.
   - Confidentialité IA : Les données transmises par nos utilisateurs ne sont **jamais utilisées pour ré-entraîner les modèles d'intelligence artificielle de Google**.

4. **Données Techniques & Télémétrie de Sécurité :**
   - Données : Adresse IP publique.
   - Finalité : Détection des abus, disjoncteur anti-DDoS, rate-limiting souverain.
   - Rétention : Purge automatique de la mémoire vive toutes les 24 heures.

---

### Article 3 — Durée de Conservation des Données
- **Fichiers PDF traités localement :** `0 seconde` (suppression immédiate à la fermeture de l'onglet).
- **Historique des opérations récentes :** Stocké uniquement sur votre terminal (`localStorage`), effaçable à tout moment en 1 clic.
- **Données de compte utilisateur :** Conservées tant que le compte est actif, puis archivées pendant une durée maximale de 3 ans après la dernière connexion avant suppression définitive.
- **Documents comptables et factures :** 10 ans (obligation légale comptable).

---

### Article 4 — Lieu d'Hébergement & Sous-Traitants
- **Infrastructure applicative :** Google Cloud Platform (Google Cloud Run), localisée dans l'Union Européenne (`europe-west3` Francfort, Allemagne).
- **Prestataires certifiés sous-traitants :**
  - Google LLC (Traitement OCR & IA éphémère).
  - Lemon Squeezy LLC / Stripe Payments Europe Ltd / CinetPay SAS (Paiements et abonnements).

---

### Article 5 — Vos Droits & Modalités de Suppression de Compte
Conformément au RGPD (articles 15 à 22), vous bénéficiez des droits suivants :
- Droit d'accès, de rectification et de portabilité de vos données.
- Droit d'opposition et de limitation du traitement.
- **Droit à l'effacement (« Droit à l'oubli ») :** Vous pouvez supprimer l'intégralité de votre compte et de vos données associées :
  1. En autonomie directement depuis le tableau de bord (*Dashboard > Paramètres > Supprimer mon compte*).
  2. Par simple notification par email à `[privacy@docupulse.io]`. Vos données résiduelles seront purgées sous 72 heures ouvrées avec accusé de confirmation.

---

## 2. CONDITIONS GÉNÉRALES D'UTILISATION & DE VENTE (CGU / CGV)

### Article 1 — Acceptation des Conditions
L'accès et l'utilisation de la plateforme DocuPulse emportent acceptation sans réserve des présentes conditions générales par l'utilisateur.

---

### Article 2 — Description du Service & Forfaits
DocuPulse met à disposition une suite logicielle SaaS de traitement documentaire. Trois niveaux d'accès sont proposés :
1. **Forfait Gratuit (*Free*) :** Accès libre dans la limite de 3 opérations quotidiennes et 5 requêtes IA d'évaluation par jour.
2. **Forfait Pro (9 $/mois ou 84 $/an) :** Conversions illimitées, fichiers jusqu'à 50 Mo, conversions par lots (jusqu'à 20 fichiers) et 100 requêtes OCR IA par jour.
3. **Forfait Entreprise & Business (24 $/mois ou 228 $/an) :** Quotas étendus à 5 000 opérations et 500 requêtes OCR quotidiennes, support prioritaire.

---

### Article 3 — Facturation, Renouvellement & Délai de Grâce
- Les abonnements payants sont facturés d'avance selon la périodicité choisie (mensuelle ou annuelle) avec tacite reconduction.
- **Délai de grâce de sécurité de 72 heures :** En cas d'échec de prélèvement bancaire lors du renouvellement, DocuPulse n'interrompt pas brutalement votre accès. Un délai de grâce de 3 jours calendaires est activé pour vous permettre de régulariser votre carte bancaire sans pénalité.
- **Résiliation sans frais :** L'utilisateur peut résilier son abonnement à tout moment en 1 clic depuis son tableau de bord. L'accès aux fonctionnalités souscrites est maintenu jusqu'à la fin de la période de facturation payée en cours.

---

### Article 4 — Responsabilité de l'Utilisateur
L'utilisateur est seul responsable des documents et fichiers qu'il soumet à DocuPulse. Il garantit détenir l'ensemble des droits de propriété intellectuelle sur les fichiers traités.
Il lui est formellement interdit d'utiliser DocuPulse pour téléverser ou traiter :
- Des contenus pédopornographiques, haineux, terroristes ou incitant à la violence.
- Des documents protégés par le secret sans autorisation requise.
- Des fichiers infectés par des virus informatiques, malwares ou chevaux de Troie.

---

### Article 5 — Propriété Intellectuelle de DocuPulse
L'ensemble de la plateforme (code source, algorithmes, interfaces graphiques, marques, logos, documentations) demeure la propriété exclusive de `[DocuPulse Technologies]`. Aucune cession de droit de propriété intellectuelle n'est consentie à l'utilisateur.

---

### Article 6 — Disponibilité & SLA
DocuPulse s'efforce d'assurer une disponibilité de 99,5% hors périodes de maintenance programmée. En cas de force majeure (perturbation majeure des réseaux Internet, cyberattaque distribuée d'ampleur exceptionnelle), la responsabilité de DocuPulse ne pourra être engagée.

---

### Article 7 — Droit Applicable & Attribution de Juridiction
> `[SECTION À VALIDER PAR UN JURISTE]`
> Les présentes CGU sont soumises au droit `[guinéen / français / selon l'entité immatriculée]`. Tout litige relatif à leur interprétation ou exécution qui n'aurait pu faire l'objet d'un accord amiable sera porté devant les tribunaux compétents du ressort de `[Tribunal de Commerce de Conakry / Tribunal de Paris]`.

---

## 3. MENTIONS LÉGALES OBLIGATOIRES

### 1. Éditeur de la Plateforme
- **Nom commercial :** DocuPulse
- **Raison sociale :** `[Raison sociale de l'entreprise à compléter]`
- **Forme juridique :** `[SARL / SAS / Entreprise Individuelle à compléter]`
- **Capital social :** `[Montant du capital social]`
- **Siège social :** `[Adresse physique complète - Conakry, République de Guinée / France]`
- **Numéro d'immatriculation :** `[Numéro RCCM Conakry GN.TCC... / SIREN à compléter]`
- **Directeur de la publication :** Badra Ali Camara
- **Contact électronique :** `camarabadraalicamara@gmail.com` / `[contact@docupulse.io]`
- **Téléphone professionnel :** `[Numéro avec indicatif international]`

### 2. Hébergeur de l'Infrastructure Technique
- **Raison sociale :** Google LLC / Google Cloud Platform (Cloud Run)
- **Adresse :** 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis
- **Centre de données (Datacenter) :** Union Européenne (Région Europe-West3, Francfort, Allemagne)
- **Site web :** https://cloud.google.com

### 3. Prestataires de Paiement Agréés
- **Lemon Squeezy LLC** (Merchant of Record international) — 222 S Main St, Salt Lake City, UT 84101, USA
- **Stripe Payments Europe Ltd** — 1 Grand Canal Street Lower, Dublin 2, Irlande
- **CinetPay SAS** — Abidjan, Côte d'Ivoire (Agrégateur Mobile Money Orange / MTN)

---

## 4. CHECK-LIST POUR VOTRE JURISTE / AVOCAT CONSEIL

Voici la liste exacte des 6 points à soumettre à votre avocat pour validation finale avant lancement commercial :

1. [ ] **Immatriculation & statut de l'exploitant :** Valider l'insertion du numéro RCCM (Tribunal de Commerce de Conakry) ou de l'entité étrangère si une structure offshore (ex: Stripe Atlas / Delaware) est utilisée.
2. [ ] **Clause attributive de juridiction :** Valider le tribunal compétent et le droit applicable en fonction du pays de domiciliation de votre compte bancaire marchand.
3. [ ] **Contrat Merchant of Record :** S'assurer de la cohérence entre les CGU de DocuPulse et les conditions générales de vente de Lemon Squeezy ou Paddle (qui agissent comme vendeurs légaux auprès des clients finaux).
4. [ ] **Plafond de responsabilité contractuelle :** Valider la clause limitant la responsabilité financière de DocuPulse au montant perçu lors des 12 derniers mois d'abonnement.
5. [ ] **Registre des traitements RGPD :** Consigner formellement la fiche de traitement des données dans votre registre interne d'entreprise.
6. [ ] **Politique de remboursement (14 jours) :** Confirmer le droit de rétractation de 14 jours applicable aux consommateurs et l'exclusion pour les professionnels (B2B).
