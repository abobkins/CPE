"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Plus, X, Globe, Building2, User as UserIcon, Phone, Mail, Search,
  Calendar, Check, Trash2, ChevronRight, Target, Zap, Sparkles, Filter,
  ChevronDown, ChevronUp, Briefcase, Save
} from "lucide-react";

interface Company { id: number; name: string; inn: string; sphere: string; sector: string; products: string; tnved: string; exportCountries: string; contactCpe: string; phoneCpe: string; emailCpe: string; categoryMsp: string; statusExporter: string; }
interface ForeignPartner { id: number; companyName: string; country: string; contactPerson: string; phone: string; email: string; website: string; productInterests: string; }
interface EventItem { id: number; name: string; serviceType: string; serviceCategory: string; country: string; status: string; notes: string; createdAt: string; }
interface Meeting { id: number; eventId: number; companyId: number; foreignPartnerId: number; matchScore: number; matchType: string; status: string; stage: string; assignedEmployee: string; notes: string; company: Company | null; foreignPartner: ForeignPartner | null; }

const serviceTypeOptions = [
  { value: "exhibition", label: "Международная выставка" },
  { value: "business_mission", label: "Бизнес-миссия" },
  { value: "reverse_business_mission", label: "Реверсная бизнес-миссия" },
  { value: "interregional_mission", label: "Межрегиональная бизнес-миссия" },
  { value: "search_and_selection", label: "Поиск и подбор партнёра" },
  { value: "etp_placement", label: "Размещение на ЭТП" },
  { value: "other", label: "Другое" },
];

