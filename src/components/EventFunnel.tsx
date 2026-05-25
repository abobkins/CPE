"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus, X, Globe, Building2, User as UserIcon, Phone, Mail, Search,
  Calendar, Check, Trash2, ChevronRight, Target, Zap, Sparkles, Filter
} from "lucide-react";

interface Company { id: number; name: string; inn: string; sphere: string; sector: string; products: string; tnved: string; exportCountries: string; contactCpe: string; phoneCpe: string; emailCpe: string; categoryMsp: string; statusExporter: string; }
interface ForeignPartner { id: number; companyName: string; country: string; contactPerson: string; phone: string; email: string; website: string; productInterests: string; }
interface EventItem { id: number; name: string; serviceType: string; serviceCategory: string; country: string; status: string; notes: string; createdAt: string; }
interface Meeting { id: number; eventId: number; companyId: number; foreignPartnerId: number; matchScore: number; matchType: string; status: string; notes: string; company: Company | null; foreignPartner: ForeignPartner | null; }

const serviceTypeOptions = [
  { value: "exhibition", label: "Международная выставка" },
  { value: "business_mission", label: "Бизнес-миссия" },
  { value: "reverse_business_mission", label: "Реверсная бизнес-миссия" },
  { value: "interregional_mission", label: "Межрегиональная бизнес-миссия" },
  { value: "search_and_selection", label: "Поиск и подбор партнёра" },
  { value: "etp_placement", label: "Размещение на ЭТП" },
  { value: "other", label: "Другое" },
];

