"use client";

import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Search, Plus, Edit, Trash2, Download, Upload, X, Globe, Mail, Phone, User as UserIcon,
  Building2, FileText, List, Grid
} from "lucide-react";

interface ForeignPartner {
  id: number;
  companyName: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  productInterests: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function ForeignPartners() {
  const [partners, setPartners] = useState<ForeignPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    country: "",
    contactPerson: "",
    phone: "",
    email: "",
    website: "",
    productInterests: "",
    notes: "",
  });

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Conflicts
  const [conflicts, setConflicts] = useState<{ name: string; existing: string; incoming: string }[]>([]);

  const fetchPartners = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/foreign-partners?${params.toString()}`);
      if (res.ok) {
        setPartners(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [searchQuery]);

  const resetForm = () => {
    setForm({ companyName: "", country: "", contactPerson: "", phone: "", email: "", website: "", productInterests: "", notes: "" });
    setEditId(null);
  };

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.country.trim()) {
      alert("Название компании и страна обязательны");
      return;
    }

    try {
      if (editId !== null) {
        const res = await fetch(`/api/foreign-partners/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          await fetchPartners();
          setShowAddModal(false);
          resetForm();
        } else {
          const err = await res.json();
          alert(`Ошибка: ${err.error || ""}`);
        }
      } else {
        const res = await fetch("/api/foreign-partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          await fetchPartners();
          setShowAddModal(false);
          resetForm();
        } else {
          const err = await res.json();
          alert(`Ошибка: ${err.error || ""}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (p: ForeignPartner) => {
    setForm({
      companyName: p.companyName,
      country: p.country,
      contactPerson: p.contactPerson,
      phone: p.phone,
      email: p.email,
      website: p.website,
      productInterests: p.productInterests,
      notes: p.notes,
    });
    setEditId(p.id);
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить партнёра?")) return;
    try {
      const res = await fetch(`/api/foreign-partners/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchPartners();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Название компании", "Страна", "Контактное лицо", "Телефон",
      "Email", "Сайт", "Интересующая продукция", "Примечания"
    ];
    const rows = partners.map(p => [
      `"${p.companyName.replace(/"/g, '""')}"`,
      `"${p.country.replace(/"/g, '""')}"`,
      `"${p.contactPerson.replace(/"/g, '""')}"`,
      `"${p.phone.replace(/"/g, '""')}"`,
      `"${p.email.replace(/"/g, '""')}"`,
      `"${p.website.replace(/"/g, '""')}"`,
      `"${p.productInterests.replace(/"/g, '""')}"`,
      `"${p.notes.replace(/"/g, '""')}"`,
    ]);

    const csv = "\uFEFF" + headers.join(";") + "\r\n" + rows.map(r => r.join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `foreign_partners_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Excel / CSV Import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("Читаем файл...");
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });

      let imported = 0;
      let errors = 0;

      for (const row of json) {
        const companyName = (row["Название компании"] || row["Компания"] || row["companyName"] || row["Имя"] || "").trim();
        const country = (row["Страна"] || row["country"] || "").trim();
        if (!companyName || !country) {
          errors++;
          continue;
        }
        const contactPerson = (row["Контактное лицо"] || row["contactPerson"] || row["Контакт"] || "").trim();
        const phone = (row["Телефон"] || row["phone"] || "").trim();
        const email = (row["Email"] || row["email"] || row["Почта"] || "").trim();
        const website = (row["Сайт"] || row["website"] || row["Вебсайт"] || "").trim();
        const productInterests = (row["Интересующая продукция"] || row["productInterests"] || row["Продукция"] || "").trim();
        const notes = (row["Примечания"] || row["notes"] || row["Заметки"] || "").trim();

        const res = await fetch("/api/foreign-partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ companyName, country, contactPerson, phone, email, website, productInterests, notes }),
        });

        if (res.ok) {
          imported++;
        } else {
          errors++;
        }
      }

      await fetchPartners();
      setImportStatus(`Импортировано: ${imported}, ошибок: ${errors}`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
      }, 2000);
    } catch (e: any) {
      alert(`Ошибка при импорте: ${e.message}`);
      setImportStatus(null);
    }

    e.target.value = "";
  };

  // CSV text import
  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      alert("Введите CSV-данные");
      return;
    }

    try {
      const lines = csvText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) {
        alert("Слишком мало строк");
        return;
      }

      const parseCsvLine = (line: string) => {
        const result: string[] = [];
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

      const findHeader = (...needles: string[]) =>
        normalizedHeaders.findIndex(h => needles.some(n => h.includes(n)));

      const getValue = (values: string[], index: number) => index !== -1 ? (values[index] || "").trim() : "";

      const companyNameIdx = findHeader("название компании", "компания", "company name", "companyname");
      const countryIdx = findHeader("страна", "country");
      const contactIdx = findHeader("контактное лицо", "контакт", "contact person", "contactperson");
      const phoneIdx = findHeader("телефон", "phone");
      const emailIdx = findHeader("email", "почта", "e-mail");
      const websiteIdx = findHeader("сайт", "website", "вебсайт");
      const productIdx = findHeader("интересующая продукция", "продукция", "product interests", "productinterests");
      const notesIdx = findHeader("примечания", "notes", "заметки");

      let imported = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length < 2) continue;

        const companyName = getValue(values, companyNameIdx);
        const country = getValue(values, countryIdx);
        if (!companyName || !country) continue;

        const res = await fetch("/api/foreign-partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName,
            country,
            contactPerson: getValue(values, contactIdx),
            phone: getValue(values, phoneIdx),
            email: getValue(values, emailIdx),
            website: getValue(values, websiteIdx),
            productInterests: getValue(values, productIdx),
            notes: getValue(values, notesIdx),
          }),
        });

        if (res.ok) imported++;
      }

      await fetchPartners();
      setImportStatus(`Успешно импортировано: ${imported}`);
      setTimeout(() => {
        setShowImportModal(false);
        setCsvText("");
        setImportStatus(null);
      }, 2000);
    } catch (e: any) {
      alert(`Ошибка при парсинге CSV: ${e.message}`);
    }
  };

  // Unique countries for stats
  const countries = useMemo(() => {
    const set = new Set(partners.map(p => p.country).filter(Boolean));
    return Array.from(set).sort();
  }, [partners]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{partners.length}</span>
            <span className="text-xs text-slate-400 ml-2">всего партнёров</span>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{countries.length}</span>
            <span className="text-xs text-slate-400 ml-2">стран</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Добавить партнёра
          </button>
        </div>
      </div>

      {/* Search & view toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, контакту, продукции..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
          />
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
          <button onClick={() => setViewMode("table")} className={`p-1.5 rounded-lg ${viewMode === "table" ? "bg-white dark:bg-slate-800 shadow-xs" : ""}`}>
            <List className="w-4 h-4 text-slate-500" />
          </button>
          <button onClick={() => setViewMode("cards")} className={`p-1.5 rounded-lg ${viewMode === "cards" ? "bg-white dark:bg-slate-800 shadow-xs" : ""}`}>
            <Grid className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <Download className="w-4 h-4" /> CSV
        </button>
        <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" /> Excel
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} className="hidden" />
        </label>
        <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
          <FileText className="w-4 h-4" /> CSV (текст)
        </button>
      </div>

      {/* Table view */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 text-left">Компания</th>
                <th className="py-3 px-4 text-left">Страна</th>
                <th className="py-3 px-4 text-left">Контакты</th>
                <th className="py-3 px-4 text-left">Сайт / Продукция</th>
                <th className="py-3 px-4 text-left">Примечания</th>
                <th className="py-3 px-4 text-center w-20">Действия</th>
              </tr>
            </thead>
            <tbody>
              {partners.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">Нет иностранных партнёров</td></tr>
              )}
              {partners.map(p => (
                <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-white">{p.companyName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-semibold">
                      <Globe className="w-3 h-3" /> {p.country}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      {p.contactPerson && <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><UserIcon className="w-3 h-3" /> {p.contactPerson}</div>}
                      {p.phone && <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><Phone className="w-3 h-3" /> {p.phone}</div>}
                      {p.email && <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400"><Mail className="w-3 h-3" /> {p.email}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-0.5">
                      {p.website && <div className="text-indigo-500"><a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{p.website}</a></div>}
                      {p.productInterests && <div className="text-slate-500 dark:text-slate-400 text-[10px]">{p.productInterests}</div>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-400 dark:text-slate-500 text-[10px] max-w-[200px] truncate">{p.notes}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleEdit(p)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-400 text-sm">Нет иностранных партнёров</div>
          )}
          {partners.map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-semibold text-xs text-slate-800 dark:text-white">{p.companyName}</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-semibold">
                  <Globe className="w-3 h-3" /> {p.country}
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                {p.contactPerson && <div className="flex items-center gap-1.5"><UserIcon className="w-3 h-3" /> {p.contactPerson}</div>}
                {p.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {p.phone}</div>}
                {p.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {p.email}</div>}
                {p.website && <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> <a href={p.website.startsWith("http") ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{p.website}</a></div>}
              </div>
              {p.productInterests && (
                <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                  {p.productInterests}
                </div>
              )}
              {p.notes && <div className="mt-2 text-[10px] text-slate-400 italic">{p.notes}</div>}
              <div className="flex items-center gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => handleEdit(p)} className="flex-1 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Edit className="w-3 h-3" /> Изменить
                </button>
                <button onClick={() => handleDelete(p.id)} className="flex-1 py-1.5 text-[10px] font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                {editId ? "Редактировать партнёра" : "Новый иностранный партнёр"}
              </h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Название компании *</label>
                  <input type="text" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Страна *</label>
                  <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Контактное лицо</label>
                <input type="text" value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Телефон</label>
                  <input type="text" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Сайт</label>
                <input type="text" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                  placeholder="example.com"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Интересующая продукция</label>
                <textarea value={form.productInterests} onChange={e => setForm(p => ({ ...p, productInterests: e.target.value }))}
                  rows={2} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Примечания</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2} className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowAddModal(false); resetForm(); }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Отмена
              </button>
              <button onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors">
                {editId ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => { setShowImportModal(false); setCsvText(""); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Импорт иностранных партнёров</h3>
              <button onClick={() => { setShowImportModal(false); setCsvText(""); }}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Вставьте CSV-данные (разделитель ;) или загрузите Excel-файл. Первая строка — заголовки.
            </p>
            <div className="mb-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                <Upload className="w-4 h-4" /> Выбрать Excel / CSV файл
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileImport} className="hidden" />
              </label>
            </div>
            <div className="text-xs text-slate-400 mb-2">Или введите CSV:</div>
            <form onSubmit={handleCsvImport}>
              <textarea value={csvText} onChange={e => setCsvText(e.target.value)}
                rows={8}
                placeholder={"Название компании;Страна;Контактное лицо;Телефон;Email;Сайт;Интересующая продукция;Примечания\nООО \"Торговая компания\";Китай;Ли Вэй;+86 123456789;li@example.com;example.com;Электроника;Потенциальный партнёр"}
                className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-700 dark:text-slate-300"
              />
              <div className="flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => { setShowImportModal(false); setCsvText(""); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  Отмена
                </button>
                <button type="submit" disabled={!!importStatus}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                  {importStatus || "Импортировать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
