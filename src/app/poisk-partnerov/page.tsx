"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, Building, Globe, Phone, Mail, FileText } from "lucide-react";

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
}

export default function PoiskPartnerovPage() {
  const [partners, setPartners] = useState<ForeignPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  useEffect(() => {
    fetch("/api/foreign-partners")
      .then((r) => r.json())
      .then((data) => setPartners(Array.isArray(data) ? data : []))
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, []);

  const countries = useMemo(() => {
    const set = new Set(partners.map((p) => p.country).filter(Boolean));
    return Array.from(set).sort();
  }, [partners]);

  const filtered = useMemo(() => {
    let result = partners;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.companyName.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.productInterests.toLowerCase().includes(q)
      );
    }
    if (countryFilter) {
      result = result.filter((p) => p.country === countryFilter);
    }
    return result;
  }, [partners, search, countryFilter]);

  return (
    <>
      <section className="bg-[#0c2248] text-white py-16 md:py-24">
        <div className="container-site">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Поиск иностранных партнёров
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl leading-relaxed mb-8">
            Иностранные импортёры, заинтересованные в приобретении продукции
            Оренбургских экспортёров
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0c2248]/40"
              />
              <input
                type="text"
                placeholder="Поиск по названию, стране или продукции..."
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
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="sm:w-48 px-4 py-3.5 rounded-[20px] bg-white text-text text-sm outline-none focus:ring-2 focus:ring-accent/30 transition-shadow appearance-none cursor-pointer border-none"
            >
              <option value="">Все страны</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-site">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#f1f6fb] rounded-[20px] p-6 animate-pulse"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#f1f6fb] rounded-[20px] p-12 text-center">
              <Building size={48} className="mx-auto text-text/20 mb-4" />
              <p className="text-text/50 text-lg">
                Иностранные партнёры не найдены
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-text/60 mb-5">
                Найдено партнёров:{" "}
                <span className="font-semibold text-text">{filtered.length}</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#f1f6fb] rounded-[20px] p-6 hover:shadow-sm transition-shadow flex flex-col"
                  >
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Building size={24} className="text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-text">{p.companyName}</h3>
                        <span className="inline-flex items-center gap-1 text-sm text-text/50 mt-0.5">
                          <Globe size={14} />
                          {p.country}
                        </span>
                      </div>
                    </div>

                    {p.contactPerson && (
                      <p className="text-sm font-medium text-text/70 mb-3">
                        {p.contactPerson}
                      </p>
                    )}

                    {(p.phone || p.email) && (
                      <div className="space-y-1.5 mb-3 text-sm text-text/60">
                        {p.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="shrink-0 text-accent" />
                            <a
                              href={`tel:${p.phone}`}
                              className="hover:text-accent transition-colors"
                            >
                              {p.phone}
                            </a>
                          </div>
                        )}
                        {p.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="shrink-0 text-accent" />
                            <a
                              href={`mailto:${p.email}`}
                              className="hover:text-accent transition-colors truncate"
                            >
                              {p.email}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {p.productInterests && (
                      <div className="mb-3">
                        <p className="text-xs text-text/40 mb-1">
                          Интерес к продукции:
                        </p>
                        <p className="text-sm text-text/70 leading-relaxed line-clamp-2">
                          {p.productInterests}
                        </p>
                      </div>
                    )}

                    {p.notes && (
                      <div className="mt-auto pt-3 border-t border-white/50">
                        <p className="text-xs text-text/40 leading-relaxed line-clamp-2">
                          {p.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
