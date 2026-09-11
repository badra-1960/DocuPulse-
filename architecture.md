# DocuPulse — Document d'Architecture Système & Technique

**Projet :** DocuPulse SaaS  
**Version :** 2.5.0-production-spec  
**Statut :** Spécification d'Architecture de Référence  
**Dernière mise à jour :** Août 2026  

---

## 1. Vue d'Ensemble & Objectifs Architecturaux

DocuPulse est une plateforme SaaS de traitement, conversion et analyse documentaire (PDF, Office, Images, OCR IA) conçue pour être :
- **Sécurisée (Zero Trust on Client)** : Aucune règle d'autorisation, de quota, de facturation ou d'accès n'est déléguée au navigateur.
- **Fidèle aux données** : Aucune donnée documentaire n'est synthétisée artificiellement.
- **Performante & Résiliente** : Découplage des traitements lourds, gestion stricte de la mémoire vive et streaming des fichiers volumineux.
- **Scalable & Multi-Tenant** : Architecture prête pour conteneurisation Cloud Run avec persistance de données distribuée.

---

## 2. Architecture Actuelle vs. Architecture Cible

### A. Architecture Actuelle (État des lieux)

```text
┌────────────────────────────────────────────────────────────────────────┐
│                             NAVIGATEUR CLIENT                          │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     React 19 UI Components                       │  │
│  │ (Header, Landing, ToolWorkspace, Dashboard, AdminPanel, Modals)  │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
│                                    │                                   │
│  ┌─────────────────────────────────▼────────────────────────────────┐  │
│  │                AppContext.tsx (Single State Hub)                 │  │
│  │    - user, quota, invoices, history, systemSettings, theme       │  │
│  └───────┬─────────────────────────┬────────────────────────┬───────┘  │
│          │                         │                        │          │
│          ▼                         ▼                        ▼          │
│   ┌──────────────┐          ┌──────────────┐         ┌──────────────┐  │
│   │ localStorage │          │ Client Engines│        │  aiService   │  │
│   │ (Persistence)│          │ (pdfEngine,  │         │   (Client)   │  │
│   │              │          │  conversion, │         │              │  │
│   │              │          │  imageEngine)│         └──────┬───────┘  │
│   └──────────────┘          └──────────────┘                │          │
└─────────────────────────────────────────────────────────────┼──────────┘
                                                              │ fetch()
                                                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVEUR EXPRESS (server.ts)                     │
│                                                                        │
│   ┌───────────────┐     ┌──────────────────────────────────────────┐   │
│   │ /api/health   │     │ /api/ai/ocr & /api/ai/analyze-text       │   │
│   │ /api/quota    │     │ /api/billing (Simulé)                    │   │
│   └───────────────┘     │ (Proxy Gemini Flash SDK & In-Memory Map) │   │
│                         └────────────────────┬─────────────────────┘   │
└──────────────────────────────────────────────┼─────────────────────────┘
                                               ▼
                                  Google Gemini Flash API
```

---

### B. Architecture Cible Recommandée (Production-Grade)

```text
                                  ┌─────────────────────────────┐
                                  │      Client Web / Mobile    │
                                  │    (React 19 / Vite SPA)    │
                                  └──────────────┬──────────────┘
                                                 │ HTTPS
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     Cloudflare / CDN WAF    │
                                  │ (DDoS, SSL, Edge Caching)   │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     Express API Gateway     │
                                  │   (Port 3000 / Cloud Run)   │
                                  └──────┬────────────────┬─────┘
                                         │                │
            ┌────────────────────────────┼────────────────┴───────────────────────────┐
            │                            │                                            │
            ▼                            ▼                                            ▼
┌───────────────────────┐   ┌─────────────────────────┐                  ┌─────────────────────────┐
│ Auth & Session Guard  │   │ Quota & Rate-Limiter    │                  │ Payment & Subscriptions │
│  - JWT HttpOnly Cookie│   │  - Redis Token Bucket   │                  │  - Stripe Checkout      │
│  - RBAC Middleware    │   │  - Authoritative limits │                  │  - Webhooks Listener    │
└───────────┬───────────┘   └────────────┬────────────┘                  └────────────┬────────────┘
            │                            │                                            │
            └────────────────────────────┼────────────────────────────────────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────┐
                        │   PostgreSQL / Cloud SQL / Supa │
                        │ (Users, Subs, Usage, Audit Logs)│
                        └─────────────────────────────────┘
```

---

## 3. Schéma & Modèle de Données (Database Schema)

### Tables Essentielles (PostgreSQL)

```sql
-- 1. Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Organisations (Multi-Tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'business')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Abonnements & Facturation Stripe
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(100) UNIQUE,
    stripe_subscription_id VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'incomplete',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE
);

-- 4. Registre des Quotas & Utilisation (Authoritative Usage)
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    tool_id VARCHAR(50) NOT NULL,
    bytes_processed BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Journaux d'Audit (Audit Logs)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Pipeline de Traitement des Fichiers & Moteurs Documentaires

| Outil | Moteur d'Exécution | Isolation | Politique de Données |
| :--- | :--- | :--- | :--- |
| **PDF Merge / Split / Rotate / Watermark** | `pdf-lib` (Web Worker) | Navigateur Client | Local in-memory. Zéro téléversement serveur. |
| **Word $\to$ PDF** | `mammoth` + `jspdf` | Navigateur Client | Extraction fidèle XML sans fausse donnée. |
| **PDF $\to$ Excel** | `pdfjs-dist` + `xlsx` | Navigateur Client | Flux vectoriel réel uniquement. |
| **Images (Resize / Filters)** | Canvas HTML5 | Navigateur Client | Révocation mémoire via `URL.revokeObjectURL`. |
| **OCR & Analyse IA** | Google Gemini API via `server.ts` | Backend Sécurisé | Décompte quota serveur obligatoire. |

---

## 5. Matrice de Sécurité & Conformité

1. **Isolation des Clés & Secrets** : `GEMINI_API_KEY`, `STRIPE_SECRET_KEY` et `DATABASE_URL` restent strictement confinées dans l'environnement Node.js (`server.ts`).
2. **Défense en Profondeur** :
   - En-têtes HTTP de sécurité (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`).
   - Rate limiting basé sur IP et Token.
   - Validation stricte des types de fichiers (Magic Bytes).
3. **Gestion Mémoire** : Nettoyage systématique des objets `Blob` et des ressources Canvas.
