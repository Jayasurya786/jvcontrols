import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  FileText, 
  LogOut, 
  Loader2, 
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Users,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  Calendar,
  ExternalLink,
  MessageSquare,
  Zap,
  MapPin,
  Cpu,
  Battery,
  Package,
  PlusCircle,
  Trash2,
  Edit3,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  ArrowRight,
  Maximize2,
  Minimize2,
  CheckSquare,
  CalendarCheck,
  Clock3,
  CheckCheck,
  Bell,
  BellRing,
  Inbox,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UnifiedPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewInquiryClick: () => void;
}

export const UnifiedPortalModal: React.FC<UnifiedPortalModalProps> = ({
  isOpen,
  onClose,
  onNewInquiryClick,
}) => {
  const { user, token, isAdmin, logout } = useAuth();

  // Navigation tab state
  // If admin: default to 'admin-overview'; if customer: default to 'my-inquiries'
  const [activeTab, setActiveTab] = useState<string>('my-inquiries');

  // Customer Data state
  const [myInquiries, setMyInquiries] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);

  // Admin Data state (Only fetched & rendered if isAdmin)
  const [adminStats, setAdminStats] = useState<any>(null);
  const [allInquiries, setAllInquiries] = useState<any[]>([]);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [customerProducts, setCustomerProducts] = useState<any[]>([]);

  // Product Data Entry Form state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formCategory, setFormCategory] = useState('Online UPS');
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formWarrantyYears, setFormWarrantyYears] = useState<number>(1);
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [productFormSuccess, setProductFormSuccess] = useState<string | null>(null);

  // Filter & Search for Customer Products
  const [prodSearchQuery, setProdSearchQuery] = useState('');
  const [prodFilterStatus, setProdFilterStatus] = useState('ALL');
  const [copiedSerial, setCopiedSerial] = useState<string | null>(null);

  // UI & Filter states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  // Ticket Filter & Search states
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketFilterStatus, setTicketFilterStatus] = useState('ALL');

  // Service tracking states
  const [updatingServiceKey, setUpdatingServiceKey] = useState<string | null>(null);
  const [expandedProductServices, setExpandedProductServices] = useState<{ [id: string]: boolean }>({});
  const [productServiceFilter, setProductServiceFilter] = useState<{ [id: string]: 'ALL' | 'PENDING' | 'UPCOMING' | 'SERVICED' }>({});
  const [sendingEmailKey, setSendingEmailKey] = useState<string | null>(null);
  const [emailFeedback, setEmailFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Notification states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'ALL' | 'INQUIRY' | 'SERVICE' | 'WARRANTY'>('ALL');
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('jvc_admin_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleExpandServices = (id: string) => {
    setExpandedProductServices((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Set default tab when opening
  useEffect(() => {
    if (isOpen) {
      if (isAdmin) {
        setActiveTab('admin-overview');
      } else {
        setActiveTab('my-inquiries');
      }
      loadPortalData();
    }
  }, [isOpen, isAdmin, token]);

  const safeJson = async (res: Response) => {
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  };

  const loadPortalData = async () => {
    if (!token) return;
    setIsLoading(true);

    try {
      // 1. Load user's profile and own inquiries & products
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await safeJson(res);
        setMyInquiries(data.inquiries || []);
        setMyTickets(data.tickets || []);
        let prods = data.registeredProducts || [];

        // Also query /api/customer/my-products to ensure any email or phone linked products are loaded
        try {
          const pRes = await fetch('/api/customer/my-products', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pRes.ok) {
            const pData = await safeJson(pRes);
            if (pData.products && pData.products.length > 0) {
              prods = pData.products;
            }
          }
        } catch (pErr) {
          console.error('Error fetching /api/customer/my-products:', pErr);
        }

        setMyProducts(prods);
      }

      // 2. If user is authorized admin, load comprehensive management data
      if (isAdmin) {
        const [statsRes, inqRes, tixRes, usersRes, prodsRes, notifRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/inquiries', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/tickets', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/customer-products', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/notifications/read', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statsRes.ok) {
          const s = await safeJson(statsRes);
          if (s.stats) setAdminStats(s.stats);
        }
        if (inqRes.ok) {
          const inqData = await safeJson(inqRes);
          setAllInquiries(inqData.inquiries || []);
        }
        if (tixRes.ok) {
          const tixData = await safeJson(tixRes);
          setAllTickets(tixData.tickets || []);
        }
        if (usersRes.ok) {
          const uData = await safeJson(usersRes);
          setAllUsers(uData.users || []);
        }
        if (prodsRes.ok) {
          const pData = await safeJson(prodsRes);
          setCustomerProducts(pData.products || []);
        }
        if (notifRes.ok) {
          const nData = await safeJson(notifRes);
          if (Array.isArray(nData.readIds)) {
            setReadNotificationIds((prev) => {
              const combined = Array.from(new Set([...prev, ...nData.readIds]));
              try {
                localStorage.setItem('jvc_admin_read_notifications', JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Admin status update handlers
  const handleUpdateInquiryStatus = async (id: string, newStatus: string) => {
    setStatusUpdatingId(id);
    const targetStr = String(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAllInquiries((prev) =>
          prev.map((item) =>
            String(item._id) === targetStr || String(item.inquiryId) === targetStr || String(item.id) === targetStr
              ? { ...item, status: newStatus }
              : item
          )
        );
        // Refresh portal data in background
        loadPortalData();
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleUpdateTicketStatus = async (id: string, newStatus: string, notes?: string) => {
    setStatusUpdatingId(id);
    const targetStr = String(id);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      const data = await safeJson(res);
      if (res.ok) {
        setAllTickets((prev) =>
          prev.map((item) =>
            String(item._id) === targetStr || String(item.ticketId) === targetStr || String(item.id) === targetStr
              ? { ...item, status: newStatus, ...(notes ? { issueDescription: `${item.issueDescription || ''}\n[Note]: ${notes}` } : {}) }
              : item
          )
        );
        setMyTickets((prev) =>
          prev.map((item) =>
            String(item._id) === targetStr || String(item.ticketId) === targetStr || String(item.id) === targetStr
              ? { ...item, status: newStatus }
              : item
          )
        );
        // Refresh portal data in background
        loadPortalData();
      } else {
        alert(data.error || 'Failed to update ticket status');
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // 6-Month Periodic Warranty Service Toggle Handler
  const handleToggleServiceStatus = async (
    productId: string,
    serviceNumber: number,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === 'SERVICED' ? 'DEFAULT' : 'SERVICED';
    const key = `${productId}-${serviceNumber}`;
    setUpdatingServiceKey(key);

    try {
      const res = await fetch(`/api/admin/customer-products/${productId}/service/${serviceNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          technician: user?.name ? `${user.name} (JV Controls)` : 'Field Engineer',
          notes: newStatus === 'SERVICED' ? 'Periodic 6-month checkup completed' : '',
        }),
      });

      const data = await safeJson(res);
      if (res.ok && data.product) {
        setCustomerProducts((prev) =>
          prev.map((p) =>
            p._id === productId || p.id === productId || p.serialNumber === productId
              ? data.product
              : p
          )
        );
        setMyProducts((prev) =>
          prev.map((p) =>
            p._id === productId || p.id === productId || p.serialNumber === productId
              ? data.product
              : p
          )
        );
      } else {
        alert(data.error || 'Failed to update service milestone');
      }
    } catch (err) {
      console.error('Error toggling service status:', err);
    } finally {
      setUpdatingServiceKey(null);
    }
  };

  const showEmailFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setEmailFeedback({ message, type });
    setTimeout(() => setEmailFeedback(null), 4500);
  };

  const handleSendServiceMilestoneEmail = async (productId: string, serviceNumber: number) => {
    if (!token) return;
    const key = `service-${productId}-${serviceNumber}`;
    setSendingEmailKey(key);

    try {
      const res = await fetch(`/api/admin/customer-products/${productId}/service/${serviceNumber}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target: 'both' }),
      });

      const data = await safeJson(res);
      if (res.ok && data.product) {
        setCustomerProducts((prev) =>
          prev.map((p) =>
            p._id === productId || p.id === productId || p.serialNumber === productId
              ? data.product
              : p
          )
        );
        showEmailFeedback(
          `✓ 6-Month Service #${serviceNumber} alert email sent to Customer & Admin!`,
          'success'
        );
      } else {
        showEmailFeedback(data.error || 'Failed to dispatch service notification email', 'error');
      }
    } catch (err: any) {
      showEmailFeedback(err.message || 'Error dispatching service email', 'error');
    } finally {
      setSendingEmailKey(null);
    }
  };

  const handleSendWarrantyExpiryEmail = async (productId: string) => {
    if (!token) return;
    const key = `warranty-${productId}`;
    setSendingEmailKey(key);

    try {
      const res = await fetch(`/api/admin/customer-products/${productId}/send-warranty-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target: 'both' }),
      });

      const data = await safeJson(res);
      if (res.ok && data.product) {
        setCustomerProducts((prev) =>
          prev.map((p) =>
            p._id === productId || p.id === productId || p.serialNumber === productId
              ? data.product
              : p
          )
        );
        showEmailFeedback(
          '✓ Warranty expiry notice email sent to Customer & Admin!',
          'success'
        );
      } else {
        showEmailFeedback(data.error || 'Failed to dispatch warranty expiry email', 'error');
      }
    } catch (err: any) {
      showEmailFeedback(err.message || 'Error dispatching warranty email', 'error');
    } finally {
      setSendingEmailKey(null);
    }
  };

  const handleScanAndDispatchAllEmails = async () => {
    if (!token) return;
    setSendingEmailKey('scan-all');

    try {
      const res = await fetch('/api/admin/notifications/scan-and-send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await safeJson(res);
      if (res.ok) {
        showEmailFeedback(data.message || 'Automated email scan completed!', 'success');
        loadPortalData();
      } else {
        showEmailFeedback(data.error || 'Failed to execute email scan', 'error');
      }
    } catch (err: any) {
      showEmailFeedback(err.message || 'Error executing email scan', 'error');
    } finally {
      setSendingEmailKey(null);
    }
  };

  // Helper to get or compute 6-month service schedule
  const getOrGenerateServiceSchedule = (prod: any) => {
    if (prod.serviceSchedule && prod.serviceSchedule.length > 0) {
      return prod.serviceSchedule;
    }
    const years = Number(prod.warrantyYears) || 1;
    const count = Math.max(1, Math.round(years * 2));
    const schedule = [];
    const pDate = prod.purchaseDate ? new Date(prod.purchaseDate) : new Date();

    for (let i = 1; i <= count; i++) {
      const dueDate = new Date(pDate);
      dueDate.setMonth(dueDate.getMonth() + i * 6);
      schedule.push({
        serviceNumber: i,
        monthInterval: i * 6,
        label: `Service #${i} (${i * 6}th Month)`,
        dueDate: dueDate.toISOString(),
        status: 'DEFAULT',
        servicedDate: null,
        technician: '',
        notes: '',
      });
    }
    return schedule;
  };

  // Helper to evaluate 6-month service milestone status using current date and time
  const getServiceMilestoneInfo = (service: any) => {
    const isServiced = service.status === 'SERVICED';
    if (isServiced) {
      return {
        statusKey: 'SERVICED',
        badgeText: 'SERVICED',
        badgeClass: 'bg-emerald-200 text-emerald-900 border border-emerald-300 font-black',
        cardClass: 'bg-emerald-50/60 border-emerald-300 text-emerald-950 ring-1 ring-emerald-200',
        iconBgClass: 'bg-emerald-600 text-white',
        statusLabel: service.servicedDate
          ? `✓ Done on ${new Date(service.servicedDate).toLocaleDateString('en-IN')}${service.technician ? ` (${service.technician})` : ''}`
          : '✓ Serviced & Completed',
        isOverdue: false,
        isDueSoon: false,
        isUpcoming: false,
        diffDays: 0,
      };
    }

    if (!service.dueDate) {
      return {
        statusKey: 'UPCOMING',
        badgeText: 'SCHEDULED',
        badgeClass: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
        cardClass: 'bg-white border-slate-200 text-slate-800 shadow-xs',
        iconBgClass: 'bg-slate-400 text-white',
        statusLabel: '🗓️ Scheduled Checkup',
        isOverdue: false,
        isDueSoon: false,
        isUpcoming: true,
        diffDays: 999,
      };
    }

    const now = new Date();
    const dueDate = new Date(service.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const daysOverdue = Math.abs(diffDays);
      return {
        statusKey: 'OVERDUE',
        badgeText: '🚨 OVERDUE',
        badgeClass: 'bg-rose-600 text-white border border-rose-700 shadow-xs animate-pulse font-black',
        cardClass: 'bg-rose-50/90 border-rose-300 text-rose-950 ring-2 ring-rose-300 shadow-xs',
        iconBgClass: 'bg-rose-600 text-white animate-pulse',
        statusLabel: `⚠️ Overdue by ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} — Immediate Action Required`,
        isOverdue: true,
        isDueSoon: false,
        isUpcoming: false,
        diffDays,
      };
    }

    if (diffDays <= 30) {
      return {
        statusKey: 'DUE_SOON',
        badgeText: diffDays === 0 ? '🔴 DUE TODAY' : `🔴 DUE IN ${diffDays}D`,
        badgeClass: 'bg-amber-500 text-slate-950 border border-amber-600 shadow-xs font-black',
        cardClass: 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-300 shadow-xs',
        iconBgClass: 'bg-amber-600 text-white',
        statusLabel: diffDays === 0 ? '🔴 Maintenance Checkup Due Today' : `⚠️ Maintenance Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`,
        isOverdue: false,
        isDueSoon: true,
        isUpcoming: false,
        diffDays,
      };
    }

    const monthsAway = Math.round(diffDays / 30);
    return {
      statusKey: 'UPCOMING',
      badgeText: '🗓️ UPCOMING',
      badgeClass: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
      cardClass: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-xs',
      iconBgClass: 'bg-slate-400 text-white',
      statusLabel: `🗓️ Scheduled Checkup (in ~${monthsAway} months)`,
      isOverdue: false,
      isDueSoon: false,
      isUpcoming: true,
      diffDays,
    };
  };

  // Helper to check if a product has any active pending (overdue or due within 30 days) service based on current date
  const hasProductPendingService = (prod: any) => {
    const schedule = getOrGenerateServiceSchedule(prod);
    return schedule.some((s: any) => {
      const info = getServiceMilestoneInfo(s);
      return info.isOverdue || info.isDueSoon;
    });
  };

  const PRODUCT_PRESETS = [
    { name: '1kVA True Online UPS (1:1)', category: 'Online UPS', warranty: 2 },
    { name: '2kVA True Online UPS (1:1)', category: 'Online UPS', warranty: 2 },
    { name: '3kVA True Online UPS (1:1)', category: 'Online UPS', warranty: 2 },
    { name: '5kVA True Online UPS (1:1)', category: 'Online UPS', warranty: 2 },
    { name: '10kVA True Online UPS (3:1 / 3:3)', category: 'Online UPS', warranty: 3 },
    { name: 'Luminous Zelio+ 1100 Pure Sine Wave Inverter', category: 'Inverter', warranty: 2 },
    { name: 'Microtek Luxe 1400VA Sine Wave Inverter', category: 'Inverter', warranty: 2 },
    { name: 'Exide Inva Tubular 150Ah Battery (IT500)', category: 'Tubular Battery', warranty: 3 },
    { name: 'Amaron Current 150Ah Short Tubular Battery', category: 'Tubular Battery', warranty: 3 },
    { name: 'Rocket 12V 26Ah / 42Ah / 65Ah SMF Battery', category: 'SMF Battery', warranty: 2 },
    { name: '5kVA Servo Controlled Voltage Stabilizer', category: 'Servo Stabilizer', warranty: 3 },
  ];

  const resetProductForm = () => {
    setEditingProductId(null);
    setFormCustomerName('');
    setFormMobile('');
    setFormEmail('');
    setFormAddress('');
    setFormProductName('');
    setFormCategory('Online UPS');
    setFormSerialNumber('');
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    setFormWarrantyYears(1);
    setFormInvoiceNumber('');
    setFormNotes('');
    setProductFormError(null);
    setProductFormSuccess(null);
  };

  const handleOpenNewProductModal = () => {
    resetProductForm();
    setIsProductModalOpen(true);
  };

  const handleOpenEditProductModal = (prod: any) => {
    setEditingProductId(prod._id || prod.id);
    setFormCustomerName(prod.customerName || '');
    setFormMobile(prod.mobile || '');
    setFormEmail(prod.email || '');
    setFormAddress(prod.address || '');
    setFormProductName(prod.productName || '');
    setFormCategory(prod.category || 'Online UPS');
    setFormSerialNumber(prod.serialNumber || '');
    setFormPurchaseDate(
      prod.purchaseDate ? new Date(prod.purchaseDate).toISOString().split('T')[0] : ''
    );
    setFormWarrantyYears(prod.warrantyYears || 1);
    setFormInvoiceNumber(prod.invoiceNumber || '');
    setFormNotes(prod.notes || '');
    setProductFormError(null);
    setProductFormSuccess(null);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingProduct(true);
    setProductFormError(null);
    setProductFormSuccess(null);

    const payload = {
      customerName: formCustomerName,
      mobile: formMobile,
      email: formEmail,
      address: formAddress,
      productName: formProductName,
      category: formCategory,
      serialNumber: formSerialNumber.trim().toUpperCase(),
      purchaseDate: formPurchaseDate,
      warrantyYears: Number(formWarrantyYears),
      invoiceNumber: formInvoiceNumber,
      notes: formNotes,
    };

    try {
      const url = editingProductId
        ? `/api/admin/customer-products/${editingProductId}`
        : '/api/admin/customer-products';
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save customer product record');
      }

      setProductFormSuccess(
        editingProductId
          ? 'Customer product record updated successfully!'
          : 'New customer product & warranty registered successfully!'
      );

      loadPortalData();

      setTimeout(() => {
        setIsProductModalOpen(false);
        resetProductForm();
      }, 1000);
    } catch (err: any) {
      setProductFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, serial: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete customer product record (Serial: ${serial})? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/customer-products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || 'Failed to delete record');
      loadPortalData();
    } catch (err: any) {
      alert(err.message || 'Error deleting product record');
    }
  };

  const exportProductsToCSV = () => {
    if (!customerProducts.length) {
      alert('No customer product records to export.');
      return;
    }

    const headers = [
      'Customer Name',
      'Mobile Number',
      'Email',
      'Installation Address',
      'Product Name',
      'Category',
      'Serial Number',
      'Purchase Date',
      'Warranty (Years)',
      'Warranty Expiry Date',
      'Status',
      'Invoice No',
      'Notes',
    ];

    const rows = customerProducts.map((p) => [
      `"${(p.customerName || '').replace(/"/g, '""')}"`,
      `"${p.mobile || ''}"`,
      `"${p.email || ''}"`,
      `"${(p.address || '').replace(/"/g, '""')}"`,
      `"${(p.productName || '').replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      `"${p.serialNumber || ''}"`,
      p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString('en-IN') : '',
      p.warrantyYears || 1,
      p.warrantyExpiryDate ? new Date(p.warrantyExpiryDate).toLocaleDateString('en-IN') : '',
      new Date(p.warrantyExpiryDate) >= new Date() ? 'ACTIVE' : 'EXPIRED',
      `"${p.invoiceNumber || ''}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `JV_Controls_Customer_Products_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWarrantyCalculation = (pDateStr: string, years: number) => {
    if (!pDateStr) return null;
    const pDate = new Date(pDateStr);
    if (isNaN(pDate.getTime())) return null;
    const expDate = new Date(pDate);
    expDate.setFullYear(expDate.getFullYear() + Number(years));
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isActive = diffDays >= 0;
    return {
      expFormatted: expDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      diffDays,
      isActive,
      isExpiringSoon: isActive && diffDays <= 30,
    };
  };

  const getWhatsAppWarrantyMessageUrl = (prod: any) => {
    const pDate = prod.purchaseDate ? new Date(prod.purchaseDate).toLocaleDateString('en-IN') : 'N/A';
    const expDate = prod.warrantyExpiryDate ? new Date(prod.warrantyExpiryDate).toLocaleDateString('en-IN') : 'N/A';
    const cleanMobile = (prod.mobile || '').replace(/\D/g, '');
    const targetPhone = cleanMobile.startsWith('91') ? cleanMobile : `91${cleanMobile}`;

    const text = 
`*JV CONTROLS CHENNAI - PRODUCT & WARRANTY CONFIRMATION*

Dear *${prod.customerName}*,
Thank you for choosing JV Controls. Here are your product and warranty registration details:

📦 *Product:* ${prod.productName}
🔢 *Serial Number:* ${prod.serialNumber}
📅 *Purchase Date:* ${pDate}
🛡️ *Warranty Period:* ${prod.warrantyYears} Year(s)
⏳ *Warranty Valid Until:* ${expDate}
📍 *Installation Address:* ${prod.address}
${prod.invoiceNumber ? `📄 *Invoice Number:* ${prod.invoiceNumber}\n` : ''}
For technical service, battery replacement, or emergency breakdown, call *+91 9500087723*.

*JV Controls Chennai*
Plot No. 1957, 13th Main Road, Annanagar East, Chennai - 600040`;

    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  const handleCopySerial = (serial: string) => {
    if (!serial) return;
    try {
      navigator.clipboard.writeText(serial);
      setCopiedSerial(serial);
      setTimeout(() => setCopiedSerial(null), 2000);
    } catch (e) {
      console.warn('Could not copy serial to clipboard:', e);
    }
  };

  // Count metrics for inquiries
  const newInquiriesCount = allInquiries.filter((i) => (i.status || 'NEW') === 'NEW').length;
  const inProgressInquiriesCount = allInquiries.filter((i) => i.status === 'IN_PROGRESS').length;
  const resolvedInquiriesCount = allInquiries.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
  const unresolvedInquiriesCount = allInquiries.filter((i) => (i.status || 'NEW') !== 'RESOLVED' && i.status !== 'CLOSED').length;

  // Count metrics for tickets
  const emergencyTicketsCount = allTickets.filter((t) => t.priority === 'emergency' && t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
  const pendingTicketsCount = allTickets.filter((t) => t.status === 'DISPATCH_PENDING').length;
  const inProgressTicketsCount = allTickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const resolvedTicketsCount = allTickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const unresolvedTicketsCount = allTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;

  // Filter inquiries for admin view
  const filteredAllInquiries = allInquiries.filter((inq) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (inq.name && inq.name.toLowerCase().includes(q)) ||
      (inq.mobile && inq.mobile.includes(q)) ||
      (inq.serviceType && inq.serviceType.toLowerCase().includes(q)) ||
      (inq.location && inq.location.toLowerCase().includes(q)) ||
      (inq.comments && inq.comments.toLowerCase().includes(q)) ||
      (inq.inquiryId && inq.inquiryId.toLowerCase().includes(q));

    let matchesFilter = true;
    if (filterStatus === 'ACTIVE') matchesFilter = (inq.status || 'NEW') !== 'RESOLVED' && inq.status !== 'CLOSED';
    else if (filterStatus === 'NEW') matchesFilter = (inq.status || 'NEW') === 'NEW';
    else if (filterStatus === 'IN_PROGRESS') matchesFilter = inq.status === 'IN_PROGRESS';
    else if (filterStatus === 'RESOLVED') matchesFilter = inq.status === 'RESOLVED' || inq.status === 'CLOSED';

    return matchesSearch && matchesFilter;
  });

  // Filter tickets for admin view
  const filteredAllTickets = allTickets.filter((tix) => {
    const q = (ticketSearchQuery || searchQuery).toLowerCase();
    const matchesSearch =
      !q ||
      (tix.name && tix.name.toLowerCase().includes(q)) ||
      (tix.mobile && tix.mobile.includes(q)) ||
      (tix.ticketId && tix.ticketId.toLowerCase().includes(q)) ||
      (tix.equipmentType && tix.equipmentType.toLowerCase().includes(q)) ||
      (tix.brandCapacity && tix.brandCapacity.toLowerCase().includes(q)) ||
      (tix.address && tix.address.toLowerCase().includes(q)) ||
      (tix.issueDescription && tix.issueDescription.toLowerCase().includes(q));

    let matchesFilter = true;
    if (ticketFilterStatus === 'ACTIVE') {
      matchesFilter = tix.status !== 'RESOLVED' && tix.status !== 'CLOSED';
    } else if (ticketFilterStatus === 'EMERGENCY') {
      matchesFilter = tix.priority === 'emergency' && tix.status !== 'RESOLVED' && tix.status !== 'CLOSED';
    } else if (ticketFilterStatus === 'DISPATCH_PENDING') {
      matchesFilter = tix.status === 'DISPATCH_PENDING';
    } else if (ticketFilterStatus === 'IN_PROGRESS') {
      matchesFilter = tix.status === 'IN_PROGRESS' || tix.status === 'ASSIGNED';
    } else if (ticketFilterStatus === 'RESOLVED') {
      matchesFilter = tix.status === 'RESOLVED' || tix.status === 'CLOSED';
    }

    return matchesSearch && matchesFilter;
  });

  // Pre-calculate service pending and serviced counts for admin products using current date and time
  const servicePendingProductsCount = customerProducts.filter(hasProductPendingService).length;

  const servicedProductsCount = customerProducts.filter((p) => {
    const s = getOrGenerateServiceSchedule(p);
    return s.some((item: any) => item.status === 'SERVICED');
  }).length;

  // Filter customer products for admin view
  const filteredProducts = customerProducts.filter((p) => {
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const exp = new Date(p.warrantyExpiryDate);

    if (prodFilterStatus === 'ACTIVE' && exp < now) return false;
    if (prodFilterStatus === 'EXPIRED' && exp >= now) return false;
    if (prodFilterStatus === 'EXPIRING_SOON' && (exp < now || exp > in30Days)) return false;

    if (prodFilterStatus === 'SERVICE_PENDING') {
      if (!hasProductPendingService(p)) return false;
    }

    if (prodFilterStatus === 'SERVICED') {
      const schedule = getOrGenerateServiceSchedule(p);
      const hasServiced = schedule.some((item: any) => item.status === 'SERVICED');
      if (!hasServiced) return false;
    }

    if (!prodSearchQuery) return true;
    const q = prodSearchQuery.toLowerCase();
    return (
      (p.customerName && p.customerName.toLowerCase().includes(q)) ||
      (p.mobile && p.mobile.includes(q)) ||
      (p.serialNumber && p.serialNumber.toLowerCase().includes(q)) ||
      (p.productName && p.productName.toLowerCase().includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(q))
    );
  });

  // ==========================================
  // ADMIN NOTIFICATIONS ENGINE & ACTIONS
  // ==========================================
  const handleMarkNotificationRead = async (notifId: string) => {
    const updated = Array.from(new Set([...readNotificationIds, notifId]));
    setReadNotificationIds(updated);
    try {
      localStorage.setItem('jvc_admin_read_notifications', JSON.stringify(updated));
    } catch {}

    try {
      await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId: notifId }),
      });
    } catch (err) {
      console.error('Failed to sync notification mark-read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    const currentUnreadIds = unreadNotifications.map((n) => n.id);
    const updated = Array.from(new Set([...readNotificationIds, ...currentUnreadIds]));
    setReadNotificationIds(updated);
    try {
      localStorage.setItem('jvc_admin_read_notifications', JSON.stringify(updated));
    } catch {}

    try {
      await fetch('/api/admin/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAll: true, allCurrentIds: currentUnreadIds }),
      });
    } catch (err) {
      console.error('Failed to sync mark-all-read:', err);
    }
  };

  const handleNavigateFromNotification = (notif: any) => {
    handleMarkNotificationRead(notif.id);
    setIsNotificationOpen(false);
    if (notif.actionTab) {
      setActiveTab(notif.actionTab);
    }
    if (notif.actionFilter) {
      if (notif.actionTab === 'all-inquiries') {
        setFilterStatus(notif.actionFilter);
      } else if (notif.actionTab === 'admin-products') {
        setProdFilterStatus(notif.actionFilter);
        if (notif.searchHint) {
          setProdSearchQuery(notif.searchHint);
        }
      }
    }
  };

  const allGeneratedNotifications = useMemo(() => {
    if (!isAdmin) return [];
    const notifs: any[] = [];
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 1. New Inquiries Notifications
    allInquiries.forEach((inq: any) => {
      const isNew = (inq.status || 'NEW') === 'NEW';
      if (isNew) {
        const primaryKey = inq.inquiryId || inq._id || inq.id;
        notifs.push({
          id: `inquiry-${primaryKey}`,
          altId: inq._id ? `inquiry-${inq._id}` : undefined,
          type: 'INQUIRY',
          category: 'New Inquiry',
          title: `New Inquiry: ${inq.name || 'Customer'}`,
          subtitle: inq.product || inq.serviceType || 'Sales / Quote Request',
          message: `${inq.name || 'A customer'} submitted an inquiry for ${inq.product || inq.serviceType || 'power backup'}.${inq.mobile ? ` Phone: ${inq.mobile}` : ''}${inq.location ? ` • Location: ${inq.location}` : ''}`,
          phone: inq.mobile || inq.phone,
          email: inq.email,
          date: inq.createdAt || new Date().toISOString(),
          urgency: 'HIGH',
          actionTab: 'all-inquiries',
          actionFilter: 'NEW',
          actionLabel: 'View Inquiry',
          searchHint: inq.mobile || inq.name || '',
          meta: inq,
        });
      }
    });

    // 2. 6-Month Maintenance Service Notifications
    customerProducts.forEach((p: any) => {
      const schedule = getOrGenerateServiceSchedule(p);
      const prodKey = p._id || p.id || p.serialNumber;

      schedule.forEach((s: any) => {
        if (s.status !== 'SERVICED') {
          const dueDate = s.dueDate ? new Date(s.dueDate) : null;
          const isOverdue = dueDate ? dueDate < now : false;
          const isDueSoon = dueDate ? dueDate >= now && dueDate <= in30Days : false;
          const dueDateFormatted = dueDate
            ? dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Scheduled Date';

          // Notify on overdue or due in 30 days based on current date and time
          if (isOverdue || isDueSoon) {
            notifs.push({
              id: `service-${prodKey}-${s.serviceNumber}`,
              type: 'SERVICE',
              category: isOverdue ? '🚨 6M Service Overdue' : '🔴 6M Service Due',
              title: isOverdue
                ? `🚨 Overdue Service: ${p.productName}`
                : `🔴 6-Month Service Due: ${p.productName}`,
              subtitle: `${s.label || `Service #${s.serviceNumber}`} • S/N: ${p.serialNumber}`,
              message: `Maintenance service #${s.serviceNumber} for ${p.customerName} (${p.mobile}) ${
                isOverdue ? `was due on ${dueDateFormatted} (OVERDUE). Please dispatch engineer.` : `is due on ${dueDateFormatted}. Schedule battery inspection.`
              }`,
              phone: p.mobile,
              email: p.email,
              date: s.dueDate || p.purchaseDate,
              urgency: isOverdue ? 'CRITICAL' : 'HIGH',
              actionTab: 'admin-products',
              actionFilter: 'SERVICE_PENDING',
              actionLabel: 'Manage Service',
              searchHint: p.serialNumber || p.mobile || '',
              meta: { prod: p, service: s },
            });
          }
        }
      });
    });

    // 3. Warranty Expiry Notifications
    customerProducts.forEach((p: any) => {
      const prodKey = p._id || p.id || p.serialNumber;
      const exp = new Date(p.warrantyExpiryDate);
      const expFormatted = exp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const isExpired = exp < now;
      const isExpiringSoon = exp >= now && exp <= in30Days;
      const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (isExpired) {
        notifs.push({
          id: `warranty-expired-${prodKey}`,
          type: 'WARRANTY',
          category: 'Warranty Expired',
          title: `⚠️ Warranty Expired: ${p.productName}`,
          subtitle: `S/N: ${p.serialNumber} • ${p.customerName}`,
          message: `Manufacturer warranty for ${p.productName} (S/N: ${p.serialNumber}) expired on ${expFormatted}. Contact ${p.customerName} (${p.mobile}) to offer an AMC maintenance contract.`,
          phone: p.mobile,
          email: p.email,
          date: p.warrantyExpiryDate,
          urgency: 'HIGH',
          actionTab: 'admin-products',
          actionFilter: 'EXPIRED',
          actionLabel: 'View Asset',
          searchHint: p.serialNumber || p.mobile || '',
          meta: { prod: p },
        });
      } else if (isExpiringSoon) {
        notifs.push({
          id: `warranty-expiring-${prodKey}`,
          type: 'WARRANTY',
          category: 'Warranty Expiring Soon',
          title: `⏳ Warranty Expiring in ${diffDays} Day${diffDays === 1 ? '' : 's'}: ${p.productName}`,
          subtitle: `S/N: ${p.serialNumber} • ${p.customerName}`,
          message: `Warranty for ${p.productName} (S/N: ${p.serialNumber}) expires on ${expFormatted}. Proactively schedule warranty extension / AMC renewal for ${p.customerName} (${p.mobile}).`,
          phone: p.mobile,
          email: p.email,
          date: p.warrantyExpiryDate,
          urgency: 'HIGH',
          actionTab: 'admin-products',
          actionFilter: 'EXPIRING_SOON',
          actionLabel: 'View Asset',
          searchHint: p.serialNumber || p.mobile || '',
          meta: { prod: p },
        });
      }
    });

    // Sort by date descending
    return notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [isAdmin, allInquiries, customerProducts]);

  // Unread notifications: those whose IDs are not in readNotificationIds
  const unreadNotifications = useMemo(() => {
    const readSet = new Set(readNotificationIds);
    return allGeneratedNotifications.filter((n) => {
      if (readSet.has(n.id)) return false;
      if (n.altId && readSet.has(n.altId)) return false;
      return true;
    });
  }, [allGeneratedNotifications, readNotificationIds]);

  const filteredUnreadNotifications = useMemo(() => {
    if (notificationFilter === 'ALL') return unreadNotifications;
    return unreadNotifications.filter((n) => n.type === notificationFilter);
  }, [unreadNotifications, notificationFilter]);

  const unreadCount = unreadNotifications.length;
  const inquiryNotifCount = unreadNotifications.filter((n) => n.type === 'INQUIRY').length;
  const serviceNotifCount = unreadNotifications.filter((n) => n.type === 'SERVICE').length;
  const warrantyNotifCount = unreadNotifications.filter((n) => n.type === 'WARRANTY').length;

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-2 md:p-3 animate-in fade-in duration-200`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${
          isFullscreen
            ? 'h-full max-w-none max-h-none rounded-none'
            : 'h-[100dvh] sm:h-[96vh] max-w-full sm:max-w-[98vw] 2xl:max-w-[1720px] rounded-none sm:rounded-3xl'
        } bg-slate-50 shadow-2xl overflow-hidden border-0 sm:border border-slate-700/30 flex flex-col transition-all duration-300 relative`}
      >
        {/* Floating Email Feedback Toast */}
        {emailFeedback && (
          <div
            className={`fixed top-6 right-6 z-[9999] max-w-md p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs sm:text-sm font-bold border transition-all duration-300 animate-in slide-in-from-top-4 ${
              emailFeedback.type === 'success'
                ? 'bg-emerald-950/95 text-emerald-100 border-emerald-500/50 shadow-emerald-950/40'
                : 'bg-rose-950/95 text-rose-100 border-rose-500/50 shadow-rose-950/40'
            }`}
          >
            {emailFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{emailFeedback.message}</span>
            <button
              onClick={() => setEmailFeedback(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Unified Portal Header */}
        <div className="px-5 sm:px-8 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#002f5c] text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          
          {/* User Information with Avatar */}
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md border ${
              isAdmin
                ? 'bg-gradient-to-tr from-amber-600 to-orange-500 border-amber-300/40'
                : 'bg-gradient-to-tr from-[#004b87] to-indigo-600 border-white/20'
            }`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  {user?.name || 'Customer Portal'}
                </h2>
                {isAdmin ? (
                  <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    <span>Administrator</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified Customer</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{user?.email}</span>
                </span>
                {user?.mobile && (
                  <span className="hidden sm:flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{user?.mobile}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Controls: Notifications, Refresh, Fullscreen, Logout & Close */}
          <div className="flex items-center gap-2">
            {/* Admin Notifications Bell with live unread badge */}
            {isAdmin && (
              <button
                onClick={() => setIsNotificationOpen(true)}
                className={`relative p-2 rounded-xl transition-all border flex items-center justify-center ${
                  unreadCount > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 ring-1 ring-amber-400/40'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-white hover:bg-slate-700'
                }`}
                title={`Operational Notifications (${unreadCount} unread)`}
                aria-label="View notifications"
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-amber-400' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-md animate-pulse border border-slate-900">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={loadPortalData}
              disabled={isLoading}
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/60"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/60"
              title={isFullscreen ? 'Restore Window Size' : 'Fill Entire Screen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 rounded-xl transition-all"
              title="Log out of account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unified Navigation Tabs */}
        <div className="px-3 sm:px-8 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0 py-2 sm:py-2.5 overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Admin Management Tabs (Unlocked exclusively for authorized admin) */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin-overview')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all ${
                    activeTab === 'admin-overview'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-900" />
                  <span>Admin Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('all-inquiries')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'all-inquiries'
                      ? 'bg-[#004b87] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Inquiries ({unresolvedInquiriesCount})</span>
                  {newInquiriesCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                      {newInquiriesCount} NEW
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('all-tickets')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'all-tickets'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>AMC Tickets ({unresolvedTicketsCount})</span>
                  {emergencyTicketsCount > 0 && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                      {emergencyTicketsCount} URGENT
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('customer-products')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'customer-products'
                      ? 'bg-emerald-600 text-white shadow-sm font-black'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Assets & Warranties ({customerProducts.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('all-users')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'all-users'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Users ({allUsers.length})</span>
                </button>

                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    isNotificationOpen
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : unreadCount > 0
                      ? 'bg-amber-50 text-amber-900 border border-amber-300 font-bold hover:bg-amber-100'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <Bell className={`w-3.5 h-3.5 ${unreadCount > 0 ? 'text-amber-700' : ''}`} />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Customer Tabs - Only visible to verified customers, hidden in Admin Portal */}
            {!isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('my-inquiries')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'my-inquiries'
                      ? 'bg-[#004b87] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>My Inquiries & Quotes</span>
                </button>

                <button
                  onClick={() => setActiveTab('my-tickets')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'my-tickets'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>My AMC Requests</span>
                </button>

                <button
                  onClick={() => setActiveTab('my-products')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    activeTab === 'my-products'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>My Equipment & Warranties ({myProducts.length})</span>
                </button>
              </>
            )}

            <button
              onClick={() => setActiveTab('profile')}
              className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/80'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Account Profile</span>
            </button>
          </div>

          {/* New Request Action - Only visible to customers, hidden in Admin Portal */}
          {!isAdmin && (
            <button
              onClick={onNewInquiryClick}
              className="flex items-center gap-1.5 bg-[#ea580c] hover:bg-[#c2410c] text-white px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-xs transition-all ml-auto"
            >
              <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>Request Quote</span>
            </button>
          )}
        </div>

        {/* Portal Body Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 bg-slate-50 space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#004b87]" />
              <p className="text-xs font-semibold">Synchronizing portal records from MongoDB...</p>
            </div>
          ) : (
            <>
              {/* ============================================================== */}
              {/* ADMIN OVERVIEW (KPI STATS) - EXCLUSIVE TO ADMIN EMAIL */}
              {/* ============================================================== */}
              {isAdmin && activeTab === 'admin-overview' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Admin Banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <ShieldAlert className="w-5 h-5 text-slate-950" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">
                          Administrator Management Console Active
                        </h3>
                        <p className="text-xs text-slate-600">
                          Authorized access confirmed for <strong className="text-amber-900">{user?.email}</strong>. Live connection to MongoDB and notification queue active.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Operational Alerts Section */}
                  {unreadCount > 0 ? (
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm">
                                Attention Required: {unreadCount} Operational Alert{unreadCount === 1 ? '' : 's'}
                              </h4>
                              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                Active
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-3 flex-wrap">
                              {inquiryNotifCount > 0 && (
                                <span className="text-blue-700 font-bold">📩 {inquiryNotifCount} New Inquiries</span>
                              )}
                              {serviceNotifCount > 0 && (
                                <span className="text-rose-700 font-bold">🔴 {serviceNotifCount} 6M Services Due</span>
                              )}
                              {warrantyNotifCount > 0 && (
                                <span className="text-amber-800 font-bold">⚠️ {warrantyNotifCount} Warranty Alerts</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleMarkAllNotificationsRead}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-all active:scale-95 flex items-center gap-1.5"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark All Read</span>
                          </button>
                          <button
                            onClick={() => setIsNotificationOpen(true)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white bg-slate-900 hover:bg-[#004b87] shadow-xs transition-all active:scale-95 flex items-center gap-1"
                          >
                            <span>Open Notification Center</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Top 3 Quick Alerts Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        {unreadNotifications.slice(0, 3).map((notif) => (
                          <div
                            key={notif.id}
                            className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-2xs flex flex-col justify-between gap-2"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-[10px] font-black uppercase text-slate-500">
                                  {notif.category}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(notif.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <h5 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                                {notif.title}
                              </h5>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                              <button
                                onClick={() => handleMarkNotificationRead(notif.id)}
                                className="text-slate-500 hover:text-emerald-700 font-bold flex items-center gap-1"
                              >
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Mark as Read</span>
                              </button>
                              <button
                                onClick={() => handleNavigateFromNotification(notif)}
                                className="text-[#004b87] font-black hover:underline flex items-center gap-0.5"
                              >
                                <span>View</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-emerald-950 block">All Operational Notifications Cleared</span>
                          <span className="text-[11px] text-emerald-700">No pending unread alerts for inquiries, 6-month services, or warranties.</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsNotificationOpen(true)}
                        className="text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-xl transition-all"
                      >
                        Notification Center
                      </button>
                    </div>
                  )}

                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Active Inquiries</span>
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {unresolvedInquiriesCount}
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                        ● {newInquiriesCount} New Follow-ups • {resolvedInquiriesCount} Resolved
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">AMC Tickets</span>
                        <Wrench className="w-4 h-4 text-rose-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {unresolvedTicketsCount}
                      </div>
                      <div className="text-[11px] text-rose-600 font-semibold mt-1">
                        ● {emergencyTicketsCount} Urgent Breakdowns • {resolvedTicketsCount} Resolved
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                        <Users className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">
                        {adminStats?.totalUsers || allUsers.length}
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-1">
                        MongoDB Verified Accounts
                      </div>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-sm font-black text-emerald-700">
                        MongoDB Live
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold mt-1">
                        Hotline: +91 9500087723
                      </div>
                    </div>
                  </div>

                  {/* Quick Shortcut Buttons to Manage Inquiries & Tickets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setActiveTab('all-inquiries')}
                      className="p-5 bg-white hover:bg-sky-50/50 rounded-2xl border border-slate-200 shadow-xs cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-extrabold text-sm text-[#004b87] group-hover:underline">
                          Review Customer Quotations & Leads →
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            unresolvedInquiriesCount > 0 ? 'bg-sky-100 text-[#004b87]' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {unresolvedInquiriesCount} Inquiries
                          </span>
                          {resolvedInquiriesCount > 0 && (
                            <span className="text-[11px] text-slate-500 font-semibold">
                              ({resolvedInquiriesCount} resolved)
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Inspect requested product models, battery sizing, loads, customer phone numbers, and update quotation progress.
                      </p>
                    </div>

                    <div 
                      onClick={() => setActiveTab('all-tickets')}
                      className="p-5 bg-white hover:bg-rose-50/50 rounded-2xl border border-slate-200 shadow-xs cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-extrabold text-sm text-rose-700 group-hover:underline">
                          Review Urgent AMC Breakdown Tickets →
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            unresolvedTicketsCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {unresolvedTicketsCount} Tickets
                          </span>
                          {resolvedTicketsCount > 0 && (
                            <span className="text-[11px] text-slate-500 font-semibold">
                              ({resolvedTicketsCount} resolved)
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        View technician assignments, client locations across Chennai, fault symptoms, and equipment types (Online UPS, Inverters, Batteries).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* ADMIN VIEW: ALL INQUIRIES */}
              {/* ============================================================== */}
              {isAdmin && activeTab === 'all-inquiries' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Top Bar with Title and Summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#004b87]" />
                        <span>Customer Quotations & Leads</span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          {allInquiries.length} Total
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage prospective customer quotations, backup load requirements, and service inquiries.
                      </p>
                    </div>

                    {/* Quick Filter Status Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      <button
                        onClick={() => setFilterStatus('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          filterStatus === 'ALL'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        All ({allInquiries.length})
                      </button>

                      <button
                        onClick={() => setFilterStatus('ACTIVE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          filterStatus === 'ACTIVE'
                            ? 'bg-[#004b87] text-white shadow-xs ring-2 ring-sky-300'
                            : 'bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-200'
                        }`}
                      >
                        Active ({unresolvedInquiriesCount})
                      </button>

                      <button
                        onClick={() => setFilterStatus('NEW')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                          filterStatus === 'NEW'
                            ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <span>🔥 New Inquiries ({newInquiriesCount})</span>
                      </button>

                      <button
                        onClick={() => setFilterStatus('IN_PROGRESS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          filterStatus === 'IN_PROGRESS'
                            ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-300'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        In Progress ({inProgressInquiriesCount})
                      </button>

                      <button
                        onClick={() => setFilterStatus('RESOLVED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          filterStatus === 'RESOLVED'
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        Resolved ({resolvedInquiriesCount})
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search inquiries by customer name, mobile, service type, location, notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#004b87]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {filteredAllInquiries.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                      No customer inquiries match your current search criteria.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAllInquiries.map((inq) => (
                        <div
                          key={inq._id || inq.inquiryId}
                          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900">
                                {inq.name}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                                {inq.inquiryId}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <select
                                value={inq.status || 'NEW'}
                                disabled={statusUpdatingId === (inq._id || inq.inquiryId)}
                                onChange={(e) => handleUpdateInquiryStatus(inq._id || inq.inquiryId, e.target.value)}
                                className={`text-xs font-extrabold px-3 py-1 rounded-xl border transition-all cursor-pointer ${
                                  inq.status === 'RESOLVED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : inq.status === 'IN_PROGRESS'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-sky-50 text-[#004b87] border-sky-200'
                                }`}
                              >
                                <option value="NEW">NEW</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Mobile</span>
                              <a href={`tel:${inq.mobile}`} className="font-bold text-slate-900 hover:text-[#004b87]">
                                {inq.mobile}
                              </a>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Requirement</span>
                              <span className="font-semibold text-slate-800">{inq.serviceType}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Location</span>
                              <span>{inq.location || 'Chennai'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Date</span>
                              <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {inq.comments && (
                            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                              <strong className="text-slate-900">Notes:</strong> {inq.comments}
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={`https://wa.me/91${inq.mobile.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(inq.name)}%2C%20greetings%20from%20JV%20Controls%20regarding%20your%20inquiry%20%23${inq.inquiryId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors"
                            >
                              Message on WhatsApp
                            </a>
                            <a
                              href={`tel:${inq.mobile}`}
                              className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                            >
                              Call Customer
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* ADMIN VIEW: ALL AMC TICKETS */}
              {/* ============================================================== */}
              {isAdmin && activeTab === 'all-tickets' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Top Bar with Title & Ticket Filter Pills */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-rose-600" />
                        <span>AMC & Emergency Service Dispatch</span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          {allTickets.length} Total
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Track technician dispatches, Chennai site visits, and mark resolved tickets.
                      </p>
                    </div>

                    {/* Quick Filter Status Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      <button
                        onClick={() => setTicketFilterStatus('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          ticketFilterStatus === 'ALL'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        All ({allTickets.length})
                      </button>

                      <button
                        onClick={() => setTicketFilterStatus('ACTIVE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          ticketFilterStatus === 'ACTIVE'
                            ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-300'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        Active ({unresolvedTicketsCount})
                      </button>

                      <button
                        onClick={() => setTicketFilterStatus('EMERGENCY')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                          ticketFilterStatus === 'EMERGENCY'
                            ? 'bg-rose-600 text-white shadow-xs ring-2 ring-rose-400'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <span>🚨 Emergency ({emergencyTicketsCount})</span>
                      </button>

                      <button
                        onClick={() => setTicketFilterStatus('DISPATCH_PENDING')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          ticketFilterStatus === 'DISPATCH_PENDING'
                            ? 'bg-amber-500 text-slate-950 shadow-xs ring-2 ring-amber-300'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        Pending ({pendingTicketsCount})
                      </button>

                      <button
                        onClick={() => setTicketFilterStatus('IN_PROGRESS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          ticketFilterStatus === 'IN_PROGRESS'
                            ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-300'
                            : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
                        }`}
                      >
                        In Progress ({inProgressTicketsCount})
                      </button>

                      <button
                        onClick={() => setTicketFilterStatus('RESOLVED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          ticketFilterStatus === 'RESOLVED'
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        Resolved ({resolvedTicketsCount})
                      </button>
                    </div>
                  </div>

                  {/* Search Bar for Tickets */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search tickets by customer name, mobile, ticket ID, equipment, address..."
                      value={ticketSearchQuery}
                      onChange={(e) => setTicketSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    {ticketSearchQuery && (
                      <button
                        onClick={() => setTicketSearchQuery('')}
                        className="absolute right-3.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {filteredAllTickets.length === 0 ? (
                    <div className="py-14 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-800">No Service Tickets Found</h4>
                      <p className="text-xs text-slate-500">
                        No service tickets match your selected filters or search terms.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAllTickets.map((tix) => {
                        const isResolved = tix.status === 'RESOLVED' || tix.status === 'CLOSED';
                        const ticketTargetId = tix._id || tix.ticketId || tix.id;
                        const isUpdating = statusUpdatingId === ticketTargetId;

                        return (
                          <div
                            key={ticketTargetId}
                            className={`p-5 rounded-3xl border shadow-xs space-y-3.5 transition-all ${
                              isResolved
                                ? 'bg-slate-50/80 border-slate-200 opacity-80'
                                : tix.priority === 'emergency'
                                ? 'bg-white border-rose-200 hover:border-rose-300 ring-1 ring-rose-100'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-sm text-slate-900">
                                  {tix.name}
                                </span>
                                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-black uppercase ${
                                  tix.priority === 'emergency'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}>
                                  {tix.priority === 'emergency' ? '🚨 EMERGENCY BREAKDOWN' : '🛠️ ROUTINE AMC'}
                                </span>
                                <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                                  #{tix.ticketId || tix.id}
                                </span>
                              </div>

                              {/* Status Badges & 1-Click Resolve Controls */}
                              <div className="flex items-center gap-2">
                                {isResolved ? (
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-xl text-xs font-black">
                                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>RESOLVED & COMPLETED</span>
                                    </span>
                                    <button
                                      disabled={isUpdating}
                                      onClick={() => handleUpdateTicketStatus(ticketTargetId, 'IN_PROGRESS')}
                                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-xl transition-all"
                                      title="Reopen ticket"
                                    >
                                      Reopen
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {/* 1-Click Resolve Button */}
                                    <button
                                      disabled={isUpdating}
                                      onClick={() => handleUpdateTicketStatus(ticketTargetId, 'RESOLVED')}
                                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-extrabold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>{isUpdating ? 'Saving...' : 'Mark as Resolved'}</span>
                                    </button>

                                    {/* Status Dropdown */}
                                    <select
                                      value={tix.status || 'DISPATCH_PENDING'}
                                      disabled={isUpdating}
                                      onChange={(e) => handleUpdateTicketStatus(ticketTargetId, e.target.value)}
                                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#004b87]"
                                    >
                                      <option value="DISPATCH_PENDING">DISPATCH PENDING</option>
                                      <option value="ASSIGNED">ENGINEER ASSIGNED</option>
                                      <option value="IN_PROGRESS">IN PROGRESS</option>
                                      <option value="RESOLVED">RESOLVED</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Equipment / Model</span>
                                <span className="font-extrabold text-slate-900">{tix.equipmentType} ({tix.brandCapacity || 'Standard'})</span>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Customer Mobile</span>
                                <a href={`tel:${tix.mobile}`} className="font-bold text-[#004b87] hover:underline">
                                  {tix.mobile}
                                </a>
                              </div>
                              <div>
                                <span className="text-slate-400 text-[10px] uppercase font-bold block">Site / Plant Address</span>
                                <span className="text-slate-800 font-medium">{tix.address || 'Chennai Area'}</span>
                              </div>
                            </div>

                            {tix.issueDescription && (
                              <div className="p-3 bg-rose-50/70 rounded-2xl text-xs text-rose-950 border border-rose-200/80">
                                <strong className="font-extrabold">Reported Issue:</strong> {tix.issueDescription}
                              </div>
                            )}

                            {/* Ticket Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="text-[11px] text-slate-400">
                                Logged: {new Date(tix.createdAt).toLocaleString('en-IN')}
                              </span>

                              <div className="flex items-center gap-2">
                                <a
                                  href={`https://wa.me/91${(tix.mobile || '').replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(tix.name)}%2C%20this%20is%20JV%20Controls%20technical%20service%20regarding%20Ticket%20%23${tix.ticketId || tix.id}.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WhatsApp Customer</span>
                                </a>
                                <a
                                  href={`tel:${tix.mobile}`}
                                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                                >
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Call Customer</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* ADMIN VIEW: USERS DIRECTORY */}
              {/* ============================================================== */}
              {isAdmin && activeTab === 'all-users' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in duration-200">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Registered Accounts in MongoDB ({allUsers.length})
                    </h4>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {allUsers.map((u) => (
                      <div key={u._id || u.email} className="p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-white ${
                            u.role === 'admin' ? 'bg-amber-600' : 'bg-[#004b87]'
                          }`}>
                            {u.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.role === 'admin' && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 text-[11px]">{u.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-600">
                          <span>{u.mobile}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* ADMIN VIEW: CUSTOMER ASSET & WARRANTY DATA ENTRY REGISTER */}
              {/* ============================================================== */}
              {isAdmin && activeTab === 'customer-products' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Top Bar with Header & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Package className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">
                          Customer Asset & Warranty Register
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Record customer purchases, installation address, serial numbers, warranty period, and track expiration.
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        onClick={exportProductsToCSV}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 transition-all"
                        title="Export records to CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>

                      <button
                        onClick={handleOpenNewProductModal}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all active:scale-98"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>New Customer Entry</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setProdFilterStatus('ALL')}
                      className={`p-3 bg-white rounded-2xl border text-left transition-all ${
                        prodFilterStatus === 'ALL'
                          ? 'ring-2 ring-slate-900 border-slate-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Products</span>
                      <span className="text-lg sm:text-xl font-black text-slate-900">{customerProducts.length}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProdFilterStatus('ACTIVE')}
                      className={`p-3 bg-white rounded-2xl border text-left transition-all ${
                        prodFilterStatus === 'ACTIVE'
                          ? 'ring-2 ring-emerald-600 border-emerald-600 shadow-sm bg-emerald-50/30'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Active Warranty</span>
                      <span className="text-lg sm:text-xl font-black text-emerald-600">
                        {customerProducts.filter((p) => new Date(p.warrantyExpiryDate) >= new Date()).length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProdFilterStatus('EXPIRING_SOON')}
                      className={`p-3 bg-white rounded-2xl border text-left transition-all ${
                        prodFilterStatus === 'EXPIRING_SOON'
                          ? 'ring-2 ring-amber-500 border-amber-500 shadow-sm bg-amber-50/30'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Expiring &lt; 30D</span>
                      <span className="text-lg sm:text-xl font-black text-amber-600">
                        {customerProducts.filter((p) => {
                          const now = new Date();
                          const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                          const exp = new Date(p.warrantyExpiryDate);
                          return exp >= now && exp <= in30;
                        }).length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setProdFilterStatus('EXPIRED')}
                      className={`p-3 bg-white rounded-2xl border text-left transition-all ${
                        prodFilterStatus === 'EXPIRED'
                          ? 'ring-2 ring-rose-600 border-rose-600 shadow-sm bg-rose-50/30'
                          : 'border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Expired Warranty</span>
                      <span className="text-lg sm:text-xl font-black text-rose-600">
                        {customerProducts.filter((p) => new Date(p.warrantyExpiryDate) < new Date()).length}
                      </span>
                    </button>

                    {/* RED SERVICE PENDING METRIC CARD */}
                    <button
                      type="button"
                      onClick={() => setProdFilterStatus('SERVICE_PENDING')}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        prodFilterStatus === 'SERVICE_PENDING'
                          ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-600 shadow-md shadow-rose-600/30'
                          : 'bg-rose-50/80 border-rose-200 text-rose-900 hover:bg-rose-100 hover:border-rose-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${
                          prodFilterStatus === 'SERVICE_PENDING' ? 'text-rose-100' : 'text-rose-700'
                        }`}>
                          Service Pending
                        </span>
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-black">
                          {servicePendingProductsCount}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          prodFilterStatus === 'SERVICE_PENDING' ? 'text-rose-200' : 'text-rose-600'
                        }`}>
                          units
                        </span>
                      </div>
                    </button>

                    {/* GREEN SERVICED METRIC CARD */}
                    <button
                      type="button"
                      onClick={() => setProdFilterStatus('SERVICED')}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        prodFilterStatus === 'SERVICED'
                          ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600 shadow-md shadow-emerald-600/30'
                          : 'bg-emerald-50/80 border-emerald-200 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-wider block ${
                          prodFilterStatus === 'SERVICED' ? 'text-emerald-100' : 'text-emerald-700'
                        }`}>
                          Serviced
                        </span>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${
                          prodFilterStatus === 'SERVICED' ? 'text-white' : 'text-emerald-600'
                        }`} />
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-black">
                          {servicedProductsCount}
                        </span>
                        <span className={`text-[10px] font-bold ${
                          prodFilterStatus === 'SERVICED' ? 'text-emerald-200' : 'text-emerald-600'
                        }`}>
                          units
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search by customer, mobile, serial #, product, or address..."
                        value={prodSearchQuery}
                        onChange={(e) => setProdSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {prodSearchQuery && (
                        <button
                          onClick={() => setProdSearchQuery('')}
                          className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 flex-wrap sm:flex-nowrap">
                      {[
                        { id: 'ALL', label: 'All' },
                        { id: 'ACTIVE', label: 'Active' },
                        { id: 'EXPIRING_SOON', label: 'Expiring Soon' },
                        { id: 'EXPIRED', label: 'Expired' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setProdFilterStatus(tab.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            prodFilterStatus === tab.id
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}

                      <div className="h-5 w-px bg-slate-300 hidden sm:block mx-1"></div>

                      {/* RED SERVICE PENDING FILTER BUTTON */}
                      <button
                        onClick={() => setProdFilterStatus('SERVICE_PENDING')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 border shadow-xs ${
                          prodFilterStatus === 'SERVICE_PENDING'
                            ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-300 shadow-rose-600/30'
                            : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 hover:border-rose-400'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        <span>🔴 Service Pending</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          prodFilterStatus === 'SERVICE_PENDING' ? 'bg-white/25 text-white' : 'bg-rose-200 text-rose-800'
                        }`}>
                          {servicePendingProductsCount}
                        </span>
                      </button>

                      {/* GREEN SERVICED FILTER BUTTON */}
                      <button
                        onClick={() => setProdFilterStatus('SERVICED')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1.5 border shadow-xs ${
                          prodFilterStatus === 'SERVICED'
                            ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300 shadow-emerald-600/30'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>🟢 Serviced</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          prodFilterStatus === 'SERVICED' ? 'bg-white/25 text-white' : 'bg-emerald-200 text-emerald-800'
                        }`}>
                          {servicedProductsCount}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Products Records List */}
                  {filteredProducts.length === 0 ? (
                    <div className="py-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3 p-6">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {customerProducts.length === 0
                          ? 'No Customer Products Registered Yet'
                          : 'No Records Match Your Search'}
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {customerProducts.length === 0
                          ? 'Click "New Customer Entry" above to record customer purchases, serial numbers, and track warranty validity.'
                          : 'Try adjusting your search keywords or clearing the warranty filter.'}
                      </p>
                      {customerProducts.length === 0 && (
                        <button
                          onClick={handleOpenNewProductModal}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs"
                        >
                          + Register First Customer Product
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredProducts.map((prod) => {
                        const calc = getWarrantyCalculation(prod.purchaseDate, prod.warrantyYears);
                        const isExpired = !calc?.isActive;
                        const isExpiringSoon = calc?.isExpiringSoon;

                        return (
                          <div
                            key={prod._id || prod.id}
                            className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all space-y-4"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                              {/* Customer Information */}
                              <div className="space-y-1.5 min-w-[280px]">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-sm text-slate-900">
                                    {prod.customerName}
                                  </span>
                                  {prod.category && (
                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                                      {prod.category}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                                  <div className="flex items-center gap-1 font-semibold text-[#004b87]">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    <a href={`tel:${prod.mobile}`} className="hover:underline">
                                      {prod.mobile}
                                    </a>
                                  </div>

                                  {prod.email && (
                                    <div className="flex items-center gap-1 text-slate-500">
                                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{prod.email}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-start gap-1.5 text-xs text-slate-500">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                  <span>{prod.address}</span>
                                </div>
                              </div>

                              {/* Product & Hardware Specifications */}
                              <div className="space-y-1.5 lg:border-l lg:border-r lg:border-slate-100 lg:px-6 flex-1">
                                <div className="font-extrabold text-sm text-slate-900">
                                  {prod.productName}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="flex items-center gap-1 font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                                    <span className="text-slate-400 font-sans text-[9px] uppercase">S/N:</span>
                                    <span>{prod.serialNumber}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(prod.serialNumber);
                                        setCopiedSerial(prod.serialNumber);
                                        setTimeout(() => setCopiedSerial(null), 2000);
                                      }}
                                      className="ml-1 text-slate-400 hover:text-slate-700"
                                      title="Copy Serial Number"
                                    >
                                      {copiedSerial === prod.serialNumber ? (
                                        <Check className="w-3 h-3 text-emerald-600" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>

                                  {prod.invoiceNumber && (
                                    <span className="text-[11px] text-slate-500 font-medium">
                                      Inv: <strong>#{prod.invoiceNumber}</strong>
                                    </span>
                                  )}
                                </div>

                                {prod.notes && (
                                  <p className="text-[11px] text-slate-500 italic">
                                    "{prod.notes}"
                                  </p>
                                )}
                              </div>

                              {/* Warranty Status & Expiry */}
                              <div className="space-y-1.5 lg:text-right min-w-[200px]">
                                <div>
                                  {isExpired ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                      <span>Warranty Expired</span>
                                    </span>
                                  ) : isExpiringSoon ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                      <span>Expiring in {calc?.diffDays} Days</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                      <span>Under Warranty ({calc?.diffDays}d left)</span>
                                    </span>
                                  )}
                                </div>

                                <div className="text-xs text-slate-600">
                                  <span>Bought: </span>
                                  <strong>{prod.purchaseDate ? new Date(prod.purchaseDate).toLocaleDateString('en-IN') : 'N/A'}</strong>
                                  <span className="text-slate-400"> ({prod.warrantyYears} Yr{prod.warrantyYears > 1 ? 's' : ''})</span>
                                </div>

                                <div className="text-xs text-slate-500">
                                  <span>Valid Until: </span>
                                  <strong className={isExpired ? 'text-rose-700' : 'text-slate-900'}>
                                    {calc?.expFormatted || 'N/A'}
                                  </strong>
                                </div>

                                {/* Warranty Expiry Email Trigger */}
                                {(isExpired || isExpiringSoon) && (
                                  <div className="pt-1">
                                    <button
                                      type="button"
                                      disabled={sendingEmailKey === `warranty-${prod._id || prod.id || prod.serialNumber}`}
                                      onClick={() => handleSendWarrantyExpiryEmail(prod._id || prod.id || prod.serialNumber)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all shadow-2xs active:scale-95 disabled:opacity-50"
                                      title="Send warranty expiry alert email with full customer & product details to Customer & Admin"
                                    >
                                      <Mail className="w-3 h-3 text-amber-700" />
                                      <span>
                                        {sendingEmailKey === `warranty-${prod._id || prod.id || prod.serialNumber}`
                                          ? 'Sending Email...'
                                          : prod.warrantyEmailNotifiedAt
                                          ? `Re-send Warranty Email (${new Date(prod.warrantyEmailNotifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`
                                          : '📧 Send Warranty Notice Email'}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 6-Month Warranty Periodic Maintenance Service Schedule */}
                            {(() => {
                              const schedule = getOrGenerateServiceSchedule(prod);
                              const totalServices = schedule.length;
                              const servicedCount = schedule.filter((s: any) => s.status === 'SERVICED').length;
                              const overdueCount = schedule.filter((s: any) => getServiceMilestoneInfo(s).isOverdue).length;
                              const dueSoonCount = schedule.filter((s: any) => getServiceMilestoneInfo(s).isDueSoon).length;
                              const pendingActionCount = overdueCount + dueSoonCount;
                              const upcomingCount = schedule.filter((s: any) => getServiceMilestoneInfo(s).isUpcoming).length;
                              const prodKey = prod._id || prod.id || prod.serialNumber;
                              const isExpanded = !!expandedProductServices[prodKey];

                              return (
                                <div className="bg-slate-50 rounded-2xl border border-slate-200/90 overflow-hidden">
                                  {/* Header bar with summary & expand toggle */}
                                  <div
                                    onClick={() => toggleExpandServices(prodKey)}
                                    className="p-3.5 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/80 transition-colors"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-lg bg-[#004b87]/10 text-[#004b87] flex items-center justify-center font-bold">
                                        <Wrench className="w-3.5 h-3.5" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-extrabold text-xs text-slate-900">
                                            6-Month Periodic Maintenance Services
                                          </span>
                                          <span className="bg-blue-100 text-[#004b87] text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            Every 6 Months • {totalServices} Services Till Warranty
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 mt-0.5">
                                          Periodic battery gravity check, water top-up, inverter terminal tightening & load testing.
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                      {/* Overdue alert pill */}
                                      {overdueCount > 0 && (
                                        <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                                          <span>🚨 {overdueCount} Overdue</span>
                                        </span>
                                      )}

                                      {/* Due soon alert pill */}
                                      {dueSoonCount > 0 && (
                                        <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                          <span>🔴 {dueSoonCount} Due Soon</span>
                                        </span>
                                      )}

                                      {/* Upcoming badge if no overdue or due soon */}
                                      {pendingActionCount === 0 && upcomingCount > 0 && (
                                        <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                          <span>🗓️ {upcomingCount} Upcoming</span>
                                        </span>
                                      )}

                                      {/* Progress badge */}
                                      <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                                        servicedCount === totalServices
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : servicedCount > 0
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}>
                                        {servicedCount} / {totalServices} Serviced ({Math.round((servicedCount / totalServices) * 100)}%)
                                      </span>

                                      <div className="flex items-center gap-1 text-xs font-bold text-[#004b87]">
                                        <span>{isExpanded ? 'Hide Schedule' : 'Manage Services'}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expandable Services Grid */}
                                  {isExpanded && (
                                    <div className="p-4 border-t border-slate-200/80 bg-white space-y-3 animate-in fade-in duration-150">
                                      {/* Intra-Product Milestone Sub-Filter Bar */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                          <span>Filter Schedule:</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <button
                                            type="button"
                                            onClick={() => setProductServiceFilter((prev) => ({ ...prev, [prodKey]: 'ALL' }))}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                              (productServiceFilter[prodKey] || 'ALL') === 'ALL'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                          >
                                            All ({totalServices})
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => setProductServiceFilter((prev) => ({ ...prev, [prodKey]: 'PENDING' }))}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
                                              productServiceFilter[prodKey] === 'PENDING'
                                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                            }`}
                                          >
                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                            <span>🔴 Action Due ({pendingActionCount})</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => setProductServiceFilter((prev) => ({ ...prev, [prodKey]: 'UPCOMING' }))}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
                                              productServiceFilter[prodKey] === 'UPCOMING'
                                                ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                            }`}
                                          >
                                            <Calendar className="w-3 h-3 text-slate-500" />
                                            <span>🗓️ Upcoming ({upcomingCount})</span>
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => setProductServiceFilter((prev) => ({ ...prev, [prodKey]: 'SERVICED' }))}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 border ${
                                              productServiceFilter[prodKey] === 'SERVICED'
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                            }`}
                                          >
                                            <Check className="w-3 h-3 text-emerald-600" />
                                            <span>🟢 Serviced ({servicedCount})</span>
                                          </button>
                                        </div>
                                      </div>

                                      {(() => {
                                        const activeMilestoneFilter = productServiceFilter[prodKey] || 'ALL';
                                        const displayedSchedule = schedule.filter((service: any) => {
                                          const info = getServiceMilestoneInfo(service);
                                          if (activeMilestoneFilter === 'PENDING') return info.isOverdue || info.isDueSoon;
                                          if (activeMilestoneFilter === 'UPCOMING') return info.isUpcoming;
                                          if (activeMilestoneFilter === 'SERVICED') return info.statusKey === 'SERVICED';
                                          return true;
                                        });

                                        if (displayedSchedule.length === 0) {
                                          return (
                                            <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                                              <p className="font-bold">No milestones match the "{activeMilestoneFilter}" filter.</p>
                                              <button
                                                type="button"
                                                onClick={() => setProductServiceFilter((prev) => ({ ...prev, [prodKey]: 'ALL' }))}
                                                className="text-xs text-[#004b87] font-extrabold hover:underline"
                                              >
                                                Show All Services
                                              </button>
                                            </div>
                                          );
                                        }

                                        return (
                                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {displayedSchedule.map((service: any) => {
                                              const info = getServiceMilestoneInfo(service);
                                              const isServiced = info.statusKey === 'SERVICED';
                                              const isUpdating = updatingServiceKey === `${prodKey}-${service.serviceNumber}`;
                                              const dueDateFormatted = service.dueDate
                                                ? new Date(service.dueDate).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                  })
                                                : 'N/A';

                                              return (
                                                <div
                                                  key={service.serviceNumber}
                                                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 transition-all ${info.cardClass}`}
                                                >
                                                  <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-start gap-2.5">
                                                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${info.iconBgClass}`}>
                                                        {isServiced ? (
                                                          <Check className="w-3.5 h-3.5" />
                                                        ) : info.isOverdue ? (
                                                          <AlertTriangle className="w-3.5 h-3.5" />
                                                        ) : info.isDueSoon ? (
                                                          <Clock className="w-3.5 h-3.5" />
                                                        ) : (
                                                          <Calendar className="w-3.5 h-3.5" />
                                                        )}
                                                      </div>
                                                      <div>
                                                        <div className="font-black text-xs text-slate-900">
                                                          {service.label || `Service #${service.serviceNumber} (${service.monthInterval}M)`}
                                                        </div>
                                                        <div className="text-[11px] mt-0.5">
                                                          <span className={isServiced ? 'text-slate-500' : info.isOverdue ? 'text-rose-700' : info.isDueSoon ? 'text-amber-800' : 'text-slate-500'}>Due: </span>
                                                          <strong className={isServiced ? 'text-slate-800' : info.isOverdue ? 'text-rose-900 font-black' : info.isDueSoon ? 'text-amber-950 font-black' : 'text-slate-700 font-bold'}>
                                                            {dueDateFormatted}
                                                          </strong>
                                                        </div>
                                                        <div className={`text-[10px] font-bold mt-1 ${isServiced ? 'text-emerald-700' : info.isOverdue ? 'text-rose-700' : info.isDueSoon ? 'text-amber-800' : 'text-slate-500'}`}>
                                                          {info.statusLabel}
                                                        </div>
                                                      </div>
                                                    </div>

                                                    <span className={`text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${info.badgeClass}`}>
                                                      {info.badgeText}
                                                    </span>
                                                  </div>

                                                   {/* Action: Toggle between Default & Serviced + Email Dispatch */}
                                                   <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                                                     <button
                                                       type="button"
                                                       disabled={sendingEmailKey === `service-${prodKey}-${service.serviceNumber}`}
                                                       onClick={() => handleSendServiceMilestoneEmail(prodKey, service.serviceNumber)}
                                                       className="text-[11px] font-bold text-[#004b87] hover:text-[#002f5c] bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/90 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                                                       title="Send 6-Month Service Alert Email to Customer & Admin"
                                                     >
                                                       <Mail className="w-3 h-3 text-[#004b87]" />
                                                       <span>
                                                         {sendingEmailKey === `service-${prodKey}-${service.serviceNumber}`
                                                           ? 'Sending...'
                                                           : service.emailNotifiedAt
                                                           ? `Sent (${new Date(service.emailNotifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`
                                                           : '📧 Send Email'}
                                                       </span>
                                                     </button>

                                                     <div className="flex items-center gap-2">
                                                       {isServiced ? (
                                                         <button
                                                           disabled={isUpdating}
                                                           onClick={() =>
                                                             handleToggleServiceStatus(prodKey, service.serviceNumber, 'SERVICED')
                                                           }
                                                           className="text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg transition-all"
                                                         >
                                                           {isUpdating ? 'Saving...' : 'Set to Pending'}
                                                         </button>
                                                       ) : (
                                                         <button
                                                           disabled={isUpdating}
                                                           onClick={() =>
                                                             handleToggleServiceStatus(prodKey, service.serviceNumber, 'DEFAULT')
                                                           }
                                                           className="text-[11px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1 rounded-lg shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                                                         >
                                                           <CheckCircle2 className="w-3.5 h-3.5" />
                                                           <span>{isUpdating ? 'Saving...' : 'Mark as Serviced'}</span>
                                                         </button>
                                                       )}
                                                     </div>
                                                   </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Action Buttons Row */}
                            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                              <div className="text-[11px] text-slate-400">
                                Registered: {new Date(prod.createdAt).toLocaleDateString('en-IN')} by {prod.createdBy || 'Admin'}
                              </div>

                              <div className="flex items-center gap-2">
                                <a
                                  href={getWhatsAppWarrantyMessageUrl(prod)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all"
                                  title="Send product & warranty details to customer via WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>Send Warranty via WhatsApp</span>
                                </a>

                                <button
                                  onClick={() => handleOpenEditProductModal(prod)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-slate-700 hover:bg-slate-100 transition-all border border-slate-200"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteProduct(prod._id || prod.id, prod.serialNumber)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* CUSTOMER VIEW: MY INQUIRIES & QUOTES */}
              {/* ============================================================== */}
              {!isAdmin && activeTab === 'my-inquiries' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      My Quotations & Inquiries ({myInquiries.length})
                    </h3>
                  </div>

                  {myInquiries.length === 0 ? (
                    <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 p-6">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#004b87] flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">No Inquiries Submitted Yet</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You can request quotations for Online UPS, pure sine wave inverters, or tubular batteries with doorstep delivery in Chennai.
                      </p>
                      <button
                        onClick={onNewInquiryClick}
                        className="bg-[#004b87] hover:bg-[#003b6b] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs"
                      >
                        Request a Quotation Now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myInquiries.map((inq) => (
                        <div
                          key={inq._id || inq.inquiryId}
                          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900">
                              {inq.serviceType || 'Quotation Request'}
                            </span>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              inq.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inq.status === 'IN_PROGRESS'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-sky-100 text-[#004b87]'
                            }`}>
                              {inq.status || 'NEW'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                            <span>ID: #{inq.inquiryId}</span>
                            <span>Date: {new Date(inq.createdAt).toLocaleDateString()}</span>
                            <span>Location: {inq.location || 'Chennai'}</span>
                          </div>

                          {inq.comments && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                              {inq.comments}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* CUSTOMER VIEW: MY SERVICE TICKETS */}
              {/* ============================================================== */}
              {!isAdmin && activeTab === 'my-tickets' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      My AMC & Emergency Tickets ({myTickets.length})
                    </h3>
                  </div>

                  {myTickets.length === 0 ? (
                    <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 p-6">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                        <Wrench className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">No Service Tickets Registered</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Need 24x7 emergency technician support or battery maintenance? Book an AMC service visit anytime.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myTickets.map((tix) => (
                        <div
                          key={tix._id || tix.ticketId}
                          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900">
                              {tix.equipmentType} ({tix.priority === 'emergency' ? 'Emergency' : 'Routine'})
                            </span>
                            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 uppercase tracking-wider">
                              {tix.status || 'DISPATCH_PENDING'}
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 space-y-1">
                            <div>Address: {tix.address || 'Chennai'}</div>
                            <div>Date: {new Date(tix.createdAt).toLocaleDateString()}</div>
                          </div>

                          {tix.issueDescription && (
                            <p className="text-xs text-slate-600 bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                              {tix.issueDescription}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* CUSTOMER VIEW: MY REGISTERED PRODUCTS & WARRANTIES */}
              {/* ============================================================== */}
              {!isAdmin && activeTab === 'my-products' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#004b87]" />
                        <span>My Equipment & Warranties ({myProducts.length})</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Equipment registered with your phone <strong>{user?.mobile || 'phone'}</strong> or email <strong>{user?.email}</strong>.
                      </p>
                    </div>

                    <button
                      onClick={loadPortalData}
                      disabled={isLoading}
                      className="text-xs font-bold text-[#004b87] hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      <span>Refresh Assets</span>
                    </button>
                  </div>

                  {myProducts.length === 0 ? (
                    <div className="py-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 p-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                        <Package className="w-6 h-6" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">No Equipment Linked Yet</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        If you recently bought an Online UPS, Inverter, or Battery from JV Controls Chennai, our admin records warranties under your mobile number (<strong>{user?.mobile || 'Not set'}</strong>) or email (<strong>{user?.email}</strong>).
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                        <a
                          href={`https://wa.me/919500087723?text=${encodeURIComponent(`Hi JV Controls, please link my purchased product warranty to my account (Phone: ${user?.mobile || ''}, Email: ${user?.email || ''}).`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp Support to Link Equipment</span>
                        </a>
                        <a
                          href="tel:+919500087723"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Hotline: +91 9500087723</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myProducts.map((prod) => {
                        const calc = getWarrantyCalculation(prod.purchaseDate, prod.warrantyYears);
                        const isExpired = !calc?.isActive;
                        const schedule = getOrGenerateServiceSchedule(prod);
                        const totalServices = schedule.length;
                        const servicedCount = schedule.filter((s: any) => s.status === 'SERVICED').length;
                        const overdueCount = schedule.filter((s: any) => getServiceMilestoneInfo(s).isOverdue).length;
                        const dueSoonCount = schedule.filter((s: any) => getServiceMilestoneInfo(s).isDueSoon).length;
                        const pendingActionCount = overdueCount + dueSoonCount;
                        const upcomingCount = schedule.filter((s: any) => getServiceMilestoneInfo(s).isUpcoming).length;

                        return (
                          <div
                            key={prod._id || prod.id || prod.serialNumber}
                            className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 transition-all hover:shadow-md"
                          >
                            {/* Product Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-base text-slate-900">
                                    {prod.productName}
                                  </span>
                                  {prod.category && (
                                    <span className="bg-[#004b87]/10 text-[#004b87] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                      {prod.category}
                                    </span>
                                  )}
                                  {prod.invoiceNumber && (
                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                      Inv #{prod.invoiceNumber}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                  <span>Serial: <strong>{prod.serialNumber}</strong></span>
                                  <button
                                    onClick={() => handleCopySerial(prod.serialNumber)}
                                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors inline-flex items-center gap-1 text-[11px] font-sans"
                                    title="Copy Serial Number"
                                  >
                                    {copiedSerial === prod.serialNumber ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="text-emerald-600 font-bold">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span className="hover:underline">Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isExpired ? (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Warranty Expired</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Active Warranty ({calc?.diffDays} days left)</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Full Product & Warranty Specs Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700">
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Purchase</span>
                                <span className="font-bold text-slate-900">
                                  {prod.purchaseDate ? new Date(prod.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Warranty Period</span>
                                <span className="font-bold text-slate-900">{prod.warrantyYears} Year(s) Full Coverage</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Warranty Valid Until</span>
                                <span className={`font-bold ${isExpired ? 'text-rose-600' : 'text-emerald-700'}`}>
                                  {calc?.expFormatted || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Invoice</span>
                                <span className="font-bold text-slate-900">
                                  {prod.invoiceNumber || 'On Record (JV Controls)'}
                                </span>
                              </div>

                              {prod.address && (
                                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-slate-600">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                  <span><strong>Installation Address:</strong> {prod.address}</span>
                                </div>
                              )}

                              {prod.notes && (
                                <div className="col-span-2 sm:col-span-4 bg-white p-2.5 rounded-xl border border-slate-200/60 text-slate-600">
                                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Configuration & Technical Notes</span>
                                  <span>{prod.notes}</span>
                                </div>
                              )}
                            </div>

                            {/* Customer 6-Month Warranty Periodic Maintenance Timeline with RED INDICATOR FOR PENDING */}
                            <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/90 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-[#004b87]/10 text-[#004b87] flex items-center justify-center font-bold">
                                    <Wrench className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-black text-xs text-slate-900">
                                        6-Month Complimentary Periodic Maintenance Schedule
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      Complimentary checkup every 6 months: battery gravity, terminal cleaning & load testing.
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Overdue alert pill */}
                                  {overdueCount > 0 && (
                                    <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                                      <span>🚨 {overdueCount} Service{overdueCount > 1 ? 's' : ''} Overdue</span>
                                    </span>
                                  )}

                                  {/* Due soon alert pill */}
                                  {dueSoonCount > 0 && (
                                    <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                      <span>🔴 {dueSoonCount} Due Soon</span>
                                    </span>
                                  )}

                                  {/* Upcoming badge if no overdue or due soon */}
                                  {pendingActionCount === 0 && upcomingCount > 0 && (
                                    <span className="bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                      <span>🗓️ {upcomingCount} Upcoming</span>
                                    </span>
                                  )}

                                  <span className={`font-black px-2.5 py-0.5 rounded-full text-[11px] ${
                                    servicedCount === totalServices
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {servicedCount} / {totalServices} Serviced
                                  </span>
                                </div>
                              </div>

                              {/* Service Cards Grid: Serviced is Green, Action Due is Red/Amber, Upcoming is Slate */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {schedule.map((service: any) => {
                                  const info = getServiceMilestoneInfo(service);
                                  const isServiced = info.statusKey === 'SERVICED';
                                  const dueDateFormatted = service.dueDate
                                    ? new Date(service.dueDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    : 'N/A';

                                  return (
                                    <div
                                      key={service.serviceNumber}
                                      className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between gap-2.5 transition-all ${info.cardClass}`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2">
                                          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${info.iconBgClass}`}>
                                            {isServiced ? (
                                              <Check className="w-3.5 h-3.5" />
                                            ) : info.isOverdue ? (
                                              <AlertTriangle className="w-3.5 h-3.5" />
                                            ) : info.isDueSoon ? (
                                              <Clock className="w-3.5 h-3.5" />
                                            ) : (
                                              <Calendar className="w-3.5 h-3.5" />
                                            )}
                                          </div>
                                          <div>
                                            <div className="font-black text-xs text-slate-900">
                                              {service.label || `Service #${service.serviceNumber} (${service.monthInterval}M)`}
                                            </div>
                                            <div className="text-[11px] mt-0.5">
                                              <span className={isServiced ? 'text-slate-500' : info.isOverdue ? 'text-rose-700' : info.isDueSoon ? 'text-amber-800' : 'text-slate-500'}>Due: </span>
                                              <strong className={isServiced ? 'text-slate-800' : info.isOverdue ? 'text-rose-900 font-black' : info.isDueSoon ? 'text-amber-950 font-black' : 'text-slate-700 font-bold'}>
                                                {dueDateFormatted}
                                              </strong>
                                            </div>
                                            {isServiced && (
                                              <div className="text-[10px] text-emerald-700 font-bold mt-1">
                                                ✓ Completed {service.servicedDate ? new Date(service.servicedDate).toLocaleDateString('en-IN') : ''}
                                              </div>
                                            )}
                                            {!isServiced && (
                                              <div className={`text-[10px] font-bold mt-1 ${info.isOverdue ? 'text-rose-700' : info.isDueSoon ? 'text-amber-800' : 'text-slate-500'}`}>
                                                {info.statusLabel}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${info.badgeClass}`}>
                                          {info.badgeText}
                                        </span>
                                      </div>

                                      {/* Quick WhatsApp Service Booking Button for Action Due Services */}
                                      {(info.isOverdue || info.isDueSoon) && (
                                        <a
                                          href={`https://wa.me/919500087723?text=${encodeURIComponent(
                                            `Hi JV Controls, I would like to schedule my complimentary 6-Month Service #${service.serviceNumber} for my ${prod.productName} (S/N: ${prod.serialNumber}). Address: ${prod.address || ''}.`
                                          )}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-black text-[11px] text-white transition-all shadow-xs ${
                                            info.isOverdue ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'
                                          } active:scale-95`}
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                          <span>Book Free Service #{service.serviceNumber} on WhatsApp</span>
                                        </a>
                                      )}

                                      {info.isUpcoming && (
                                        <div className="text-[10px] text-slate-400 italic text-center pt-1 border-t border-slate-100">
                                          Scheduled checkup — reminder will be sent before due date
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Product Card Footer Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                              <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                <span>Free emergency on-site technician response across Chennai within warranty.</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:+919500087723`}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                                >
                                  <Phone className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Call Support</span>
                                </a>

                                <a
                                  href={`https://wa.me/919500087723?text=${encodeURIComponent(`Hi JV Controls, I need emergency service/support for my ${prod.productName} (S/N: ${prod.serialNumber}). Installed at: ${prod.address}.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-white bg-[#004b87] hover:bg-[#003866] transition-all shadow-xs"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                                  <span>Request Service on WhatsApp</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* UNIFIED ACCOUNT PROFILE */}
              {/* ============================================================== */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5 animate-in fade-in duration-200">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                    Account Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-400 font-bold block mb-1">Full Name</span>
                      <span className="font-extrabold text-slate-900 text-sm">{user?.name}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-400 font-bold block mb-1">Email Address</span>
                      <span className="font-extrabold text-slate-900 text-sm">{user?.email}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-400 font-bold block mb-1">Mobile Phone</span>
                      <span className="font-extrabold text-slate-900 text-sm">{user?.mobile || 'Not set'}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                      <span className="text-slate-400 font-bold block mb-1">Role / Access Level</span>
                      <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        {isAdmin ? (
                          <>
                            <ShieldAlert className="w-4 h-4 text-amber-600" />
                            <span>Authorized Administrator</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Verified Customer</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs text-slate-700 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#004b87] shrink-0 mt-0.5" />
                    <div>
                      <strong>JV Controls Direct Hotline:</strong> Call <strong>+91 9500087723</strong> or <strong>+91 9841619346</strong> for immediate quotation confirmation, emergency dispatch, or on-site load evaluation in Anna Nagar, Ambattur, and across Chennai.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>JV Controls Chennai • Encrypted Session Active</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
          >
            Close Portal
          </button>
        </div>

        {/* ============================================================== */}
        {/* MODAL: CUSTOMER PRODUCT & WARRANTY DATA ENTRY FORM */}
        {/* ============================================================== */}
        {isProductModalOpen && (
          <div
            className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isSavingProduct) setIsProductModalOpen(false);
            }}
          >
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Form Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-[#002f5c] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white">
                      {editingProductId ? 'Edit Customer & Product Warranty Record' : 'New Customer & Product Data Entry'}
                    </h3>
                    <p className="text-[11px] text-slate-300">
                      Enter customer details, address, product, serial number, and warranty years.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => !isSavingProduct && setIsProductModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 flex-1">
                {productFormError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{productFormError}</span>
                  </div>
                )}

                {productFormSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{productFormSuccess}</span>
                  </div>
                )}

                {/* Quick Product Preset Chips */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Quick Select Popular Products & Standard Warranty:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRODUCT_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFormProductName(preset.name);
                          setFormCategory(preset.category);
                          setFormWarrantyYears(preset.warranty);
                        }}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                          formProductName === preset.name
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        {preset.name} ({preset.warranty}Y)
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Customer / Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Hospital / Rajesh Kumar"
                      value={formCustomerName}
                      onChange={(e) => setFormCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Customer Mobile */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Customer Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9500087723"
                      value={formMobile}
                      onChange={(e) => setFormMobile(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Customer Email */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Customer Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Product Category */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Equipment Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Online UPS">Online UPS</option>
                      <option value="Inverter">Inverter</option>
                      <option value="Tubular Battery">Tubular Battery</option>
                      <option value="SMF Battery">SMF Battery</option>
                      <option value="Servo Stabilizer">Servo Stabilizer</option>
                      <option value="Solar System">Solar System</option>
                      <option value="Other">Other Equipment</option>
                    </select>
                  </div>
                </div>

                {/* Installation Address */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Installation / Site Address *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Plot No. 1957, 13th Main Road, Annanagar East, Chennai - 600040"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Product Name & Serial Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Product Name & Model *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5kVA True Online UPS (1:1)"
                      value={formProductName}
                      onChange={(e) => setFormProductName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Product Serial Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JVC-2026-UPS-8841"
                      value={formSerialNumber}
                      onChange={(e) => setFormSerialNumber(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold uppercase bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Purchase Date & Warranty Years */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Date of Buying / Purchase *
                    </label>
                    <input
                      type="date"
                      required
                      value={formPurchaseDate}
                      onChange={(e) => setFormPurchaseDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Warranty Period (Years) *
                    </label>
                    <select
                      value={formWarrantyYears}
                      onChange={(e) => setFormWarrantyYears(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value={1}>1 Year Warranty</option>
                      <option value={2}>2 Years Warranty</option>
                      <option value={3}>3 Years Warranty</option>
                      <option value={4}>4 Years Warranty</option>
                      <option value={5}>5 Years Warranty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Invoice / Bill # (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. JVC/2026/045"
                      value={formInvoiceNumber}
                      onChange={(e) => setFormInvoiceNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Live Warranty Expiry Calculation Box */}
                {(() => {
                  const preview = getWarrantyCalculation(formPurchaseDate, formWarrantyYears);
                  if (!preview) return null;
                  return (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Auto-Calculated Warranty Expiry Date:
                        </span>
                        <span className="text-base font-black text-emerald-900">
                          {preview.expFormatted}
                        </span>
                      </div>

                      <div>
                        {preview.isActive ? (
                          <span className="bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-xs">
                            Active Coverage ({preview.diffDays} days remaining)
                          </span>
                        ) : (
                          <span className="bg-rose-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-xs">
                            Expired ({Math.abs(preview.diffDays)} days ago)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Remarks & Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Installation Remarks / Battery Details (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Installed with 16 nos 12V 26Ah SMF batteries in 2nd floor server room"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isSavingProduct}
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-6 py-2.5 rounded-2xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {isSavingProduct ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Entry...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{editingProductId ? 'Update Record' : 'Save Customer & Asset Entry'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ADMIN NOTIFICATIONS DRAWER / MODAL */}
        {/* ============================================================== */}
        {isAdmin && isNotificationOpen && (
          <div
            className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsNotificationOpen(false);
            }}
          >
            <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#002f5c] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700 shrink-0">
                <div className="flex items-center justify-between w-full sm:w-auto gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-xs shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-black text-white">Admin Notifications</h3>
                        {unreadCount > 0 ? (
                          <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                            {unreadCount} Unread
                          </span>
                        ) : (
                          <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                            All Cleared
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-1 sm:line-clamp-none">
                        Live alerts for new inquiries, 6M services & warranty expiries.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors sm:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={handleScanAndDispatchAllEmails}
                    disabled={sendingEmailKey === 'scan-all'}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-sky-300 bg-sky-950/70 hover:bg-sky-900 border border-sky-800/80 transition-all active:scale-95 shadow-xs disabled:opacity-50"
                    title="Scan all registered customer equipment and dispatch due 6-month service and warranty expiry alert emails to Customer & Admin"
                  >
                    {sendingEmailKey === 'scan-all' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    <span>{sendingEmailKey === 'scan-all' ? 'Scanning...' : 'Scan & Send Due Emails'}</span>
                  </button>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/80 transition-all active:scale-95 shadow-xs"
                      title="Clear all active notifications"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Read</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsNotificationOpen(false)}
                    className="hidden sm:block p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notification Filter Tabs */}
              <div className="px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
                <button
                  onClick={() => setNotificationFilter('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    notificationFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  All ({unreadCount})
                </button>

                <button
                  onClick={() => setNotificationFilter('INQUIRY')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    notificationFilter === 'INQUIRY'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <FileText className="w-3 h-3 text-blue-500" />
                  <span>New Inquiries ({inquiryNotifCount})</span>
                </button>

                <button
                  onClick={() => setNotificationFilter('SERVICE')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    notificationFilter === 'SERVICE'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>6M Services ({serviceNotifCount})</span>
                </button>

                <button
                  onClick={() => setNotificationFilter('WARRANTY')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    notificationFilter === 'WARRANTY'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <ShieldAlert className="w-3 h-3 text-amber-500" />
                  <span>Warranties ({warrantyNotifCount})</span>
                </button>
              </div>

              {/* Notification Items List */}
              <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-3 bg-slate-50">
                {filteredUnreadNotifications.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-sm text-slate-900">
                      All Caught Up! No Unread Alerts
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      All new inquiries, 6-month maintenance service schedules, and warranty expiration alerts have been reviewed and marked as read.
                    </p>
                  </div>
                ) : (
                  filteredUnreadNotifications.map((notif) => {
                    const isService = notif.type === 'SERVICE';
                    const isWarranty = notif.type === 'WARRANTY';
                    const isInquiry = notif.type === 'INQUIRY';

                    return (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-2xl border transition-all bg-white hover:shadow-md flex flex-col gap-3 relative overflow-hidden ${
                          isService
                            ? 'border-rose-200 ring-1 ring-rose-100'
                            : isWarranty
                            ? 'border-amber-200 ring-1 ring-amber-100'
                            : 'border-blue-200 ring-1 ring-blue-100'
                        }`}
                      >
                        {/* Accent left indicator bar */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            isService ? 'bg-rose-500' : isWarranty ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                        />

                        <div className="flex items-start justify-between gap-3 pl-1">
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-white ${
                                isService ? 'bg-rose-600' : isWarranty ? 'bg-amber-600' : 'bg-blue-600'
                              }`}
                            >
                              {isService ? (
                                <Wrench className="w-3.5 h-3.5" />
                              ) : isWarranty ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : (
                                <FileText className="w-3.5 h-3.5" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                  {notif.category}
                                </span>
                                {notif.urgency === 'CRITICAL' && (
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600 text-white animate-pulse">
                                    🚨 OVERDUE
                                  </span>
                                )}
                              </div>
                              <h4 className="font-extrabold text-xs text-slate-900 mt-1">
                                {notif.title}
                              </h4>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              {notif.phone && (
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5">
                                  <span>Phone: <strong>{notif.phone}</strong></span>
                                  {notif.email && <span>Email: <strong>{notif.email}</strong></span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on notification card */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 pl-1 flex-wrap">
                          {isService && notif.meta?.prod && notif.meta?.service && (
                            <button
                              type="button"
                              disabled={
                                sendingEmailKey ===
                                `service-${notif.meta.prod._id || notif.meta.prod.id || notif.meta.prod.serialNumber}-${notif.meta.service.serviceNumber}`
                              }
                              onClick={() =>
                                handleSendServiceMilestoneEmail(
                                  notif.meta.prod._id || notif.meta.prod.id || notif.meta.prod.serialNumber,
                                  notif.meta.service.serviceNumber
                                )
                              }
                              className="text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                              title="Send 6-Month service reminder email to Customer & Admin"
                            >
                              <Mail className="w-3.5 h-3.5 text-sky-600" />
                              <span>
                                {sendingEmailKey ===
                                `service-${notif.meta.prod._id || notif.meta.prod.id || notif.meta.prod.serialNumber}-${notif.meta.service.serviceNumber}`
                                  ? 'Sending Email...'
                                  : notif.meta.service.emailNotifiedAt
                                  ? `Re-send Alert (${new Date(notif.meta.service.emailNotifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`
                                  : '📧 Send Email Alert'}
                              </span>
                            </button>
                          )}

                          {isWarranty && notif.meta?.prod && (
                            <button
                              type="button"
                              disabled={
                                sendingEmailKey ===
                                `warranty-${notif.meta.prod._id || notif.meta.prod.id || notif.meta.prod.serialNumber}`
                              }
                              onClick={() =>
                                handleSendWarrantyExpiryEmail(
                                  notif.meta.prod._id || notif.meta.prod.id || notif.meta.prod.serialNumber
                                )
                              }
                              className="text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                              title="Send warranty expiry notice email to Customer & Admin"
                            >
                              <Mail className="w-3.5 h-3.5 text-amber-700" />
                              <span>
                                {sendingEmailKey ===
                                `warranty-${notif.meta.prod._id || notif.meta.prod.id || notif.meta.prod.serialNumber}`
                                  ? 'Sending Email...'
                                  : notif.meta.prod.warrantyEmailNotifiedAt
                                  ? `Re-send Alert (${new Date(notif.meta.prod.warrantyEmailNotifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })})`
                                  : '📧 Send Email Alert'}
                              </span>
                            </button>
                          )}

                          <button
                            onClick={() => handleMarkNotificationRead(notif.id)}
                            className="text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                            title="Mark as read and clear notification"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark as Read</span>
                          </button>

                          <button
                            onClick={() => handleNavigateFromNotification(notif)}
                            className="text-xs font-black text-white bg-slate-900 hover:bg-[#004b87] px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                          >
                            <span>{notif.actionLabel || 'View Record'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <span>
                  Showing {filteredUnreadNotifications.length} of {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="text-xs font-black text-[#004b87] hover:underline"
                  >
                    Clear All Notifications
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

