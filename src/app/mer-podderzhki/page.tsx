"use client";

import { Search, Handshake, Wallet, MessageCircle, ShoppingCart, Globe, BookOpen } from "lucide-react";

const categories = [
  {
    icon: Search,
    title: "Содействие в поиске иностранного партнёра",
    desc: "Помощь в подборе потенциальных импортёров и деловых партнёров за рубежом по профилю вашей продукции.",
  },
  {
    icon: Handshake,
    title: "Организация B2B-встреч и бизнес-миссий",
    desc: "Организация двусторонних переговоров с иностранными покупателями и участие в бизнес-миссиях в дружественные страны.",
  },
  {
    icon: Wallet,
    title: "Софинансирование затрат на экспорт",
    desc: "Компенсация части затрат на транспортировку, сертификацию, патентование и маркетинговые мероприятия.",
  },
  {
    icon: MessageCircle,
    title: "Консультационные услуги по ВЭД",
    desc: "Консультации по таможенному оформлению, валютному контролю, налоговым аспектам и логистике.",
  },
  {
    icon: ShoppingCart,
    title: "Содействие в размещении на электронных торговых площадках",
    desc: "Помощь в регистрации и продвижении продукции на международных B2B-площадках (Alibaba, Mercado Libre и др.).",
  },
  {
    icon: Globe,
    title: "Продвижение продукции за рубежом",
    desc: "Размещение в международных каталогах, участие в зарубежных выставках и дегустационно-деловых мероприятиях.",
  },
  {
    icon: BookOpen,
    title: "Образовательные программы по экспорту",
    desc: "Обучение в Школе экспорта РЭЦ: курсы по основам ВЭД, маркетингу, финансам и праву для экспортёров.",
  },
];

export default function MerPodderzhkiPage() {
  return (
    <>
      <section className="bg-[#0c2248] text-white py-16 md:py-24">
        <div className="container-site">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Меры поддержки экспортной деятельности
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl leading-relaxed">
            Центр поддержки экспорта Оренбургской области предоставляет широкий
            спектр мер поддержки для экспортёров и экспортно-ориентированных компаний
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-site">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="bg-[#f1f6fb] rounded-[20px] p-7 flex items-start gap-5 hover:shadow-sm transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Icon size={28} className="text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text text-lg mb-2">{cat.title}</h3>
                    <p className="text-text/60 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="container-site">
          <div className="bg-[#f1f6fb] rounded-[20px] p-8 md:p-10 text-center">
            <h2 className="text-xl font-bold text-text mb-3">
              По вопросам получения мер поддержки обращайтесь в ЦПЭ Оренбургской области
            </h2>
            <p className="text-text/60 mb-4">
            </p>
            <a
              href="tel:+73532910179"
              className="inline-flex items-center gap-2 bg-accent text-white rounded-[20px] px-8 py-3 font-medium hover:bg-hover transition-colors"
            >
              +7 (3532) 91-01-79
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
