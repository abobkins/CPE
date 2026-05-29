"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Building2, Phone, Mail, Download, X, Globe, FileText } from "lucide-react";
import * as XLSX from "xlsx";

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
  supportMeasures: any[];
  interactions: any[];
  tasks: any[];
  notes: string;
  updatedAt: string;
}

const SPHERE_OPTIONS = ["АПК", "Промышленность", "Прочие"];
const STATUS_OPTIONS = ["экспортёр", "не экспортёр", "2025 г."];
const CATEGORY_MSP_OPTIONS = ["Микро", "Малое", "Среднее"];

export default function ExportersCatalogPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sphereFilter, setSphereFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cpeFilter, setCpeFilter] = useState("");

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setCompanies([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = companies;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.inn.toLowerCase().includes(q)
      );
    }
    if (sphereFilter) {
      result = result.filter((c) => c.sphere === sphereFilter);
    }
    if (statusFilter) {
      result = result.filter((c) => c.statusExporter === statusFilter);
    }
    if (categoryFilter) {
      result = result.filter((c) => c.categoryMsp === categoryFilter);
    }
    if (cpeFilter) {
      const isYes = cpeFilter === "yes";
      result = result.filter((c) => c.cpeCooperation === isYes);
    }
    return result;
  }, [companies, search, sphereFilter, statusFilter, categoryFilter, cpeFilter]);

  const hasFilters = sphereFilter || statusFilter || categoryFilter || cpeFilter;

  const resetFilters = () => {
    setSphereFilter("");
    setStatusFilter("");
    setCategoryFilter("");
    setCpeFilter("");
    setSearch("");
  };

  const formatVolume = (v: number) => {
    if (!v) return "—";
    return new Intl.NumberFormat("ru-RU").format(v) + " ₽";
  };

  const exportExcel = useCallback(() => {
    const data = filtered.map((c) => ({
      "Название": c.name,
      "ИНН": c.inn,
      "Сфера": c.sphere,
      "Отрасль": c.sector,
      "Продукция": c.products,
      "Статус экспортёра": c.statusExporter,
      "Категория МСП": c.categoryMsp,
      "Работа с ЦПЭ": c.cpeCooperation ? "Да" : "Нет",
      "Объём экспорта 2023": c.exportVolume2023,
      "Объём экспорта 2024": c.exportVolume2024,
      "Страны экспорта": c.exportCountries,
      "ТН ВЭД": c.tnved,
      "Телефон (Минпром)": c.phoneMinprom || "",
      "Email (Минпром)": c.emailMinprom || "",
      "Телефон (ЦПЭ)": c.phoneCpe || "",
      "Email (ЦПЭ)": c.emailCpe || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Экспортёры");
    XLSX.writeFile(wb, "reestr-eksporterov.xlsx");
  }, [filtered]);

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      "экспортёр": "bg-green-50 text-green-700",
      "не экспортёр": "bg-gray-100 text-gray-600",
      "2025 г.": "bg-blue-50 text-blue-700",
    };
    return (
      <span className={`text-[11px] px-2.5 py-0.5 rounded-[20px] font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  const renderCard = (c: Company) => (
    <div
      key={c.id}
      className="bg-card rounded-[20px] shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-text">{c.name}</h3>
          <p className="text-xs text-text/50 mt-0.5">ИНН {c.inn}</p>
        </div>
        <StatusBadge status={c.statusExporter} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs px-2.5 py-1 rounded-[20px] bg-[#e3edf7] text-text/70">{c.sphere}</span>
        {c.categoryMsp && (
          <span className="text-xs px-2.5 py-1 rounded-[20px] bg-[#e3edf7] text-text/70">{c.categoryMsp}</span>
        )}
        {c.cpeCooperation && (
          <span className="text-xs px-2.5 py-1 rounded-[20px] bg-accent/10 text-accent">Работа с ЦПЭ</span>
        )}
      </div>

      {c.products && (
        <p className="text-sm text-text/60 mb-3 line-clamp-2">{c.products}</p>
      )}

      {c.tnved && (
        <div className="flex items-start gap-2 text-xs text-text/50 mb-2">
          <FileText size={12} className="mt-0.5 shrink-0" />
          <span>{c.tnved}</span>
        </div>
      )}

      {(c.exportVolume2023 > 0 || c.exportVolume2024 > 0) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text/60 mb-2">
          {c.exportVolume2023 > 0 && <span>2023: {formatVolume(c.exportVolume2023)}</span>}
          {c.exportVolume2024 > 0 && <span>2024: {formatVolume(c.exportVolume2024)}</span>}
        </div>
      )}

      {c.exportCountries && (
        <div className="flex items-start gap-2 text-xs text-text/60 mb-3">
          <Globe size={12} className="mt-0.5 shrink-0" />
          <span>{c.exportCountries}</span>
        </div>
      )}

      {(c.phoneMinprom || c.emailMinprom || c.phoneCpe || c.emailCpe) && (
        <div className="space-y-1 mt-auto pt-3 border-t border-gray-50 text-xs text-text/50">
          {(c.phoneMinprom || c.phoneCpe) && (
            <div className="flex items-center gap-1.5">
              <Phone size={11} className="shrink-0" />
              <span>{c.phoneMinprom || c.phoneCpe}</span>
            </div>
          )}
          {(c.emailMinprom || c.emailCpe) && (
            <div className="flex items-center gap-1.5">
              <Mail size={11} className="shrink-0" />
              <span className="truncate">{c.emailMinprom || c.emailCpe}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderSkeleton = () => {
    const items = Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="bg-card rounded-[20px] shadow-sm p-6 animate-pulse">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
          <div className="h-5 bg-gray-100 rounded-[20px] w-20" />
        </div>
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-100 rounded-[20px] w-16" />
          <div className="h-6 bg-gray-100 rounded-[20px] w-20" />
        </div>
        <div className="h-4 bg-gray-100 rounded w-full mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
        <div className="pt-3 border-t border-gray-50 space-y-1">
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    ));
    return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{items}</div>;
  };

  return (
    <>
      <section className="bg-[#0c2248] text-white py-14 md:py-20">
        <div className="container-site">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Реестр экспортёров Оренбургской области
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-3xl leading-relaxed mb-8">
            В реестре представлены компании Оренбургской области, осуществляющие экспортную деятельность.
            Центр поддержки экспорта оказывает содействие в продвижении продукции на внешние рынки,
            поиске иностранных партнёров и участии в международных мероприятиях.
          </p>
          <div className="relative max-w-xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0c2248]/40" />
            <input
              type="text"
              placeholder="Поиск по названию или ИНН..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-[20px] bg-white text-text placeholder:text-text/30 text-sm outline-none focus:ring-2 focus:ring-accent/30 transition-shadow"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text/30 hover:text-text/60"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-site">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-[280px] shrink-0">
              <div className="bg-card rounded-[20px] shadow-sm p-6 space-y-6 lg:sticky lg:top-28">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-text">Фильтры</h2>
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-accent hover:text-hover transition-colors"
                    >
                      Сбросить все
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text mb-2.5">Сфера деятельности</h3>
                  <div className="space-y-1">
                    {SPHERE_OPTIONS.map((s) => (
                      <FilterRadio
                        key={s}
                        label={s}
                        checked={sphereFilter === s}
                        onChange={() => setSphereFilter(sphereFilter === s ? "" : s)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text mb-2.5">Статус экспортёра</h3>
                  <div className="space-y-1">
                    {STATUS_OPTIONS.map((s) => (
                      <FilterRadio
                        key={s}
                        label={s}
                        checked={statusFilter === s}
                        onChange={() => setStatusFilter(statusFilter === s ? "" : s)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text mb-2.5">Категория МСП</h3>
                  <div className="space-y-1">
                    {CATEGORY_MSP_OPTIONS.map((c) => (
                      <FilterRadio
                        key={c}
                        label={c}
                        checked={categoryFilter === c}
                        onChange={() => setCategoryFilter(categoryFilter === c ? "" : c)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-text mb-2.5">Работа с ЦПЭ</h3>
                  <div className="space-y-1">
                    <FilterRadio
                      label="Да"
                      checked={cpeFilter === "yes"}
                      onChange={() => setCpeFilter(cpeFilter === "yes" ? "" : "yes")}
                    />
                    <FilterRadio
                      label="Нет"
                      checked={cpeFilter === "no"}
                      onChange={() => setCpeFilter(cpeFilter === "no" ? "" : "no")}
                    />
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
                <p className="text-sm text-text/70">
                  Найдено компаний:{" "}
                  <span className="font-semibold text-text">{filtered.length}</span>
                </p>
                <button
                  onClick={exportExcel}
                  disabled={filtered.length === 0}
                  className="flex items-center gap-2 text-sm text-accent hover:text-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download size={16} />
                  Экспортировать в Excel
                </button>
              </div>

              {loading ? (
                renderSkeleton()
              ) : filtered.length === 0 ? (
                <div className="bg-card rounded-[20px] shadow-sm p-12 text-center">
                  <Building2 size={48} className="mx-auto text-text/20 mb-4" />
                  <p className="text-text/50 text-lg">
                    {companies.length === 0
                      ? "Компании не найдены"
                      : "По вашему запросу ничего не найдено. Попробуйте изменить параметры фильтрации."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map(renderCard)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FilterRadio({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <span
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          checked
            ? "border-accent"
            : "border-gray-300 group-hover:border-accent"
        }`}
      >
        {checked && <span className="w-2 h-2 rounded-full bg-accent" />}
      </span>
      <span className="text-sm leading-snug text-text/80 group-hover:text-text transition-colors">
        {label}
      </span>
    </label>
  );
}
