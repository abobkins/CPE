"use client";

import { Phone, Mail, MapPin, Users, Clock } from "lucide-react";

const teamMembers = [
  {
    name: "Иванова Елена Петровна",
    role: "Руководитель ЦПЭ",
    phone: "+7 (3532) 91-01-79",
    email: "cpe@mail.orb.ru",
  },
  {
    name: "Сидоров Алексей Владимирович",
    role: "Ведущий специалист по ВЭД",
    phone: "+7 (3532) 91-01-79",
    email: "cpe@mail.orb.ru",
  },
  {
    name: "Кузнецова Мария Сергеевна",
    role: "Специалист по работе с экспортёрами",
    phone: "+7 (3532) 91-01-79",
    email: "cpe@mail.orb.ru",
  },
];

export default function ContactsPage() {
  return (
    <>
      <section className="bg-[#0c2248] text-white py-14 md:py-20">
        <div className="container-site">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Контакты Центра поддержки экспорта
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-3xl leading-relaxed">
            Свяжитесь с нами по вопросам экспортной деятельности и получения мер поддержки
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-card rounded-[20px] shadow-sm p-8">
              <h2 className="text-xl font-bold text-text mb-6">
                Центр поддержки экспорта Оренбургской области
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text/50">Телефон</p>
                    <a href="tel:+73532910179" className="font-medium text-text hover:text-accent transition-colors">
                      +7 (3532) 91-01-79
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text/50">Email</p>
                    <a href="mailto:cpe@mail.orb.ru" className="font-medium text-text hover:text-accent transition-colors">
                      cpe@mail.orb.ru
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text/50">Адрес</p>
                    <p className="font-medium text-text">г. Оренбург, ул. 9 Января, д. 64</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text/50">Режим работы</p>
                    <p className="font-medium text-text">Пн–Пт: 09:00 – 18:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-[20px] shadow-sm p-8">
              <h2 className="text-xl font-bold text-text mb-4">Наши услуги</h2>
              <ul className="space-y-3 text-text/70 text-sm leading-relaxed">
                <li>— Содействие в поиске иностранных партнёров и B2B-переговоры</li>
                <li>— Организация участия в международных выставках и бизнес-миссиях</li>
                <li>— Консультирование по вопросам внешнеэкономической деятельности</li>
                <li>— Софинансирование затрат на экспорт (транспорт, сертификация, маркетинг)</li>
                <li>— Помощь в размещении на международных электронных площадках</li>
                <li>— Образовательные программы Школы экспорта РЭЦ</li>
              </ul>
            </div>
          </div>

          <div className="bg-card rounded-[20px] shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users size={24} className="text-accent" />
              <h2 className="text-xl font-bold text-text">Наши специалисты</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teamMembers.map((member) => (
                <div key={member.name} className="bg-[#f1f6fb] rounded-[20px] p-5">
                  <p className="font-semibold text-text mb-1">{member.name}</p>
                  <p className="text-sm text-text/50 mb-3">{member.role}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-accent shrink-0" />
                      <a href={`tel:${member.phone.replace(/\s/g, "")}`} className="text-text/70 hover:text-accent transition-colors">
                        {member.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-accent shrink-0" />
                      <a href={`mailto:${member.email}`} className="text-text/70 hover:text-accent transition-colors">
                        {member.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
