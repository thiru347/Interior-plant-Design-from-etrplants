import React, { useState } from 'react';
import {
  Leaf,
  PlusCircle,
  FolderOpen,
  BookOpen,
  Box,
  Mail,
  Sparkles,
  Upload,
  RotateCcw,
  BarChart3,
  Compass,
} from 'lucide-react';

interface NavbarProps {
  currentTab:
    | 'home'
    | 'studio'
    | 'house-tour'
    | 'plants'
    | 'pots'
    | 'my-designs'
    | 'dashboard'
    | 'contact';
  onSelectTab: (
    tab:
      | 'home'
      | 'studio'
      | 'house-tour'
      | 'plants'
      | 'pots'
      | 'my-designs'
      | 'dashboard'
      | 'contact'
  ) => void;

  onOpenAiSettings: () => void;
  aiConfigured: boolean;
  placedPlantsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAiSettings,
  aiConfigured,
  placedPlantsCount,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('etr_custom_logo') || null;
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomLogoUrl(result);
        localStorage.setItem('etr_custom_logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomLogoUrl(null);
    localStorage.removeItem('etr_custom_logo');
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectTab('home')}
          >
            {customLogoUrl ? (
              <div className="relative">
                <img
                  src={customLogoUrl}
                  alt="ETR Plants Logo"
                  className="h-10 w-auto object-contain max-w-[140px]"
                />
                <button
                  onClick={handleResetLogo}
                  title="Reset to default logo"
                  className="absolute -top-1 -right-1 bg-stone-800 text-stone-400 hover:text-stone-100 rounded-full p-0.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-950/40">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif tracking-wider text-xl font-bold text-stone-100">
                      ETR PLANTS
                    </span>
                    <span className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-mono rounded">
                      Studio
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 tracking-wide font-sans">
                    Interior Plant Designer
                  </p>
                </div>
              </div>
            )}

            {/* Configurable Logo Button */}
            <label
              title="Upload official ETR Plants logo"
              className="hidden lg:flex items-center gap-1 ml-2 text-[11px] text-stone-500 hover:text-stone-300 cursor-pointer transition-colors"
            >
              <Upload className="w-3 h-3" />
              <span>Logo</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onSelectTab('studio')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === 'studio'
                  ? 'text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Design</span>
              {placedPlantsCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-900 text-emerald-300 text-xs rounded-full font-mono">
                  {placedPlantsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectTab('house-tour')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === 'house-tour'
                  ? 'text-emerald-400 border-b-2 border-emerald-500 font-semibold'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>House 3D Tour</span>
            </button>
            <button
              onClick={() => onSelectTab('plants')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === 'plants'
                  ? 'text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Plant Catalogue</span>
            </button>
            <button
              onClick={() => onSelectTab('pots')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === 'pots'
                  ? 'text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Pot Catalogue</span>
            </button>
            <button
              onClick={() => onSelectTab('my-designs')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === 'my-designs'
                  ? 'text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>My Designs</span>
            </button>
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onSelectTab('contact')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                currentTab === 'contact'
                  ? 'text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Contact ETR Plants</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAiSettings}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded border transition-colors ${
                aiConfigured
                  ? 'border-emerald-700/80 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60'
                  : 'border-stone-700 bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
              title="AI model engine configuration & status"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{aiConfigured ? 'AI Vision Active' : 'AI Offline Engine'}</span>
            </button>

            <button
              onClick={() => onSelectTab('studio')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-stone-50 font-medium text-sm rounded shadow-sm shadow-emerald-950/60 transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Start Designing</span>
              <span className="text-emerald-200 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-stone-950/80 border-t border-stone-800/80 gap-2 text-xs">
        <button
          onClick={() => onSelectTab('home')}
          className={`px-2.5 py-1 whitespace-nowrap rounded ${
            currentTab === 'home' ? 'bg-emerald-800 text-white' : 'text-stone-400'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onSelectTab('studio')}
          className={`px-2.5 py-1 whitespace-nowrap rounded ${
            currentTab === 'studio' ? 'bg-emerald-800 text-white' : 'text-stone-400'
          }`}
        >
          Studio
        </button>
        <button
          onClick={() => onSelectTab('house-tour')}
          className={`px-2.5 py-1 whitespace-nowrap rounded ${
            currentTab === 'house-tour' ? 'bg-emerald-800 text-white' : 'text-stone-400'
          }`}
        >
          House 3D Tour
        </button>
        <button
          onClick={() => onSelectTab('plants')}
          className={`px-2.5 py-1 whitespace-nowrap rounded ${
            currentTab === 'plants' ? 'bg-emerald-800 text-white' : 'text-stone-400'
          }`}
        >
          Plants
        </button>
        <button
          onClick={() => onSelectTab('pots')}
          className={`px-2.5 py-1 whitespace-nowrap rounded ${
            currentTab === 'pots' ? 'bg-emerald-800 text-white' : 'text-stone-400'
          }`}
        >
          Pots
        </button>
        <button
          onClick={() => onSelectTab('my-designs')}
          className={`px-2.5 py-1 whitespace-nowrap rounded ${
            currentTab === 'my-designs' ? 'bg-emerald-800 text-white' : 'text-stone-400'
          }`}
        >
          My Designs
        </button>
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`px-2.5 py-1 whitespace-nowrap rounded ${
            currentTab === 'dashboard' ? 'bg-emerald-800 text-white' : 'text-stone-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => onSelectTab('contact')}
          className={`px-2.5 py-1 whitespace-nowrap rounded ${
            currentTab === 'contact' ? 'bg-emerald-800 text-white' : 'text-stone-400'
          }`}
        >
          Contact
        </button>
      </div>
    </header>
  );
};
