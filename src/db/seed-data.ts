import { db, ensureDatabaseReady } from "./index";
import { companies, customFieldDefinitions, foreignPartners } from "./schema";
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
    tnved: "8474, 8479, 7326",
    supportMeasures: [
      { id: "sm-1", name: "Субсидия на сертификацию продукции", serviceType: "exhibition", serviceCategory: "complex", requestDate: "2024-04-01", receiptDate: "2024-05-12", status: "Одобрено", amount: 1500000, conversion: { hasContract: true, contractCountry: "Китай", contractAmount: 12000000, contractDate: "2024-08-15", isNewExporter: false } },
      { id: "sm-2", name: "Участие в международной выставке в Шанхае", serviceType: "exhibition", serviceCategory: "complex", requestDate: "2025-08-01", receiptDate: "2025-10-15", status: "Выполнено", amount: 800000, conversion: { hasContract: true, contractCountry: "Индия", contractAmount: 8500000, contractDate: "2025-11-20", isNewExporter: true } }
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
    tnved: "1512, 2306, 1507",
    supportMeasures: [
      { id: "sm-3", name: "Льготное кредитование экспортеров", serviceType: "other", serviceCategory: "popularization", requestDate: "2023-03-01", receiptDate: "2023-04-20", status: "Одобрено", amount: 25000000, conversion: { hasContract: true, contractCountry: "Китай, Монголия", contractAmount: 45000000, contractDate: "2023-09-10", isNewExporter: false } }
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
    tnved: "",
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
    tnved: "6109, 6110, 6203",
    supportMeasures: [
      { id: "sm-4", name: "Разработка экспортного бренда и каталога", serviceType: "other", serviceCategory: "popularization", requestDate: "2024-06-01", receiptDate: "2024-08-11", status: "Выполнено", amount: 300000, conversion: null }
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
    tnved: "0409, 1702, 2106",
    supportMeasures: [
      { id: "sm-5", name: "Сертификация продукции Халяль / Органик", serviceType: "search_and_selection", serviceCategory: "complex", requestDate: "2024-10-01", receiptDate: "2024-11-20", status: "Одобрено", amount: 450000, conversion: { hasContract: true, contractCountry: "Германия", contractAmount: 5000000, contractDate: "2025-01-15", isNewExporter: true } }
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
    tnved: "0808, 0810, 2009",
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
    tnved: "8542, 8541, 8536",
    supportMeasures: [
      { id: "sm-6", name: "Субсидия Минпромторга на НИОКР", serviceType: "other", serviceCategory: "popularization", requestDate: "2024-01-01", receiptDate: "2024-03-10", status: "Одобрено", amount: 12000000, conversion: null }
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
    tnved: "4407, 4418, 9406",
    supportMeasures: [
      { id: "sm-7", name: "Субсидирование части затрат на транспортировку древесины", serviceType: "business_mission", serviceCategory: "complex", requestDate: "2024-06-01", receiptDate: "2024-07-20", status: "Одобрено", amount: 4800000, conversion: { hasContract: true, contractCountry: "ОАЭ, Турция", contractAmount: 15000000, contractDate: "2024-10-05", isNewExporter: true } }
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
  },
  // Additional companies for matching
  {
    inn: "7808111222",
    name: "ООО 'Балтийский Кондитер'",
    statusExporter: "экспортер",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Малое",
    sphere: "АПК",
    sector: "Пищевая промышленность",
    mainActivity: "Производство кондитерских изделий",
    products: "Шоколад ручной работы, конфеты премиум-класса, вафли сахарные, мармелад",
    emailMinprom: "spb-food@gov.ru",
    phoneMinprom: "+7 (812) 432-15-67",
    contactMinprom: "Алексеева Ирина Павловна",
    emailCpe: "export-spb@cpe.ru",
    phoneCpe: "+7 (812) 555-44-33",
    contactCpe: "Громов Андрей Викторович",
    exportVolume2023: 8.5,
    exportVolume2024: 14.2,
    exportVolume2025: 22.0,
    exportCountries: "Беларусь, Казахстан, Израиль",
    tnved: "1806, 1704, 1905",
    supportMeasures: [
      { id: "sm-8", name: "Участие в выставке WorldFood", serviceType: "exhibition", serviceCategory: "complex", requestDate: "2025-10-01", receiptDate: "2025-12-15", status: "Выполнено", amount: 600000, conversion: { hasContract: true, contractCountry: "Израиль", contractAmount: 3200000, contractDate: "2026-01-20", isNewExporter: true } }
    ],
    interactions: [
      { id: "int-10", date: "2026-03-10", author: "Громов А.В.", text: "Получен крупный заказ от торговой сети в Израиле. Прорабатываем логистику." }
    ],
    tasks: [
      { id: "task-9", text: "Подготовить документы для сертификации кошерной продукции", date: "2026-05-01", status: "pending", assignedTo: "Андрей Громов" }
    ],
    customFields: { website: "https://balticonditer.ru", founded_year: "2016", iso_certified: true, exporter_rating: "A" },
    changeLogs: [],
    notes: "Семейная кондитерская с уникальными рецептами. Успешно выходят на рынок Израиля.",
    needsUpdate: false,
  },
  {
    inn: "6501999887",
    name: "ООО 'Сахалинские Морепродукты'",
    statusExporter: "экспортер",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Среднее",
    sphere: "АПК",
    sector: "Рыболовство и аквакультура",
    mainActivity: "Вылов и переработка рыбы и морепродуктов",
    products: "Краб камчатский, креветка северная, филе минтая, икра лососевая, гребешок",
    emailMinprom: "sakh-fish@gov.ru",
    phoneMinprom: "+7 (4242) 45-67-89",
    contactMinprom: "Зайцев Виталий Юрьевич",
    emailCpe: "sakhalin-export@cpe.ru",
    phoneCpe: "+7 (4242) 72-33-44",
    contactCpe: "Морозова Татьяна Сергеевна",
    exportVolume2023: 250.0,
    exportVolume2024: 310.5,
    exportVolume2025: 380.0,
    exportCountries: "Китай, Япония, Республика Корея",
    tnved: "0306, 0303, 1605",
    supportMeasures: [
      { id: "sm-9", name: "Субсидия на сертификацию HACCP и FSMS", serviceType: "search_and_selection", serviceCategory: "complex", requestDate: "2024-02-01", receiptDate: "2024-04-20", status: "Одобрено", amount: 900000, conversion: { hasContract: true, contractCountry: "Япония", contractAmount: 28000000, contractDate: "2024-07-10", isNewExporter: false } }
    ],
    interactions: [
      { id: "int-11", date: "2026-03-05", author: "Морозова Т.С.", text: "Проведены переговоры с сетью ресторанов в Токио. Договорились о регулярных поставках гребешка." }
    ],
    tasks: [
      { id: "task-10", text: "Обновить сертификат происхождения СТ-1 для поставок в Китай", date: "2026-06-01", status: "pending", assignedTo: "Татьяна Морозова" }
    ],
    customFields: { website: "https://sakhalin-seafood.ru", founded_year: "2000", iso_certified: true, exporter_rating: "AAA" },
    changeLogs: [],
    notes: "Один из крупнейших поставщиков краба в Японию. Имеют собственную ТРЦ.",
    needsUpdate: false,
  },
  {
    inn: "7809123456",
    name: "ООО 'ХимПромСинтез'",
    statusExporter: "экспортер",
    cpeCooperation: false,
    mspStatus: true,
    categoryMsp: "Среднее",
    sphere: "Промышленность",
    sector: "Химическая промышленность",
    mainActivity: "Производство органических растворителей и реагентов",
    products: "Ацетон технический, бутилацетат, толуол, изопропанол, метанол",
    emailMinprom: "chemprom-min@gov.ru",
    phoneMinprom: "+7 (812) 543-21-00",
    contactMinprom: "Белов Дмитрий Николаевич",
    emailCpe: "",
    phoneCpe: "",
    contactCpe: "",
    exportVolume2023: 180.0,
    exportVolume2024: 220.0,
    exportVolume2025: 275.0,
    exportCountries: "Финляндия, Польша, Турция, Индия",
    tnved: "2914, 2915, 2909",
    supportMeasures: [],
    interactions: [
      { id: "int-12", date: "2026-01-20", author: "Белов Д.Н.", text: "Запрос на подбор логистики для опасных грузов (класс 3) в порты Балтии." }
    ],
    tasks: [
      { id: "task-11", text: "Проработать альтернативный маршрут через порт Усть-Луга", date: "2026-04-20", status: "pending", assignedTo: "Дмитрий Белов" }
    ],
    customFields: { website: "https://himpromsintez.ru", founded_year: "2003", iso_certified: true, exporter_rating: "AA" },
    changeLogs: [],
    notes: "Поставки химреактивов для фармацевтических производств в Европу и Индию.",
    needsUpdate: false,
  },
  {
    inn: "7415999888",
    name: "ООО 'Южно-Уральский Мясокомбинат'",
    statusExporter: "не экспортер",
    cpeCooperation: true,
    mspStatus: true,
    categoryMsp: "Среднее",
    sphere: "АПК",
    sector: "Мясопереработка",
    mainActivity: "Производство мясных полуфабрикатов и деликатесов",
    products: "Говядина замороженная, баранина, мясные консервы, субпродукты",
    emailMinprom: "meat-ural@gov.ru",
    phoneMinprom: "+7 (351) 265-14-15",
    contactMinprom: "Шакиров Ринат Марсельевич",
    emailCpe: "cpe-chel@export74.ru",
    phoneCpe: "+7 (351) 777-99-00",
    contactCpe: "Красулин Евгений Валерьевич",
    exportVolume2023: 0.0,
    exportVolume2024: 0.0,
    exportVolume2025: 0.0,
    exportCountries: "",
    tnved: "0202, 0204, 1602",
    supportMeasures: [
      { id: "sm-10", name: "Аудит экспортной готовности мясоперерабатывающего предприятия", serviceType: "other", serviceCategory: "popularization", requestDate: "2026-01-10", receiptDate: "2026-02-20", status: "Выполнено", amount: 150000, conversion: null }
    ],
    interactions: [
      { id: "int-13", date: "2026-02-25", author: "Красулин Е.В.", text: "Прорабатываем возможность поставок халяльной баранины в ОАЭ и Саудовскую Аравию." }
    ],
    tasks: [
      { id: "task-12", text: "Получить сертификат Халяль для экспорта мяса", date: "2026-06-15", status: "pending", assignedTo: "Евгений Красулин" }
    ],
    customFields: { website: "https://umk-chel.ru", founded_year: "1995", iso_certified: true, exporter_rating: "B" },
    changeLogs: [],
    notes: "Ищут рынки сбыта в странах Персидского залива. Необходима поддержка в сертификации.",
    needsUpdate: true,
  },
];

export const initialForeignPartners = [
  {
    companyName: "SuperFoods GmbH",
    country: "Германия",
    contactPerson: "Hans Mueller",
    phone: "+49 173 456 7890",
    email: "hans@superfoods.de",
    website: "superfoods.de",
    productInterests: "Мёд органический, орехи, сухофрукты, масло подсолнечное, кондитерские изделия, шоколад",
    notes: "Крупный импортёр органических продуктов в Европе.",
  },
  {
    companyName: "Beijing Food Import Co.",
    country: "Китай",
    contactPerson: "Li Wei",
    phone: "+86 138 5678 1234",
    email: "liwei@beijingfood.cn",
    website: "beijingfood.cn",
    productInterests: "Краб камчатский, креветка, минтай, икра, мёд, подсолнечное масло, мука, соя",
    notes: "Крупнейший импортёр морепродуктов и сельхозпродукции.",
  },
  {
    companyName: "Tokyo Marine Products Ltd.",
    country: "Япония",
    contactPerson: "Tanaka Kenji",
    phone: "+81 90 2345 6789",
    email: "tanaka@tokyomarine.jp",
    website: "tokyomarine.jp",
    productInterests: "Краб камчатский, гребешок, креветка, икра лососевая, рыба мороженая, морепродукты премиум",
    notes: "Премиальные морепродукты для ресторанного сегмента Японии.",
  },
  {
    companyName: "Al Ghurair Trading LLC",
    country: "ОАЭ",
    contactPerson: "Ahmed Al Mansouri",
    phone: "+971 50 123 4567",
    email: "ahmed@alghurairtrading.ae",
    website: "alghurairtrading.ae",
    productInterests: "Баранина халяль, говядина замороженная, мёд, масло подсолнечное, пиломатериалы, деревянные дома",
    notes: "Торговый дом Дубая. Закупают продукцию для строительного и продовольственного сектора.",
  },
  {
    companyName: "Eurasia Chemicals Sp. z o.o.",
    country: "Польша",
    contactPerson: "Krzysztof Nowak",
    phone: "+48 601 234 567",
    email: "k.nowak@eurasiachem.pl",
    website: "eurasiachem.pl",
    productInterests: "Ацетон, бутилацетат, толуол, метанол, изопропанол, растворители органические, реагенты",
    notes: "Химический дистрибьютор. Ищет альтернативных поставщиков растворителей.",
  },
  {
    companyName: "PT Seafood Asia",
    country: "Индонезия",
    contactPerson: "Budi Santoso",
    phone: "+62 812 3456 7890",
    email: "budi@seafoodasia.id",
    website: "seafoodasia.id",
    productInterests: "Рыба мороженая, креветка, кальмар, консервы рыбные, краб",
    notes: "Переработчик морепродуктов. Заинтересованы в долгосрочных контрактах.",
  },
  {
    companyName: "Mongolia Meat & Milk LLC",
    country: "Монголия",
    contactPerson: "Bat-Erdene Jargal",
    phone: "+976 11 123 456",
    email: "bat@mongolianmeat.mn",
    website: "mongolianmeat.mn",
    productInterests: "Говядина, баранина, мясные консервы, мука, масло подсолнечное, сахар, кондитерские изделия",
    notes: "Мясоперерабатывающий комбинат. Импортируют продовольствие.",
  },
  {
    companyName: "Dubai Wood Trade FZC",
    country: "ОАЭ",
    contactPerson: "Saeed Al Qasimi",
    phone: "+971 55 987 6543",
    email: "saeed@dubaiwood.ae",
    website: "dubaiwood.ae",
    productInterests: "Пиломатериалы хвойных пород, клееный брус, строганная доска, фанера, OSB, деревянные домокомплекты",
    notes: "Импортёр стройматериалов из дерева. Активно работают с Россией.",
  },
  {
    companyName: "TechElectro India Pvt. Ltd.",
    country: "Индия",
    contactPerson: "Rajesh Patel",
    phone: "+91 98765 43210",
    email: "rajesh@techelectro.in",
    website: "techelectro.in",
    productInterests: "Микроконтроллеры, интегральные схемы, электронные компоненты, датчики, оптопары, LED-модули",
    notes: "Сборщик электроники. Ищет надёжных поставщиков компонентов.",
  },
  {
    companyName: "Sultan Food Industries",
    country: "Турция",
    contactPerson: "Mehmet Yilmaz",
    phone: "+90 532 123 45 67",
    email: "mehmet@sultanfood.com.tr",
    website: "sultanfood.com.tr",
    productInterests: "Мука пшеничная, масло подсолнечное, сахар, мясо замороженное, кондитерские изделия, шоколад",
    notes: "Производитель готовых продуктов. Импортируют сырьё.",
  },
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
        tnved: comp.tnved,
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

  // Seed foreign partners
  const fpCount = await db.select({ count: count() }).from(foreignPartners);
  if (force || fpCount[0].count === 0) {
    if (force) {
      await db.delete(foreignPartners);
    }
    for (const fp of initialForeignPartners) {
      await db.insert(foreignPartners).values({
        companyName: fp.companyName,
        country: fp.country,
        contactPerson: fp.contactPerson || "",
        phone: fp.phone || "",
        email: fp.email || "",
        website: fp.website || "",
        productInterests: fp.productInterests || "",
        notes: fp.notes || "",
      });
    }
  }

  return { success: true, count: initialCompanies.length };
}
