"use client";

import Link from "next/link";
import { useState } from "react";
import { Send, MessageCircle, Phone, Mail } from "lucide-react";

const navLinks = [
  { href: "/", label: "Главная" },
  { href: "/katalog-eksporterov", label: "Реестр экспортёров" },
  { href: "/mer-podderzhki", label: "Меры поддержки" },
  { href: "/poisk-partnerov", label: "Поиск партнёров" },
  { href: "/kalendar-sobytiy", label: "Календарь событий" },
  { href: "/zayavki", label: "Заявки на экспорт" },
  { href: "/kontakty", label: "Контакты" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <footer className="bg-[#0c2248] text-white mt-16">
      <div className="container-site py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div>
            <h3 className="text-lg font-semibold mb-4">Подписаться на рассылку</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-white/30 pb-2 text-white placeholder-white/50 text-sm focus:outline-none focus:border-accent transition-colors"
                required
              />
              <label className="flex items-start gap-2 text-xs text-white/70">
                <input type="checkbox" className="mt-0.5 accent-accent" required />
                <span>
                  Я ознакомлен с{" "}
                  <a href="/policy.pdf" className="text-accent hover:underline" target="_blank">
                    политикой конфиденциальности
                  </a>{" "}
                  и согласен на обработку персональных данных
                </span>
              </label>
              <button
                type="submit"
                className="flex items-center gap-2 bg-accent hover:bg-hover text-white px-6 py-2.5 rounded-[20px] text-sm font-medium transition-colors"
              >
                <Send size={16} />
                Подписаться
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Разделы</h3>
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/70 hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Контакты</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/50 mb-2">Центр поддержки экспорта Оренбургской области</p>
                <div className="space-y-2">
                  <a href="tel:+73532910179" className="flex items-center gap-2 text-sm text-white/70 hover:text-accent">
                    <Phone size={16} className="text-accent" />
                    +7 (3532) 91-01-79
                  </a>
                  <a href="mailto:cpe@orb.ru" className="flex items-center gap-2 text-sm text-white/70 hover:text-accent">
                    <Mail size={16} className="text-accent" />
                    cpe@orb.ru
                  </a>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <a
                  href="https://t.me/export_orenburg"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-accent transition-colors"
                  target="_blank"
                >
                  <MessageCircle size={18} className="text-accent" />
                  Экспорт Оренбуржья — Telegram
                </a>
                <a
                  href="https://t.me/cpe_orenburg"
                  className="flex items-center gap-2 text-sm text-white/70 hover:text-accent transition-colors"
                  target="_blank"
                >
                  <MessageCircle size={18} className="text-accent" />
                  ЦПЭ Оренбург — Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-link py-6">
        <div className="container-site flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} Центр Деловых Контактов</p>
          <div className="flex items-center gap-4">
            <a href="/policy.pdf" className="hover:text-accent transition-colors" target="_blank">
              Политика конфиденциальности
            </a>
            <Link href="/crm" className="hover:text-accent transition-colors">
              Панель управления ЦПЭ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
