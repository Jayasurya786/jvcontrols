import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { BrandBadgesSection } from './components/BrandBadgesSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductComparisonModal } from './components/ProductComparisonModal';
import { LoadCalculator } from './components/LoadCalculator';
import { ServicesSection } from './components/ServicesSection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { AboutSection } from './components/AboutSection';
import { ContactAndQuote } from './components/ContactAndQuote';
import { AMCServiceModal } from './components/AMCServiceModal';
import { QuoteCallbackModal } from './components/QuoteCallbackModal';
import { AuthModal } from './components/AuthModal';
import { UnifiedPortalModal } from './components/UnifiedPortalModal';
import { Footer } from './components/Footer';
import { QuickContactFloating } from './components/QuickContactFloating';
import { ProductItem } from './types';
import { X, Sparkles } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('All Brands');
  const [modalProduct, setModalProduct] = useState<ProductItem | null>(null);

  // Comparison state
  const [comparisonProducts, setComparisonProducts] = useState<ProductItem[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // AMC Service Modal state
  const [amcModalOpen, setAmcModalOpen] = useState(false);

  // Auth & Unified Portal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');
  const [portalOpen, setPortalOpen] = useState(false);

  // Quote modal state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<ProductItem | null>(null);
  const [quoteLoadData, setQuoteLoadData] = useState<{
    watts: number;
    va: number;
    ah: number;
    hours: number;
  } | null>(null);
  const [quoteService, setQuoteService] = useState<string | null>(null);

  // Tab and filter handler
  const handleSelectTab = (tab: string, cat?: string, brand?: string) => {
    setActiveTab(tab);
    if (cat) setSelectedCategory(cat);
    if (brand) setSelectedBrand(brand);

    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(`${tab}-section`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleToggleCompare = (product: ProductItem) => {
    setComparisonProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        alert('You can compare up to 4 models simultaneously. Please remove one to add another.');
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleRemoveFromCompare = (id: string) => {
    setComparisonProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearComparison = () => {
    setComparisonProducts([]);
  };

  const handleOpenQuoteForProduct = (product: ProductItem) => {
    setQuoteProduct(product);
    setQuoteLoadData(null);
    setQuoteService(null);
    setQuoteModalOpen(true);
  };

  const handleOpenQuoteForLoad = (watts: number, va: number, ah: number, hours: number) => {
    setQuoteProduct(null);
    setQuoteLoadData({ watts, va, ah, hours });
    setQuoteService(null);
    setQuoteModalOpen(true);
  };

  const handleOpenQuoteForService = (serviceName?: string) => {
    setQuoteProduct(null);
    setQuoteLoadData(null);
    setQuoteService(serviceName || 'General Service & AMC');
    setQuoteModalOpen(true);
  };

  const handleGeneralQuote = () => {
    setQuoteProduct(null);
    setQuoteLoadData(null);
    setQuoteService(null);
    setQuoteModalOpen(true);
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthDefaultTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden flex flex-col bg-slate-50 selection:bg-amber-400 selection:text-slate-900 font-sans antialiased text-slate-800">
      {/* Top Main Navigation Bar with Tamil/English toggle & AMC */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenQuoteModal={handleGeneralQuote}
        onOpenAMCModal={() => setAmcModalOpen(true)}
        onOpenAuthModal={handleOpenAuth}
        onOpenPortal={() => setPortalOpen(true)}
      />

      <main className="flex-grow">
        {/* Full Single-Page / Tab-Filtered Views */}
        {activeTab === 'home' && (
          <>
            <HeroSlider
              onExploreProducts={() => handleSelectTab('products')}
              onOpenCalculator={() => handleSelectTab('calculator')}
              onOpenQuoteModal={handleGeneralQuote}
            />

            {/* Authorized Dealerships & Brand Badges */}
            <BrandBadgesSection />

            {/* Product Catalog Section with Compare Support */}
            <ProductCatalog
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              onSelectCategory={setSelectedCategory}
              onSelectBrand={setSelectedBrand}
              onViewProductDetails={setModalProduct}
              onOpenQuoteModalForProduct={handleOpenQuoteForProduct}
              comparisonProducts={comparisonProducts}
              onToggleCompare={handleToggleCompare}
              onOpenComparisonModal={() => setComparisonModalOpen(true)}
              onClearComparison={handleClearComparison}
            />

            {/* Interactive Load Calculator */}
            <LoadCalculator
              onQuoteWithCalculatedLoad={handleOpenQuoteForLoad}
            />

            {/* Services & AMC Section */}
            <ServicesSection
              onBookService={handleOpenQuoteForService}
            />

            {/* Installation Showcase / Photo Gallery */}
            <GallerySection
              onOpenQuote={handleGeneralQuote}
            />

            {/* Client Testimonials & Case Studies Carousel */}
            <TestimonialsSection />

            {/* About Section */}
            <AboutSection
              onContactClick={() => handleSelectTab('contact')}
            />

            {/* Contact, WhatsApp Notification & Google Maps Embed Section */}
            <ContactAndQuote
              initialProduct={quoteProduct}
              initialLoadData={quoteLoadData}
              initialService={quoteService}
            />
          </>
        )}

        {activeTab === 'about' && (
          <div className="pt-2">
            <AboutSection onContactClick={() => handleSelectTab('contact')} />
            <BrandBadgesSection />
            <TestimonialsSection />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="pt-2">
            <ProductCatalog
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              onSelectCategory={setSelectedCategory}
              onSelectBrand={setSelectedBrand}
              onViewProductDetails={setModalProduct}
              onOpenQuoteModalForProduct={handleOpenQuoteForProduct}
              comparisonProducts={comparisonProducts}
              onToggleCompare={handleToggleCompare}
              onOpenComparisonModal={() => setComparisonModalOpen(true)}
              onClearComparison={handleClearComparison}
            />
          </div>
        )}

        {activeTab === 'services' && (
          <div className="pt-2">
            <ServicesSection onBookService={handleOpenQuoteForService} />
            <GallerySection onOpenQuote={handleGeneralQuote} />
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="pt-2">
            <LoadCalculator onQuoteWithCalculatedLoad={handleOpenQuoteForLoad} />
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="pt-2">
            <ContactAndQuote
              initialProduct={quoteProduct}
              initialLoadData={quoteLoadData}
              initialService={quoteService}
            />
          </div>
        )}
      </main>

      {/* Product Detail Modal (with Spec Sheet Download button) */}
      <ProductDetailModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
        onSelectProductForQuote={handleOpenQuoteForProduct}
      />

      {/* Product Comparison Modal */}
      <ProductComparisonModal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        products={comparisonProducts}
        onRemoveProduct={handleRemoveFromCompare}
        onClearAll={handleClearComparison}
        onSelectForQuote={(p) => {
          setComparisonModalOpen(false);
          handleOpenQuoteForProduct(p);
        }}
      />

      {/* Dedicated AMC & Emergency Breakdown Modal */}
      <AMCServiceModal
        isOpen={amcModalOpen}
        onClose={() => setAmcModalOpen(false)}
      />

      {/* Dedicated Responsive Quotation / Callback Modal */}
      <QuoteCallbackModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        product={quoteProduct}
        loadData={quoteLoadData}
        service={quoteService}
      />

      {/* Unified Authentication Modal (with 6-Digit Email OTP) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />

      {/* Unified Customer & Administrator Portal */}
      <UnifiedPortalModal
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
        onNewInquiryClick={() => {
          setPortalOpen(false);
          handleGeneralQuote();
        }}
      />

      {/* Floating Quick Action Contacts (WhatsApp & Phone) */}
      <QuickContactFloating />

      {/* Global Footer */}
      <Footer
        onNavClick={handleSelectTab}
        onOpenQuoteModal={handleGeneralQuote}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
