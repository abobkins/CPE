"use client";

import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { Check, FileText, Loader2, Upload, X } from "lucide-react";

const allowedFileTypes = ".png,.jpg,.jpeg,.svg,.pdf,.docx,.xlsx";

interface SelectedFile {
  name: string;
  size: number;
  data: string;
}

export default function ZayavkiPage() {
  const [companyName, setCompanyName] = useState("");
  const [inn, setInn] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [countries, setCountries] = useState("");
  const [description, setDescription] = useState("");
  const [tnved, setTnved] = useState("");
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    const newFiles: SelectedFile[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const data = await readFileAsDataURL(file);
      newFiles.push({ name: file.name, size: file.size, data });
    }
    setFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!companyName.trim()) { setError("Укажите наименование компании"); return; }
    if (!inn.trim()) { setError("Укажите ИНН"); return; }
    if (!contactPerson.trim()) { setError("Укажите контактное лицо"); return; }
    if (!phone.trim()) { setError("Укажите номер телефона"); return; }
    if (!email.trim()) { setError("Укажите email"); return; }
    if (!description.trim()) { setError("Опишите продукцию или услуги"); return; }
    if (!agreed) { setError("Необходимо согласие на обработку персональных данных"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/applications/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          companyInn: inn.trim(),
          contactName: contactPerson.trim(),
          contactPhone: phone.trim(),
          contactEmail: email.trim(),
          subject: `Заявка на экспорт: ${companyName.trim()}`,
          message: description.trim(),
          rawData: {
            countries: countries.trim().split(",").map((s) => s.trim()).filter(Boolean),
            tnved: tnved.trim(),
            files: files.map((f) => ({ name: f.name, size: f.size, data: f.data })),
          },
          source: "export-application",
        }),
      });
      if (!res.ok) throw new Error("Ошибка при отправке заявки");
      setSuccess(true);
      setCompanyName(""); setInn(""); setContactPerson(""); setPhone(""); setEmail("");
      setCountries(""); setDescription(""); setTnved(""); setFiles([]); setAgreed(false);
    } catch (err: any) {
      setError(err.message || "Произошла ошибка. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-[#0c2248] text-white py-16 md:py-24">
        <div className="container-site">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Заявки на экспорт</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl leading-relaxed">
            Оставьте заявку на экспорт вашей продукции. Мы поможем найти
            иностранных партнёров и организовать B2B-встречи.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-site max-w-3xl">
          {success ? (
            <div className="bg-white rounded-[20px] border border-[#e3edf7] p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Check size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-text mb-3">Заявка отправлена!</h2>
              <p className="text-text/70 mb-6">
                Спасибо! Ваша заявка на экспорт принята. Мы свяжемся с вами в
                ближайшее время для обсуждения деталей.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="bg-accent text-white rounded-[20px] px-8 py-3 font-medium hover:bg-hover transition-colors"
              >
                Подать ещё одну заявку
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-[20px] border border-[#e3edf7] p-8 md:p-10 space-y-7"
            >
              <div>
                <h2 className="text-2xl font-bold text-text mb-1">
                  Форма заявки на экспорт
                </h2>
                <p className="text-text/60 text-sm">Заполните все обязательные поля</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-[20px] px-5 py-4 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Field label="Наименование компании" required>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ООО «Экспортёр»"
                  className="w-full border border-[#e3edf7] rounded-[20px] px-5 py-3 text-text bg-white focus:outline-none focus:border-accent transition-colors placeholder:text-text/40"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="ИНН" required>
                  <input
                    type="text"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    placeholder="1234567890"
                    className="w-full border border-[#e3edf7] rounded-[20px] px-5 py-3 text-text bg-white focus:outline-none focus:border-accent transition-colors placeholder:text-text/40"
                  />
                </Field>
                <Field label="Контактное лицо" required>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="w-full border border-[#e3edf7] rounded-[20px] px-5 py-3 text-text bg-white focus:outline-none focus:border-accent transition-colors placeholder:text-text/40"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Телефон" required>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full border border-[#e3edf7] rounded-[20px] px-5 py-3 text-text bg-white focus:outline-none focus:border-accent transition-colors placeholder:text-text/40"
                  />
                </Field>
                <Field label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="company@example.ru"
                    className="w-full border border-[#e3edf7] rounded-[20px] px-5 py-3 text-text bg-white focus:outline-none focus:border-accent transition-colors placeholder:text-text/40"
                  />
                </Field>
              </div>

              <Field label="Страны интереса для экспорта">
                <input
                  type="text"
                  value={countries}
                  onChange={(e) => setCountries(e.target.value)}
                  placeholder="Китай, Казахстан, Узбекистан"
                  className="w-full border border-[#e3edf7] rounded-[20px] px-5 py-3 text-text bg-white focus:outline-none focus:border-accent transition-colors placeholder:text-text/40"
                />
              </Field>

              <Field label="Описание продукции / услуг" required>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={6}
                  placeholder="Опишите вашу продукцию, объёмы производства, условия поставки..."
                  className="w-full border border-[#e3edf7] rounded-[20px] px-5 py-3 text-text bg-white focus:outline-none focus:border-accent transition-colors placeholder:text-text/40 resize-y"
                />
                <p className="text-xs text-text/40 text-right mt-1">
                  {description.length}/1000
                </p>
              </Field>

              <Field label="Коды ТН ВЭД (если известны)">
                <input
                  type="text"
                  value={tnved}
                  onChange={(e) => setTnved(e.target.value)}
                  placeholder="8471, 8473, 8523"
                  className="w-full border border-[#e3edf7] rounded-[20px] px-5 py-3 text-text bg-white focus:outline-none focus:border-accent transition-colors placeholder:text-text/40"
                />
              </Field>

              <Field label="Прикрепить файлы (КП, каталоги)">
                <div className="border border-[#e3edf7] rounded-[20px] p-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={allowedFileTypes}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 cursor-pointer text-accent hover:text-hover transition-colors font-medium"
                  >
                    <Upload size={20} />
                    <span>Выберите файлы</span>
                  </label>
                  <p className="text-xs text-text/40 mt-1">
                    Допустимые форматы: PNG, JPG, PDF, DOCX, XLSX
                  </p>
                  {files.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {files.map((file, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-3 bg-[#f1f6fb] rounded-[12px] px-4 py-2 text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText size={16} className="text-accent shrink-0" />
                            <span className="truncate text-text">{file.name}</span>
                            <span className="text-text/40 shrink-0">
                              ({formatSize(file.size)})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Field>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-[#e3edf7] text-accent focus:ring-accent shrink-0"
                />
                <span className="text-sm text-text/70 group-hover:text-text transition-colors">
                  Я даю согласие на обработку персональных данных в соответствии с
                  политикой конфиденциальности
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white rounded-[20px] px-8 py-4 font-semibold text-lg hover:bg-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить заявку"
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );

  function Field({
    label,
    required,
    children,
  }: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
  }) {
    return (
      <div>
        <label className="block font-medium text-text mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {children}
      </div>
    );
  }
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
