import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Search,
  Calendar,
  Package,
  LayoutDashboard,
  ArrowRight,
  Globe,
  Handshake,
} from "lucide-react";

const quickLinks = [
  { href: "/katalog-eksporterov", label: "Реестр экспортёров", icon: Building2, desc: "Экспортёры и экспортно-ориентированные компании" },
  { href: "/mer-podderzhki", label: "Меры поддержки экспорта", icon: ShieldCheck, desc: "Господдержка для экспортёров" },
  { href: "/poisk-partnerov", label: "Поиск партнёров", icon: Search, desc: "Иностранные импортёры и запросы" },
  { href: "/kalendar-sobytiy", label: "Календарь событий", icon: Calendar, desc: "B2B-встречи, форумы, миссии" },
  { href: "/zayavki", label: "Заявки на экспорт", icon: Package, desc: "Оставить заявку на экспорт продукции" },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-[#0c2248] text-white py-20 md:py-28">
        <div className="container-site">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Центр Деловых Контактов
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl leading-relaxed mb-8">
            Единая цифровая платформа для поддержки экспортной деятельности
            Оренбургской области. Реестр экспортёров, поиск иностранных
            партнёров, меры поддержки и B2B-коммуникация.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/katalog-eksporterov"
              className="inline-flex items-center gap-2 bg-accent hover:bg-hover text-white px-8 py-3 rounded-[20px] text-lg font-medium transition-colors"
            >
              Реестр экспортёров <ArrowRight size={20} />
            </Link>
            <Link
              href="/crm"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-[20px] text-lg font-medium transition-colors"
            >
              <LayoutDashboard size={20} />
              Панель ЦПЭ
            </Link>
          </div>
        </div>
      </section>

      <section className="-mt-10">
        <div className="container-site">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card rounded-[20px] p-6 shadow-sm">
              <Globe size={32} className="text-accent mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-accent mb-2">12+</p>
              <p className="text-sm text-text leading-snug">Экспортёров и экспортно-ориентированных компаний</p>
            </div>
            <div className="bg-card rounded-[20px] p-6 shadow-sm">
              <Handshake size={32} className="text-accent mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-accent mb-2">10+</p>
              <p className="text-sm text-text leading-snug">Иностранных партнёров из дружественных стран</p>
            </div>
            <div className="bg-card rounded-[20px] p-6 shadow-sm">
              <ShieldCheck size={32} className="text-accent mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-accent mb-2">12</p>
              <p className="text-sm text-text leading-snug">Мер поддержки экспортной деятельности</p>
            </div>
            <div className="bg-card rounded-[20px] p-6 shadow-sm">
              <Calendar size={32} className="text-accent mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-accent mb-2">5+</p>
              <p className="text-sm text-text leading-snug">B2B-мероприятий и бизнес-миссий</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-site">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Возможности платформы</h2>
            <Link
              href="/crm"
              className="hidden md:inline-flex items-center gap-2 text-accent hover:text-hover text-sm font-medium"
            >
              <LayoutDashboard size={18} />
              Панель управления ЦПЭ
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-card rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <Icon size={24} className="text-accent" />
                  </div>
                  <h3 className="font-semibold text-text mb-1">{link.label}</h3>
                  <p className="text-sm text-text/60">{link.desc}</p>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/crm"
              className="inline-flex items-center gap-2 bg-accent hover:bg-hover text-white px-6 py-3 rounded-[20px] text-sm font-medium transition-colors"
            >
              <LayoutDashboard size={18} />
              Панель управления ЦПЭ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
