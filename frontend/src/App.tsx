import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { ThreeDBackground } from './components/ThreeDBackground';
import { Home } from './pages/Home';
import { ContentDetails } from './pages/ContentDetails';
import { About } from './pages/About';
import { Footer } from './components/Footer';
import { SheetSettingsModal } from './components/SheetSettingsModal';
import { useSheetData } from './hooks/useSheetData';
import { ContentItem, ActiveTab } from './types/content';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCardItem, setSelectedCardItem] = useState<ContentItem | null>(null);
  
  // Custom Google Sheet configuration state
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const sheetDataState = useSheetData(sheetUrl, apiKey);

  // Auto-route to shared article detail page if direct link URL query param exists
  React.useEffect(() => {
    if (sheetDataState.allItems.length > 0 && !selectedCardItem) {
      const urlParams = new URLSearchParams(window.location.search);
      const articleId = urlParams.get('article');
      if (articleId) {
        const foundItem = sheetDataState.allItems.find(i => i.id === articleId || i.id.startsWith(articleId));
        if (foundItem) {
          setSelectedCardItem(foundItem);
        }
      }
    }
  }, [sheetDataState.allItems]);

  const handleFocusSearch = () => {
    setActiveTab('explore');
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      const section = document.getElementById('collection-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleCardClick = (item: ContentItem) => {
    setSelectedCardItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSettings = (newSheetUrl: string, newApiKey: string) => {
    setSheetUrl(newSheetUrl);
    setApiKey(newApiKey);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Dynamic 3D WebGL / Particle Background */}
      <ThreeDBackground />

      {/* Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedCardItem(null);
          setActiveTab(tab);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onFocusSearch={handleFocusSearch}
        sourceType={sheetDataState.rawApiResponse?.sourceType}
        totalItemsCount={sheetDataState.allItems.length}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow">
        {selectedCardItem ? (
          <ContentDetails
            item={selectedCardItem}
            allItems={sheetDataState.allItems}
            onBack={() => setSelectedCardItem(null)}
            onSelectRelated={handleCardClick}
          />
        ) : activeTab === 'about' ? (
          <About />
        ) : (
          <Home
            items={sheetDataState.items}
            allItems={sheetDataState.allItems}
            categories={sheetDataState.categories}
            authors={sheetDataState.authors}
            loading={sheetDataState.loading}
            error={sheetDataState.error}
            searchQuery={sheetDataState.searchQuery}
            setSearchQuery={sheetDataState.setSearchQuery}
            selectedCategory={sheetDataState.selectedCategory}
            setSelectedCategory={sheetDataState.setSelectedCategory}
            selectedAuthor={sheetDataState.selectedAuthor}
            setSelectedAuthor={sheetDataState.setSelectedAuthor}
            quickFilter={sheetDataState.quickFilter}
            setQuickFilter={sheetDataState.setQuickFilter}
            sortOption={sheetDataState.sortOption}
            setSortOption={sheetDataState.setSortOption}
            clearFilters={sheetDataState.clearFilters}
            onRetry={sheetDataState.refresh}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onCardClick={handleCardClick}
            searchRef={searchInputRef}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SheetSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSheetUrl={sheetUrl}
        currentApiKey={apiKey}
        onSave={handleSaveSettings}
        sourceType={sheetDataState.rawApiResponse?.sourceType}
      />

      {/* Footer */}
      <Footer setActiveTab={(tab) => {
        setSelectedCardItem(null);
        setActiveTab(tab);
      }} />

    </div>
  );
}

export default App;
