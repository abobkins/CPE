"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp,
  BarChart3,
  Globe,
  FileText,
  CheckSquare,
  Settings,
  AlertTriangle,
  Download,
  Upload,
  X,
  ChevronRight,
  Shield,
  Info,
  Calendar,
  Building2,
  Mail,
  Phone,
  User,
  RefreshCw,
  Sliders,
  Database,
  Layers,
  Grid,
  List,
  Check,
  PlusCircle,
  HelpCircle,
  Clock,
  Briefcase,
  Inbox
} from "lucide-react";

interface SupportMeasure {
  id: string;
  name: string;
  serviceType: "exhibition" | "business_mission" | "search_and_selection" | "etp_placement" | "reverse_business_mission" | "interregional_mission" | "other";
  serviceCategory: "complex" | "popularization";
  requestDate: string;
  receiptDate: string;
  amount: number;
  status: string;
  conversion: {
    hasContract: boolean;
    contractCountry: string;
    contractAmount: number;
    contractDate: string;
    isNewExporter: boolean;
  } | null;
}

interface Interaction {
  id: string;
  date: string;
  author: string;
  text: string;
}

interface Task {
  id: string;
  text: string;
  date: string;
  status: "pending" | "completed";
  assignedTo: string;
}

interface ChangeLog {
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

interface Company {
  id: number;
  inn: string;
  name: string;
  statusExporter: string;
  cpeCooperation: boolean;
  mspStatus: boolean;
  categoryMsp: string;
  sphere: string;
  sector: string;
  mainActivity: string;
  products: string;
  emailMinprom: string | null;
  phoneMinprom: string | null;
  contactMinprom: string | null;
  emailCpe: string | null;
  phoneCpe: string | null;
  contactCpe: string | null;
  exportVolume2023: number;
  exportVolume2024: number;
  exportVolume2025: number;
  exportCountries: string;
  tnved: string;
  supportMeasures: SupportMeasure[];
  interactions: Interaction[];
  tasks: Task[];
  customFields: Record<string, any>;
  changeLogs: ChangeLog[];
  notes: string;
  needsUpdate: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CustomFieldDef {
  id: number;
  key: string;
  label: string;
  type: string;
}

interface Application {
  id: number;
  source: string;
  sourceUrl: string;
  companyId: number | null;
  companyName: string;
  companyInn: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "completed" | "rejected";
  assignedTo: string;
  processedAt: string | null;
  processedBy: string | null;
  comment: string;
  rawData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface KpiTarget {
  id: number;
  year: number;
  supportedExportVolume: number;
  countryDiversification: number;
  newExporters: number;
}

export default function CrmApp() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // App settings
  const [darkMode, setDarkMode] = useState(false);
  const [currentRole, setCurrentRole] = useState<"admin" | "manager" | "analyst">("admin");
  const [activeTab, setActiveTab] = useState<"dashboard" | "catalog" | "directory" | "applications" | "custom_fields" | "kpi_targets">("dashboard");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [filters, setFilters] = useState({
    sphere: "",
    statusExporter: "",
    cpeCooperation: "",
    categoryMsp: "",
    needsUpdate: "",
    hasContacts: "",
    tnved: "",
  });

  // Selected companies for bulk actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Detailed view
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyDetailTab, setCompanyDetailTab] = useState<"general" | "contacts" | "export" | "support" | "interactions" | "audit">("general");

  // Modals & form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Form inputs for creating a new company
  const [newCompanyData, setNewCompanyData] = useState({
    inn: "",
    name: "",
    statusExporter: "не экспортер",
    cpeCooperation: false,
    mspStatus: true,
    categoryMsp: "Микро",
    sphere: "Прочие",
    sector: "",
    mainActivity: "",
    products: "",
    emailMinprom: "",
    phoneMinprom: "",
    contactMinprom: "",
    emailCpe: "",
    phoneCpe: "",
    contactCpe: "",
    exportVolume2023: 0,
    exportVolume2024: 0,
    exportVolume2025: 0,
    exportCountries: "",
    tnved: "",
    notes: "",
    customFields: {} as Record<string, any>,
  });

  // Form inputs for dynamic custom field creation
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");

  // Form inputs for bulk actions
  const [bulkUpdates, setBulkUpdates] = useState({
    statusExporter: "",
    cpeCooperation: "",
    sphere: "",
    categoryMsp: "",
    needsUpdate: "",
  });

  // Form inputs for detail interactions/tasks/measures
  const [newInteractionText, setNewInteractionText] = useState("");
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState("");
  
  const [newMeasureName, setNewMeasureName] = useState("");
  const [newMeasureServiceType, setNewMeasureServiceType] = useState<string>("exhibition");
  const [newMeasureRequestDate, setNewMeasureRequestDate] = useState("");
  const [newMeasureReceiptDate, setNewMeasureReceiptDate] = useState("");
  const [newMeasureStatus, setNewMeasureStatus] = useState("Одобрено");
  const [newMeasureAmount, setNewMeasureAmount] = useState(0);
  const [newMeasureConversion, setNewMeasureConversion] = useState(false);
  const [newMeasureContractCountry, setNewMeasureContractCountry] = useState("");
  const [newMeasureContractAmount, setNewMeasureContractAmount] = useState(0);
  const [newMeasureContractDate, setNewMeasureContractDate] = useState("");
  const [newMeasureIsNewExporter, setNewMeasureIsNewExporter] = useState(false);

