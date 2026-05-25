"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search, RefreshCw, Globe, Building2, User as UserIcon, Phone, Mail,
  Check, X, Calendar, ChevronRight, Info, AlertTriangle, Target, Filter
} from "lucide-react";

interface ForeignPartner {
  id: number;
  companyName: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  productInterests: string;
  notes: string;
}

interface Company {
  id: number;
  name: string;
  inn: string;
  sphere: string;
  sector: string;
  products: string;
  tnved: string;
  exportCountries: string;
  contactCpe: string;
  phoneCpe: string;
  emailCpe: string;
}

interface Match {
  id: number;
  foreignPartnerId: number;
  companyId: number;
  score: number;
  matchReason: string;
  status: string;
  notes: string;
  foreignPartner: ForeignPartner | null;
  company: Company | null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Новое", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  contacted: { label: "Связались", color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  meeting_scheduled: { label: "Встреча назначена", color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  meeting_done: { label: "Встреча прошла", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  rejected: { label: "Отказ", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
};

export default function Matching() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedFpId, setSelectedFpId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<number, string>>({});

  const fetchMatches = async (recalc = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (recalc) params.set("recalc", "true");
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/matching?${params.toString()}`);
      if (res.ok) {
        setMatches(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [statusFilter]);

  const handleRecalc = async () => {
    if (!confirm("Пересчитать все совпадения? Это заменит текущие результаты.")) return;
    setRecalculating(true);
    await fetchMatches(true);
    setRecalculating(false);
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const res = await fetch("/api/matching", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async (id: number) => {
    const notes = editingNotes[id];
    if (notes === undefined) return;
    try {
      const res = await fetch("/api/matching", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes }),
      });
      if (res.ok) {
        setMatches(prev => prev.map(m => m.id === id ? { ...m, notes } : m));
        setEditingNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Group matches by foreign partner
  const grouped = useMemo(() => {
    const groups = new Map<number, { partner: ForeignPartner; matches: Match[] }>();
    for (const m of matches) {
      if (!m.foreignPartner) continue;
      const fpId = m.foreignPartnerId;
      if (!groups.has(fpId)) {
        groups.set(fpId, { partner: m.foreignPartner, matches: [] });
      }
      const g = groups.get(fpId)!;
      if (!selectedFpId || selectedFpId === fpId) {
        g.matches.push(m);
      }
    }
    return Array.from(groups.values())
      .filter(g => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return g.partner.companyName.toLowerCase().includes(q) ||
          g.partner.country.toLowerCase().includes(q) ||
          g.partner.productInterests.toLowerCase().includes(q);
      })
      .sort((a, b) => b.matches.reduce((s, m) => s + m.score, 0) - a.matches.reduce((s, m) => s + m.score, 0));
  }, [matches, searchQuery, selectedFpId]);

  const totalMatches = matches.length;
  const contactedCount = matches.filter(m => m.status !== "new").length;
  const meetingCount = matches.filter(m => m.status === "meeting_scheduled" || m.status === "meeting_done").length;

  if (loading && !recalculating) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Stats & Actions */}
      <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 shadow-xs border border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <div>
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{totalMatches}</span>
              <span className="text-xs text-slate-400 ml-1">совпадений</span>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-amber-600">{contactedCount}</span> в работе · <span className="font-semibold text-emerald-600">{meetingCount}</span> встреч
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecalc}
            disabled={recalculating}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${recalculating ? "animate-spin" : ""}`} />
            {recalculating ? "Расчёт..." : "Пересчитать совпадения"}
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по партнёру, стране, продукции..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-indigo-500 text-slate-700 dark:text-slate-300"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-slate-700 dark:text-slate-300"
        >
          <option value="">Все статусы</option>
          <option value="new">Новые</option>
          <option value="contacted">Связались</option>
          <option value="meeting_scheduled">Встреча назначена</option>
          <option value="meeting_done">Встреча прошла</option>
          <option value="rejected">Отказ</option>
        </select>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
          <button onClick={() => setSelectedFpId(null)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${!selectedFpId ? "bg-white dark:bg-slate-800 shadow-xs text-indigo-600" : "text-slate-500"}`}>
            Все партнёры
          </button>
          <button onClick={() => {}} className="px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-700">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {totalMatches === 0 && !recalculating && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 border border-slate-100 dark:border-slate-800 text-center">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300">Нет совпадений</h3>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            Нажмите «Пересчитать совпадения», чтобы система автоматически сопоставила иностранных партнёров с российскими экспортёрами по кодам ТН ВЭД, сфере деятельности и продукции.
          </p>
        </div>
      )}

      {recalculating && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 border border-slate-100 dark:border-slate-800 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-slate-500">Идёт сопоставление компаний...</p>
          <p className="text-xs text-slate-400 mt-1">Анализируем коды ТН ВЭД, сферы деятельности и продукцию</p>
        </div>
      )}

      {/* Match groups */}
      <div className="space-y-6">
        {grouped.map(group => {
          const totalScore = Math.round(group.matches.reduce((s, m) => s + m.score, 0) / Math.max(1, group.matches.length));
          const bestMatches = group.matches.filter(m => m.score >= 50);
          return (
            <div key={group.partner.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* Partner header */}
              <div className="bg-slate-50 dark:bg-slate-900 px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-950 rounded-lg">
                    <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{group.partner.companyName}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {group.partner.country}</span>
                      {group.partner.contactPerson && <span className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {group.partner.contactPerson}</span>}
                      {group.partner.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {group.partner.phone}</span>}
                      {group.partner.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {group.partner.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Средний рейтинг:</span>
                  <span className="text-base font-black text-indigo-600">{totalScore}%</span>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-semibold">
                    {bestMatches.length} лучших
                  </span>
                </div>
              </div>

              {/* Partner product interests */}
              {group.partner.productInterests && (
                <div className="px-5 py-2 bg-indigo-50/50 dark:bg-indigo-950/10 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500">Интересы: </span>
                  <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{group.partner.productInterests}</span>
                </div>
              )}

              {/* Matches table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                      <th className="py-2.5 px-4 text-left">Российская компания</th>
                      <th className="py-2.5 px-4 text-left">Сфера / ТН ВЭД</th>
                      <th className="py-2.5 px-4 text-left">Совпадение</th>
                      <th className="py-2.5 px-4 text-left">Статус</th>
                      <th className="py-2.5 px-4 text-left">Заметки</th>
                      <th className="py-2.5 px-4 text-center">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.matches
                      .sort((a, b) => b.score - a.score)
                      .map(m => (
                        <tr key={m.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <div>
                                <span className="font-semibold text-slate-800 dark:text-white">{m.company?.name || "—"}</span>
                                <div className="text-[10px] text-slate-400">{m.company?.inn || ""}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="text-slate-600 dark:text-slate-400">{m.company?.sphere || ""}</span>
                            {m.company?.tnved && (
                              <div className="text-[10px] font-mono text-indigo-500">{m.company.tnved}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                                m.score >= 70 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                                m.score >= 40 ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                                "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}>
                                {m.score}%
                              </div>
                              <div className="text-[10px] text-slate-500 max-w-[200px] leading-tight">{m.matchReason}</div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <select
                              value={m.status}
                              onChange={e => handleStatusUpdate(m.id, e.target.value)}
                              className={`text-[10px] px-2 py-1 rounded-lg border-0 font-semibold ${statusLabels[m.status]?.color || ""}`}
                            >
                              {Object.entries(statusLabels).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 px-4 max-w-[150px]">
                            {editingNotes[m.id] !== undefined ? (
                              <div className="flex items-center gap-1">
                                <input type="text" value={editingNotes[m.id]}
                                  onChange={e => setEditingNotes(prev => ({ ...prev, [m.id]: e.target.value }))}
                                  className="w-full text-[10px] p-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded"
                                  autoFocus
                                  onKeyDown={e => { if (e.key === "Enter") handleSaveNotes(m.id); if (e.key === "Escape") setEditingNotes(prev => { const n = { ...prev }; delete n[m.id]; return n; }); }}
                                />
                                <button onClick={() => handleSaveNotes(m.id)} className="p-1 text-emerald-500"><Check className="w-3 h-3" /></button>
                                <button onClick={() => setEditingNotes(prev => { const n = { ...prev }; delete n[m.id]; return n; })} className="p-1 text-slate-400"><X className="w-3 h-3" /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400 truncate">{m.notes || "—"}</span>
                                <button onClick={() => setEditingNotes(prev => ({ ...prev, [m.id]: m.notes }))} className="p-0.5 text-slate-300 hover:text-slate-500">
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 11l-4 4v4h4l4-4m2-2l-4-4m6 6l-4-4" /></svg>
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleStatusUpdate(m.id, "contacted")}
                                title="Отметить связались"
                                className={`p-1.5 rounded-lg transition-colors ${m.status === "contacted" ? "bg-amber-100 text-amber-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(m.id, "meeting_scheduled")}
                                title="Назначить встречу"
                                className={`p-1.5 rounded-lg transition-colors ${m.status === "meeting_scheduled" ? "bg-purple-100 text-purple-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(m.id, "meeting_done")}
                                title="Встреча прошла"
                                className={`p-1.5 rounded-lg transition-colors ${m.status === "meeting_done" ? "bg-emerald-100 text-emerald-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(m.id, "rejected")}
                                title="Отказ"
                                className={`p-1.5 rounded-lg transition-colors ${m.status === "rejected" ? "bg-red-100 text-red-600" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {totalMatches > 0 && grouped.length === 0 && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm text-slate-500">Ничего не найдено по вашему запросу</p>
        </div>
      )}
    </div>
  );
}
