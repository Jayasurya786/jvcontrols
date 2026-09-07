import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  Check, 
  Sparkles, 
  Zap, 
  Info, 
  Layers, 
  Cpu, 
  Battery, 
  ShieldCheck, 
  RefreshCcw,
  Scale,
  Download,
  X
} from 'lucide-react';
import { PRODUCTS, CATEGORIES, BRANDS } from '../data/productsData';
import { ProductItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { downloadProductSpecSheet } from '../utils/downloadSpecSheet';

interface ProductCatalogProps {
  selectedCategory: string;
  selectedBrand: string;
  onSelectCategory: (cat: string) => void;
  onSelectBrand: (brand: string) => void;
  onViewProductDetails: (product: ProductItem) => void;
  onOpenQuoteModalForProduct: (product: ProductItem) => void;
  comparisonProducts?: ProductItem[];
  onToggleCompare?: (product: ProductItem) => void;
  onOpenComparisonModal?: () => void;
  onClearComparison?: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  selectedCategory,
  selectedBrand,
  onSelectCategory,
  onSelectBrand,
  onViewProductDetails,
  onOpenQuoteModalForProduct,
  comparisonProducts = [],
  onToggleCompare,
  onOpenComparisonModal,
  onClearComparison,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products based on Category, Brand, and Search
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((item) => {
      // Category check
      const matchesCategory = 
        selectedCategory === 'all' || item.category === selectedCategory;

      // Brand check
      const matchesBrand = 
        selectedBrand === 'All Brands' || 
        item.brand.toLowerCase().includes(selectedBrand.toLowerCase()) ||
        (selectedBrand === 'Delta / Vertiv' && (item.brand.includes('Delta') || item.brand.includes('Vertiv')));

      // Search query check
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.brand.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.capacity && item.capacity.toLowerCase().includes(query)) ||
        (item.tagline && item.tagline.toLowerCase().includes(query)) ||
        item.features.some(f => f.toLowerCase().includes(query));

      return matchesCategory && matchesBrand && matchesSearch;
    });
  }, [selectedCategory, selectedBrand, searchQuery]);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'ups': return <Cpu className="w-4 h-4" />;
      case 'inverter': return <Zap className="w-4 h-4" />;
      case 'tubular-battery': return <Battery className="w-4 h-4" />;
      case 'smf-battery': return <ShieldCheck className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const isProductCompared = (id: string) => {
    return comparisonProducts.some((p) => p.id === id);
  };

  return (
    <section id="products-section" className="py-16 sm:py-20 bg-slate-50 border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header with Clear Visual Hierarchy */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#004b87] border border-blue-200/80 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#004b87]" />
            <span>{t.catalog.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {t.catalog.title}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t.catalog.subtitle}
          </p>
        </div>

        {/* Category Navigation Tabs with Smooth Overflow */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 sm:gap-2.5 pb-3 mb-7 no-scrollbar snap-x">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 shrink-0 snap-start active:scale-95 ${
                selectedCategory === cat.id
                  ? 'bg-[#004b87] text-white shadow-lg shadow-blue-900/30 ring-2 ring-[#004b87]/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/80 shadow-xs'
              }`}
            >
              {getCategoryIcon(cat.id)}
              <span>{cat.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Command Center */}
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Live Search Bar */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.catalog.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#004b87] focus:bg-white transition-all text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results Counter & Comparison Trigger */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              {comparisonProducts.length > 0 && onOpenComparisonModal && (
                <button
                  onClick={onOpenComparisonModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-sm transition-all active:scale-95"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Compare ({comparisonProducts.length})</span>
                </button>
              )}
              <div className="text-xs font-semibold text-slate-500">
                Found <span className="text-[#004b87] font-extrabold text-sm">{filteredProducts.length}</span> models
              </div>
            </div>
          </div>

          {/* Brand Filter Pills Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Brands:
            </span>
            {BRANDS.map((brand) => (
              <button
                key={brand}
                onClick={() => onSelectBrand(brand)}
                className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all text-[11px] sm:text-xs shrink-0 ${
                  selectedBrand === brand
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No matching systems found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
              We couldn't find any products matching "{searchQuery}". Try selecting "All Brands" or changing the category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('all');
                onSelectBrand('All Brands');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#005696] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#004275] transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 items-stretch">
            {filteredProducts.map((product) => {
              const compared = isProductCompared(product.id);
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-2xl card-hover-lift transition-all duration-300 flex flex-col h-full group ${
                    compared ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-200/80 hover:border-blue-400/50'
                  }`}
                >
                  {/* Product Image Frame */}
                  <div className="relative aspect-[4/3] bg-gradient-to-b from-white to-slate-50/80 p-6 flex items-center justify-center border-b border-slate-100 overflow-hidden shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="max-h-36 max-w-[85%] object-contain group-hover:scale-108 transition-transform duration-500 cursor-pointer filter drop-shadow-sm"
                      onClick={() => onViewProductDetails(product)}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    
                    {/* Brand & Capacity Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 max-w-[70%]">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#004b87] text-white shadow-sm">
                        {product.brand}
                      </span>
                      {product.capacity && (
                        <span className="text-[10px] font-extrabold px-2 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200 shadow-sm">
                          {product.capacity}
                        </span>
                      )}
                    </div>

                    {/* Compare & Stock Actions */}
                    <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                      {onToggleCompare && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(product);
                          }}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all flex items-center gap-1 shadow-xs active:scale-95 ${
                            compared
                              ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-600'
                              : 'bg-white/90 hover:bg-white text-slate-700 border border-slate-200'
                          }`}
                          title="Compare with another model"
                        >
                          <Scale className="w-3 h-3" />
                          <span>{compared ? t.catalog.comparing : t.catalog.compareBtn}</span>
                        </button>
                      )}

                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {t.catalog.inStock}
                      </span>
                    </div>
                  </div>

                  {/* Card Body with Consistent Vertical Alignment */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Subcategory Label & Quick PDF */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        <span>{product.subCategory || product.category}</span>
                        <button
                          onClick={() => downloadProductSpecSheet(product)}
                          className="text-slate-400 hover:text-[#004b87] flex items-center gap-1 lowercase text-[10px] font-medium transition-colors"
                          title="Download Spec Sheet"
                        >
                          <Download className="w-3 h-3" />
                          <span>spec</span>
                        </button>
                      </div>

                      {/* Product Name (Guaranteed 2 lines max height) */}
                      <h3 
                        onClick={() => onViewProductDetails(product)}
                        className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#004b87] transition-colors cursor-pointer leading-snug line-clamp-2 min-h-[3rem]"
                      >
                        {product.name}
                      </h3>

                      {/* Tagline / Subtitle */}
                      {product.tagline && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2 italic">
                          "{product.tagline}"
                        </p>
                      )}

                      {/* Top 3 Feature Bullets */}
                      <div className="mt-3.5 space-y-1.5 pt-3 border-t border-slate-100">
                        {product.features.slice(0, 3).map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-600">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Bottom CTA Buttons (Always aligned at the bottom) */}
                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-auto">
                      <button
                        onClick={() => onViewProductDetails(product)}
                        className="flex-1 py-3 px-3 rounded-xl border border-slate-200 hover:border-[#004b87] hover:bg-blue-50/70 text-slate-700 hover:text-[#004b87] font-bold text-xs transition-all flex items-center justify-center gap-1 active:scale-98"
                      >
                        <span>{t.catalog.viewSpecs}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onOpenQuoteModalForProduct(product)}
                        className="py-3 px-4 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-xs shadow-md shadow-orange-950/20 hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                        <span>{t.catalog.getQuote}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Comparison Bar (when items are selected) */}
      {comparisonProducts.length > 0 && onOpenComparisonModal && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 px-5 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200 max-w-[90vw]">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold text-amber-400">{comparisonProducts.length}</span>
              <span className="text-slate-300 ml-1">selected for comparison</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {comparisonProducts.map((p) => (
              <div key={p.id} className="w-8 h-8 rounded-lg bg-white p-1 border border-slate-600 shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenComparisonModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-colors whitespace-nowrap shadow-sm"
            >
              Compare Side-by-Side
            </button>
            {onClearComparison && (
              <button
                onClick={onClearComparison}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Clear comparison selection"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