const stageConfig: { key: string; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "selected", label: "Отобрано", icon: <Target className="w-3 h-3" />, color: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" },
  { key: "in_progress", label: "В работе", icon: <Briefcase className="w-3 h-3" />, color: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800" },
  { key: "confirmed", label: "Подтверждено", icon: <Calendar className="w-3 h-3" />, color: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800" },
  { key: "completed", label: "Проведено", icon: <Check className="w-3 h-3" />, color: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" },
];

const cancelledLabel = { label: "Отменено", color: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800" };

const stageOrder = ["selected", "in_progress", "confirmed", "completed"];

export default function EventFunnel() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedMeetingId, setExpandedMeetingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", serviceType: "exhibition", serviceCategory: "complex", country: "", notes: "" });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [foreignPartners, setForeignPartners] = useState<ForeignPartner[]>([]);
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [addMeetingData, setAddMeetingData] = useState({ companyId: 0, foreignPartnerId: 0, notes: "" });

  const [searchQ, setSearchQ] = useState("");
  const [filterStage, setFilterStage] = useState("");

  // Inline edit per meeting
  const [editData, setEditData] = useState<Record<number, { assignedEmployee: string; notes: string }>>({});

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
    if (selectedEventId) {
      fetchEventDetail(selectedEventId);
      setExpandedMeetingId(null);
    } else setMeetings([]);
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

  const handleUpdateMeeting = async (id: number, updates: Record<string, any>) => {
    setSaving(true);
    try {
      const res = await fetch("/api/event-meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      if (res.ok) {
        setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleStageChange = (meeting: Meeting, stage: string) => {
    handleUpdateMeeting(meeting.id, { stage });
  };

  const handleSaveInline = (meeting: Meeting) => {
    const ed = editData[meeting.id];
    if (!ed) return;
    handleUpdateMeeting(meeting.id, {
      assignedEmployee: ed.assignedEmployee,
      notes: ed.notes,
    });
    setEditData(prev => { const n = { ...prev }; delete n[meeting.id]; return n; });
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

  const filteredMeetings = useMemo(() => {
    let list = meetings;
    if (filterStage) list = list.filter(m => m.stage === filterStage);
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(m =>
        m.company?.name.toLowerCase().includes(q) ||
        m.foreignPartner?.companyName.toLowerCase().includes(q) ||
        m.notes.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.matchScore - a.matchScore);
  }, [meetings, filterStage, searchQ]);

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

  const stageRow = (meeting: Meeting) => {
    const isCancelled = meeting.stage === "cancelled";
    const currentIdx = stageOrder.indexOf(meeting.stage);

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {stageConfig.map((s, idx) => {
          const done = currentIdx > idx;
          const active = meeting.stage === s.key;
          const clickable = !done && !active && meeting.stage !== "cancelled";

          return (
            <React.Fragment key={s.key}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
              <button
                onClick={() => clickable && handleStageChange(meeting, s.key)}
                disabled={!clickable}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
                  done ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50 cursor-default" :
                  active ? `${s.color} ring-1 ring-offset-1 ring-indigo-300 cursor-default` :
                  clickable ? "bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:hover:border-indigo-600 cursor-pointer" :
                  "bg-white text-slate-300 border-slate-200 dark:bg-slate-900 dark:border-slate-700 cursor-not-allowed opacity-50"
                }`}
              >
                {done ? <Check className="w-3 h-3" /> : active ? s.icon : s.icon}
                {s.label}
              </button>
            </React.Fragment>
          );
        })}

        {isCancelled ? (
          <>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${cancelledLabel.color} cursor-default`}>
              <X className="w-3 h-3" /> Отменено
            </span>
          </>
        ) : (
          currentIdx < 3 && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <button
                onClick={() => handleStageChange(meeting, "cancelled")}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950 transition-colors bg-white dark:bg-slate-900"
              >
                <X className="w-3 h-3" /> Отменить
              </button>
            </>
          )
        )}
      </div>
    );
  };

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
                <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
                  className="text-xs p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <option value="">Все этапы</option>
                  <option value="selected">Отобрано</option>
                  <option value="in_progress">В работе</option>
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
                        {group.meetings.map(m => {
                          const expanded = expandedMeetingId === m.id;
                          const ed = editData[m.id];
                          return (
                            <div key={m.id}>
                              {/* Collapsed row */}
                              <div
                                onClick={() => setExpandedMeetingId(expanded ? null : m.id)}
                                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                              >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                  m.matchScore >= 60 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" :
                                  m.matchScore >= 30 ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                                  "bg-slate-100 text-slate-500 dark:bg-slate-800"
                                }`}>
                                  {m.matchScore || "?"}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-slate-800 dark:text-white">{m.company?.name || "—"}</span>
                                    <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${
                                      m.matchType === "manual" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                                    }`}>{m.matchType === "manual" ? "ручной" : "авто"}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{m.notes}</div>
                                </div>

                                {/* Stage badge */}
                                <div className={`text-[9px] px-2 py-0.5 rounded-lg font-semibold ${
                                  m.stage === "selected" ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" :
                                  m.stage === "in_progress" ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300" :
                                  m.stage === "confirmed" ? "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300" :
                                  m.stage === "completed" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" :
                                  m.stage === "cancelled" ? "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300" :
                                  "bg-slate-100 text-slate-500"
                                }`}>
                                  {stageConfig.find(s => s.key === m.stage)?.label || "Отобрано"}
                                </div>

                                {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                              </div>

                              {/* Expanded detail */}
                              {expanded && (
                                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 space-y-3">
                                  {/* Stage progression */}
                                  <div className="bg-white dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Этапы согласования</span>
                                      {m.stage !== "cancelled" && (
                                        <span className={`text-[9px] font-semibold ${
                                          m.stage === "completed" ? "text-emerald-500" : "text-amber-500"
                                        }`}>{stageConfig.find(s => s.key === m.stage)?.label || ""}</span>
                                      )}
                                      {m.stage === "cancelled" && <span className="text-[9px] font-semibold text-red-500">Отменено</span>}
                                    </div>
                                    {stageRow(m)}
                                  </div>

                                  {/* Two-column contact info */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Russian company */}
                                    <div className="bg-white dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-white">{m.company?.name || "—"}</span>
                                      </div>
                                      <div className="space-y-1 text-[10px] text-slate-500">
                                        <div>ИНН: <span className="text-slate-700 dark:text-slate-300 font-mono">{m.company?.inn || "—"}</span></div>
                                        <div>Сфера: <span className="text-slate-700 dark:text-slate-300">{m.company?.sphere || "—"}</span></div>
                                        <div>Продукция: <span className="text-slate-700 dark:text-slate-300">{m.company?.products || "—"}</span></div>
                                        {m.company?.tnved && <div>ТН ВЭД: <span className="text-slate-700 dark:text-slate-300 font-mono">{m.company.tnved}</span></div>}
                                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-1.5">
                                          <div className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {m.company?.contactCpe || "—"}</div>
                                          <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.company?.phoneCpe || "—"}</div>
                                          <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {m.company?.emailCpe || "—"}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Foreign partner */}
                                    <div className="bg-white dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <Globe className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-white">{m.foreignPartner?.companyName || "—"}</span>
                                        <span className="text-[9px] text-slate-400">({m.foreignPartner?.country || ""})</span>
                                      </div>
                                      <div className="space-y-1 text-[10px] text-slate-500">
                                        <div>Интересы: <span className="text-slate-700 dark:text-slate-300">{m.foreignPartner?.productInterests || "—"}</span></div>
                                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-1.5">
                                          <div className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> {m.foreignPartner?.contactPerson || "—"}</div>
                                          <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.foreignPartner?.phone || "—"}</div>
                                          <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {m.foreignPartner?.email || "—"}</div>
                                          {m.foreignPartner?.website && <div className="flex items-center gap-1"><Globe className="w-3 h-3" /> {m.foreignPartner.website}</div>}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Assigned employee + notes */}
                                  <div className="bg-white dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Закреплённый сотрудник</label>
                                        <input
                                          type="text"
                                          value={ed?.assignedEmployee ?? m.assignedEmployee}
                                          onChange={e => setEditData(prev => ({ ...prev, [m.id]: { ...prev[m.id] || { notes: m.notes }, assignedEmployee: e.target.value } }))}
                                          placeholder="ФИО сотрудника"
                                          className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Заметки</label>
                                        <input
                                          type="text"
                                          value={ed?.notes ?? m.notes}
                                          onChange={e => setEditData(prev => ({ ...prev, [m.id]: { ...prev[m.id] || { assignedEmployee: m.assignedEmployee }, notes: e.target.value } }))}
                                          placeholder="Комментарий к встрече"
                                          className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                      <button
                                        onClick={() => handleSaveInline(m)}
                                        disabled={saving || !editData[m.id]}
                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors disabled:opacity-50"
                                      >
                                        <Save className="w-3.5 h-3.5" /> {saving ? "Сохранение..." : "Сохранить"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
                      .filter(m => m.matchScore >= 40 && m.stage !== "cancelled")
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
