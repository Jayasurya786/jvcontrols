import React from 'react';
import { X, Sparkles, Check, Download, Zap, Trash2 } from 'lucide-react';
import { ProductItem } from '../types';
import { downloadProductSpecSheet } from '../utils/downloadSpecSheet';

interface ProductComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onSelectForQuote: (product: ProductItem) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  isOpen,
  onClose,
  products,
  onRemoveProduct,
  onClearAll,
  onSelectForQuote,
}) => {
  if (!isOpen) return null;

  const getSystemVoltage = (p: ProductItem) => {
    if (p.specs?.['Nominal Battery Voltage']) return p.specs['Nominal Battery Voltage'];
    if (p.specs?.['Battery Voltage']) return p.specs['Battery Voltage'];
    if (p.specs?.['Voltage']) return p.specs['Voltage'];
    if (p.specs?.['DC Voltage']) return p.specs['DC Voltage'];
    if (p.category.includes('battery')) return '12V DC Block';
    if (p.capacity?.includes('10000VA') || p.capacity?.includes('10 kVA')) return '192V DC Bus';
    if (p.capacity?.includes('5000VA') || p.capacity?.includes('5 kVA')) return '96V / 192V DC';
    if (p.capacity?.includes('1400VA') || p.capacity?.includes('1500VA')) return '24V DC (2x12V)';
    return '12V DC (Single Battery)';
  };

  const getWaveform = (p: ProductItem) => {
    if (p.category === 'ups') return 'Double Conversion Online (Pure Sine Wave)';
    if (p.specs?.['Wave Form'] || p.specs?.['Waveform']) return p.specs['Wave Form'] || p.specs['Waveform'];
    if (p.name.toLowerCase().includes('sine wave') || p.description.toLowerCase().includes('sine wave')) {
      return 'Pure Sine Wave';
    }
    return 'Digital Square / Modified Sine Wave';
  };

  const getApplication = (p: ProductItem) => {
    if (p.category === 'ups') return 'IT Servers, Data Centers, Diagnostic Labs, CNC';
    if (p.category.includes('battery')) return 'Long Duration Cyclic Backup for Inverter & UPS';
    if (p.capacity?.includes('10000VA') || p.capacity?.includes('5000VA')) return 'Commercial Offices, Petrol Pumps, Clinics';
    if (p.capacity?.includes('1400VA')) return '2-3 BHK Homes, Laser Printers, Large TVs';
    return '1-2 BHK Homes, Lights, Fans, Desktop PCs';
  };

  const getWarranty = (p: ProductItem) => {
    if (p.specs?.['Warranty']) return p.specs['Warranty'];
    if (p.name.toLowerCase().includes('tubular') || p.description.toLowerCase().includes('tubular')) {
      return '36 to 54 Months (Manufacturer Onsite)';
    }
    if (p.category === 'smf-battery') return '24 to 36 Months Replacement Guarantee';
    if (p.category === 'ups') return '2 Years Comprehensive (UPS & Electronics)';
    return '24 Months Comprehensive Manufacturer Warranty';
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Power System Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Comparing {products.length} {products.length === 1 ? 'model' : 'models'} side-by-side (Select up to 4 models)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {products.length > 0 && (
              <button
                onClick={onClearAll}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 rounded-full transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-x-auto overflow-y-auto flex-1">
          {products.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No products selected for comparison</h3>
              <p className="text-xs max-w-sm mx-auto">
                Browse our product catalog and click the "+ Compare" button on any product card to view side-by-side technical differences.
              </p>
            </div>
          ) : (
            <div className="min-w-[650px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left w-48 bg-slate-100/70 rounded-l-xl text-xs font-black uppercase text-slate-600 tracking-wider">
                      Specifications
                    </th>
                    {products.map((p) => (
                      <th
                        key={p.id}
                        className="p-4 text-center bg-slate-50 border-l border-slate-200 align-top relative group"
                        style={{ width: `${80 / products.length}%` }}
                      >
                        <button
                          onClick={() => onRemoveProduct(p.id)}
                          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors shadow-xs"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="h-28 flex items-center justify-center p-2 mb-2">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#004b87] text-white mb-1 shadow-xs">
                          {p.brand}
                        </span>

                        <h4 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 min-h-[2.5rem]">
                          {p.name}
                        </h4>

                        <div className="mt-2 flex flex-col gap-1.5">
                          <button
                            onClick={() => onSelectForQuote(p)}
                            className="w-full py-2.5 px-3 bg-[#ea580c] hover:bg-[#c2410c] text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                            <span>Request Quote</span>
                          </button>
                          <button
                            onClick={() => downloadProductSpecSheet(p)}
                            className="w-full py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Spec Sheet PDF</span>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-xs">
                  {/* Category */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50">Category</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 font-semibold text-slate-800">
                        {p.subCategory || p.category.toUpperCase()}
                      </td>
                    ))}
                  </tr>

                  {/* Capacity */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50">Rated Capacity</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 font-black text-[#004b87]">
                        {p.capacity || 'Standard Rating'}
                      </td>
                    ))}
                  </tr>

                  {/* System DC Voltage */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50">System DC Bus / Voltage</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-700">
                        {getSystemVoltage(p)}
                      </td>
                    ))}
                  </tr>

                  {/* Output Waveform */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50">Output Waveform</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 font-medium text-slate-700">
                        {getWaveform(p)}
                      </td>
                    ))}
                  </tr>

                  {/* Best Suited For */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50">Ideal Applications</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 text-slate-600 text-[11px]">
                        {getApplication(p)}
                      </td>
                    ))}
                  </tr>

                  {/* Warranty */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50">Warranty Coverage</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-center border-l border-slate-200 font-bold text-emerald-700">
                        {getWarranty(p)}
                      </td>
                    ))}
                  </tr>

                  {/* Key Highlights */}
                  <tr>
                    <td className="p-3 font-bold text-slate-700 bg-slate-50 align-top">Key Highlights</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-left border-l border-slate-200 align-top">
                        <ul className="space-y-1">
                          {p.features.slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