const meetingStatusLabels: Record<string, { label: string; color: string }> = {
  suggested: { label: "Рекомендовано", color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  confirmed: { label: "Подтверждено", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  completed: { label: "Проведено", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  cancelled: { label: "Отменено", color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
};

export default function EventFunnel() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create form
  const [form, setForm] = useState({ name: "", serviceType: "exhibition", serviceCategory: "complex", country: "", notes: "" });

  // Companies & FPs for manual add
  const [companies, setCompanies] = useState<Company[]>([]);
  const [foreignPartners, setForeignPartners] = useState<ForeignPartner[]>([]);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [addMeetingData, setAddMeetingData] = useState({ companyId: 0, foreignPartnerId: 0, notes: "" });

  const [searchQ, setSearchQ] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) setEvents(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchEventDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/events?eventId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch (e) { console.error(e); }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      if (res.ok) setCompanies(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchForeignPartners = async () => {
    try {
      const res = await fetch("/api/foreign-partners");
      if (res.ok) setForeignPartners(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchEvents(), fetchCompanies(), fetchForeignPartners()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedEventId) fetchEventDetail(selectedEventId);
    else setMeetings([]);
  }, [selectedEventId]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const ev = await res.json();
        setEvents(prev => [ev, ...prev]);
        setSelectedEventId(ev.id);
        setShowCreateForm(false);
        setForm({ name: "", serviceType: "exhibition", serviceCategory: "complex", country: "", notes: "" });
        fetchEventDetail(ev.id);
      } else {
        const err = await res.json();
        alert(`Ошибка: ${err.error || ""}`);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Удалить мероприятие?")) return;
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
      setEvents(prev => prev.filter(e => e.id !== id));
      if (selectedEventId === id) setSelectedEventId(null);
    } catch (e) { console.error(e); }
  };

  const handleAddManualMeeting = async () => {
    if (!addMeetingData.companyId || !addMeetingData.foreignPartnerId) {
      alert("Выберите компанию и иностранного партнёра");
      return;
    }
    try {
      const res = await fetch("/api/event-meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: selectedEventId, ...addMeetingData }),
      });
      if (res.ok) {
        await fetchEventDetail(selectedEventId!);
        setShowAddMeeting(false);
        setAddMeetingData({ companyId: 0, foreignPartnerId: 0, notes: "" });
      }
    } catch (e) { console.error(e); }
  };

  const handleMeetingStatus = async (id: number, status: string) => {
    try {
      await fetch("/api/event-meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    } catch (e) { console.error(e); }
  };

  const handleDeleteMeeting = async (id: number) => {
    try {
      await fetch("/api/event-meetings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setMeetings(prev => prev.filter(m => m.id !== id));
    } catch (e) { console.error(e); }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Filtered meetings
  const filteredMeetings = useMemo(() => {
    let list = meetings;
    if (filterStatus) list = list.filter(m => m.status === filterStatus);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(m =>
        m.company?.name.toLowerCase().includes(q) ||
        m.foreignPartner?.companyName.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.matchScore - a.matchScore);
  }, [meetings, filterStatus, searchQ]);

  // Group by partner for funnel view
  const funnelGroups = useMemo(() => {
    const groups = new Map<number, { fp: ForeignPartner; meetings: Meeting[] }>();
    for (const m of filteredMeetings) {
      if (!m.foreignPartner) continue;
      const fpId = m.foreignPartnerId;
      if (!groups.has(fpId)) groups.set(fpId, { fp: m.foreignPartner, meetings: [] });
      groups.get(fpId)!.meetings.push(m);
    }
    return Array.from(groups.values()).sort((a, b) => {
      const avgA = a.meetings.reduce((s, m) => s + m.matchScore, 0) / a.meetings.length;
      const avgB = b.meetings.reduce((s, m) => s + m.matchScore, 0) / b.meetings.length;
      return avgB - avgA;
    });
  }, [filteredMeetings]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-950 rounded-2xl p-4 shadow-xs border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-indigo-500" />
          <div>
            <span className="text-sm font-bold text-slate-800 dark:text-white">Воронка мероприятий</span>
            <span className="text-xs text-slate-400 ml-2">{events.length} мероприятий</span>
          </div>
        </div>
        <button onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Новое мероприятие
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Создать мероприятие</h3>
            <button onClick={() => setShowCreateForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Название мероприятия *</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Например: Выставка Gulfood 2026"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Тип услуги *</label>
                <select value={form.serviceType} onChange={e => setForm(p => ({ ...p, serviceType: e.target.value }))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  {serviceTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Страна *</label>
                <input type="text" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                  placeholder="Например: ОАЭ"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Примечания</label>
              <input type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition-all">
              Создать и сформировать воронку
            </button>
          </form>
        </div>
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Events list */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Мероприятия</div>
          {events.length === 0 && (
            <div className="text-xs text-slate-400 py-6 text-center bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
              Нет мероприятий
            </div>
          )}
          {events.map(ev => {
            const meetingCount = meetings.filter(m => m.eventId === ev.id).length;
            return (
              <div key={ev.id}
                onClick={() => setSelectedEventId(ev.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedEventId === ev.id
                    ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 shadow-sm"
                    : "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{ev.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteEvent(ev.id); }} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <Globe className="w-3 h-3" /> {ev.country}
                  <span>·</span>
                  <span className="font-semibold">{meetingCount} встреч</span>
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">{serviceTypeOptions.find(o => o.value === ev.serviceType)?.label || ev.serviceType}</div>
              </div>
            );
          })}
        </div>

        {/* Right: Event funnel */}
        <div className="lg:col-span-3">
          {!selectedEvent ? (
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 border border-slate-100 dark:border-slate-800 text-center">
              <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Выберите мероприятие</h3>
              <p className="text-xs text-slate-400 mt-2">Или создайте новое — система автоматически подберёт лучшие варианты встреч</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Event header */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{selectedEvent!.name}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {selectedEvent!.country}</span>
                      <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-semibold">
                        {serviceTypeOptions.find(o => o.value === selectedEvent!.serviceType)?.label || selectedEvent!.serviceType}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowAddMeeting(true)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Добавить встречу
                    </button>
                  </div>
                </div>
              </div>

              {/* Search & filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    placeholder="Поиск по компании или партнёру..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className="text-xs p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <option value="">Все статусы</option>
                  <option value="suggested">Рекомендовано</option>
                  <option value="confirmed">Подтверждено</option>
                  <option value="completed">Проведено</option>
                  <option value="cancelled">Отменено</option>
                </select>
              </div>

              {/* Funnel: grouped by foreign partner */}
              {funnelGroups.length === 0 && (
                <div className="bg-white dark:bg-slate-950 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 text-center">
                  <Zap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Нет совпадений для этого мероприятия</p>
                  <p className="text-xs text-slate-400 mt-1">Добавьте встречи вручную или измените параметры мероприятия</p>
                </div>
              )}

              <div className="space-y-4">
                {funnelGroups.map(group => {
                  const avgScore = Math.round(group.meetings.reduce((s, m) => s + m.matchScore, 0) / group.meetings.length);
                  return (
                    <div key={group.fp.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      {/* Foreign partner header */}
                      <div className="bg-gradient-to-r from-indigo-50 to-transparent dark:from-indigo-950/20 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-indigo-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-white">{group.fp.companyName}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1"><Globe className="w-3 h-3" /> {group.fp.country}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {group.fp.contactPerson && <span className="text-[10px] text-slate-400"><UserIcon className="w-3 h-3 inline" /> {group.fp.contactPerson}</span>}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            avgScore >= 60 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                            avgScore >= 30 ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                            "bg-slate-100 text-slate-500"
                          }`}>{avgScore}%</span>
                        </div>
                      </div>

                      {/* Meetings for this partner */}
                      <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {group.meetings.map(m => (
                          <div key={m.id} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            {/* Score */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              m.matchScore >= 60 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                              m.matchScore >= 30 ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                              "bg-slate-100 text-slate-500 dark:bg-slate-800"
                            }`}>
                              {m.matchScore || "?"}
                            </div>

                            {/* Company */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-800 dark:text-white">{m.company?.name || "—"}</span>
                                <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                                  m.matchType === "manual" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                }`}>{m.matchType === "manual" ? "ручной" : "авто"}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{m.notes}</div>
                            </div>

                            {/* Status */}
                            <select value={m.status} onChange={e => handleMeetingStatus(m.id, e.target.value)}
                              className={`text-[10px] px-2 py-1 rounded-lg border-0 font-semibold ${meetingStatusLabels[m.status]?.color || ""}`}>
                              {Object.entries(meetingStatusLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>

                            {/* Actions */}
                            <button onClick={() => handleDeleteMeeting(m.id)} className="p-1 text-slate-300 hover:text-red-500">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Potential candidates summary */}
              {funnelGroups.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/20 dark:to-emerald-950/20 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Рекомендовано к приглашению</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(filteredMeetings
                      .filter(m => m.matchScore >= 40)
                      .map(m => m.company?.name)))
                      .filter(Boolean)
                      .slice(0, 10)
                      .map(name => (
                        <span key={name} className="px-2 py-1 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-xs">
                          {name}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add manual meeting modal */}
      {showAddMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => { setShowAddMeeting(false); setAddMeetingData({ companyId: 0, foreignPartnerId: 0, notes: "" }); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Добавить встречу вручную</h3>
              <button onClick={() => { setShowAddMeeting(false); setAddMeetingData({ companyId: 0, foreignPartnerId: 0, notes: "" }); }}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Российская компания</label>
                <select value={addMeetingData.companyId} onChange={e => setAddMeetingData(p => ({ ...p, companyId: Number(e.target.value) }))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <option value={0}>Выберите компанию</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.sphere})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Иностранный партнёр</label>
                <select value={addMeetingData.foreignPartnerId} onChange={e => setAddMeetingData(p => ({ ...p, foreignPartnerId: Number(e.target.value) }))}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <option value={0}>Выберите партнёра</option>
                  {foreignPartners.map(fp => <option key={fp.id} value={fp.id}>{fp.companyName} ({fp.country})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Заметки</label>
                <input type="text" value={addMeetingData.notes} onChange={e => setAddMeetingData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Например: предварительная договорённость"
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowAddMeeting(false); setAddMeetingData({ companyId: 0, foreignPartnerId: 0, notes: "" }); }}
                className="px-4 py-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl">Отмена</button>
              <button onClick={handleAddManualMeeting}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-500 rounded-xl hover:bg-indigo-600">Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
