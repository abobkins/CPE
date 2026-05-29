"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, User, LayoutDashboard } from "lucide-react";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/katalog-eksporterov", label: "Реестр экспортёров" },
  { href: "/mer-podderzhki", label: "Меры поддержки" },
  { href: "/poisk-partnerov", label: "Поиск партнёров" },
  { href: "/kalendar-sobytiy", label: "Календарь событий" },
  { href: "/zayavki", label: "Заявки на экспорт" },
  { href: "/kontakty", label: "Контакты" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-[#0c2248] sticky top-0 z-50">
      <div className="container-site flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight">
            Центр Деловых
            <br />
            Контактов
          </span>
        </Link>

        <nav className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-white/80 hover:text-white transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/crm"
            className="hidden xl:inline-flex items-center gap-1 text-white/70 hover:text-white text-sm transition-colors mr-2"
          >
            <LayoutDashboard size={16} />
            ЦПЭ
          </Link>
          <Link
            href="/auth"
            className="hidden md:inline-flex items-center gap-2 bg-accent hover:bg-hover text-white px-5 py-2 rounded-[20px] text-sm font-medium transition-colors"
          >
            <User size={18} />
            Войти
          </Link>

          <button
            className="xl:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Меню"
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden bg-[#0c2248] border-t border-white/10">
          <div className="container-site py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-white/80 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/crm"
              className="flex items-center gap-2 px-3 py-2 text-sm text-accent hover:text-hover font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              <LayoutDashboard size={18} />
              Панель ЦПЭ
            </Link>
            <Link
              href="/auth"
              className="flex items-center gap-2 px-3 py-2 text-sm text-accent hover:text-hover font-medium transition-colors"
              onClick={() => setOpen(false)}
            >
              <User size={18} />
              Войти
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
