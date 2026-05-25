import { db, ensureDatabaseReady } from "./index";
import { companies, customFieldDefinitions } from "./schema";
import { count, eq } from "drizzle-orm";

export const initialCustomFields = [
  { key: "website", label: "Официальный сайт", type: "text" },
  { key: "founded_year", label: "Год основания", type: "number" },
  { key: "iso_certified", label: "Сертификация ISO 9001", type: "boolean" },
  { key: "exporter_rating", label: "Рейтинг экспортера", type: "text" },
];

export const initialCompanies = [
  {
    inn: "7453012345",
    name: "ООО 'Уральский Машиностроительный Завод'",
    statusExporter: "экспортер",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Среднее",
    sphere: "Промышленность",
    sector: "Тяжелое машиностроение",
    mainActivity: "Производство металлургического оборудования",
    products: "Прокатные станы, доменные печи, литейные ковши, запасные части",
    emailMinprom: "minprom-ural@gov.ru",
    phoneMinprom: "+7 (351) 263-45-12",
    contactMinprom: "Степанов Илья Дмитриевич",
    emailCpe: "export74@cpe.ru",
    phoneCpe: "+7 (351) 700-12-34",
    contactCpe: "Ковалева Анна Сергеевна",
    exportVolume2023: 120.5,
    exportVolume2024: 154.2,
    exportVolume2025: 180.0,
    exportCountries: "Китай, Индия, Казахстан, Узбекистан",
    supportMeasures: [
      { id: "sm-1", name: "Субсидия на сертификацию продукции", date: "2024-05-12", status: "Одобрено", amount: 1500000 },
      { id: "sm-2", name: "Участие в международной выставке в Шанхае", date: "2025-10-15", status: "Выполнено", amount: 800000 }
    ],
    interactions: [
      { id: "int-1", date: "2026-01-10", author: "Степанов И.Д.", text: "Проведен созвон, компания подала заявку на субсидирование логистики в СНГ." },
      { id: "int-2", date: "2026-02-12", author: "Ковалева А.С.", text: "Завершена подготовка документов на сертификацию для экспорта в Индию." }
    ],
    tasks: [
      { id: "task-1", text: "Проверить отчетность по валютной выручке", date: "2026-03-01", status: "completed", assignedTo: "Иван Смирнов" },
      { id: "task-2", text: "Подготовить заявку на транспортировку в Китай", date: "2026-04-15", status: "pending", assignedTo: "Иван Смирнов" }
    ],
    customFields: {
      website: "https://uralmach.ru",
      founded_year: "1998",
      iso_certified: true,
      exporter_rating: "A+"
    },
    changeLogs: [
      { timestamp: "2026-01-05T09:00:00Z", user: "Система", action: "Создание", details: "Импортировано из первичного реестра" }
    ],
    notes: "Крупнейший завод региона, высокая готовность к расширению экспорта в Азию.",
    needsUpdate: false,
  },
  {
    inn: "5406112233",
    name: "АО 'Сибирский Агрокомплекс'",
    statusExporter: "экспортер",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Среднее",
    sphere: "АПК",
    sector: "Пищевая промышленность",
    mainActivity: "Производство подсолнечного масла и шрота",
    products: "Масло подсолнечное рафинированное дезодорированное, жмых подсолнечный",
    emailMinprom: "sibagro-min@gov.ru",
    phoneMinprom: "+7 (383) 223-11-22",
    contactMinprom: "Васильев Олег Петрович",
    emailCpe: "cpe-nsk@export54.ru",
    phoneCpe: "+7 (383) 319-44-55",
    contactCpe: "Иванова Мария Владимировна",
    exportVolume2023: 310.0,
    exportVolume2024: 450.5,
    exportVolume2025: 520.0,
    exportCountries: "Китай, Монголия, Вьетнам",
    supportMeasures: [
      { id: "sm-3", name: "Льготное кредитование экспортеров", date: "2023-04-20", status: "Одобрено", amount: 25000000 }
    ],
    interactions: [
      { id: "int-3", date: "2026-02-14", author: "Иванова М.В.", text: "Проведены переговоры по поставке флекситанков с маслом по железной дороге через Забайкальск." }
    ],
    tasks: [
      { id: "task-3", text: "Согласовать квоты на экспорт масла", date: "2026-03-25", status: "pending", assignedTo: "Ольга Петрова" }
    ],
    customFields: {
      website: "https://sibagrocomplex.ru",
      founded_year: "2005",
      iso_certified: true,
      exporter_rating: "AAA"
    },
    changeLogs: [
      { timestamp: "2026-01-05T09:05:00Z", user: "Система", action: "Создание", details: "Импортировано из первичного реестра" }
    ],
    notes: "Один из ключевых экспортеров масла в Китай.",
    needsUpdate: false,
  },
  {
    inn: "7701556677",
    name: "ООО 'БиоТехнологии'",
    statusExporter: "не экспортер",
    cpeCooperation: false,
    mspStatus: true,
    categoryMsp: "Малое",
    sphere: "Прочие",
    sector: "Фармацевтика и биотехнологии",
    mainActivity: "Разработка ферментных препаратов",
    products: "Кормовые ферменты, биодобавки, пробиотики для животноводства",
    emailMinprom: "biotech-min@gov.ru",
    phoneMinprom: "+7 (495) 999-88-77",
    contactMinprom: "Кузнецов Артем Игоревич",
    emailCpe: "",
    phoneCpe: "",
    contactCpe: "",
    exportVolume2023: 0.0,
    exportVolume2024: 0.0,
    exportVolume2025: 0.0,
    exportCountries: "",
    supportMeasures: [],
    interactions: [
      { id: "int-4", date: "2026-02-10", author: "Кузнецов А.И.", text: "Запрос на аудит экспортной готовности. Планируют выход на рынок СНГ к концу 2026 года." }
    ],
    tasks: [
      { id: "task-4", text: "Провести первичный скоринг готовности", date: "2026-04-10", status: "pending", assignedTo: "Дмитрий Власов" }
    ],
    customFields: {
      website: "https://biotech-labs.ru",
      founded_year: "2018",
      iso_certified: false,
      exporter_rating: "Нет"
    },
    changeLogs: [
      { timestamp: "2026-01-05T09:10:00Z", user: "Система", action: "Создание", details: "Импортировано из первичного реестра" }
    ],
    notes: "Высокотехнологичный стартап. Требуется обучение сотрудников основам ВЭД.",
    needsUpdate: true,
  },
  {
    inn: "3664055544",
    name: "ООО 'Воронежский трикотаж'",
    statusExporter: "2025 г.",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Малое",
    sphere: "Промышленность",
    sector: "Легкая промышленность",
    mainActivity: "Производство трикотажных изделий",
    products: "Одежда детская, трикотажное полотно, спортивные костюмы",
    emailMinprom: "vrn-textile@gov.ru",
    phoneMinprom: "+7 (473) 255-66-77",
    contactMinprom: "Петров Александр Юрьевич",
    emailCpe: "vrn-export@cpe.ru",
    phoneCpe: "+7 (473) 280-10-10",
    contactCpe: "Соколова Елена Викторовна",
    exportVolume2023: 0.0,
    exportVolume2024: 0.0,
    exportVolume2025: 5.5,
    exportCountries: "Беларусь, Казахстан",
    supportMeasures: [
      { id: "sm-4", name: "Разработка экспортного бренда и каталога", date: "2024-08-11", status: "Выполнено", amount: 300000 }
    ],
    interactions: [
      { id: "int-5", date: "2026-01-15", author: "Соколова Е.В.", text: "Отгружена первая партия детской одежды в Минск. Оформляют субсидию на маркетплейсы." }
    ],
    tasks: [
      { id: "task-5", text: "Помочь с листингом на Wildberries.by", date: "2026-03-10", status: "pending", assignedTo: "Елена Соколова" }
    ],
    customFields: {
      website: "http://vrn-trikotazh.ru",
      founded_year: "2012",
      iso_certified: false,
      exporter_rating: "B"
    },
    changeLogs: [
      { timestamp: "2026-01-05T09:12:00Z", user: "Система", action: "Создание", details: "Импортировано" }
    ],
    notes: "Недавно начали экспорт. Активные, оперативно выходят на маркетплейсы СНГ.",
    needsUpdate: false,
  },
  {
    inn: "2221088776",
    name: "ООО 'Алтайский Мед'",
    statusExporter: "экспортер",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Микро",
    sphere: "АПК",
    sector: "Пчеловодство",
    mainActivity: "Фасовка и переработка меда",
    products: "Мед алтайский натуральный, перга, прополис, медовые муссы",
    emailMinprom: "minprom-altay@gov.ru",
    phoneMinprom: "+7 (3852) 35-42-11",
    contactMinprom: "Романов Роман Павлович",
    emailCpe: "export-altai@mail.ru",
    phoneCpe: "+7 (3852) 22-99-88",
    contactCpe: "Дмитриева Ольга Николаевна",
    exportVolume2023: 15.0,
    exportVolume2024: 22.4,
    exportVolume2025: 28.1,
    exportCountries: "Китай, Германия, Япония",
    supportMeasures: [
      { id: "sm-5", name: "Сертификация продукции Халяль / Органик", date: "2024-11-20", status: "Одобрено", amount: 450000 }
    ],
    interactions: [
      { id: "int-6", date: "2026-02-05", author: "Дмитриева О.Н.", text: "Отправили образцы меда на экспертизу в Шанхай для получения импортного разрешения КНР." }
    ],
    tasks: [
      { id: "task-6", text: "Проконтролировать получение фитосанитарного сертификата", date: "2026-03-12", status: "pending", assignedTo: "Алексей Иванов" }
    ],
    customFields: {
      website: "http://altay-honey.ru",
      founded_year: "2015",
      iso_certified: true,
      exporter_rating: "A"
    },
    changeLogs: [
      { timestamp: "2026-01-05T09:15:00Z", user: "Система", action: "Создание", details: "Импортировано" }
    ],
    notes: "Семейный бизнес, премиальный сегмент. Есть интерес со стороны дистрибьюторов из ОАЭ и Саудовской Аравии.",
    needsUpdate: false,
  },
  {
    inn: "2310882233",
    name: "ООО 'Краснодарские Сады'",
    statusExporter: "не экспортер",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Среднее",
    sphere: "АПК",
    sector: "Садоводство",
    mainActivity: "Выращивание семечковых культур и косточковых плодов",
    products: "Свежие яблоки, сухофрукты, яблочный концентрат",
    emailMinprom: "agro-krasnodar@gov.ru",
    phoneMinprom: "+7 (861) 211-12-13",
    contactMinprom: "Шевченко Игорь Васильевич",
    emailCpe: "krd-export@cpe.ru",
    phoneCpe: "+7 (861) 279-00-11",
    contactCpe: "Карпов Дмитрий Андреевич",
    exportVolume2023: 0.0,
    exportVolume2024: 0.0,
    exportVolume2025: 0.0,
    exportCountries: "",
    supportMeasures: [],
    interactions: [
      { id: "int-7", date: "2026-01-28", author: "Шевченко И.В.", text: "Проконсультировались по поводу экспорта яблок в Египет и ОАЭ. Проблемы с логистикой рефрижераторных контейнеров." }
    ],
    tasks: [
      { id: "task-7", text: "Подобрать логистических операторов с реф-контейнерами до Новороссийска", date: "2026-05-15", status: "pending", assignedTo: "Иван Смирнов" }
    ],
    customFields: {
      website: "http://kuban-gardens.ru",
      founded_year: "2010",
      iso_certified: true,
      exporter_rating: "Нет"
    },
    changeLogs: [],
    notes: "Огромный логистический хаб-склад на 15 000 тонн единовременного хранения. Ищут выходы на Ближний Восток.",
    needsUpdate: true,
  },
  {
    inn: "7724099887",
    name: "АО 'МикроЭлектроника'",
    statusExporter: "экспортер",
    cpeCooperation: false,
    mspStatus: true,
    categoryMsp: "Малое",
    sphere: "Промышленность",
    sector: "Электроника",
    mainActivity: "Производство интегральных микросхем",
    products: "Микроконтроллеры, датчики давления, оптопары, светодиодные модули",
    emailMinprom: "electronic-min@gov.ru",
    phoneMinprom: "+7 (495) 777-55-44",
    contactMinprom: "Федоров Сергей Михайлович",
    emailCpe: "",
    phoneCpe: "",
    contactCpe: "",
    exportVolume2023: 45.0,
    exportVolume2024: 55.0,
    exportVolume2025: 67.0,
    exportCountries: "Казахстан, Узбекистан, Индия",
    supportMeasures: [
      { id: "sm-6", name: "Субсидия Минпромторга на НИОКР", date: "2024-03-10", status: "Одобрено", amount: 12000000 }
    ],
    interactions: [
      { id: "int-8", date: "2026-02-01", author: "Федоров С.М.", text: "Компания не работает с региональным ЦПЭ, так как обслуживается напрямую в Минпромторге и РЭЦ." }
    ],
    tasks: [],
    customFields: {
      website: "https://micro-el.ru",
      founded_year: "1994",
      iso_certified: true,
      exporter_rating: "AA"
    },
    changeLogs: [],
    notes: "Высокотехнологичный сектор, работает с госзаказами. Экспортируют продукцию гражданского назначения.",
    needsUpdate: false,
  },
  {
    inn: "5902888111",
    name: "ООО 'Пермские Деревянные Дома'",
    statusExporter: "экспортер",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Малое",
    sphere: "Промышленность",
    sector: "Лесозаготовка и деревообработка",
    mainActivity: "Производство деревянных домокомплектов",
    products: "Клееный брус, оцилиндрованное бревно, доска строганная, вагонка",
    emailMinprom: "minprom-perm@gov.ru",
    phoneMinprom: "+7 (342) 235-00-99",
    contactMinprom: "Котов Владимир Львович",
    emailCpe: "cpe-perm@export.ru",
    phoneCpe: "+7 (342) 201-11-22",
    contactCpe: "Смирнов Алексей Игоревич",
    exportVolume2023: 88.0,
    exportVolume2024: 104.0,
    exportVolume2025: 112.0,
    exportCountries: "Казахстан, Кыргызстан, Турция, ОАЭ",
    supportMeasures: [
      { id: "sm-7", name: "Субсидирование части затрат на транспортировку древесины", date: "2024-07-20", status: "Одобрено", amount: 4800000 }
    ],
    interactions: [
      { id: "int-9", date: "2026-02-18", author: "Смирнов А.И.", text: "Проведен вебинар для компании по правилам экспорта пиломатериалов с системой ЛесЕГАИС." }
    ],
    tasks: [
      { id: "task-8", text: "Согласовать участие в строительной выставке BIG 5 в Дубае", date: "2026-07-15", status: "pending", assignedTo: "Алексей Смирнов" }
    ],
    customFields: {
      website: "http://permwoodhouses.ru",
      founded_year: "2008",
      iso_certified: true,
      exporter_rating: "A+"
    },
    changeLogs: [],
    notes: "Отличный потенциал в странах Персидского залива из-за спроса на экологичное домостроение.",
    needsUpdate: false,
  }
];

