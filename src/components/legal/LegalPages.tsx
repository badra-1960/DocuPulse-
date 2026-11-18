import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  FileText,
  Lock,
  Building,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Cpu,
  Server,
  Globe2,
  ArrowLeft,
  Download,
  ExternalLink,
} from 'lucide-react';

export const LegalPages: React.FC = () => {
  const { setCurrentView, t } = useApp();
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'mentions'>('privacy');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation back */}
        <button
          onClick={() => setCurrentView('home')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('nav_home', {}, 'Retour à l\'accueil')}</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
            <Scale className="w-3.5 h-3.5 text-indigo-500" />
            <span>Conformité Réglementaire, RGPD & Cadre Contractuel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transparence, Sécurité & Pages Légales
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
            Retrouvez l'ensemble des règles régissant la protection de vos données personnelles, les conditions d'utilisation de DocuPulse et les mentions obligatoires de l'éditeur.
          </p>
        </div>

        {/* AVERTISSEMENT JURIDIQUE PRÉALABLE (DISCLAIMER) */}
        <div className="mb-8 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold uppercase tracking-wider text-[11px] mb-1">
                Avertissement Légal & Décharge de Responsabilité (Disclaimer)
              </p>
              <p className="text-amber-800 dark:text-amber-300/90">
                Les présents textes sont des <strong>brouillons préparatoires rigoureusement documentés</strong> établis pour le fonctionnement technique de la plateforme SaaS DocuPulse. <strong>Ils ne constituent en aucun cas un conseil juridique et ne remplacent pas la validation formelle d'un avocat ou d'un juriste spécialisé</strong> en droit du numérique et de la propriété intellectuelle. Les éléments balisés entre crochets <code>[EXEMPLE EN JAUNE]</code> doivent être personnalisés et validés avant l'exploitation commerciale définitive.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-8 overflow-x-auto">
          {[
            { id: 'privacy', label: 'Politique de Confidentialité (RGPD)', icon: Lock },
            { id: 'terms', label: 'Conditions Générales d\'Utilisation (CGU)', icon: FileText },
            { id: 'mentions', label: 'Mentions Légales & Éditeur', icon: Building },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: POLITIQUE DE CONFIDENTIALITÉ */}
        {activeTab === 'privacy' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Règlement Général sur la Protection des Données (RGPD 2016/679)
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Politique de Confidentialité & Engagement Zéro-Rétention
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Dernière mise à jour : 12 Novembre 2026 • Version 2.5
              </p>
            </div>

            {/* Architecture Zero-Rétention */}
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Garantie d'Architecture Zéro-Rétention Locale (Client-Side Privacy)
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                DocuPulse repose sur une architecture moderne de confidentialité à la source : <strong>la très grande majorité des traitements de manipulation de documents (fusion, découpage, compression, rotation, numérotation, filigrane, conversions vectorielles) est exécutée à 100% en local dans la mémoire vive de votre navigateur web</strong> grâce aux technologies WebAssembly et Canvas. Vos documents confidentiels ne quittent jamais votre terminal pour ces opérations et ne sont jamais téléversés sur un disque dur externe.
              </p>
            </div>

            {/* 1. Données collectées */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>1. Nature des Données Collectées</span>
              </h3>
              <p>
                Nous limitons rigoureusement la collecte aux seules données strictement nécessaires au fonctionnement et à la sécurité du service :
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li>
                  <strong>Données de compte utilisateur :</strong> Adresse de courrier électronique (email), nom/pseudonyme, mot de passe sous forme hachée cryptographiquement en SHA-256 (aucun mot de passe en clair), jeton de session chiffré HMAC.
                </li>
                <li>
                  <strong>Données de facturation :</strong> Toutes les transactions financières sont traitées de manière sécurisée par nos prestataires de paiement certifiés PCI-DSS Niveau 1 (Stripe, Lemon Squeezy ou CinetPay). DocuPulse ne conserve et n'a jamais accès à vos numéros complets de carte bancaire.
                </li>
                <li>
                  <strong>Données transmises pour l'Intelligence Artificielle (OCR & Extraction de texte) :</strong> Lorsque vous utilisez volontairement une fonctionnalité d'IA avancée, le document est transmis via un canal chiffré TLS 1.3 à notre API backend qui sollicite le modèle Google Gemini 3.7 Flash. <strong>Le traitement est éphémère en mémoire vive, aucune copie du fichier n'est conservée sur disque, et Google n'utilise pas les données de nos clients pour ré-entraîner ses modèles.</strong>
                </li>
                <li>
                  <strong>Données techniques de sécurité :</strong> Adresse IP client (utilisée uniquement par notre disjoncteur anti-DDoS et notre limiteur de débit souverain, purgée automatiquement sous 24 heures).
                </li>
              </ul>
            </section>

            {/* 2. Durée de conservation */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Durée de Conservation des Données
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Documents PDF manipulés</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    <strong>0 seconde.</strong> Détruits immédiatement de la mémoire vive du navigateur dès la fermeture de la page ou de l'onglet.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Historique des conversions</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    Stocké exclusivement sur votre propre ordinateur dans le <code>localStorage</code> du navigateur. Effaçable en un clic depuis le Dashboard.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Comptes utilisateurs</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    Conservés pendant la durée de l'abonnement, puis archivés pendant 3 ans maximum en l'absence totale d'activité avant suppression définitive.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="font-bold text-slate-900 dark:text-white block mb-1">Justificatifs de facturation</span>
                  <p className="text-slate-500 dark:text-slate-400">
                    10 ans (obligation légale comptable et fiscale en vigueur).
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Lieu de traitement */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Hébergement & Lieux de Traitement des Données
              </h3>
              <p className="text-xs">
                Les serveurs applicatifs de DocuPulse sont hébergés au sein de l'<strong>Union Européenne (Région Europe-West3, Francfort, Allemagne ou Europe-West1, Belgique)</strong> sur l'infrastructure Google Cloud Run, bénéficiant des plus hautes certifications de sécurité (ISO/IEC 27001, SOC 2, SOC 3, conformité RGPD).
              </p>
            </section>

            {/* 4. Suppression de compte */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. Vos Droits & Procédure de Suppression Définitive de Compte
              </h3>
              <p className="text-xs">
                Conformément aux articles 15 à 22 du RGPD, vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement intégral de vos données (« Droit à l'oubli »).
              </p>
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2 text-xs">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 block">
                  Comment exercer votre droit d'effacement :
                </span>
                <p>
                  1. <strong>En autonomie :</strong> Rendez-vous sur votre <em>Dashboard Utilisateur</em> &gt; onglet <em>Paramètres</em> &gt; cliquez sur <em>Supprimer mon compte</em> pour purger instantanément vos données locales et vos sessions.
                </p>
                <p>
                  2. <strong>Par notification écrite :</strong> Adressez votre demande par email à l'adresse du délégué à la protection des données : <span className="bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 px-1 py-0.5 rounded font-mono">[privacy@docupulse.io ou camarabadraalicamara@gmail.com]</span>. Vos données résiduelles seront effacées sous 72 heures ouvrées avec confirmation écrite.
                </p>
              </div>
            </section>

            {/* 5. Cookies */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5. Politique Relative aux Cookies & Traceurs
              </h3>
              <p className="text-xs">
                DocuPulse applique une politique stricte de respect de la vie privée : <strong>aucun cookie publicitaire tiers, aucun outil de tracking intrusif ni pixel de ciblage comportemental</strong> n'est déployé sur la plateforme. Seuls des traceurs techniques indispensables au service (maintien de session authentifiée, mémorisation du thème sombre/clair et de la langue sélectionnée) sont utilisés.
              </p>
            </section>
          </div>
        )}

        {/* Tab 2: CONDITIONS GÉNÉRALES D'UTILISATION (CGU) */}
        {activeTab === 'terms' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Cadre Contractuel du Service SaaS
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Conditions Générales d'Utilisation & de Vente (CGU / CGV)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                En vigueur au 12 Novembre 2026 • Version 2.5
              </p>
            </div>

            {/* 1. Objet */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                1. Objet du Service DocuPulse
              </h3>
              <p className="text-xs">
                La plateforme DocuPulse fournit une suite logicielle SaaS (Software as a Service) de traitement, de manipulation, de conversion vectorielle et d'analyse documentaire automatisée de fichiers numériques (PDF, Word, Excel, PowerPoint, Images, OCR).
              </p>
            </section>

            {/* 2. Forfaits & Quotas */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                2. Forfaits d'Abonnement, Tarifs & Délais de Grâce
              </h3>
              <div className="space-y-2 text-xs">
                <p>
                  • <strong>Forfait Gratuit (Free) :</strong> Accès sans frais limité à 3 opérations documentaires quotidiennes et 5 requêtes IA d'évaluation par jour, réinitialisées chaque jour à minuit UTC.
                </p>
                <p>
                  • <strong>Forfait Pro (9 $/mois ou 84 $/an) :</strong> Conversions illimitées, taille de fichier maximale étendue à 50 Mo par document, traitement par lots jusqu'à 20 fichiers simultanés et jusqu'à 100 requêtes OCR IA par jour.
                </p>
                <p>
                  • <strong>Forfait Entreprise & Business (24 $/mois ou 228 $/an) :</strong> Support dédié prioritaire, 5 000 opérations/jour, OCR haute cadence (500 requêtes/jour).
                </p>
                <p>
                  • <strong>Délai de grâce de sécurité (72 heures) :</strong> En cas d'échec de prélèvement sur votre carte bancaire lors du renouvellement mensuel, DocuPulse déclenche un délai de grâce bienveillant de 3 jours calendaires (72h). Votre accès Pro demeure actif pendant ce délai pour vous permettre de régulariser votre moyen de paiement sans interruption de service.
                </p>
                <p>
                  • <strong>Résiliation sans frais en 1 clic :</strong> Vous pouvez résilier votre abonnement à tout moment directement depuis votre Dashboard. Votre accès Pro reste disponible jusqu'au dernier jour de votre cycle de facturation en cours. Aucun frais d'annulation n'est facturé.
                </p>
              </div>
            </section>

            {/* 3. Responsabilité de l'utilisateur */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3. Responsabilité de l'Utilisateur sur les Fichiers Soumis
              </h3>
              <p className="text-xs">
                L'utilisateur conserve l'entière propriété et responsabilité juridique des documents et contenus qu'il soumet à DocuPulse. Il s'engage expressément à :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li>Détenir tous les droits de propriété intellectuelle ou autorisations nécessaires sur les fichiers traités.</li>
                <li>Ne pas téléverser de documents contenant des codes malveillants, virus, chevaux de Troie ou scripts destructeurs.</li>
                <li>Ne pas utiliser le service pour traiter des contenus illicites, à caractère pédopornographique, terroriste, diffamatoire ou contrefaisant.</li>
              </ul>
            </section>

            {/* 4. Disponibilité & Force majeure */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. Disponibilité du Service & Limitation de Responsabilité
              </h3>
              <p className="text-xs">
                DocuPulse met en œuvre tous les moyens raisonnables pour assurer une disponibilité continue de la plateforme (objectif SLA indicatif de 99,5%). Toutefois, la responsabilité de DocuPulse ne saurait être engagée en cas de dysfonctionnement temporaire lié à des opérations de maintenance programmée, à une défaillance des réseaux Internet tiers ou à un événement constitutif de force majeure.
              </p>
            </section>

            {/* 5. Juridiction */}
            <section className="space-y-2 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                5. Droit Applicable & Résolution des Litiges [À VALIDER PAR UN JURISTE]
              </h3>
              <p className="text-amber-800 dark:text-amber-300/90">
                Les présentes CGU sont régies par le droit <span className="bg-amber-200 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono font-bold">[guinéen / français / selon l'entité juridique définitive choisie]</span>. En cas de différend qui ne pourrait être résolu à l'amiable, les tribunaux compétents du ressort de <span className="bg-amber-200 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono font-bold">[Tribunal de Commerce de Conakry / Tribunal compétent]</span> seront seuls compétents.
              </p>
            </section>
          </div>
        )}

        {/* Tab 3: MENTIONS LÉGALES */}
        {activeTab === 'mentions' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-8 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Informations Légales & Identité de l'Exploitant
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                Mentions Légales Obligatoires
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Conformément aux dispositions de la loi pour la confiance dans l'économie numérique.
              </p>
            </div>

            {/* Éditeur de la plateforme */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>1. Éditeur du Site et de l'Application DocuPulse</span>
              </h3>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Raison sociale / Nom commercial :</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                      [DocuPulse Technologies / Raison Sociale à compléter]
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Forme juridique :</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                      [SARL / SAS / Entreprise Individuelle à compléter]
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Numéro d'immatriculation RCCM / SIREN :</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                      [RCCM Conakry GN.TCC... / SIRET à compléter]
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Directeur de la publication :</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Badra Ali Camara
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Adresse du siège social :</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                      [Adresse physique du siège social - Conakry, République de Guinée]
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Courrier électronique de contact :</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      camarabadraalicamara@gmail.com
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Téléphone professionnel :</span>
                    <span className="font-bold text-slate-900 dark:text-white bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded">
                      [Numéro de téléphone professionnel avec indicatif +224]
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Hébergeur */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>2. Hébergeur de l'Infrastructure Technique</span>
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                <p><strong>Société :</strong> Google LLC / Google Cloud Platform</p>
                <p><strong>Adresse postale :</strong> 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis</p>
                <p><strong>Région d'hébergement :</strong> Union Européenne (Région Europe-West3, Francfort, Allemagne)</p>
                <p><strong>Site web officiel :</strong> cloud.google.com</p>
              </div>
            </section>

            {/* Prestataires de paiement */}
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>3. Prestataires de Paiement et Revendeurs Officiels</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="font-bold block text-slate-900 dark:text-white mb-0.5">Lemon Squeezy LLC</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Merchant of Record international (TVA, CB, PayPal). Salt Lake City, Utah, USA.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="font-bold block text-slate-900 dark:text-white mb-0.5">Stripe Payments Europe</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Paiements par cartes bancaires (Visa, Mastercard, Amex). Dublin 2, Irlande.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="font-bold block text-slate-900 dark:text-white mb-0.5">CinetPay SAS</span>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Agrégateur Mobile Money (Orange Money Guinée, MTN, Wave). Abidjan, Côte d'Ivoire.
                  </p>
                </div>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                4. Propriété Intellectuelle & Droits d'Auteur
              </h3>
              <p className="text-xs">
                L'ensemble des éléments graphiques, marques, logos, codes sources, architectures logicielles et documentations textuelles composant DocuPulse sont protégés par les lois internationales relatives à la propriété intellectuelle. Toute reproduction, modification ou distribution non autorisée est rigoureusement interdite.
              </p>
            </section>
          </div>
        )}

        {/* CHECK-LIST POUR LE JURISTE CONSEIL */}
        <div className="mt-8 p-6 rounded-3xl bg-slate-900 text-white border border-slate-800">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-amber-400" />
            Check-list Spécifique des Points à Valider Impérativement par votre Juriste
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span><strong>Forme d'exercice et immatriculation :</strong> Vérifier le numéro RCCM guinéen ou SIREN selon le pays de rattachement fiscal.</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span><strong>Droit applicable & tribunal compétent :</strong> Valider la clause attributive de juridiction (Conakry vs droit OHADA vs tribunal européen).</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span><strong>Régime fiscal Merchant of Record :</strong> Valider l'accord d'encaissement tiers (Lemon Squeezy / Paddle) et les obligations TVA export.</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span><strong>Plafond légal d'indemnisation SLA :</strong> Valider la clause limitative de responsabilité (ex: plafonnée au montant des 12 derniers mois d'abonnement).</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