  // KPI Targets state
  const [kpiTargets, setKpiTargets] = useState<KpiTarget>({ id: 0, year: 2026, supportedExportVolume: 500, countryDiversification: 15, newExporters: 10 });
  const [kpiEditVolume, setKpiEditVolume] = useState(500);
  const [kpiEditCountries, setKpiEditCountries] = useState(15);
  const [kpiEditNewExporters, setKpiEditNewExporters] = useState(10);
  const [kpiEditYear, setKpiEditYear] = useState(2026);

  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsFilterStatus, setAppsFilterStatus] = useState("");
  const [appsSearch, setAppsSearch] = useState("");
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showAppDetail, setShowAppDetail] = useState(false);
  const [appNewStatus, setAppNewStatus] = useState<string>("");
  const [appNewComment, setAppNewComment] = useState("");
  const [appNewAssignee, setAppNewAssignee] = useState("");

  // Excel / CSV Import state
  const [csvText, setCsvText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExcelFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus("Читаем файл Excel/CSV...");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Array<string | number | boolean | null>>(worksheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      const semicolonCsv = rows
        .map((row) =>
          row
            .map((cell) => {
              const value = String(cell ?? "").replace(/\r?\n/g, " ").trim();
              return value.includes(";") || value.includes('"')
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(";")
        )
        .join("\n");

      setCsvText(semicolonCsv);
      setImportStatus(`Файл прочитан: ${rows.length > 1 ? rows.length - 1 : 0} строк данных. Нажмите «Импортировать».`);
    } catch (e: any) {
      setImportStatus(null);
      alert(`Не удалось прочитать файл: ${e.message}`);
    } finally {
      event.target.value = "";
    }
  };

  // Load companies & custom fields
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const compRes = await fetch(`/api/companies?search=${encodeURIComponent(searchQuery)}&sphere=${filters.sphere}&statusExporter=${filters.statusExporter}&cpeCooperation=${filters.cpeCooperation}&categoryMsp=${filters.categoryMsp}&needsUpdate=${filters.needsUpdate}&hasContacts=${filters.hasContacts}&tnved=${encodeURIComponent(filters.tnved)}`);
      if (!compRes.ok) throw new Error("Не удалось загрузить реестр компаний");
      const compData = await compRes.json();
      setCompanies(compData);

      const cfRes = await fetch("/api/custom-fields");
      if (cfRes.ok) {
        const cfData = await cfRes.json();
        setCustomFields(cfData);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  // Load applications
  const fetchApplications = async () => {
    setAppsLoading(true);
    try {
      const params = new URLSearchParams();
      if (appsFilterStatus) params.set("status", appsFilterStatus);
      if (appsSearch) params.set("search", appsSearch);
      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (e) {
      console.error("Ошибка загрузки заявок:", e);
    } finally {
      setAppsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchApplications();
  }, [appsFilterStatus, appsSearch]);

  // Load KPI targets
  const fetchKpiTargets = async () => {
    try {
      const res = await fetch("/api/kpi-targets");
      if (res.ok) {
        const data = await res.json();
        setKpiTargets(data);
        setKpiEditVolume(data.supportedExportVolume);
        setKpiEditCountries(data.countryDiversification);
        setKpiEditNewExporters(data.newExporters);
        setKpiEditYear(data.year);
      }
    } catch (e) {
      console.error("Ошибка загрузки KPI:", e);
    }
  };

  useEffect(() => {
    fetchKpiTargets();
  }, []);

  // Load single company if selected
  const fetchSingleCompany = async (id: number) => {
    try {
      const res = await fetch(`/api/companies/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCompany(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки карточки компании:", error);
    }
  };

  useEffect(() => {
    if (selectedCompanyId) {
      fetchSingleCompany(selectedCompanyId);
    } else {
      setSelectedCompany(null);
    }
  }, [selectedCompanyId]);

  // Save general company details edits
  const handleSaveCompanyEdit = async (updatedFields: Partial<Company>) => {
    if (!selectedCompany) return;
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatedFields,
          userName: `Оператор (${currentRole})`,
          actionType: "edit_fields",
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCompany(updated);
        // Refresh items list
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        alert("Ошибка при сохранении изменений");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add interaction logs
  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !newInteractionText.trim()) return;
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "add_interaction",
          interactionText: newInteractionText,
          userName: `Пользователь (${currentRole})`,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCompany(updated);
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
        setNewInteractionText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !newTaskText.trim()) return;
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "add_task",
          taskText: newTaskText,
          taskDate: newTaskDate || new Date().toISOString().split("T")[0],
          taskAssignedTo: newTaskAssignedTo || "Менеджер",
          userName: `Пользователь (${currentRole})`,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCompany(updated);
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
        setNewTaskText("");
        setNewTaskDate("");
        setNewTaskAssignedTo("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Task Status
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!selectedCompany) return;
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "toggle_task",
          taskId,
          taskStatus: nextStatus,
          userName: `Пользователь (${currentRole})`,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCompany(updated);
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Support Measure
  const handleAddSupportMeasure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany || !newMeasureName.trim()) return;

    const serviceCategory: "complex" | "popularization" =
      ["exhibition", "business_mission", "search_and_selection", "etp_placement", "reverse_business_mission", "interregional_mission"].includes(newMeasureServiceType)
        ? "complex" : "popularization";

    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "add_measure",
          measureName: newMeasureName,
          measureServiceType: newMeasureServiceType,
          measureServiceCategory: serviceCategory,
          measureRequestDate: newMeasureRequestDate || new Date().toISOString().split("T")[0],
          measureReceiptDate: newMeasureReceiptDate || new Date().toISOString().split("T")[0],
          measureStatus: newMeasureStatus,
          measureAmount: newMeasureAmount,
          measureConversion: newMeasureConversion ? {
            hasContract: true,
            contractCountry: newMeasureContractCountry,
            contractAmount: newMeasureContractAmount,
            contractDate: newMeasureContractDate || new Date().toISOString().split("T")[0],
            isNewExporter: newMeasureIsNewExporter,
          } : null,
          userName: `Пользователь (${currentRole})`,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCompany(updated);
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
        setNewMeasureName("");
        setNewMeasureServiceType("exhibition");
        setNewMeasureRequestDate("");
        setNewMeasureReceiptDate("");
        setNewMeasureStatus("Одобрено");
        setNewMeasureAmount(0);
        setNewMeasureConversion(false);
        setNewMeasureContractCountry("");
        setNewMeasureContractAmount(0);
        setNewMeasureContractDate("");
        setNewMeasureIsNewExporter(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Support Measure
  const handleDeleteSupportMeasure = async (measureId: string) => {
    if (!selectedCompany) return;
    if (!confirm("Вы действительно хотите удалить эту меру поддержки?")) return;
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "delete_measure",
          measureId,
          userName: `Пользователь (${currentRole})`,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedCompany(updated);
        setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reset database to seed data
  const handleResetDb = async () => {
    if (!confirm("Вы уверены, что хотите сбросить базу данных? Все текущие изменения будут заменены на 8 эталонных компаний с историей.")) return;
    try {
      setLoading(true);
      const res = await fetch("/api/companies/seed", { method: "POST" });
      if (res.ok) {
        await fetchAllData();
        setSelectedCompanyId(null);
        setSelectedIds([]);
        alert("База данных успешно пересоздана!");
      } else {
        alert("Не удалось пересоздать демонстрационные данные");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Create Company
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyData.inn || !newCompanyData.name) {
      alert("ИНН и Наименование обязательны");
      return;
    }
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCompanyData,
          userName: `Пользователь (${currentRole})`
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setCompanies(prev => [created, ...prev]);
        setShowAddModal(false);
        // Reset form
        setNewCompanyData({
          inn: "",
          name: "",
          statusExporter: "не экспортер",
          cpeCooperation: false,
          mspStatus: true,
          categoryMsp: "Микро",
          sphere: "Прочие",
          sector: "",
          mainActivity: "",
          products: "",
          emailMinprom: "",
          phoneMinprom: "",
          contactMinprom: "",
          emailCpe: "",
          phoneCpe: "",
          contactCpe: "",
          exportVolume2023: 0,
          exportVolume2024: 0,
          exportVolume2025: 0,
          exportCountries: "",
          tnved: "",
          notes: "",
          customFields: {},
        });
        setSelectedCompanyId(created.id);
        setCompanyDetailTab("general");
      } else {
        const err = await res.json();
        alert(`Ошибка при добавлении: ${err.error || "Неизвестная ошибка"}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Company
  const handleDeleteCompany = async (id: number) => {
    if (currentRole === "analyst") {
      alert("У роли 'Аналитик' нет прав на удаление данных");
      return;
    }
    if (!confirm("Вы уверены, что хотите безвозвратно удалить эту компанию из реестра?")) return;
    try {
      const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== id));
        if (selectedCompanyId === id) {
          setSelectedCompanyId(null);
        }
      } else {
        alert("Не удалось удалить компанию");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk Edit
  const handleBulkEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    
    // Construct updates map, clean empty fields
    const updates: Record<string, any> = {};
    if (bulkUpdates.statusExporter) updates.statusExporter = bulkUpdates.statusExporter;
    if (bulkUpdates.sphere) updates.sphere = bulkUpdates.sphere;
    if (bulkUpdates.categoryMsp) updates.categoryMsp = bulkUpdates.categoryMsp;
    
    if (bulkUpdates.cpeCooperation !== "") {
      updates.cpeCooperation = bulkUpdates.cpeCooperation === "true";
    }
    if (bulkUpdates.needsUpdate !== "") {
      updates.needsUpdate = bulkUpdates.needsUpdate === "true";
    }

    if (Object.keys(updates).length === 0) {
      alert("Пожалуйста, выберите хотя бы одно поле для изменения");
      return;
    }

    try {
      const res = await fetch("/api/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyIds: selectedIds,
          updates,
          userName: `Массовое редактирование (${currentRole})`
        }),
      });
      if (res.ok) {
        await fetchAllData();
        setSelectedIds([]);
        setShowBulkEditModal(false);
        setBulkUpdates({
          statusExporter: "",
          cpeCooperation: "",
          sphere: "",
          categoryMsp: "",
          needsUpdate: "",
        });
        alert("Компании успешно обновлены!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Custom Field Definition
  const handleCreateCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldKey || !newFieldLabel) {
      alert("Необходимо указать ключ и русское название");
      return;
    }
    try {
      const res = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newFieldKey,
          label: newFieldLabel,
          type: newFieldType,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setCustomFields(prev => [...prev, created]);
        setNewFieldKey("");
        setNewFieldLabel("");
        setShowCustomFieldModal(false);
        alert("Новое поле успешно добавлено! Вы можете заполнять его в карточках компаний.");
      } else {
        const err = await res.json();
        alert(`Ошибка добавления поля: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (companies.length === 0) {
      alert("Нет данных для экспорта");
      return;
    }
    const headers = [
      "ИНН",
      "Наименование",
      "Сфера",
      "Отрасль",
      "Основной вид деятельности",
      "Статус экспортера",
      "ЦПЭ",
      "МСП Категория",
      "Продукция",
      "Минпром Контакт",
      "Минпром Телефон",
      "Минпром Почта",
      "ЦПЭ Контакт",
      "ЦПЭ Телефон",
      "ЦПЭ Почта",
      "Экспорт 2023 (млн руб)",
      "Экспорт 2024 (млн руб)",
      "Экспорт 2025 (млн руб)",
      "Страны экспорта",
      "ТН ВЭД"
    ];
    
    // Add custom fields to headers
    const cfKeys = customFields.map(f => f.key);
    const cfLabels = customFields.map(f => f.label);
    const allHeaders = [...headers, ...cfLabels];

    const csvRows = [
      allHeaders.join(";")
    ];

    for (const c of companies) {
      const row = [
        c.inn || "",
        `"${(c.name || "").replace(/"/g, '""')}"`,
        c.sphere || "",
        c.sector || "",
        `"${(c.mainActivity || "").replace(/"/g, '""')}"`,
        c.statusExporter || "",
        c.cpeCooperation ? "Да" : "Нет",
        c.categoryMsp || "Микро",
        `"${(c.products || "").replace(/"/g, '""')}"`,
        c.contactMinprom || "",
        c.phoneMinprom || "",
        c.emailMinprom || "",
        c.contactCpe || "",
        c.phoneCpe || "",
        c.emailCpe || "",
        c.exportVolume2023,
        c.exportVolume2024,
        c.exportVolume2025,
        `"${(c.exportCountries || "").replace(/"/g, '""')}"`,
        `"${(c.tnved || "").replace(/"/g, '""')}"`
      ];

      // Add custom fields data
      for (const cfKey of cfKeys) {
        const val = c.customFields?.[cfKey] !== undefined ? String(c.customFields[cfKey]) : "";
        row.push(`"${val.replace(/"/g, '""')}"`);
      }

      csvRows.push(row.join(";"));
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ExportCompass_Companies_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Import parser and simulation
  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      alert("Введите CSV-данные или скопируйте их");
      return;
    }

    try {
      const lines = csvText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        alert("Слишком мало строк. Убедитесь, что первая строка содержит заголовки, а последующие — данные.");
        return;
      }

      // Simple semicolon parser
      const parseCsvLine = (line: string) => {
        const result = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ';' && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = parseCsvLine(lines[0]);
      const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/\s+/g, " ").trim());
      let countImported = 0;

      const findHeader = (...needles: string[]) =>
        normalizedHeaders.findIndex((header) => needles.some((needle) => header.includes(needle)));

      const getValue = (values: string[], index: number) => index !== -1 ? (values[index] || "").trim() : "";

      const parseBooleanRu = (value: string) => {
        const normalized = value.toLowerCase().trim();
        return ["да", "yes", "true", "1", "+", "есть"].includes(normalized);
      };

      const normalizeExporterStatus = (value: string) => {
        const normalized = value.toLowerCase().trim();
        if (normalized.includes("2025")) return "2025 г.";
        if (normalized.includes("не") && normalized.includes("экспорт")) return "не экспортер";
        if (normalized.includes("экспорт")) return "экспортер";
        return value || "не экспортер";
      };

      const normalizeMspCategory = (value: string) => {
        const normalized = value.toLowerCase().trim();
        if (normalized.includes("сред")) return "Среднее";
        if (normalized.includes("мал")) return "Малое";
        if (normalized.includes("мик")) return "Микро";
        return "Микро";
      };

      const inferSphere = (sector: string, products: string) => {
        const textValue = `${sector} ${products}`.toLowerCase();
        if (["агро", "апк", "пищ", "зерн", "мед", "молок", "мяс", "сад", "овощ", "масл", "пчел"].some(word => textValue.includes(word))) {
          return "АПК";
        }
        if (["пром", "маш", "металл", "элект", "дерево", "текст", "трикот", "хим", "оборуд", "кабель", "завод"].some(word => textValue.includes(word))) {
          return "Промышленность";
        }
        return "Прочие";
      };

      const innIdx = findHeader("инн");
      const nameIdx = findHeader("наименование", "название", "организация", "компания");
      const statusIdx = findHeader("статус (экспортер", "статус экспорт", "экспортер");
      const cpeIdx = findHeader("статус работы цпэ", "работы цпэ", "цпэ");
      const mspStatusIdx = findHeader("статус мсп");
      const mspCategoryIdx = findHeader("размер", "категория мсп", "категория");
      const sphereIdx = findHeader("сфера");
      const sectorIdx = findHeader("отрасль");
      const actIdx = findHeader("основной вид деятельности", "вид деятельности", "деятельности");
      const prodIdx = findHeader("продукция", "продукты", "товар");
      const emailMinIdx = findHeader("почта (минпром", "почта минпром", "email минпром", "e-mail минпром");
      const emailCpeIdx = findHeader("почта (цпэ", "почта цпэ", "email цпэ", "e-mail цпэ");
      const phoneMinIdx = findHeader("телефон (минпром", "телефон минпром");
      const phoneCpeIdx = findHeader("телефон (цпэ", "телефон цпэ");
      const contactMinIdx = findHeader("контактное лицо (минпром", "контакт минпром", "лицо минпром");
      const contactCpeIdx = findHeader("контактное лицо (цпэ", "контакт цпэ", "лицо цпэ");
      const tnvedIdx = findHeader("тн вэд", "код тн вэд", "коды тн вэд");

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length < 2) continue;

        const inn = getValue(values, innIdx);
        const name = getValue(values, nameIdx) || `Импорт_${Date.now()}_${i}`;
        const sector = getValue(values, sectorIdx) || "Не указана";
        const products = getValue(values, prodIdx);
        const sphere = getValue(values, sphereIdx) || inferSphere(sector, products);
        const mainActivity = getValue(values, actIdx) || "Не указан";
        const statusExporter = normalizeExporterStatus(getValue(values, statusIdx));
        const cpeCooperation = parseBooleanRu(getValue(values, cpeIdx));
        const mspStatus = parseBooleanRu(getValue(values, mspStatusIdx)) || !!getValue(values, mspCategoryIdx);
        const categoryMsp = normalizeMspCategory(getValue(values, mspCategoryIdx));
        const emailMinprom = getValue(values, emailMinIdx);
        const emailCpe = getValue(values, emailCpeIdx);
        const phoneMinprom = getValue(values, phoneMinIdx);
        const phoneCpe = getValue(values, phoneCpeIdx);
        const contactMinprom = getValue(values, contactMinIdx);
        const contactCpe = getValue(values, contactCpeIdx);
        const tnved = getValue(values, tnvedIdx);

        if (!inn && !name) continue;

        // Send request to create company
        const res = await fetch("/api/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            inn,
            name,
            sphere,
            sector,
            mainActivity,
            statusExporter,
            cpeCooperation,
            mspStatus,
            categoryMsp,
            products,
            emailMinprom,
            emailCpe,
            phoneMinprom,
            phoneCpe,
            contactMinprom,
            contactCpe,
            tnved,
            notes: "Импортировано из Excel/CSV-файла",
            userName: `Импорт Excel/CSV (${currentRole})`
          })
        });

        if (res.ok) {
          countImported++;
        }
      }

      setImportStatus(`Успешно импортировано компаний: ${countImported}`);
      await fetchAllData();
      setTimeout(() => {
        setShowImportModal(false);
        setCsvText("");
        setImportStatus(null);
      }, 2000);
    } catch (e: any) {
      alert(`Ошибка при парсинге CSV: ${e.message}`);
    }
  };

  // Toggle selection for bulk action
  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === companies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(companies.map(c => c.id));
    }
  };

  // Statistics calculation for Dashboard
  const stats = useMemo(() => {
    const total = companies.length;
    const exporters = companies.filter(c => c.statusExporter === "экспортер").length;
    const planning2025 = companies.filter(c => c.statusExporter === "2025 г.").length;
    const activeCpe = companies.filter(c => c.cpeCooperation).length;
    const mspCount = companies.filter(c => c.mspStatus).length;
    const needsUpdateCount = companies.filter(c => c.needsUpdate).length;

    // Spheres
    const sphereCounts = companies.reduce((acc, c) => {
      acc[c.sphere] = (acc[c.sphere] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Categories СМСП
    const mspCategories = companies.reduce((acc, c) => {
      acc[c.categoryMsp] = (acc[c.categoryMsp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sectors
    const sectorCounts = companies.reduce((acc, c) => {
      acc[c.sector] = (acc[c.sector] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Total exports volume sum
    const totalExport2025 = companies.reduce((sum, c) => sum + (c.exportVolume2025 || 0), 0);
    const totalExport2024 = companies.reduce((sum, c) => sum + (c.exportVolume2024 || 0), 0);

    // Support measures analytics
    const allMeasures = companies.flatMap(c => c.supportMeasures || []);
    const complexCount = allMeasures.filter(m => m.serviceCategory === "complex").length;
    const popularizationCount = allMeasures.filter(m => m.serviceCategory === "popularization").length;
    const complexCompanies = new Set(companies.filter(c => c.supportMeasures?.some(m => m.serviceCategory === "complex")).map(c => c.id)).size;
    const popularizationCompanies = new Set(companies.filter(c => c.supportMeasures?.some(m => m.serviceCategory === "popularization")).map(c => c.id)).size;

    // Service type breakdown for complex services
    const serviceTypeCounts = allMeasures.reduce((acc, m) => {
      if (m.serviceCategory === "complex") {
        acc[m.serviceType] = (acc[m.serviceType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // KPI: Supported export volume (sum of all contract amounts from conversions)
    const supportedExportVolume = allMeasures
      .filter(m => m.conversion?.hasContract)
      .reduce((sum, m) => sum + (m.conversion?.contractAmount || 0), 0);

    // KPI: Country diversification
    const exportCountriesFromContracts = new Set<string>();
    allMeasures
      .filter(m => m.conversion?.hasContract && m.conversion?.contractCountry)
      .forEach(m => {
        m.conversion!.contractCountry.split(",").forEach(c => {
          const trimmed = c.trim();
          if (trimmed) exportCountriesFromContracts.add(trimmed);
        });
      });
    const countryDiversification = exportCountriesFromContracts.size;

    // KPI: New exporters (companies that had first export contract through support)
    const newExportersCount = new Set(
      allMeasures
        .filter(m => m.conversion?.isNewExporter)
        .map(m => {
          const company = companies.find(c => c.supportMeasures?.some(sm => sm.id === m.id));
          return company?.id;
        })
        .filter(Boolean)
    ).size;

    // Companies that hit limit (3+ services, 0 conversions)
    const limitedCompanies = companies.filter(c => {
      const measures = c.supportMeasures || [];
      const serviceCount = measures.length;
      const conversionCount = measures.filter(m => m.conversion?.hasContract).length;
      return serviceCount >= 3 && conversionCount === 0;
    });

    return {
      total,
      exporters,
      planning2025,
      activeCpe,
      mspCount,
      needsUpdateCount,
      sphereCounts,
      mspCategories,
      sectorCounts,
      totalExport2025,
      totalExport2024,
      complexCount,
      popularizationCount,
      complexCompanies,
      popularizationCompanies,
      serviceTypeCounts,
      supportedExportVolume,
      countryDiversification,
      newExportersCount,
      limitedCompanies,
    };
  }, [companies]);

  // Last updated 5 companies
  const lastUpdatedCompanies = useMemo(() => {
    return [...companies]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [companies]);

  // Check custom fields values in company cards
  const getCustomFieldValue = (company: Company, key: string) => {
    return company.customFields?.[key] ?? "-";
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-slate-900 text-slate-100 dark" : "bg-slate-50 text-slate-800"}`}>
      
      {/* Header bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 sticky top-0 z-40 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 dark:bg-indigo-500 text-white p-2.5 rounded-xl shadow-md">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                ЭкспортКомпас <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">CRM v2.6</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Система анализа экспортеров и работы ЦПЭ региона</p>
            </div>
          </div>

          {/* Controls: Role, Theme, Reset */}
          <div className="flex items-center flex-wrap gap-3">
            
            {/* Roles control */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg p-1 text-xs border border-slate-200 dark:border-slate-800">
              <span className="px-2 font-medium text-slate-500 flex items-center gap-1">
                <Shield className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /> Доступ:
              </span>
              {(["admin", "manager", "analyst"] as const).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setCurrentRole(r);
                    setSelectedIds([]);
                  }}
                  className={`px-3 py-1 rounded-md font-medium capitalize transition-all ${
                    currentRole === r
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800"
                  }`}
                >
                  {r === "admin" ? "Администратор" : r === "manager" ? "Менеджер" : "Аналитик"}
                </button>
              ))}
            </div>

            {/* Quick reset database */}
            {currentRole === "admin" && (
              <button
                onClick={handleResetDb}
                title="Сбросить и заполнить эталонными данными"
                className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-900/60 flex items-center gap-1 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Сброс БД
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Переключить тему"
            >
              {darkMode ? "☀️ Светлая" : "🌙 Темная"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:px-6">
        
        {/* Окно помощи при ошибке подключения к базе данных */}
        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-900 rounded-2xl p-6 shadow-md text-red-800 dark:text-red-300">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 shrink-0 mt-1" />
              <div className="space-y-3 flex-1">
                <h3 className="font-extrabold text-base text-red-900 dark:text-red-200">
                  Ошибка подключения к базе данных или отсутствуют таблицы!
                </h3>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Детали ошибки: <code className="bg-red-100 dark:bg-red-900/60 px-1.5 py-0.5 rounded font-mono text-[11px] block mt-1 break-all">{error}</code>
                </p>
                <div className="text-xs space-y-2 border-t border-red-200 dark:border-red-900/60 pt-3 text-slate-700 dark:text-slate-200">
                  <p className="font-semibold text-red-950 dark:text-red-200">Как это исправить на вашем компьютере:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      <strong>Вы забыли применить схему данных к базе:</strong> В терминале вашего проекта выполните команду:
                      <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[10px] block mt-1 text-indigo-600 font-bold">npx drizzle-kit push</code>
                    </li>
                    <li>
                      <strong>Проверьте файл <code className="font-mono">.env</code> в корне проекта:</strong> Убедитесь, что там прописана правильная строка подключения. Например:
                      <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded font-mono text-[10px] block mt-1 text-slate-600">DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/ИМЯ_БАЗЫ</code>
                    </li>
                    <li>
                      <strong>Перезапустите сервер:</strong> После создания файла <code className="font-mono">.env</code> или применения схемы обязательно перезапустите терминал с <code className="font-mono">npm run dev</code>.
                    </li>
                  </ol>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setError(null);
                      fetchAllData();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Попробовать обновить данные
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alerts & Critical actions bar */}
        {stats.needsUpdateCount > 0 && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 flex items-center justify-between gap-3 text-red-800 dark:text-red-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5.5 h-5.5 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <span className="font-semibold text-sm">Внимание! Обнаружены неактуальные данные</span>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                  У {stats.needsUpdateCount} компаний установлен статус необходимости актуализации. Рекомендуется проверить контакты и экспортные показатели.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveTab("catalog");
                setFilters(prev => ({ ...prev, needsUpdate: "true" }));
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Показать {stats.needsUpdateCount} компаний
            </button>
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "dashboard"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <BarChart3 className="w-4.5 h-4.5" />
            Дашборд & Аналитика
          </button>
          <button
            onClick={() => setActiveTab("catalog")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "catalog"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            Реестр компаний
            <span className="ml-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-400">
              {companies.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "directory"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <Layers className="w-4.5 h-4.5" />
            Иерархия & Справочники
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "applications"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <Inbox className="w-4.5 h-4.5" />
            Заявки
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
              applications.filter(a => a.status === "new").length > 0
                ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}>
              {applications.filter(a => a.status === "new").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("custom_fields")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "custom_fields"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <Sliders className="w-4.5 h-4.5" />
            Управление полями (+доп. поля)
            <span className="ml-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs text-slate-600 dark:text-slate-400">
              {customFields.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("kpi_targets")}
            className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "kpi_targets"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
          >
            <BarChart3 className="w-4.5 h-4.5" />
            Плановые показатели
          </button>
        </div>

        {/* -------------------- 1. DASHBOARD TAB -------------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Всего СМСП в базе</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</h3>
                  <div className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    Субъекты МСП
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Активные экспортеры (СМСП)</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.exporters} <span className="text-xs font-normal text-slate-400">({Math.round((stats.exporters/stats.total)*100) || 0}%)</span>
                  </h3>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{stats.planning2025} планируют в 2025
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Globe className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Работают с ЦПЭ</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.activeCpe} <span className="text-xs font-normal text-slate-400">({Math.round((stats.activeCpe/stats.total)*100) || 0}%)</span>
                  </h3>
                  <div className="text-xs text-indigo-500 mt-2">Региональный охват поддержки</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
                  <CheckSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Общий экспорт (2025 г.)</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {stats.totalExport2025.toFixed(1)} <span className="text-xs font-normal text-slate-400">млн ₽</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-2">
                    В 2024 году было: {stats.totalExport2024.toFixed(1)} млн ₽
                  </div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* KPI Cards: Поддержка экспорта */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Объём поддержанного экспорта</span>
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {stats.supportedExportVolume.toFixed(1)} <span className="text-xs font-normal text-slate-400">млн ₽</span>
                </h3>
                <div className="mt-3 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.supportedExportVolume / Math.max(1, kpiTargets.supportedExportVolume)) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Факт: {stats.supportedExportVolume.toFixed(1)} млн ₽</span>
                  <span>План: {kpiTargets.supportedExportVolume} млн ₽</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Страновая диверсификация</span>
                  <Globe className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {stats.countryDiversification} <span className="text-xs font-normal text-slate-400">стран</span>
                </h3>
                <div className="mt-3 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.countryDiversification / Math.max(1, kpiTargets.countryDiversification)) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Факт: {stats.countryDiversification} стран</span>
                  <span>План: {kpiTargets.countryDiversification} стран</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Новые экспортёры</span>
                  <Users className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {stats.newExportersCount} <span className="text-xs font-normal text-slate-400">компаний</span>
                </h3>
                <div className="mt-3 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.newExportersCount / Math.max(1, kpiTargets.newExporters)) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Факт: {stats.newExportersCount} компаний</span>
                  <span>План: {kpiTargets.newExporters} компаний</span>
                </div>
              </div>
            </div>

            {/* Limited companies alert */}
            {stats.limitedCompanies.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl p-4 flex items-center justify-between gap-3 text-red-800 dark:text-red-300">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5.5 h-5.5 text-red-600 dark:text-red-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-sm">Достигнут лимит мер поддержки</span>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                      {stats.limitedCompanies.length} компаний получили 3+ услуги без конверсии. Им требуется проверка перед выдачей новых мер.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("catalog");
                    setFilters(prev => ({ ...prev, needsUpdate: "true" }));
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  Показать
                </button>
              </div>
            )}

            {/* Quick Actions Panel */}
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-sm font-semibold mb-3">Быстрые действия</h4>
              <div className="flex flex-wrap gap-3">
                {currentRole !== "analyst" && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    Добавить компанию вручную
                  </button>
                )}
                {currentRole === "admin" && (
                  <button
                    onClick={() => setShowCustomFieldModal(true)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Sliders className="w-4.5 h-4.5 text-indigo-600" />
                    Зарегистрировать новое поле
                  </button>
                )}
                <button
                  onClick={handleExportCSV}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4.5 h-4.5 text-emerald-600" />
                  Экспорт всего реестра (CSV)
                </button>
                {currentRole !== "analyst" && (
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all"
                  >
                    <Upload className="w-4.5 h-4.5 text-blue-600" />
                    Импортировать из Excel/CSV
                  </button>
                )}
              </div>
            </div>

            {/* Graphs & Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Support Services: Complex vs Popularization */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Получатели поддержки ЦПЭ</h4>
                  <p className="text-xs text-slate-500">Распределение по типам услуг</p>
                </div>

                <div className="py-4 space-y-3.5">
                  {/* Complex services */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span className="text-xs font-semibold">Комплексные услуги</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {stats.complexCompanies} компаний
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">({stats.complexCount} услуг)</span>
                    </div>
                  </div>

                  {/* Service type sub-breakdown */}
                  <div className="pl-5 space-y-1.5">
                    {[
                      { key: "exhibition", label: "Выставки" },
                      { key: "business_mission", label: "Бизнес-миссии" },
                      { key: "search_and_selection", label: "Поиск и подбор" },
                      { key: "etp_placement", label: "Размещение на ЭТП" },
                      { key: "reverse_business_mission", label: "Реверсные бизнес-миссии" },
                      { key: "interregional_mission", label: "Межрегиональные бизнес-миссии" },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                          {stats.serviceTypeCounts[item.key] || 0}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Popularization */}
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                      <span className="text-xs font-semibold">Популяризация экспорта</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {stats.popularizationCompanies} компаний
                      </span>
                      <span className="text-[10px] text-slate-400 ml-2">({stats.popularizationCount} услуг)</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-900 pt-3 text-xs text-slate-400 italic">
                  * Данные из карточек компаний (раздел «Меры поддержки»)
                </div>
              </div>

              {/* Service Categories SVG Donut */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Услуги ЦПЭ</h4>
                  <p className="text-xs text-slate-500">Соотношение комплексных и популяризационных услуг</p>
                </div>
                
                <div className="py-6 flex justify-center items-center gap-4">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" strokeWidth="4.2" 
                        strokeDasharray={`${(stats.complexCount / Math.max(1, stats.complexCount + stats.popularizationCount)) * 100} 100`} 
                        strokeDashoffset="25" />
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#14b8a6" strokeWidth="4.2" 
                        strokeDasharray={`${(stats.popularizationCount / Math.max(1, stats.complexCount + stats.popularizationCount)) * 100} 100`} 
                        strokeDashoffset={25 - (stats.complexCount / Math.max(1, stats.complexCount + stats.popularizationCount)) * 100} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-800 dark:text-slate-100">{stats.complexCount + stats.popularizationCount}</span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest">Всего услуг</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Комплексные: {stats.complexCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Популяризация: {stats.popularizationCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 border-t border-slate-100 dark:border-slate-900 pt-3">
                  Комплексные: выставки, бизнес-миссии, поиск и подбор, ЭТП, реверсные и межрегиональные миссии
                </div>
              </div>

            </div>

            {/* Bottom Row: Last updated & Key Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recently Updated Companies */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <Clock className="w-4.5 h-4.5 text-indigo-500" />
                    Последние изменения
                  </h4>
                  <span className="text-xs text-slate-400">Лента активности CRM</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-900">
                  {lastUpdatedCompanies.map((c) => {
                    const lastLog = c.changeLogs?.[c.changeLogs.length - 1] || {
                      timestamp: c.updatedAt,
                      user: "Система",
                      action: "Обновлено",
                      details: "Карточка отредактирована",
                    };
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCompanyId(c.id);
                          setActiveTab("catalog");
                        }}
                        className="py-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-lg px-2 cursor-pointer transition-colors flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{c.name}</h5>
                          <p className="text-[11px] text-slate-500 mt-1 truncate">
                            <strong>{lastLog.user}:</strong> {lastLog.details}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {new Date(lastLog.timestamp || c.updatedAt).toLocaleString("ru-RU", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sectors and activities dashboard */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-4.5 h-4.5 text-indigo-500" />
                  Отраслевое распределение
                </h4>
                <div className="space-y-3">
                  {Object.entries(stats.sectorCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([sector, count]) => (
                      <div key={sector}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{sector}</span>
                          <span className="text-slate-500 font-bold">{count} комп.</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- 2. CATALOG TAB -------------------- */}
        {activeTab === "catalog" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* LEFT COLUMN: FILTERS & BULK ACTIONS */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* FILTERS PANEL */}
              <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-900 pb-2">
                  <h4 className="text-sm font-bold flex items-center gap-1.5">
                    <Filter className="w-4.5 h-4.5 text-indigo-500" />
                    Фильтры реестра
                  </h4>
                  <button
                    onClick={() => setFilters({
                      sphere: "",
                      statusExporter: "",
                      cpeCooperation: "",
                      categoryMsp: "",
                      needsUpdate: "",
                      hasContacts: "",
                      tnved: "",
                    })}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Сбросить
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Sphere filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Сфера деятельности</label>
                    <select
                      value={filters.sphere}
                      onChange={e => setFilters(prev => ({ ...prev, sphere: e.target.value }))}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Все сферы</option>
                      <option value="АПК">АПК (Сельское хозяйство)</option>
                      <option value="Промышленность">Промышленность</option>
                      <option value="Прочие">Прочие</option>
                    </select>
                  </div>

                  {/* Status Exporter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Статус экспортера</label>
                    <select
                      value={filters.statusExporter}
                      onChange={e => setFilters(prev => ({ ...prev, statusExporter: e.target.value }))}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Любой статус</option>
                      <option value="экспортер">Действующий экспортер</option>
                      <option value="не экспортер">Не экспортер</option>
                      <option value="2025 г.">Планируемый (2025 г.)</option>
                    </select>
                  </div>

                  {/* CPE Cooperation */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Работа с ЦПЭ региона</label>
                    <select
                      value={filters.cpeCooperation}
                      onChange={e => setFilters(prev => ({ ...prev, cpeCooperation: e.target.value }))}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Все компании</option>
                      <option value="true">Сотрудничают (Да)</option>
                      <option value="false">Не сотрудничают (Нет)</option>
                    </select>
                  </div>

                  {/* Category MSP */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Категория МСП</label>
                    <select
                      value={filters.categoryMsp}
                      onChange={e => setFilters(prev => ({ ...prev, categoryMsp: e.target.value }))}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Любой размер</option>
                      <option value="Микро">Микропредприятие</option>
                      <option value="Малое">Малое предприятие</option>
                      <option value="Среднее">Среднее предприятие</option>
                    </select>
                  </div>

                  {/* Has Contacts */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Наличие контактов</label>
                    <select
                      value={filters.hasContacts}
                      onChange={e => setFilters(prev => ({ ...prev, hasContacts: e.target.value }))}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Все равно</option>
                      <option value="true">Есть контакты (Минпром/ЦПЭ)</option>
                      <option value="false">Контакты не заполнены</option>
                    </select>
                  </div>

                  {/* Needs Update */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Требует актуализации</label>
                    <select
                      value={filters.needsUpdate}
                      onChange={e => setFilters(prev => ({ ...prev, needsUpdate: e.target.value }))}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                    >
                      <option value="">Все записи</option>
                      <option value="true">Требует обновления данных</option>
                      <option value="false">Актуальные данные</option>
                    </select>
                  </div>

                  {/* TN VED filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Код ТН ВЭД</label>
                    <input
                      type="text"
                      value={filters.tnved || ""}
                      onChange={e => setFilters(prev => ({ ...prev, tnved: e.target.value }))}
                      placeholder="Например: 8471"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300 font-mono"
                    />
                  </div>

                </div>
              </div>

              {/* BULK ACTIONS PANEL */}
              {selectedIds.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Выбрано компаний: {selectedIds.length}
                    </span>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700"
                    >
                      Отмена
                    </button>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Вы можете применить массовое редактирование к выбранным компаниям.
                  </div>

                  <button
                    onClick={() => {
                      if (currentRole === "analyst") {
                        alert("У аналитика нет прав на редактирование");
                        return;
                      }
                      setShowBulkEditModal(true);
                    }}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 px-3 rounded-xl shadow-sm text-center block transition-all"
                  >
                    Массовое изменение полей
                  </button>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: SEARCH + MAIN VIEW */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* SEARCH BAR & VIEW SWITCHER */}
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Search input */}
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Поиск по ИНН, названию, продукции, контактам..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* View Mode & Quick add */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  
                  {/* Table/Cards toggle */}
                  <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg flex items-center border border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-1.5 rounded-md ${viewMode === "table" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}
                      title="Табличный вид"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`p-1.5 rounded-md ${viewMode === "cards" ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}
                      title="Карточный вид"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                  </div>

                  {currentRole !== "analyst" && (
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      Новая компания
                    </button>
                  )}

                </div>

              </div>

              {/* LIST VIEW (TABLE) */}
              {loading ? (
                <div className="bg-white dark:bg-slate-950 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-sm text-slate-500">Загрузка данных из реестра...</p>
                </div>
              ) : companies.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                  <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-300">Ничего не найдено</h3>
                  <p className="text-xs text-slate-400 mt-2">Попробуйте изменить параметры поиска или сбросить фильтры</p>
                </div>
              ) : viewMode === "table" ? (
                
                /* Responsive Table */
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                          <th className="py-3 px-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectedIds.length === companies.length && companies.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </th>
                          <th className="py-3 px-4">Компания</th>
                          <th className="py-3 px-4">ИНН</th>
                          <th className="py-3 px-4">Сфера / Отрасль</th>
                          <th className="py-3 px-4">ТН ВЭД</th>
                          <th className="py-3 px-4">Экспорт</th>
                          <th className="py-3 px-4">ЦПЭ</th>
                          <th className="py-3 px-4">МСП</th>
                          <th className="py-3 px-4 text-right">Действия</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-medium">
                        {companies.map((c) => {
                          const isSelected = selectedIds.includes(c.id);
                          const isDetailed = selectedCompanyId === c.id;
                          return (
                            <tr
                              key={c.id}
                              className={`hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors ${
                                isDetailed ? "bg-indigo-50/40 dark:bg-indigo-950/20" : ""
                              }`}
                            >
                              <td className="py-3 px-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelect(c.id)}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                              
                              <td
                                className="py-3 px-4 cursor-pointer max-w-xs"
                                onClick={() => {
                                  setSelectedCompanyId(c.id);
                                  setCompanyDetailTab("general");
                                }}
                              >
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  {c.name}
                                  {c.needsUpdate && (
                                    <span
                                      title="Необходимо обновить контакты"
                                      className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full shrink-0"
                                    />
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{c.mainActivity}</div>
                              </td>

                              <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono">{c.inn}</td>

                              <td className="py-3 px-4">
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold w-max ${
                                    c.sphere === "Промышленность" ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300" :
                                    c.sphere === "АПК" ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" :
                                    "bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
                                  }`}>
                                    {c.sphere}
                                  </span>
                                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{c.sector}</span>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">{c.tnved || "—"}</span>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  c.statusExporter === "экспортер" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" :
                                  c.statusExporter === "2025 г." ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300" :
                                  "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                }`}>
                                  {c.statusExporter}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                  c.cpeCooperation ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                }`}>
                                  {c.cpeCooperation ? "Да" : "Нет"}
                                </span>
                              </td>

                              <td className="py-3 px-4">
                                <div className="text-[10px] font-bold">{c.categoryMsp}</div>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedCompanyId(c.id);
                                      setCompanyDetailTab("general");
                                    }}
                                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded"
                                    title="Просмотр карточки"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  {currentRole !== "analyst" && (
                                    <button
                                      onClick={() => handleDeleteCompany(c.id)}
                                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 rounded"
                                      title="Удалить"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              ) : (
                
                /* CARDS VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        className={`bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${
                          selectedCompanyId === c.id ? "ring-2 ring-indigo-500" : ""
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono text-slate-400">ИНН {c.inn}</span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(c.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </div>

                          <h4
                            onClick={() => {
                              setSelectedCompanyId(c.id);
                              setCompanyDetailTab("general");
                            }}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer text-sm line-clamp-1"
                          >
                            {c.name}
                          </h4>

                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 min-h-[32px]">{c.mainActivity}</p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                              {c.sphere}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                              {c.tnved || "—"}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.statusExporter === "экспортер" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                            }`}>
                              {c.statusExporter}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-bold">
                              поддержка: {c.cpeCooperation ? "ЦПЭ" : "нет"}
                            </span>
                          </div>

                          {/* Extra Custom Fields info */}
                          {customFields.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-900 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                              {customFields.slice(0, 2).map(f => (
                                <div key={f.key} className="truncate">
                                  <span className="font-semibold block text-slate-500">{f.label}:</span>
                                  {String(c.customFields?.[f.key] ?? "-")}
                                </div>
                              ))}
                            </div>
                          )}

                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">МСП: {c.categoryMsp}</span>
                          <button
                            onClick={() => {
                              setSelectedCompanyId(c.id);
                              setCompanyDetailTab("general");
                            }}
                            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                          >
                            Подробнее
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              )}

            </div>

          </div>
        )}

        {/* -------------------- 3. DIRECTORY TAB -------------------- */}
        {activeTab === "directory" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold mb-1">Иерархия и Справочники</h3>
              <p className="text-xs text-slate-500 mb-6">Взаимосвязь Сферы деятельности, Отраслей и Видов деятельности компаний.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* АПК */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                    <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">Сфера: АПК</span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300 font-bold">
                      {companies.filter(c => c.sphere === "АПК").length} компаний
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400">Отрасли:</h5>
                      <ul className="list-disc pl-4 text-xs mt-1 text-slate-700 dark:text-slate-300 space-y-1">
                        <li>Пищевая промышленность</li>
                        <li>Пчеловодство</li>
                        <li>Садоводство</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400">Основные виды деятельности:</h5>
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        Производство масла и шрота, фасовка меда, выращивание и хранение плодов
                      </p>
                    </div>
                  </div>
                </div>

                {/* Промышленность */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                    <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Сфера: Промышленность</span>
                    <span className="text-xs bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded text-amber-800 dark:text-amber-300 font-bold">
                      {companies.filter(c => c.sphere === "Промышленность").length} компаний
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400">Отрасли:</h5>
                      <ul className="list-disc pl-4 text-xs mt-1 text-slate-700 dark:text-slate-300 space-y-1">
                        <li>Тяжелое машиностроение</li>
                        <li>Легкая промышленность</li>
                        <li>Лесозаготовка и деревообработка</li>
                        <li>Электроника</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400">Основные виды деятельности:</h5>
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        Производство металлургического оборудования, трикотажа, деревянных домокомплектов, микросхем
                      </p>
                    </div>
                  </div>
                </div>

                {/* Прочие */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/40">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
                    <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">Сфера: Прочие</span>
                    <span className="text-xs bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded text-purple-800 dark:text-purple-300 font-bold">
                      {companies.filter(c => c.sphere === "Прочие").length} компаний
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400">Отрасли:</h5>
                      <ul className="list-disc pl-4 text-xs mt-1 text-slate-700 dark:text-slate-300 space-y-1">
                        <li>Фармацевтика и биотехнологии</li>
                        <li>IT и разработка ПО</li>
                        <li>Сфера услуг</li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400">Основные виды деятельности:</h5>
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        Разработка ферментных препаратов, логистический консалтинг, инжиниринг
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Company Size categorization */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900">
                <h4 className="text-sm font-bold mb-3">Классификация компаний по масштабу (Реестр МСП)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-teal-600 block">Микропредприятия</span>
                    <p className="text-slate-500">Численность: до 15 человек.</p>
                    <p className="text-slate-500">Годовой доход: до 120 млн рублей.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-blue-600 block">Малые предприятия</span>
                    <p className="text-slate-500">Численность: до 100 человек.</p>
                    <p className="text-slate-500">Годовой доход: до 800 млн рублей.</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-indigo-600 block">Средние предприятия</span>
                    <p className="text-slate-500">Численность: до 250 человек.</p>
                    <p className="text-slate-500">Годовой доход: до 2 млрд рублей.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* -------------------- 4. APPLICATIONS TAB -------------------- */}
        {activeTab === "applications" && (
          <div className="space-y-6">

            {/* Stats bar */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Всего заявок</span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{applications.length}</h3>
              </div>
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Новые</span>
                <h3 className="text-2xl font-extrabold text-red-600 mt-1">{applications.filter(a => a.status === "new").length}</h3>
              </div>
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">В работе</span>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{applications.filter(a => a.status === "in_progress").length}</h3>
              </div>
              <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Завершено</span>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{applications.filter(a => a.status === "completed").length}</h3>
              </div>
            </div>

            {/* Integration info */}
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-800 dark:text-indigo-300">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Интеграция с внешним сайтом</span>
                <p className="text-indigo-700 dark:text-indigo-400">
                  Заявки автоматически поступают через API. Для интеграции отправляйте POST-запросы на endpoint:
                </p>
                <code className="block mt-1 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-900/60 font-mono text-[11px]">
                  POST /api/applications/external
                </code>
                <p className="mt-2 text-indigo-700 dark:text-indigo-400">
                  Пример JSON тела запроса:
                </p>
                <pre className="mt-1 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg border border-indigo-200 dark:border-indigo-900/60 font-mono text-[10px] overflow-x-auto">
{`{
  "companyName": "ООО Пример",
  "companyInn": "7701123456",
  "contactName": "Иванов Иван",
  "contactPhone": "+7 999 123-45-67",
  "contactEmail": "ivanov@example.ru",
  "subject": "Заявка на сертификацию",
  "message": "Прошу помочь с сертификацией продукции...",
  "source": "сайт-цпэ.рф"
}`}
                </pre>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={appsSearch}
                  onChange={e => setAppsSearch(e.target.value)}
                  placeholder="Поиск по компании, контакту, теме..."
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={appsFilterStatus}
                  onChange={e => setAppsFilterStatus(e.target.value)}
                  className="text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
                >
                  <option value="">Все статусы</option>
                  <option value="new">Новые</option>
                  <option value="in_progress">В работе</option>
                  <option value="completed">Завершено</option>
                  <option value="rejected">Отклонено</option>
                </select>
                <button
                  onClick={fetchApplications}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
                  title="Обновить"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Applications list */}
            {appsLoading ? (
              <div className="bg-white dark:bg-slate-950 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm text-slate-500">Загрузка заявок...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="bg-white dark:bg-slate-950 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Заявок нет</h3>
                <p className="text-xs text-slate-400 mt-2">Новые заявки будут появляться здесь после интеграции с сайтом</p>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setSelectedApp(app);
                      setAppNewStatus(app.status);
                      setAppNewComment(app.comment || "");
                      setAppNewAssignee(app.assignedTo || "");
                      setShowAppDetail(true);
                    }}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              app.status === "new" ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300" :
                              app.status === "in_progress" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
                              app.status === "completed" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" :
                              "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}>
                              {app.status === "new" ? "Новая" : app.status === "in_progress" ? "В работе" : app.status === "completed" ? "Завершена" : "Отклонена"}
                            </span>
                            <span className="text-[10px] text-slate-400">{new Date(app.createdAt).toLocaleString("ru-RU")}</span>
                            {app.source && (
                              <span className="text-[10px] text-slate-400">• {app.source}</span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{app.subject}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                            <span>Компания: <strong className="text-slate-700 dark:text-slate-300">{app.companyName}</strong></span>
                            {app.companyInn && <span>ИНН: <strong>{app.companyInn}</strong></span>}
                            {app.contactName && <span>Контакты: <strong>{app.contactName}</strong></span>}
                          </div>
                          {app.message && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{app.message}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>
                      {app.assignedTo && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-900 flex items-center gap-2 text-[10px] text-slate-400">
                          <User className="w-3.5 h-3.5" />
                          Назначено: {app.assignedTo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* -------------------- 5. CUSTOM FIELDS TAB -------------------- */}
        {activeTab === "custom_fields" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold">Дополнительные поля базы данных</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Зарегистрируйте новые реквизиты, чтобы они появились во всех карточках компаний для заполнения менеджерами.
                  </p>
                </div>
                {currentRole === "admin" ? (
                  <button
                    onClick={() => setShowCustomFieldModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Зарегистрировать новое поле
                  </button>
                ) : (
                  <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg font-semibold border border-amber-200 dark:border-amber-900/60">
                    Только администратор может добавлять поля
                  </div>
                )}
              </div>

              <div className="mt-6 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-bold uppercase">
                      <th className="p-3">Ключ поля (для системы)</th>
                      <th className="p-3">Название (для пользователей)</th>
                      <th className="p-3">Тип поля</th>
                      <th className="p-3">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-900 font-medium">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                      <td className="p-3 font-mono text-indigo-600">inn</td>
                      <td className="p-3">ИНН компании</td>
                      <td className="p-3 text-slate-400">Текст (Системное)</td>
                      <td className="p-3 text-slate-400">Обязательное</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                      <td className="p-3 font-mono text-indigo-600">name</td>
                      <td className="p-3">Наименование</td>
                      <td className="p-3 text-slate-400">Текст (Системное)</td>
                      <td className="p-3 text-slate-400">Обязательное</td>
                    </tr>
                    {customFields.map((cf) => (
                      <tr key={cf.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/60">
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{cf.key}</td>
                        <td className="p-3 text-slate-900 dark:text-white">{cf.label}</td>
                        <td className="p-3 capitalize">{cf.type === "text" ? "Строка текста" : cf.type === "number" ? "Число" : "Да/Нет переключатель"}</td>
                        <td className="p-3 text-emerald-600">Активно (Пользовательское)</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl p-4 mt-6 text-xs text-blue-800 dark:text-blue-300">
                <span className="font-semibold block mb-1">Справка по динамическим полям:</span>
                Все значения динамических полей хранятся в формате JSONB внутри каждой компании. Это позволяет иметь высокую производительность при поиске и сохранять гибкость при изменении структуры компании без риска потери старых данных.
              </div>
            </div>
          </div>
        )}

        {/* -------------------- 6. KPI TARGETS TAB -------------------- */}
        {activeTab === "kpi_targets" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-base font-bold mb-1">Плановые показатели KPI</h3>
              <p className="text-xs text-slate-500 mb-6">Установите целевые значения для текущего года. Фактические показатели рассчитываются автоматически из данных реестра.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-indigo-50 dark:bg-indigo-950/20 p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/60">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Объём поддержанного экспорта</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">Факт: {stats.supportedExportVolume.toFixed(1)} млн ₽</div>
                  <input
                    type="number"
                    value={kpiEditVolume}
                    onChange={e => setKpiEditVolume(Number(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    placeholder="План, млн ₽"
                  />
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Страновая диверсификация</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">Факт: {stats.countryDiversification} стран</div>
                  <input
                    type="number"
                    value={kpiEditCountries}
                    onChange={e => setKpiEditCountries(Number(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    placeholder="План, стран"
                  />
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-xl border border-amber-200 dark:border-amber-900/60">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Новые экспортёры</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">Факт: {stats.newExportersCount} компаний</div>
                  <input
                    type="number"
                    value={kpiEditNewExporters}
                    onChange={e => setKpiEditNewExporters(Number(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    placeholder="План, компаний"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-500">Год:</label>
                <input
                  type="number"
                  value={kpiEditYear}
                  onChange={e => setKpiEditYear(Number(e.target.value) || 2026)}
                  className="text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg w-24"
                />
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/kpi-targets", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          year: kpiEditYear,
                          supportedExportVolume: kpiEditVolume,
                          countryDiversification: kpiEditCountries,
                          newExporters: kpiEditNewExporters,
                        }),
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setKpiTargets(data);
                        alert("Плановые показатели сохранены");
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-5 rounded-xl transition-all"
                >
                  Сохранить плановые показатели
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900">
                <h4 className="text-sm font-bold mb-3">Выполнение KPI</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">Объём поддержанного экспорта</span>
                      <span>{Math.round(Math.min(100, (stats.supportedExportVolume / Math.max(1, kpiTargets.supportedExportVolume)) * 100))}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.supportedExportVolume / Math.max(1, kpiTargets.supportedExportVolume)) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">Страновая диверсификация</span>
                      <span>{Math.round(Math.min(100, (stats.countryDiversification / Math.max(1, kpiTargets.countryDiversification)) * 100))}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.countryDiversification / Math.max(1, kpiTargets.countryDiversification)) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold">Новые экспортёры</span>
                      <span>{Math.round(Math.min(100, (stats.newExportersCount / Math.max(1, kpiTargets.newExporters)) * 100))}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (stats.newExportersCount / Math.max(1, kpiTargets.newExporters)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* -------------------- 6. DETAILED COMPANY CARD DRAWER -------------------- */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 transition-colors animate-in slide-in-from-right duration-250">
            
            {/* Drawer Header */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedCompany.sphere === "Промышленность" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                    selectedCompany.sphere === "АПК" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                    "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                  }`}>
                    {selectedCompany.sphere}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">ИНН {selectedCompany.inn}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate mt-1">{selectedCompany.name}</h2>
              </div>
              <button
                onClick={() => setSelectedCompanyId(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 shrink-0 overflow-x-auto whitespace-nowrap">
              {(["general", "contacts", "export", "support", "interactions", "audit"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setCompanyDetailTab(tab)}
                  className={`py-2 px-3 text-xs font-semibold border-b-2 transition-all ${
                    companyDetailTab === tab
                      ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                      : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                  }`}
                >
                  {tab === "general" && "Информация"}
                  {tab === "contacts" && "Контакты"}
                  {tab === "export" && "Экспорт"}
                  {tab === "support" && `Поддержка (${selectedCompany.supportMeasures?.length || 0})`}
                  {tab === "interactions" && `CRM и Задачи (${(selectedCompany.interactions?.length || 0) + (selectedCompany.tasks?.length || 0)})`}
                  {tab === "audit" && "Аудит и Доп. поля"}
                </button>
              ))}
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB CONTENT: GENERAL INFO */}
              {companyDetailTab === "general" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase">Наименование организации</label>
                      <input
                        type="text"
                        disabled={currentRole === "analyst"}
                        value={selectedCompany.name}
                        onChange={e => handleSaveCompanyEdit({ name: e.target.value })}
                        className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:ring-1 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase">ИНН компании</label>
                      <input
                        type="text"
                        disabled={currentRole === "analyst"}
                        value={selectedCompany.inn}
                        onChange={e => handleSaveCompanyEdit({ inn: e.target.value })}
                        className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase">Статус экспортера</label>
                      <select
                        disabled={currentRole === "analyst"}
                        value={selectedCompany.statusExporter}
                        onChange={e => handleSaveCompanyEdit({ statusExporter: e.target.value })}
                        className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      >
                        <option value="экспортер">экспортер</option>
                        <option value="не экспортер">не экспортер</option>
                        <option value="2025 г.">планирует в 2025 г.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase">Категория МСП</label>
                      <select
                        disabled={currentRole === "analyst"}
                        value={selectedCompany.categoryMsp}
                        onChange={e => handleSaveCompanyEdit({ categoryMsp: e.target.value })}
                        className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      >
                        <option value="Микро">Микропредприятие</option>
                        <option value="Малое">Малое предприятие</option>
                        <option value="Среднее">Среднее предприятие</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase">Сфера деятельности</label>
                      <select
                        disabled={currentRole === "analyst"}
                        value={selectedCompany.sphere}
                        onChange={e => handleSaveCompanyEdit({ sphere: e.target.value })}
                        className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      >
                        <option value="АПК">АПК</option>
                        <option value="Промышленность">Промышленность</option>
                        <option value="Прочие">Прочие</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase">Сотрудничество с ЦПЭ</label>
                      <select
                        disabled={currentRole === "analyst"}
                        value={selectedCompany.cpeCooperation ? "true" : "false"}
                        onChange={e => handleSaveCompanyEdit({ cpeCooperation: e.target.value === "true" })}
                        className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      >
                        <option value="true">Да (Сотрудничают)</option>
                        <option value="false">Нет (Не сотрудничают)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Отрасль</label>
                    <input
                      type="text"
                      disabled={currentRole === "analyst"}
                      value={selectedCompany.sector}
                      onChange={e => handleSaveCompanyEdit({ sector: e.target.value })}
                      className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Основной вид деятельности</label>
                    <input
                      type="text"
                      disabled={currentRole === "analyst"}
                      value={selectedCompany.mainActivity}
                      onChange={e => handleSaveCompanyEdit({ mainActivity: e.target.value })}
                      className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Код ТН ВЭД</label>
                    <input
                      type="text"
                      disabled={currentRole === "analyst"}
                      value={selectedCompany.tnved}
                      onChange={e => handleSaveCompanyEdit({ tnved: e.target.value })}
                      className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl font-mono"
                      placeholder="Например: 8471, 8473, 8523"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Производимая продукция</label>
                    <textarea
                      disabled={currentRole === "analyst"}
                      value={selectedCompany.products}
                      onChange={e => handleSaveCompanyEdit({ products: e.target.value })}
                      rows={3}
                      className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      placeholder="Опишите выпускаемую продукцию..."
                    />
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="needsUpdateCheckbox"
                        disabled={currentRole === "analyst"}
                        checked={selectedCompany.needsUpdate}
                        onChange={e => handleSaveCompanyEdit({ needsUpdate: e.target.checked })}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                      />
                      <label htmlFor="needsUpdateCheckbox" className="text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer">
                        Требуется актуализация данных (поставить флаг тревоги)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Служебные примечания</label>
                    <textarea
                      disabled={currentRole === "analyst"}
                      value={selectedCompany.notes}
                      onChange={e => handleSaveCompanyEdit({ notes: e.target.value })}
                      rows={3}
                      className="mt-1 w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                      placeholder="Заметки по работе с компанией..."
                    />
                  </div>
                </div>
              )}

              {/* TAB CONTENT: CONTACTS */}
              {companyDetailTab === "contacts" && (
                <div className="space-y-6">
                  
                  {/* МИНПРОМ contacts */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      Куратор от Минпромторга
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400">ФИО представителя</label>
                        <input
                          type="text"
                          disabled={currentRole === "analyst"}
                          value={selectedCompany.contactMinprom || ""}
                          onChange={e => handleSaveCompanyEdit({ contactMinprom: e.target.value })}
                          className="mt-1 w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                          placeholder="Не указано"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400">Электронная почта</label>
                        <input
                          type="email"
                          disabled={currentRole === "analyst"}
                          value={selectedCompany.emailMinprom || ""}
                          onChange={e => handleSaveCompanyEdit({ emailMinprom: e.target.value })}
                          className="mt-1 w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                          placeholder="Не указано"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400">Телефон</label>
                      <input
                        type="text"
                        disabled={currentRole === "analyst"}
                        value={selectedCompany.phoneMinprom || ""}
                        onChange={e => handleSaveCompanyEdit({ phoneMinprom: e.target.value })}
                        className="mt-1 w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                        placeholder="Не указан"
                      />
                    </div>
                  </div>

                  {/* ЦПЭ CONTACTS */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      Закрепленный менеджер ЦПЭ
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400">ФИО представителя</label>
                        <input
                          type="text"
                          disabled={currentRole === "analyst"}
                          value={selectedCompany.contactCpe || ""}
                          onChange={e => handleSaveCompanyEdit({ contactCpe: e.target.value })}
                          className="mt-1 w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                          placeholder="Не указано"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400">Электронная почта</label>
                        <input
                          type="email"
                          disabled={currentRole === "analyst"}
                          value={selectedCompany.emailCpe || ""}
                          onChange={e => handleSaveCompanyEdit({ emailCpe: e.target.value })}
                          className="mt-1 w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                          placeholder="Не указано"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400">Телефон</label>
                      <input
                        type="text"
                        disabled={currentRole === "analyst"}
                        value={selectedCompany.phoneCpe || ""}
                        onChange={e => handleSaveCompanyEdit({ phoneCpe: e.target.value })}
                        className="mt-1 w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                        placeholder="Не указан"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: EXPORT ACTIVITY */}
              {companyDetailTab === "export" && (
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                    <h4 className="text-xs font-bold uppercase mb-3">Статистика экспорта по годам (млн ₽)</h4>
                    
                    <div className="space-y-4">
                      {/* 2023 */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">2023 год</span>
                          <span className="font-bold">{selectedCompany.exportVolume2023} млн ₽</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          disabled={currentRole === "analyst"}
                          value={selectedCompany.exportVolume2023}
                          onChange={e => handleSaveCompanyEdit({ exportVolume2023: parseFloat(e.target.value) || 0 })}
                          className="w-full max-w-[200px] text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg"
                        />
                      </div>

                      {/* 2024 */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">2024 год</span>
                          <span className="font-bold">{selectedCompany.exportVolume2024} млн ₽</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          disabled={currentRole === "analyst"}
                          value={selectedCompany.exportVolume2024}
                          onChange={e => handleSaveCompanyEdit({ exportVolume2024: parseFloat(e.target.value) || 0 })}
                          className="w-full max-w-[200px] text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg"
                        />
                      </div>

                      {/* 2025 */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">2025 год</span>
                          <span className="font-bold">{selectedCompany.exportVolume2025} млн ₽</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          disabled={currentRole === "analyst"}
                          value={selectedCompany.exportVolume2025}
                          onChange={e => handleSaveCompanyEdit({ exportVolume2025: parseFloat(e.target.value) || 0 })}
                          className="w-full max-w-[200px] text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Страны экспорта</label>
                    <input
                      type="text"
                      disabled={currentRole === "analyst"}
                      value={selectedCompany.exportCountries}
                      onChange={e => handleSaveCompanyEdit({ exportCountries: e.target.value })}
                      placeholder="Например: Китай, Вьетнам, Узбекистан (через запятую)"
                      className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                    />
                  </div>

                </div>
              )}

              {/* TAB CONTENT: SUPPORT MEASURES */}
              {companyDetailTab === "support" && (
                <div className="space-y-6">
                  
                  {/* Limit indicator */}
                  {(() => {
                    const measures = selectedCompany.supportMeasures || [];
                    const serviceCount = measures.length;
                    const conversionCount = measures.filter(m => m.conversion?.hasContract).length;
                    const limitReached = serviceCount >= 3 && conversionCount === 0;
                    return limitReached ? (
                      <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-900 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-xs font-bold text-red-800 dark:text-red-300">Лимит мер поддержки достигнут</h5>
                          <p className="text-[11px] text-red-700 dark:text-red-400 mt-1">
                            Компания получила {serviceCount} услуг(и) без конверсии. Для получения новых мер поддержки требуется повторная проверка.
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {/* List of existing support measures */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-500">Полученные меры поддержки ЦПЭ</h4>
                    
                    {(!selectedCompany.supportMeasures || selectedCompany.supportMeasures.length === 0) ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                        Меры поддержки пока не зарегистрированы для данной компании.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCompany.supportMeasures.map((m) => {
                          const svcTypeLabels: Record<string, string> = {
                            exhibition: "Выставка",
                            business_mission: "Бизнес-миссия",
                            search_and_selection: "Поиск и подбор",
                            etp_placement: "Размещение на ЭТП",
                            reverse_business_mission: "Реверсная бизнес-миссия",
                            interregional_mission: "Межрегиональная бизнес-миссия",
                            other: "Прочее",
                          };
                          const hasConversion = m.conversion?.hasContract;
                          return (
                            <div
                              key={m.id}
                              className={`p-3 rounded-xl border text-xs ${
                                hasConversion
                                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800"
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white">{m.name}</p>
                                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 mt-1">
                                    <span>Тип: {svcTypeLabels[m.serviceType] || m.serviceType}</span>
                                    <span>•</span>
                                    <span>Категория: {m.serviceCategory === "complex" ? "Комплексная" : "Популяризация"}</span>
                                    <span>•</span>
                                    <span>Запрос: {m.requestDate || "н/д"}</span>
                                    <span>•</span>
                                    <span>Получение: {m.receiptDate || "н/д"}</span>
                                    <span>•</span>
                                    <span>Сумма: {m.amount ? `${m.amount.toLocaleString("ru-RU")} ₽` : "н/д"}</span>
                                  </div>
                                  {hasConversion && (
                                    <div className="mt-2 bg-emerald-100 dark:bg-emerald-950/40 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/60">
                                      <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">✓ Конверсия (контракт)</p>
                                      <div className="flex flex-wrap gap-x-3 text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                                        <span>Страна: {m.conversion!.contractCountry}</span>
                                        <span>•</span>
                                        <span>Сумма: {m.conversion!.contractAmount.toLocaleString("ru-RU")} ₽</span>
                                        <span>•</span>
                                        <span>Дата: {m.conversion!.contractDate}</span>
                                        {m.conversion!.isNewExporter && (
                                          <span className="font-bold">• Новый экспортёр</span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    m.status === "Выполнено" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300" :
                                    m.status === "Одобрено" ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300" :
                                    "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                                  }`}>
                                    {m.status}
                                  </span>
                                  {currentRole !== "analyst" && (
                                    <button
                                      onClick={() => handleDeleteSupportMeasure(m.id)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Add Support Measure form */}
                  {currentRole !== "analyst" && (
                    <form onSubmit={handleAddSupportMeasure} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Добавить новую меру поддержки</h5>
                      
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={newMeasureName}
                          onChange={e => setNewMeasureName(e.target.value)}
                          placeholder="Название услуги"
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={newMeasureServiceType}
                            onChange={e => setNewMeasureServiceType(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                          >
                            <option value="exhibition">Выставка</option>
                            <option value="business_mission">Бизнес-миссия</option>
                            <option value="search_and_selection">Поиск и подбор</option>
                            <option value="etp_placement">Размещение на ЭТП</option>
                            <option value="reverse_business_mission">Реверсная бизнес-миссия</option>
                            <option value="interregional_mission">Межрегиональная бизнес-миссия</option>
                            <option value="other">Прочее (популяризация)</option>
                          </select>
                          <select
                            value={newMeasureStatus}
                            onChange={e => setNewMeasureStatus(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                          >
                            <option value="Одобрено">Одобрено</option>
                            <option value="Выполнено">Выполнено</option>
                            <option value="На рассмотрении">На рассмотрении</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={newMeasureRequestDate}
                            onChange={e => setNewMeasureRequestDate(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                          />
                          <input
                            type="date"
                            value={newMeasureReceiptDate}
                            onChange={e => setNewMeasureReceiptDate(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                          />
                        </div>

                        <input
                          type="number"
                          value={newMeasureAmount || ""}
                          onChange={e => setNewMeasureAmount(Number(e.target.value) || 0)}
                          placeholder="Сумма (руб)"
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                        />

                        {/* Conversion section */}
                        <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            <input
                              type="checkbox"
                              checked={newMeasureConversion}
                              onChange={e => setNewMeasureConversion(e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            По итогу услуги заключён экспортный контракт
                          </label>

                          {newMeasureConversion && (
                            <div className="space-y-2 pl-6">
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={newMeasureContractCountry}
                                  onChange={e => setNewMeasureContractCountry(e.target.value)}
                                  placeholder="Страна контракта"
                                  className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                                />
                                <input
                                  type="number"
                                  value={newMeasureContractAmount || ""}
                                  onChange={e => setNewMeasureContractAmount(Number(e.target.value) || 0)}
                                  placeholder="Сумма контракта (руб)"
                                  className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="date"
                                  value={newMeasureContractDate}
                                  onChange={e => setNewMeasureContractDate(e.target.value)}
                                  className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                                />
                                <label className="flex items-center gap-2 text-[11px] text-slate-500">
                                  <input
                                    type="checkbox"
                                    checked={newMeasureIsNewExporter}
                                    onChange={e => setNewMeasureIsNewExporter(e.target.checked)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  Новый экспортёр
                                </label>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Добавить меру поддержки
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              )}

              {/* TAB CONTENT: CRM INTERACTIONS & TASKS */}
              {companyDetailTab === "interactions" && (
                <div className="space-y-6">
                  
                  {/* Task planning section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                      <CheckSquare className="w-4 h-4 text-indigo-500" />
                      Задачи и напоминания (CRM)
                    </h4>

                    {(!selectedCompany.tasks || selectedCompany.tasks.length === 0) ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                        Задач для этой компании не запланировано.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCompany.tasks.map((t) => (
                          <div
                            key={t.id}
                            className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                              t.status === "completed"
                                ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 line-through"
                                : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/60 font-semibold"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                disabled={currentRole === "analyst"}
                                checked={t.status === "completed"}
                                onChange={() => handleToggleTaskStatus(t.id, t.status)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                              <div>
                                <p className="text-slate-800 dark:text-slate-200">{t.text}</p>
                                <div className="text-[10px] text-slate-400 mt-0.5 flex gap-2">
                                  <span>Срок: {t.date}</span>
                                  <span>•</span>
                                  <span>Исполнитель: {t.assignedTo}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Task Form */}
                    {currentRole !== "analyst" && (
                      <form onSubmit={handleAddTask} className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <span className="text-[11px] font-bold block text-slate-700 dark:text-slate-300">Запланировать новое действие:</span>
                        <input
                          type="text"
                          required
                          value={newTaskText}
                          onChange={e => setNewTaskText(e.target.value)}
                          placeholder="Что нужно сделать? (например: Получить фитосанитарный сертификат)"
                          className="w-full text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg"
                        />
                        <div className="flex gap-2">
                          <input
                            type="date"
                            value={newTaskDate}
                            onChange={e => setNewTaskDate(e.target.value)}
                            className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex-1"
                          />
                          <input
                            type="text"
                            value={newTaskAssignedTo}
                            onChange={e => setNewTaskAssignedTo(e.target.value)}
                            placeholder="Ответственный"
                            className="text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex-1"
                          />
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                          >
                            ОК
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Interaction Logs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-1">
                      <Clock className="w-4.5 h-4.5 text-indigo-500" />
                      История взаимодействия
                    </h4>

                    {(!selectedCompany.interactions || selectedCompany.interactions.length === 0) ? (
                      <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                        Записей о взаимодействии пока нет. Вы можете оставить первый лог ниже.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedCompany.interactions.map((i) => (
                          <div
                            key={i.id}
                            className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs"
                          >
                            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5">
                              <span className="font-bold">{i.author}</span>
                              <span>{i.date}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300">{i.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Interaction Form */}
                    {currentRole !== "analyst" && (
                      <form onSubmit={handleAddInteraction} className="space-y-2">
                        <textarea
                          required
                          value={newInteractionText}
                          onChange={e => setNewInteractionText(e.target.value)}
                          placeholder="Добавить примечание о созвоне, встрече или письме..."
                          rows={2}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl"
                        />
                        <button
                          type="submit"
                          className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold py-1.5 px-4 rounded-lg flex items-center gap-1 transition-all"
                        >
                          Сохранить лог созвона
                        </button>
                      </form>
                    )}
                  </div>

                </div>
              )}

              {/* TAB CONTENT: AUDIT LOGS & DYNAMIC CUSTOM FIELDS */}
              {companyDetailTab === "audit" && (
                <div className="space-y-6">
                  
                  {/* Dynamic Custom Fields Editing */}
                  <div className="bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sliders className="w-4 h-4" />
                      Пользовательские доп. реквизиты
                    </h4>

                    {customFields.length === 0 ? (
                      <p className="text-xs text-indigo-700 dark:text-indigo-300 italic">
                        Пользовательские поля не зарегистрированы. Добавьте их во вкладке "Управление полями".
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {customFields.map((field) => {
                          const val = selectedCompany.customFields?.[field.key] ?? "";
                          return (
                            <div key={field.id} className="grid grid-cols-3 items-center gap-4 text-xs">
                              <span className="font-semibold text-slate-600 dark:text-slate-400">{field.label}:</span>
                              <div className="col-span-2">
                                {field.type === "boolean" ? (
                                  <select
                                    disabled={currentRole === "analyst"}
                                    value={val === true || val === "true" ? "true" : "false"}
                                    onChange={e => {
                                      const updatedCustom = {
                                        ...selectedCompany.customFields,
                                        [field.key]: e.target.value === "true"
                                      };
                                      handleSaveCompanyEdit({ customFields: updatedCustom });
                                    }}
                                    className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950"
                                  >
                                    <option value="false">Нет</option>
                                    <option value="true">Да</option>
                                  </select>
                                ) : (
                                  <input
                                    type={field.type === "number" ? "number" : "text"}
                                    disabled={currentRole === "analyst"}
                                    value={val}
                                    onChange={e => {
                                      const updatedCustom = {
                                        ...selectedCompany.customFields,
                                        [field.key]: e.target.value
                                      };
                                      handleSaveCompanyEdit({ customFields: updatedCustom });
                                    }}
                                    className="w-full p-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-950"
                                    placeholder={`Введите ${field.label.toLowerCase()}`}
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Audit Logs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-500">Аудит истории изменений</h4>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {!selectedCompany.changeLogs || selectedCompany.changeLogs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Логов изменений нет</p>
                      ) : (
                        [...selectedCompany.changeLogs].reverse().map((log, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                            <div className="flex justify-between items-center text-slate-400">
                              <span className="font-bold">{log.user} ({log.action})</span>
                              <span>{new Date(log.timestamp).toLocaleString("ru-RU")}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 font-mono text-[10px] break-all">{log.details}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Drawer Footer Actions */}
            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">
                Создано: {new Date(selectedCompany.createdAt).toLocaleDateString("ru-RU")}
              </span>
              <div className="flex items-center gap-2">
                {currentRole !== "analyst" && (
                  <button
                    onClick={() => handleDeleteCompany(selectedCompany.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    Удалить компанию
                  </button>
                )}
                <button
                  onClick={() => setSelectedCompanyId(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Закрыть
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- 7. ADD COMPANY MODAL -------------------- */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col justify-between overflow-hidden">
            
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Вручную добавить компанию в реестр
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">ИНН компании *</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={newCompanyData.inn}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, inn: e.target.value.replace(/\D/g, "") }))}
                    placeholder="Например: 7453012345"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Наименование компании *</label>
                  <input
                    type="text"
                    required
                    value={newCompanyData.name}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ООО АгроАльянс"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Сфера деятельности</label>
                  <select
                    value={newCompanyData.sphere}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, sphere: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="Прочие">Прочие</option>
                    <option value="Промышленность">Промышленность</option>
                    <option value="АПК">АПК</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Отрасль</label>
                  <input
                    type="text"
                    value={newCompanyData.sector}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, sector: e.target.value }))}
                    placeholder="Например: Тяжелое машиностроение"
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Статус экспортера</label>
                  <select
                    value={newCompanyData.statusExporter}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, statusExporter: e.target.value }))}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="не экспортер">не экспортер</option>
                    <option value="экспортер">экспортер</option>
                    <option value="2025 г.">2025 г. (планирует)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Работа с ЦПЭ</label>
                  <select
                    value={newCompanyData.cpeCooperation ? "true" : "false"}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, cpeCooperation: e.target.value === "true" }))}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="false">Нет</option>
                    <option value="true">Да</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Категория МСП</label>
                  <select
                    value={newCompanyData.categoryMsp}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, categoryMsp: e.target.value }))}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="Микро">Микро</option>
                    <option value="Малое">Малое</option>
                    <option value="Среднее">Среднее</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Производимая продукция</label>
                <input
                  type="text"
                  value={newCompanyData.products}
                  onChange={e => setNewCompanyData(prev => ({ ...prev, products: e.target.value }))}
                  placeholder="Прокатные станы, крепежные детали..."
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Коды ТН ВЭД</label>
                <input
                  type="text"
                  value={newCompanyData.tnved || ""}
                  onChange={e => setNewCompanyData(prev => ({ ...prev, tnved: e.target.value }))}
                  placeholder="8471, 8473, 8523 (через запятую)"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Контакты Минпрома</h4>
                  <input
                    type="text"
                    value={newCompanyData.contactMinprom}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, contactMinprom: e.target.value }))}
                    placeholder="ФИО куратора"
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg mb-2"
                  />
                  <input
                    type="text"
                    value={newCompanyData.phoneMinprom}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, phoneMinprom: e.target.value }))}
                    placeholder="Телефон"
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Контакты ЦПЭ</h4>
                  <input
                    type="text"
                    value={newCompanyData.contactCpe}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, contactCpe: e.target.value }))}
                    placeholder="ФИО менеджера"
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg mb-2"
                  />
                  <input
                    type="text"
                    value={newCompanyData.phoneCpe}
                    onChange={e => setNewCompanyData(prev => ({ ...prev, phoneCpe: e.target.value }))}
                    placeholder="Телефон"
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              {customFields.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Дополнительные поля</h4>
                  {customFields.map(f => (
                    <div key={f.id} className="grid grid-cols-3 gap-2 items-center text-xs">
                      <span>{f.label}:</span>
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        className="col-span-2 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                        onChange={e => {
                          setNewCompanyData(prev => ({
                            ...prev,
                            customFields: {
                              ...prev.customFields,
                              [f.key]: e.target.value
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 -mx-6 -mb-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Сохранить компанию
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* -------------------- 8. BULK EDIT MODAL -------------------- */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Массовое редактирование ({selectedIds.length} компаний)
              </h3>
              <button onClick={() => setShowBulkEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkEdit} className="p-6 space-y-4">
              <p className="text-xs text-slate-500">
                Выберите только те поля, которые вы хотите обновить для всех {selectedIds.length} выбранных компаний. Оставшиеся поля не изменятся.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Статус экспортера</label>
                <select
                  value={bulkUpdates.statusExporter}
                  onChange={e => setBulkUpdates(prev => ({ ...prev, statusExporter: e.target.value }))}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <option value="">-- Не изменять --</option>
                  <option value="экспортер">экспортер</option>
                  <option value="не экспортер">не экспортер</option>
                  <option value="2025 г.">2025 г.</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Сотрудничество с ЦПЭ</label>
                <select
                  value={bulkUpdates.cpeCooperation}
                  onChange={e => setBulkUpdates(prev => ({ ...prev, cpeCooperation: e.target.value }))}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <option value="">-- Не изменять --</option>
                  <option value="true">Сотрудничают (Да)</option>
                  <option value="false">Не сотрудничают (Нет)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Сфера деятельности</label>
                <select
                  value={bulkUpdates.sphere}
                  onChange={e => setBulkUpdates(prev => ({ ...prev, sphere: e.target.value }))}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <option value="">-- Не изменять --</option>
                  <option value="АПК">АПК</option>
                  <option value="Промышленность">Промышленность</option>
                  <option value="Прочие">Прочие</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Категория МСП</label>
                <select
                  value={bulkUpdates.categoryMsp}
                  onChange={e => setBulkUpdates(prev => ({ ...prev, categoryMsp: e.target.value }))}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <option value="">-- Не изменять --</option>
                  <option value="Микро">Микро</option>
                  <option value="Малое">Малое</option>
                  <option value="Среднее">Среднее</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Требуется актуализация</label>
                <select
                  value={bulkUpdates.needsUpdate}
                  onChange={e => setBulkUpdates(prev => ({ ...prev, needsUpdate: e.target.value }))}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <option value="">-- Не изменять --</option>
                  <option value="true">Требует обновления данных</option>
                  <option value="false">Все актуально (Снять флаг)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBulkEditModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Применить изменения
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* -------------------- 9. CUSTOM FIELD CREATION MODAL -------------------- */}
      {showCustomFieldModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Регистрация нового поля
              </h3>
              <button onClick={() => setShowCustomFieldModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomField} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Код поля (только латиница и подчеркивания)</label>
                <input
                  type="text"
                  required
                  value={newFieldKey}
                  onChange={e => setNewFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="website"
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Название поля (отображаемое имя на русском)</label>
                <input
                  type="text"
                  required
                  value={newFieldLabel}
                  onChange={e => setNewFieldLabel(e.target.value)}
                  placeholder="Официальный сайт"
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Тип данных</label>
                <select
                  value={newFieldType}
                  onChange={e => setNewFieldType(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <option value="text">Текст (строка)</option>
                  <option value="number">Число</option>
                  <option value="boolean">Логическое (Да/Нет)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomFieldModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Создать поле
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* -------------------- 9. CSV IMPORT MODAL -------------------- */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-950 max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Импорт компаний из CSV (Excel)
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCsvImport} className="p-6 space-y-4">
              <div className="text-xs text-slate-500 space-y-2">
                <p>
                  Выберите Excel-файл (.xlsx/.xls) или CSV. Приложение автоматически сопоставит ваши русские заголовки с полями базы.
                </p>
                <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer shadow-sm">
                  <Upload className="w-4 h-4" />
                  Выбрать Excel / CSV файл
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelFileSelect}
                    className="hidden"
                  />
                </label>
                <p>
                  Поддерживаемые заголовки:
                </p>
                <code className="bg-slate-100 dark:bg-slate-900 p-2 block mt-1 font-mono text-[10px] text-indigo-600 rounded-lg whitespace-pre-wrap">
                  ИНН;Наименование;Статус (экспортер, не экспортер, 2025 г.);Статус работы ЦПЭ;Статус МСП;Отрасль;Основной вид деятельности;Продукция;Почта (Минпром);Почта (ЦПЭ);Телефон (Минпром);Телефон (ЦПЭ);Контактное лицо (Минпром);Контактное лицо (ЦПЭ)
                </code>
              </div>

              <div>
                <textarea
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                  placeholder="Пример:&#10;7701223344;ООО Тестовый Импорт;экспортер;Да;Да;Химическая промышленность;Производство пластика;Полимеры;minprom@example.ru;cpe@example.ru;+7 900 111-22-33;+7 900 222-33-44;Иванов И.И.;Петров П.П."
                  rows={8}
                  className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-indigo-500"
                />
              </div>

              {importStatus && (
                <div className="text-xs p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl font-semibold">
                  {importStatus}
                </div>
              )}

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCsvText(
                    "ИНН;Наименование;Статус (экспортер, не экспортер, 2025 г.);Статус работы ЦПЭ;Статус МСП;Отрасль;Основной вид деятельности;Продукция;Почта (Минпром);Почта (ЦПЭ);Телефон (Минпром);Телефон (ЦПЭ);Контактное лицо (Минпром);Контактное лицо (ЦПЭ)\n" +
                    "6671049900;ООО 'Екатеринбургский Кабель';экспортер;Да;Да;Электротехника;Производство медных кабелей;Медный кабель в броне;minprom-cable@example.ru;cpe-cable@example.ru;+7 343 111-22-33;+7 343 222-33-44;Иванов И.И.;Петров П.П.\n" +
                    "2315024411;ООО 'Черноморский Альянс';не экспортер;Нет;Да;Логистика;Хранение зерновых;Пшеница, кукуруза;minprom-grain@example.ru;cpe-grain@example.ru;+7 861 111-22-33;+7 861 222-33-44;Сидоров С.С.;Кузнецова А.А."
                  )}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Вставить образец
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                  >
                    Импортировать
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* -------------------- 10. APPLICATION DETAIL MODAL -------------------- */}
      {showAppDetail && selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-950 max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedApp.status === "new" ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300" :
                    selectedApp.status === "in_progress" ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
                    selectedApp.status === "completed" ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" :
                    "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  }`}>
                    {selectedApp.status === "new" ? "Новая" : selectedApp.status === "in_progress" ? "В работе" : selectedApp.status === "completed" ? "Завершена" : "Отклонена"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">№{selectedApp.id}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate mt-1">{selectedApp.subject}</h2>
              </div>
              <button onClick={() => setShowAppDetail(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Company info */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  Информация о компании
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block text-slate-400 text-[10px] font-semibold">Наименование</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedApp.companyName}</span>
                  </div>
                  {selectedApp.companyInn && (
                    <div>
                      <span className="block text-slate-400 text-[10px] font-semibold">ИНН</span>
                      <span className="font-mono">{selectedApp.companyInn}</span>
                    </div>
                  )}
                  {selectedApp.contactName && (
                    <div>
                      <span className="block text-slate-400 text-[10px] font-semibold">Контактное лицо</span>
                      <span>{selectedApp.contactName}</span>
                    </div>
                  )}
                  {selectedApp.contactPhone && (
                    <div>
                      <span className="block text-slate-400 text-[10px] font-semibold">Телефон</span>
                      <span>{selectedApp.contactPhone}</span>
                    </div>
                  )}
                  {selectedApp.contactEmail && (
                    <div>
                      <span className="block text-slate-400 text-[10px] font-semibold">Email</span>
                      <span>{selectedApp.contactEmail}</span>
                    </div>
                  )}
                  {selectedApp.source && (
                    <div>
                      <span className="block text-slate-400 text-[10px] font-semibold">Источник</span>
                      <span>{selectedApp.source}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Текст заявки
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {selectedApp.message || "(текст отсутствует)"}
                </p>
              </div>

              {/* Timestamps */}
              <div className="flex gap-4 text-[10px] text-slate-400">
                <span>Создана: {new Date(selectedApp.createdAt).toLocaleString("ru-RU")}</span>
                {selectedApp.processedAt && (
                  <span>Обработана: {new Date(selectedApp.processedAt).toLocaleString("ru-RU")}</span>
                )}
              </div>

              {/* Processing form */}
              {currentRole !== "analyst" && (
                <div className="bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                    Обработка заявки
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Статус</label>
                      <select
                        value={appNewStatus}
                        onChange={e => setAppNewStatus(e.target.value)}
                        className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                      >
                        <option value="new">Новая</option>
                        <option value="in_progress">В работе</option>
                        <option value="completed">Завершена</option>
                        <option value="rejected">Отклонена</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Назначить ответственного</label>
                      <input
                        type="text"
                        value={appNewAssignee}
                        onChange={e => setAppNewAssignee(e.target.value)}
                        placeholder="ФИО менеджера"
                        className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Комментарий по обработке</label>
                    <textarea
                      value={appNewComment}
                      onChange={e => setAppNewComment(e.target.value)}
                      placeholder="Результат обработки, примечания..."
                      rows={3}
                      className="w-full text-xs p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={async () => {
                        if (!selectedApp) return;
                        try {
                          const res = await fetch(`/api/applications/${selectedApp.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              status: appNewStatus,
                              assignedTo: appNewAssignee,
                              comment: appNewComment,
                              processedBy: currentRole === "admin" ? "Администратор" : "Менеджер",
                            }),
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setSelectedApp(updated);
                            setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
                            alert("Заявка обновлена");
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition-all"
                    >
                      <Check className="w-3.5 h-3.5 inline mr-1" />
                      Сохранить изменения
                    </button>
                    {currentRole === "admin" && (
                      <button
                        onClick={async () => {
                          if (!confirm("Удалить заявку безвозвратно?")) return;
                          try {
                            const res = await fetch(`/api/applications/${selectedApp.id}`, { method: "DELETE" });
                            if (res.ok) {
                              setApplications(prev => prev.filter(a => a.id !== selectedApp.id));
                              setShowAppDetail(false);
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold py-2 px-4 rounded-lg transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Link to existing company */}
              {currentRole !== "analyst" && (
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Привязать к существующей компании
                  </h4>
                  <p className="text-xs text-slate-400">Найдите компанию в реестре, чтобы привязать эту заявку к её карточке.</p>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 text-xs p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                      defaultValue=""
                      onChange={async (e) => {
                        const companyId = parseInt(e.target.value, 10);
                        if (!companyId || !selectedApp) return;
                        try {
                          const res = await fetch(`/api/applications/${selectedApp.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ companyId }),
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            setSelectedApp(updated);
                            setApplications(prev => prev.map(a => a.id === updated.id ? updated : a));
                            alert("Заявка привязана к компании. Откройте карточку компании, чтобы увидеть заявку.");
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                    >
                      <option value="">-- Выберите компанию --</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} (ИНН: {c.inn})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">Источник: {selectedApp.source || "внешний сайт"}</span>
              <button
                onClick={() => setShowAppDetail(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-semibold"
              >
                Закрыть
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
