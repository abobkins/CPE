"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Loader2, ExternalLink } from "lucide-react";

interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  dateFrom: string;
  dateTo: string | null;
  location: string | null;
  organizer: string | null;
  imageUrl: string | null;
  registrationUrl: string | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateRange(from: string, to: string | null): string {
  if (!to) return formatDate(from);
  const dFrom = new Date(from);
  const dTo = new Date(to);
  if (dFrom.toDateString() === dTo.toDateString()) return formatDate(from);
  const sameMonth = dFrom.getMonth() === dTo.getMonth() && dFrom.getFullYear() === dTo.getFullYear();
  if (sameMonth) {
    return `${dFrom.getDate()}–${dTo.getDate()} ${dTo.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}`;
  }
  return `${formatDate(from)} — ${formatDate(to)}`;
}

export default function EventsCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events-calendar")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events
    .filter((e) => new Date(e.dateFrom) >= new Date(Date.now() - 86400000))
    .sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime());

  return (
    <>
      <section className="bg-[#0c2248] text-white py-14 md:py-20">
        <div className="container-site">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Календарь экспортных событий
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-3xl leading-relaxed">
            B2B-встречи, бизнес-миссии, форумы и образовательные мероприятия для экспортёров
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-site">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-[20px] shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                    <div className="h-12 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="bg-card rounded-[20px] shadow-sm p-12 text-center">
              <Calendar size={48} className="mx-auto text-text/20 mb-4" />
              <p className="text-text/50 text-lg">В ближайшее время события не запланированы</p>
              <p className="text-text/40 text-sm mt-1">Следите за обновлениями</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {upcoming.map((event) => (
                <div
                  key={event.id}
                  className="bg-card rounded-[20px] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
                >
                  {event.imageUrl ? (
                    <div
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${event.imageUrl})` }}
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-[#0064dc] to-[#0c2248] flex items-center justify-center">
                      <Calendar size={48} className="text-white/30" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-text text-lg mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 mb-3 text-sm text-text/60">
                      <div className="flex items-center gap-2">
                        <Calendar size={15} className="shrink-0 text-accent" />
                        <span>{formatDateRange(event.dateFrom, event.dateTo)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={15} className="shrink-0 text-accent" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-text/60 leading-relaxed line-clamp-3 mb-4 flex-1">
                        {event.description}
                      </p>
                    )}

                    {event.registrationUrl && (
                      <a
                        href={event.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-hover transition-colors mt-auto"
                      >
                        <ExternalLink size={16} />
                        Зарегистрироваться
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
