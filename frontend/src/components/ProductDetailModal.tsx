import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Zap, 
  Phone, 
  FileText, 
  Table as TableIcon,
  HelpCircle,
  Download
} from 'lucide-react';
import { ProductItem } from '../types';
import { downloadProductSpecSheet } from '../utils/downloadSpecSheet';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onSelectProductForQuote: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onSelectProductForQuote
}) => {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  if (!product) return null;

  const currentImg = selectedImg || product.image;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-[#005696] text-white">
              {product.brand}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase truncate max-w-[180px] sm:max-w-none">
              {product.subCategory || product.category}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/80 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 sm:space-y-8">
          
          {/* Top Overview: Image + Key Information */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Gallery / Image Column */}
            <div className="md:col-span-5 space-y-3">
              <div className="aspect-square bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-center overflow-hidden">
                <img
                  src={currentImg}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Gallery Thumbnails */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {product.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImg(img)}
                      className={`w-14 h-14 rounded-xl border p-1 shrink-0 overflow-hidden transition-all ${
                        currentImg === img 
                          ? 'border-[#005696] ring-2 ring-sky-200 scale-105' 
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Warranty Guarantee Pill */}
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#005696] shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-[#005696]">Official Brand Warranty</div>
                  <div className="text-slate-600">{product.warranty || '2 Years Replacement Warranty'}</div>
                </div>
              </div>
            </div>

            {/* Product Details Column */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {product.name}
                </h2>
                {product.capacity && (
                  <div className="inline-block mt-2 text-xs font-extrabold text-[#e65100] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    Capacity: {product.capacity}
                  </div>
                )}
                {product.tagline && (
                  <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 italic">
                    "{product.tagline}"
                  </p>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {product.description}
              </p>

              {/* Key Features Bullets */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Key Capabilities & Protections
                </h4>
                <ul className="space-y-1.5">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick Action CTAs */}
              <div className="pt-3 flex flex-wrap items-stretch sm:items-center gap-2.5">
                <button
                  onClick={() => {
                    onClose();
                    onSelectProductForQuote(product);
                  }}
                  className="bg-[#ea580c] hover:bg-[#c2410c] text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                  <span>Request Price & Installation Quote</span>
                </button>
                <button
                  onClick={() => downloadProductSpecSheet(product)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-98"
                >
                  <Download className="w-4 h-4 text-[#004b87]" />
                  <span>Download Spec Sheet</span>
                </button>
                <a
                  href="tel:+919500087723"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 active:scale-98"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>Call: 9500087723</span>
                </a>
              </div>
            </div>
          </div>

          {/* Technical Specifications Section */}
          {product.detailedSpecTables && product.detailedSpecTables.length > 0 ? (
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
                <FileText className="w-5 h-5 text-[#004b87]" />
                <h3>Complete Electrical & Technical Specifications</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {product.detailedSpecTables.map((table, tIdx) => (
                  <div key={tIdx} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      {table.title}
                    </div>
                    <div className="divide-y divide-slate-200">
                      {table.rows.map((r, rIdx) => (
                        <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 px-4 py-2 text-xs">
                          <span className="font-semibold text-slate-600">{r.label}</span>
                          <span className="sm:col-span-2 text-slate-900 font-medium">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : product.specs ? (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
                <FileText className="w-5 h-5 text-[#005696]" />
                <h3>Technical Specifications</h3>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 divide-y divide-slate-200 overflow-hidden">
                {Object.entries(product.specs).map(([k, v], idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 px-4 py-2 text-xs">
                    <span className="font-semibold text-slate-600">{k}</span>
                    <span className="sm:col-span-2 text-slate-900 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Load Chart / Runtime Curves Table */}
          {product.loadChart && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900">
                  <TableIcon className="w-5 h-5 text-[#e65100]" />
                  <h3>Appliance Load Capacity & Backup Chart</h3>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 no-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#005696] text-white">
                      {product.loadChart.headers.map((h, i) => (
                        <th key={i} className="px-4 py-2.5 font-bold border-b border-blue-800 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {product.loadChart.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-2 font-medium text-slate-800 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Need advice on sizing for your premises? Call our Chennai engineering office.</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
