/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingHero } from './components/home/LandingHero';
import { PdfConversionSection } from './components/home/PdfConversionSection';
import { ToolGrid } from './components/home/ToolGrid';
import { PricingSection } from './components/home/PricingSection';
import { FeatureHighlights } from './components/home/FeatureHighlights';
import { FaqSection } from './components/home/FaqSection';
import { ToolWorkspace } from './components/tools/ToolWorkspace';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { UpgradeModal } from './components/common/UpgradeModal';
import { AuthModal } from './components/common/AuthModal';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <LandingHero />
            <PdfConversionSection />
            <ToolGrid />
            <FeatureHighlights />
            <PricingSection />
            <FaqSection />
          </>
        )}

        {currentView === 'tool' && <ToolWorkspace />}

        {currentView === 'dashboard' && <UserDashboard />}

        {currentView === 'pricing' && (
          <div className="pt-8 pb-16">
            <PricingSection />
            <FaqSection />
          </div>
        )}

        {currentView === 'admin' && <AdminPanel />}
      </main>

      <Footer />

      {/* Global Modals & Overlays */}
      <UpgradeModal />
      <AuthModal />
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