export async function seedDatabase(force = false) {
  await ensureDatabaseReady();
  // Check custom fields
  const cfCount = await db.select({ count: count() }).from(customFieldDefinitions);
  if (force || cfCount[0].count === 0) {
    // Delete existing definitions first
    if (force) {
      await db.delete(customFieldDefinitions);
    }
    for (const cf of initialCustomFields) {
      await db.insert(customFieldDefinitions).values({
        key: cf.key,
        label: cf.label,
        type: cf.type,
      }).onConflictDoNothing();
    }
  }

  // Check companies
  const companyCount = await db.select({ count: count() }).from(companies);
  if (force || companyCount[0].count === 0) {
    if (force) {
      await db.delete(companies);
    }
    for (const comp of initialCompanies) {
      await db.insert(companies).values({
        inn: comp.inn,
        name: comp.name,
        statusExporter: comp.statusExporter,
        cpeCooperation: comp.cpeCooperation,
        mspStatus: comp.mspStatus,
        categoryMsp: comp.categoryMsp,
        sphere: comp.sphere,
        sector: comp.sector,
        mainActivity: comp.mainActivity,
        products: comp.products,
        emailMinprom: comp.emailMinprom,
        phoneMinprom: comp.phoneMinprom,
        contactMinprom: comp.contactMinprom,
        emailCpe: comp.emailCpe,
        phoneCpe: comp.phoneCpe,
        contactCpe: comp.contactCpe,
        exportVolume2023: comp.exportVolume2023,
        exportVolume2024: comp.exportVolume2024,
        exportVolume2025: comp.exportVolume2025,
        exportCountries: comp.exportCountries,
        supportMeasures: comp.supportMeasures,
        interactions: comp.interactions,
        tasks: comp.tasks,
        customFields: comp.customFields,
        changeLogs: comp.changeLogs,
        notes: comp.notes,
        needsUpdate: comp.needsUpdate,
      });
    }
  }

  return { success: true, count: initialCompanies.length };
}
