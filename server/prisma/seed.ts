/**
 * ProfAI seed — Türkiye üniversiteleri kapsamlı demo verisi.
 *
 * Üniversite + bölüm verisi: gerçek (200+ üniversite, YÖK kaynaklı, bkz. data/turkish-universities.ts)
 * Profesör isimleri: TAMAMEN KURGUSAL. Gerçek akademisyenlere benzerlik tesadüftür.
 */

import "dotenv/config";
import { PrismaClient, ExamType } from "@prisma/client";
import bcrypt from "bcrypt";
import { TURKISH_UNIVERSITIES, UniInfo } from "../src/data/turkish-universities";

const prisma = new PrismaClient();

const UNIVERSITIES: UniInfo[] = TURKISH_UNIVERSITIES;

// ============================================================================
// BÖLÜM PROFİLLERİ — DERS ŞABLONLARI VE KONU HAVUZLARI
// ============================================================================

interface CourseTemplate {
  code: string;
  name: string;
}

interface DeptProfile {
  topics: string[];
  courses: CourseTemplate[];
}

const DEPARTMENT_PROFILES: Record<string, DeptProfile> = {
  "Bilgisayar Mühendisliği": {
    topics: [
      "Veri Yapıları",
      "Algoritma Analizi",
      "Nesne Yönelimli Programlama",
      "Veritabanı Sistemleri",
      "İşletim Sistemleri",
      "Bilgisayar Ağları",
      "Yazılım Mühendisliği",
      "Yapay Zeka",
      "Makine Öğrenmesi",
      "Web Teknolojileri",
      "Sistem Programlama",
      "Derleyici Tasarımı",
      "Mobil Uygulama Geliştirme",
      "Siber Güvenlik",
      "Dağıtık Sistemler",
      "Bulut Bilişim",
      "Veri Madenciliği",
      "Bilgisayar Grafiği",
    ],
    courses: [
      { code: "101", name: "Programlamaya Giriş" },
      { code: "102", name: "Bilgisayar Mühendisliğine Giriş" },
      { code: "201", name: "Veri Yapıları" },
      { code: "202", name: "Nesne Yönelimli Programlama" },
      { code: "203", name: "Ayrık Matematik" },
      { code: "301", name: "Algoritma Analizi" },
      { code: "302", name: "İşletim Sistemleri" },
      { code: "303", name: "Veritabanı Sistemleri" },
      { code: "304", name: "Bilgisayar Mimarisi" },
      { code: "305", name: "Bilgisayar Ağları" },
      { code: "401", name: "Yazılım Mühendisliği" },
      { code: "402", name: "Yapay Zeka" },
      { code: "403", name: "Makine Öğrenmesi" },
      { code: "404", name: "Web Teknolojileri" },
      { code: "405", name: "Mobil Uygulama Geliştirme" },
    ],
  },
  "Elektrik-Elektronik Mühendisliği": {
    topics: [
      "Devre Analizi",
      "Sayısal Sistemler",
      "Sinyal İşleme",
      "Kontrol Sistemleri",
      "Elektromanyetik Alan Teorisi",
      "Elektronik Devreler",
      "Mikroişlemciler",
      "Güç Elektroniği",
      "Haberleşme Sistemleri",
      "Antenler ve Yayılım",
      "Yarı İletken Cihazlar",
      "Otomatik Kontrol",
    ],
    courses: [
      { code: "101", name: "Elektrik-Elektronik Müh. Giriş" },
      { code: "201", name: "Devre Analizi I" },
      { code: "202", name: "Devre Analizi II" },
      { code: "203", name: "Elektromanyetik Teori I" },
      { code: "301", name: "Sayısal Sistem Tasarımı" },
      { code: "302", name: "Mikroişlemciler" },
      { code: "303", name: "Sinyaller ve Sistemler" },
      { code: "304", name: "Kontrol Sistemleri" },
      { code: "401", name: "Güç Sistemleri Analizi" },
      { code: "402", name: "Haberleşme Sistemleri" },
      { code: "403", name: "Sayısal Sinyal İşleme" },
    ],
  },
  "Endüstri Mühendisliği": {
    topics: [
      "Doğrusal Programlama",
      "Yöneylem Araştırması",
      "Üretim Planlaması",
      "Kalite Yönetimi",
      "Stok Yönetimi",
      "Tedarik Zinciri",
      "Sistem Simülasyonu",
      "Karar Analizi",
      "Lojistik",
      "İş Zekası",
      "Proje Yönetimi",
      "Ergonomi",
    ],
    courses: [
      { code: "101", name: "Endüstri Mühendisliğine Giriş" },
      { code: "201", name: "Olasılık ve İstatistik" },
      { code: "202", name: "Doğrusal Cebir ve Optimizasyon" },
      { code: "301", name: "Yöneylem Araştırması I" },
      { code: "302", name: "Yöneylem Araştırması II" },
      { code: "303", name: "Üretim Sistemleri" },
      { code: "304", name: "Kalite Mühendisliği" },
      { code: "401", name: "Tedarik Zinciri Yönetimi" },
      { code: "402", name: "Sistem Simülasyonu" },
      { code: "403", name: "Karar Analizi" },
    ],
  },
  "Makine Mühendisliği": {
    topics: [
      "Termodinamik",
      "Akışkanlar Mekaniği",
      "Isı Transferi",
      "Mukavemet",
      "Statik",
      "Dinamik",
      "Makine Elemanları",
      "Üretim Yöntemleri",
      "Kontrol Mühendisliği",
      "CAD/CAM",
      "Malzeme Bilimi",
      "Titreşim Analizi",
    ],
    courses: [
      { code: "101", name: "Makine Mühendisliğine Giriş" },
      { code: "201", name: "Statik" },
      { code: "202", name: "Dinamik" },
      { code: "203", name: "Mukavemet" },
      { code: "301", name: "Termodinamik I" },
      { code: "302", name: "Akışkanlar Mekaniği" },
      { code: "303", name: "Isı Transferi" },
      { code: "304", name: "Makine Elemanları" },
      { code: "401", name: "Makine Tasarımı" },
      { code: "402", name: "Üretim Yöntemleri" },
    ],
  },
  Matematik: {
    topics: [
      "Lineer Cebir",
      "Diferansiyel Denklemler",
      "Reel Analiz",
      "Karmaşık Analiz",
      "Soyut Cebir",
      "Topoloji",
      "Sayılar Teorisi",
      "Olasılık Teorisi",
      "Sayısal Yöntemler",
      "Diferansiyel Geometri",
      "Fonksiyonel Analiz",
      "Cebirsel Geometri",
    ],
    courses: [
      { code: "101", name: "Matematik Analizi I" },
      { code: "102", name: "Matematik Analizi II" },
      { code: "201", name: "Lineer Cebir" },
      { code: "202", name: "Diferansiyel Denklemler" },
      { code: "203", name: "Olasılık ve İstatistik" },
      { code: "301", name: "Soyut Cebir" },
      { code: "302", name: "Reel Analiz" },
      { code: "303", name: "Topoloji" },
      { code: "401", name: "Karmaşık Analiz" },
      { code: "402", name: "Sayısal Analiz" },
    ],
  },
  Fizik: {
    topics: [
      "Klasik Mekanik",
      "Elektromanyetik Teori",
      "Kuantum Mekaniği",
      "Termodinamik",
      "İstatistiksel Mekanik",
      "Modern Fizik",
      "Atom Fiziği",
      "Katıhal Fiziği",
      "Optik",
      "Nükleer Fizik",
      "Astrofizik",
      "Dalga Mekaniği",
    ],
    courses: [
      { code: "101", name: "Fizik I" },
      { code: "102", name: "Fizik II" },
      { code: "201", name: "Modern Fizik" },
      { code: "202", name: "Klasik Mekanik" },
      { code: "203", name: "Elektromanyetik Teori" },
      { code: "301", name: "Kuantum Mekaniği" },
      { code: "302", name: "Termodinamik ve İstatistiksel Fizik" },
      { code: "401", name: "Katıhal Fiziği" },
      { code: "402", name: "Optik" },
    ],
  },
  İşletme: {
    topics: [
      "Pazarlama Stratejisi",
      "Finansal Analiz",
      "Yönetim Muhasebesi",
      "İnsan Kaynakları",
      "Stratejik Yönetim",
      "Operasyon Yönetimi",
      "Liderlik",
      "Organizasyonel Davranış",
      "Marka Yönetimi",
      "Tüketici Davranışı",
      "Uluslararası İşletme",
      "Girişimcilik",
    ],
    courses: [
      { code: "101", name: "İşletmeye Giriş" },
      { code: "201", name: "Mikro İktisat" },
      { code: "202", name: "Pazarlama İlkeleri" },
      { code: "203", name: "Muhasebe Esasları" },
      { code: "301", name: "Finansal Yönetim" },
      { code: "302", name: "İnsan Kaynakları Yönetimi" },
      { code: "303", name: "Yönetim Bilişim Sistemleri" },
      { code: "401", name: "Stratejik Yönetim" },
      { code: "402", name: "Uluslararası İşletmecilik" },
    ],
  },
  Ekonomi: {
    topics: [
      "Mikroekonomi",
      "Makroekonomi",
      "Ekonometri",
      "Para Politikası",
      "Maliye Politikası",
      "Uluslararası Ticaret",
      "Kalkınma Ekonomisi",
      "Davranışsal Ekonomi",
      "Oyun Teorisi",
      "Ekonomi Tarihi",
      "Çevre Ekonomisi",
      "Çalışma Ekonomisi",
    ],
    courses: [
      { code: "101", name: "Ekonomiye Giriş" },
      { code: "201", name: "Mikroekonomi I" },
      { code: "202", name: "Makroekonomi I" },
      { code: "203", name: "İstatistik" },
      { code: "301", name: "Ekonometri" },
      { code: "302", name: "Para ve Banka" },
      { code: "303", name: "Uluslararası İktisat" },
      { code: "401", name: "Kalkınma Ekonomisi" },
      { code: "402", name: "Davranışsal Ekonomi" },
    ],
  },
  Tıp: {
    topics: [
      "Anatomi",
      "Fizyoloji",
      "Histoloji",
      "Patoloji",
      "Mikrobiyoloji",
      "Farmakoloji",
      "İç Hastalıkları",
      "Cerrahi",
      "Pediatri",
      "Kardiyoloji",
      "Nöroloji",
      "Radyoloji",
    ],
    courses: [
      { code: "101", name: "Anatomi" },
      { code: "102", name: "Histoloji ve Embriyoloji" },
      { code: "201", name: "Fizyoloji" },
      { code: "202", name: "Biyokimya" },
      { code: "301", name: "Patoloji" },
      { code: "302", name: "Mikrobiyoloji" },
      { code: "303", name: "Farmakoloji" },
      { code: "401", name: "İç Hastalıkları" },
      { code: "402", name: "Cerrahi" },
      { code: "403", name: "Pediatri" },
    ],
  },
  Hukuk: {
    topics: [
      "Anayasa Hukuku",
      "Borçlar Hukuku",
      "Ceza Hukuku",
      "İdare Hukuku",
      "Ticaret Hukuku",
      "Medeni Hukuk",
      "Uluslararası Hukuk",
      "İş Hukuku",
      "Vergi Hukuku",
      "Hukuk Tarihi",
      "Usul Hukuku",
      "İcra İflas Hukuku",
    ],
    courses: [
      { code: "101", name: "Hukuka Giriş" },
      { code: "102", name: "Hukuk Tarihi" },
      { code: "201", name: "Anayasa Hukuku" },
      { code: "202", name: "Medeni Hukuk" },
      { code: "203", name: "Borçlar Hukuku Genel" },
      { code: "301", name: "Ceza Hukuku Genel" },
      { code: "302", name: "İdare Hukuku" },
      { code: "303", name: "Ticaret Hukuku" },
      { code: "401", name: "Uluslararası Hukuk" },
      { code: "402", name: "İş ve Sosyal Güvenlik Hukuku" },
    ],
  },
  Psikoloji: {
    topics: [
      "Gelişim Psikolojisi",
      "Bilişsel Psikoloji",
      "Sosyal Psikoloji",
      "Klinik Psikoloji",
      "Davranışsal Psikoloji",
      "Nöropsikoloji",
      "Eğitim Psikolojisi",
      "Endüstriyel Psikoloji",
      "Aile Psikolojisi",
      "Test Geliştirme",
      "Psikometri",
      "Anormal Psikoloji",
    ],
    courses: [
      { code: "101", name: "Psikolojiye Giriş" },
      { code: "201", name: "Gelişim Psikolojisi" },
      { code: "202", name: "Bilişsel Psikoloji" },
      { code: "203", name: "Sosyal Psikoloji" },
      { code: "301", name: "Klinik Psikoloji" },
      { code: "302", name: "Deneysel Psikoloji" },
      { code: "303", name: "Psikolojide İstatistik" },
      { code: "401", name: "Psikolojik Değerlendirme" },
      { code: "402", name: "Anormal Psikoloji" },
    ],
  },
  Mimarlık: {
    topics: [
      "Mimari Tasarım",
      "Yapı Bilgisi",
      "Şehir Planlama",
      "Sürdürülebilir Tasarım",
      "Mimari Tarih",
      "İç Mimari",
      "Peyzaj Tasarımı",
      "Yapı Statiği",
      "BIM",
      "Tarihsel Yapılar",
      "Akıllı Bina Sistemleri",
      "Restorasyon",
    ],
    courses: [
      { code: "101", name: "Mimari Tasarıma Giriş" },
      { code: "201", name: "Yapı Bilgisi I" },
      { code: "202", name: "Mimari Çizim" },
      { code: "203", name: "Mimari Tarih I" },
      { code: "301", name: "Yapı Statiği" },
      { code: "302", name: "Şehircilik" },
      { code: "303", name: "Sürdürülebilir Mimari" },
      { code: "401", name: "Mimari Proje" },
    ],
  },
};

// İktisat = Ekonomi (alias)
DEPARTMENT_PROFILES["İktisat"] = DEPARTMENT_PROFILES["Ekonomi"];

// Yazılım Mühendisliği = Bilgisayar Mühendisliği (büyük örtüşme)
DEPARTMENT_PROFILES["Yazılım Mühendisliği"] = DEPARTMENT_PROFILES["Bilgisayar Mühendisliği"];

// Elektrik / Elektronik varyantları
DEPARTMENT_PROFILES["Elektrik Mühendisliği"] = DEPARTMENT_PROFILES["Elektrik-Elektronik Mühendisliği"];
DEPARTMENT_PROFILES["Elektronik Mühendisliği"] = DEPARTMENT_PROFILES["Elektrik-Elektronik Mühendisliği"];
DEPARTMENT_PROFILES["Elektronik ve Haberleşme Mühendisliği"] = DEPARTMENT_PROFILES["Elektrik-Elektronik Mühendisliği"];

// Havacılık varyantları
const AERO_PROFILE: DeptProfile = {
  topics: [
    "Aerodinamik",
    "Uçak Yapı Analizi",
    "Jet Motorları",
    "Uçuş Mekaniği",
    "Aviyonik",
    "Uçak Tasarımı",
    "Kompozit Malzemeler",
    "Uzay Sistemleri",
    "Roket Teknolojisi",
    "Hava Aracı Sistemleri",
  ],
  courses: [
    { code: "101", name: "Havacılığa Giriş" },
    { code: "201", name: "Aerodinamik I" },
    { code: "301", name: "Uçak Yapıları" },
    { code: "302", name: "Jet Motorları" },
    { code: "401", name: "Uçak Tasarımı" },
  ],
};
DEPARTMENT_PROFILES["Havacılık ve Uzay Mühendisliği"] = AERO_PROFILE;
DEPARTMENT_PROFILES["Havacılık Mühendisliği"] = AERO_PROFILE;
DEPARTMENT_PROFILES["Uçak Mühendisliği"] = AERO_PROFILE;
DEPARTMENT_PROFILES["Havacılık ve Uzay Bilimleri"] = AERO_PROFILE;

// Diğer mühendislik bölümleri için ortak profil
const GENERIC_ENG_PROFILE: DeptProfile = {
  topics: [
    "Mühendislik Matematiği",
    "Termodinamik",
    "Statik ve Dinamik",
    "Malzeme Bilimi",
    "Mühendislik Ekonomisi",
    "Tasarım Yöntemleri",
    "Sistem Analizi",
    "Kalite Kontrol",
    "Proje Yönetimi",
    "Sürdürülebilirlik",
  ],
  courses: [
    { code: "101", name: "Mühendisliğe Giriş" },
    { code: "201", name: "Mühendislik Matematiği" },
    { code: "202", name: "Mühendislik Mekaniği" },
    { code: "301", name: "Tasarım Esasları" },
    { code: "302", name: "Mesleki Uygulamalar" },
    { code: "401", name: "Mühendislik Projesi" },
  ],
};

const ENG_DEPTS = [
  "İnşaat Mühendisliği", "Kimya Mühendisliği", "Çevre Mühendisliği", "Gıda Mühendisliği",
  "Biyomedikal Mühendisliği", "Mekatronik Mühendisliği", "Maden Mühendisliği",
  "Orman Mühendisliği", "Ziraat Mühendisliği", "Matematik Mühendisliği",
  "Fizik Mühendisliği", "Malzeme Bilimi ve Nano Mühendislik",
  "Kimya ve Biyoloji Mühendisliği", "Deniz Ulaştırma İşletme Mühendisliği",
];
for (const d of ENG_DEPTS) DEPARTMENT_PROFILES[d] = GENERIC_ENG_PROFILE;

// Fen bilimleri
const SCIENCE_PROFILE: DeptProfile = {
  topics: [
    "Genel Kimya", "Organik Kimya", "Hücre Biyolojisi", "Genetik", "Mikrobiyoloji",
    "Biyokimya", "Moleküler Biyoloji", "Ekoloji", "Fizyoloji", "İstatistiksel Analiz",
  ],
  courses: [
    { code: "101", name: "Genel Bilim I" },
    { code: "201", name: "Laboratuvar Yöntemleri" },
    { code: "301", name: "İleri Konular" },
    { code: "401", name: "Araştırma Projesi" },
  ],
};
DEPARTMENT_PROFILES["Biyoloji"] = SCIENCE_PROFILE;
DEPARTMENT_PROFILES["Biyolojik Bilimler"] = SCIENCE_PROFILE;
DEPARTMENT_PROFILES["Kimya"] = SCIENCE_PROFILE;
DEPARTMENT_PROFILES["Moleküler Biyoloji ve Genetik"] = SCIENCE_PROFILE;
DEPARTMENT_PROFILES["Moleküler Biyoloji, Genetik ve Biyomühendislik"] = SCIENCE_PROFILE;
DEPARTMENT_PROFILES["İstatistik"] = {
  topics: [
    "Olasılık Teorisi", "Hipotez Testleri", "Regresyon Analizi", "Bayes İstatistiği",
    "Çok Değişkenli Analiz", "Zaman Serisi", "Stokastik Süreçler", "Örnekleme Teorisi",
  ],
  courses: [
    { code: "101", name: "İstatistiğe Giriş" },
    { code: "201", name: "Olasılık" },
    { code: "301", name: "Regresyon Analizi" },
    { code: "401", name: "Çok Değişkenli İstatistik" },
  ],
};

// Sağlık bilimleri
DEPARTMENT_PROFILES["Diş Hekimliği"] = {
  topics: [
    "Diş Anatomisi", "Periodontoloji", "Ortodonti", "Endodonti", "Pedodonti",
    "Cerrahi", "Restoratif Diş Tedavisi", "Protez", "Radyoloji", "Halk Sağlığı",
  ],
  courses: [
    { code: "101", name: "Diş Anatomisi" },
    { code: "201", name: "Klinik Bilimler" },
    { code: "301", name: "Restoratif Diş Tedavisi" },
    { code: "401", name: "Klinik Uygulamalar" },
  ],
};
DEPARTMENT_PROFILES["Eczacılık"] = {
  topics: [
    "Farmakoloji", "Farmasötik Kimya", "Farmasötik Teknoloji", "Klinik Eczacılık",
    "Farmakognozi", "Toksikoloji", "Biyokimya", "İlaç Etkileşimleri",
  ],
  courses: [
    { code: "101", name: "Eczacılığa Giriş" },
    { code: "201", name: "Farmasötik Kimya" },
    { code: "301", name: "Farmakoloji" },
    { code: "401", name: "Klinik Eczacılık" },
  ],
};
DEPARTMENT_PROFILES["Veteriner"] = {
  topics: [
    "Veteriner Anatomisi", "Hayvan Fizyolojisi", "İç Hastalıkları", "Cerrahi",
    "Mikrobiyoloji", "Patoloji", "Doğum ve Jinekoloji", "Halk Sağlığı",
  ],
  courses: [
    { code: "101", name: "Veteriner Anatomisi" },
    { code: "201", name: "Hayvan Fizyolojisi" },
    { code: "301", name: "İç Hastalıkları" },
    { code: "401", name: "Veteriner Cerrahi" },
  ],
};

// Sosyal bilimler
const SOC_PROFILE: DeptProfile = {
  topics: [
    "Araştırma Yöntemleri", "Klasik Teoriler", "Modern Yaklaşımlar", "Türkiye Örnekleri",
    "Karşılaştırmalı Analiz", "Etik", "Toplumsal Değişim", "Kavramsal Çerçeveler",
  ],
  courses: [
    { code: "101", name: "Bölüme Giriş" },
    { code: "201", name: "Temel Kavramlar" },
    { code: "301", name: "Araştırma Yöntemleri" },
    { code: "401", name: "Bitirme Çalışması" },
  ],
};
DEPARTMENT_PROFILES["Sosyoloji"] = SOC_PROFILE;
DEPARTMENT_PROFILES["Tarih"] = SOC_PROFILE;
DEPARTMENT_PROFILES["Türk Dili ve Edebiyatı"] = SOC_PROFILE;
DEPARTMENT_PROFILES["İlahiyat"] = SOC_PROFILE;
DEPARTMENT_PROFILES["Sınıf Öğretmenliği"] = SOC_PROFILE;
DEPARTMENT_PROFILES["Müzik"] = SOC_PROFILE;
DEPARTMENT_PROFILES["Siyaset Bilimi ve Kamu Yönetimi"] = {
  topics: [
    "Siyaset Bilimi", "Kamu Yönetimi", "Anayasa Hukuku", "Karşılaştırmalı Siyaset",
    "Türk Siyasal Hayatı", "Uluslararası İlişkiler", "Yerel Yönetimler", "Kamu Politikası",
  ],
  courses: [
    { code: "101", name: "Siyaset Bilimine Giriş" },
    { code: "201", name: "Kamu Yönetimi" },
    { code: "301", name: "Türk Siyasal Hayatı" },
    { code: "401", name: "Karşılaştırmalı Siyaset" },
  ],
};
DEPARTMENT_PROFILES["Uluslararası İlişkiler"] = {
  topics: [
    "Uluslararası İlişkiler Teorisi", "Diplomasi Tarihi", "Türk Dış Politikası",
    "Uluslararası Hukuk", "Uluslararası Örgütler", "Bölgesel Çalışmalar", "Güvenlik Çalışmaları",
  ],
  courses: [
    { code: "101", name: "Uluslararası İlişkiler I" },
    { code: "201", name: "Diplomasi Tarihi" },
    { code: "301", name: "Türk Dış Politikası" },
    { code: "401", name: "Uluslararası Hukuk" },
  ],
};

// Diğer
DEPARTMENT_PROFILES["Şehir ve Bölge Planlama"] = DEPARTMENT_PROFILES["Mimarlık"];
DEPARTMENT_PROFILES["Lojistik Yönetimi"] = DEPARTMENT_PROFILES["İşletme"];
DEPARTMENT_PROFILES["İşletme Yönetimi"] = DEPARTMENT_PROFILES["İşletme"];
DEPARTMENT_PROFILES["Turist Rehberliği"] = DEPARTMENT_PROFILES["İşletme"];
DEPARTMENT_PROFILES["Moda Tasarımı"] = DEPARTMENT_PROFILES["Mimarlık"];
DEPARTMENT_PROFILES["Güvenlik Bilimleri"] = SOC_PROFILE;

// Generic catch-all fallback for any remaining departments
function getProfile(deptName: string): DeptProfile {
  if (DEPARTMENT_PROFILES[deptName]) return DEPARTMENT_PROFILES[deptName];
  // Heuristic by suffix
  if (deptName.endsWith("Mühendisliği")) return GENERIC_ENG_PROFILE;
  if (deptName.includes("Bilim")) return SCIENCE_PROFILE;
  return SOC_PROFILE;
}

// ============================================================================
// İSİM HAVUZLARI
// ============================================================================

const FIRST_NAMES_M = [
  "Mehmet", "Ahmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İbrahim", "İsmail",
  "Murat", "Osman", "Yusuf", "Emre", "Burak", "Serkan", "Cem", "Kerem",
  "Onur", "Cenk", "Tolga", "Selim", "Ozan", "Barış", "Erdem", "Levent",
  "Eren", "Berk", "Halil", "Mert", "Tarık", "Volkan", "Tuncay", "Sinan",
  "Korhan", "Doruk", "Kaan", "Çağlar", "Bora", "Görkem", "Hakan", "Süleyman",
  "Recep", "Yavuz", "Erol", "Bülent", "Ferhat", "Caner",
];

const FIRST_NAMES_F = [
  "Ayşe", "Fatma", "Emine", "Zeynep", "Hatice", "Merve", "Elif", "Sevgi",
  "Esra", "Pınar", "Selin", "Ceren", "Gizem", "Aslı", "Burcu", "Deniz",
  "Ece", "Gül", "Hande", "Nazlı", "Özlem", "Sevda", "Tülay", "Yasemin",
  "Zehra", "Buse", "Cansu", "Nehir", "Sena", "Tuğba", "Beste", "Ezgi",
  "İlayda", "Melisa", "Nilgün", "Sema", "Şule", "Tuba", "Yıldız", "Banu",
  "Begüm", "Defne", "Gamze", "Hilal", "Müge", "Sibel",
];

const LAST_NAMES = [
  "Yılmaz", "Kaya", "Demir", "Şahin", "Çelik", "Yıldız", "Yıldırım", "Öztürk",
  "Aydın", "Özdemir", "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Korkmaz",
  "Çakır", "Erdoğan", "Polat", "Türk", "Bulut", "Acar", "Erdem", "Kara",
  "Karaca", "Kurt", "Özkan", "Aksoy", "Tekin", "Sezer", "Köse", "Güneş",
  "Avcı", "Yavuz", "Pekin", "Aktaş", "Tunç", "Topçu", "Altun", "Akın",
  "Erol", "Ertem", "Tan", "Üstün", "Soylu", "Karadağ", "Alkan", "Soydan",
  "Güler", "Şentürk", "Saraç", "Önal", "Türker", "Yalçın", "Eroğlu", "Çoban",
];

const TITLES = ["Prof. Dr.", "Doç. Dr.", "Dr. Öğr. Üyesi"];
const TITLE_WEIGHTS = [0.35, 0.35, 0.3];

// ============================================================================
// GERÇEK VERİ OVERRIDE'LARI
// Belirli üniversite + bölüm için bilinen gerçek profesör ve dersler.
// Bu bölümler için rastgele kurgusal kayıt ÜRETİLMEZ; sadece buradaki kayıtlar oluşur.
// ============================================================================

interface RealOverride {
  university: string;
  department: string;
  professors: Array<{
    name: string;
    courses: Array<{ code: string; name: string }>;
  }>;
}

const REAL_OVERRIDES: RealOverride[] = [
  {
    university: "İstanbul Aydın Üniversitesi",
    department: "Yazılım Geliştirme (İngilizce)",
    professors: [
      {
        name: "Doç. Dr. Burçin Kaplan",
        courses: [{ code: "UMI332", name: "Research Methodology" }],
      },
      {
        name: "Dr. Öğr. Üyesi Kağan Okatan",
        courses: [{ code: "UYG314", name: "Data Mining and Business Intelligence" }],
      },
      {
        name: "Dr. Öğr. Üyesi Özlem Öztürk",
        courses: [{ code: "UYG316", name: "Statistical Analysis on Data Science" }],
      },
      {
        name: "Prof. Dr. Ali Okatan",
        courses: [{ code: "UYG332", name: "Image Processing" }],
      },
      {
        name: "Dr. Öğr. Üyesi Peri Güneş",
        courses: [{ code: "UYG338", name: "Software Project Management" }],
      },
      {
        name: "Prof. Dr. Ali Güneş",
        courses: [{ code: "YUM304", name: "Work Placement-II" }],
      },
    ],
  },
];

const OVERRIDDEN_DEPTS = new Set(
  REAL_OVERRIDES.map((o) => `${o.university}::${o.department}`)
);

function isOverridden(uni: string, dept: string): boolean {
  return OVERRIDDEN_DEPTS.has(`${uni}::${dept}`);
}

// ============================================================================
// TÜRKÇE DEĞERLENDİRME YORUMLARI
// ============================================================================

const RATING_COMMENTS_TR: (string | null)[] = [
  "Çok adil bir hoca, sınav soruları derste işlediklerimizden geliyor. Kesinlikle tavsiye ederim.",
  "Sınavları zor ama anlattığı konuları gerçekten çok iyi öğretiyor. Office hours'a mutlaka gidin.",
  "Sürpriz sorular yapmıyor, ne çalışmamız gerektiğini açıkça söylüyor. Şeffaf bir hoca.",
  "Genelde uzun problemler veriyor, zaman yönetimi çok önemli. Önceki sınavlara çalışın.",
  "Çoktan seçmeli ve klasik dengesi iyi. Konsept anlamadıysanız iki türünde de yapamazsınız.",
  "Notlama biraz katı ama sorular gayet adil. Yarım puan için üzülmek yok.",
  "Anlatımı çok iyi, derste anlamadığınızı sormaktan çekinmeyin. Soru sevdiği belli.",
  "Sınavlarda kavramsal sorular çok, ezbere çalışmak işe yaramıyor. Anlamak şart.",
  "Vize ve final birbirine benzer formatta, bir kere alıştıktan sonra rahat ediyorsunuz.",
  "Quiz'leri ciddiye alıyor, dönem boyu düzenli çalışmak şart. Son hafta boğulursunuz.",
  "Office hours'ı ihmal etmeyin, sınavda ne gelecek hakkında değerli ipuçları var.",
  "Ders kitabını mutlaka takip edin, sınav sorularının çoğu direkt oradan geliyor.",
  "Pratiğe çok önem veriyor, lab ödevlerini iyi yapın. Final notuna büyük katkısı var.",
  "Yazılı sınavlarda gerekçeleme istiyor, sadece doğru cevap yetmiyor. Yöntem önemli.",
  "Bonus sorular yapıyor, fırsatı kaçırmayın. Genelde dersin ileri konularından oluyor.",
  "Programlama ödevleri çok ağır ama gerçekten öğretici. Sabırlı olmak lazım.",
  "İnce ayrıntılara dikkat ediyor, ders notlarını eksiksiz takip edin.",
  "Sınav süresi yetiyor ama çok düşünmek gerekiyor. Pratik yapan rahat eder.",
  "Açık uçlu sorularda yorum istiyor, ezber işe yaramaz. Gerçekten anlamış olmak şart.",
  "Online materyalleri çok faydalı, mutlaka çalışın. Slaytlar yetersiz kalıyor bazen.",
  "Çok zor ama haklı bir hoca, gerçekten konuyu öğretiyor. Notu hak edenler alıyor.",
  "Vize zor, final daha kolay. Vizeye iyi çalışın, finalde rahat olur.",
  "Ödevler ders saatinden uzun sürüyor, planlama yapın. Birden fazla derse zaman ayırın.",
  "Hocanın anlatım hızı yüksek, derste çok yoğun olur. Önceden konuya bakmak iyi.",
  "Sınavda kalem-kağıt yetmez, hesap makinesi getirin. Hesaplamalar yoğun.",
  "Grup projesi var, takım arkadaşı seçimi çok önemli. Aktif birileri ile çalışın.",
  "Sınavdan önce review session yapıyor, mutlaka katılın. Çok faydalı oluyor.",
  "Bazı sorular trick var, dikkatli okuyun. Anladığınızdan emin olmadan başlamayın.",
  "Hocanın beklentileri net, ne istediğini açıkça söylüyor. Belirsizlik yok.",
  "Geçen yıllara göre sınav formatı değişti, eski sınavlara güvenmeyin tek başına.",
  null,
  null,
  null,
];

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomElements<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const r = Math.random();
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r < acc) return items[i];
  }
  return items[items.length - 1];
}

function generateProfessorName(usedNames: Set<string>): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    const isMale = Math.random() < 0.55;
    const first = randomElement(isMale ? FIRST_NAMES_M : FIRST_NAMES_F);
    const last = randomElement(LAST_NAMES);
    const title = weightedPick(TITLES, TITLE_WEIGHTS);
    const full = `${title} ${first} ${last}`;
    if (!usedNames.has(full)) {
      usedNames.add(full);
      return full;
    }
  }
  // Fallback (extremely unlikely)
  return `Dr. Öğr. Üyesi ${randomElement(FIRST_NAMES_M)} ${randomElement(LAST_NAMES)} ${Date.now()}`;
}

function generateQuestionTypes() {
  const mc = randomInt(20, 60);
  const tf = randomInt(10, Math.min(40, 100 - mc));
  const oe = 100 - mc - tf;
  return {
    "Multiple Choice": mc,
    "Classic/Open-ended": oe,
    "True/False": tf,
  };
}

function generateTopicDistribution(topics: string[]) {
  const numTopics = Math.min(randomInt(3, 6), topics.length);
  const selected = randomElements(topics, numTopics);
  const dist: Record<string, number> = {};
  let remaining = 100;
  for (let i = 0; i < selected.length; i++) {
    if (i === selected.length - 1) {
      dist[selected[i]] = remaining;
    } else {
      const maxShare = remaining - (selected.length - i - 1) * 5;
      const share = randomInt(10, Math.min(40, Math.max(10, maxShare)));
      dist[selected[i]] = share;
      remaining -= share;
    }
  }
  return dist;
}

function generateSummary(
  questionCount: number,
  difficulty: number,
  courseName: string,
  topics: string[],
  questionTypes: Record<string, number>
): string {
  const diffLabel =
    difficulty <= 4
      ? "kolay"
      : difficulty <= 6
      ? "orta zorlukta"
      : difficulty <= 7.5
      ? "zor"
      : "çok zor";

  const topTopics = Object.entries(
    topics.reduce<Record<string, number>>((acc, t) => {
      acc[t] = 1;
      return acc;
    }, {})
  )
    .map(([t]) => t)
    .slice(0, 3);

  const dominantType = Object.entries(questionTypes).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const dominantTypeTr =
    dominantType === "Multiple Choice"
      ? "çoktan seçmeli"
      : dominantType === "True/False"
      ? "doğru-yanlış"
      : "klasik açık uçlu";

  return (
    `Bu ${courseName} sınavı ${questionCount} sorudan oluşmaktadır ve ` +
    `genel olarak ${diffLabel} seviyededir (${difficulty.toFixed(1)}/10). ` +
    `Ağırlıklı olarak ${dominantTypeTr} sorular kullanılmıştır. ` +
    `Özellikle ${topTopics.join(", ")} konuları ön plandadır. ` +
    `Öğrencilerin temel kavramları kavraması ve dönem boyu düzenli çalışması ` +
    `başarı için kritiktir.`
  );
}

// ============================================================================
// ANA SEED
// ============================================================================

async function main() {
  console.log("🌱 ProfAI seed başlıyor — İstanbul üniversiteleri demo verisi\n");
  const startTime = Date.now();

  // -- Temizlik --
  console.log("🧹 Mevcut veriler temizleniyor...");
  await prisma.examAnalysis.deleteMany();
  await prisma.professorRating.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.course.deleteMany();
  await prisma.professor.deleteMany();
  await prisma.user.deleteMany();

  // -- Kullanıcılar --
  console.log("👥 Demo öğrenci kullanıcılar oluşturuluyor...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const usersData = [
    { email: "erdemacar1@stu.aydin.edu.tr", name: "Erdem Acar", university: "İstanbul Aydın Üniversitesi", department: "Bilgisayar Mühendisliği" },
    { email: "demo@profai.com", name: "Demo Öğrenci", university: "Yıldız Teknik Üniversitesi", department: "Bilgisayar Mühendisliği" },
    { email: "ali@bogazici.edu.tr", name: "Ali Şahin", university: "Boğaziçi Üniversitesi", department: "Bilgisayar Mühendisliği" },
    { email: "ayse@itu.edu.tr", name: "Ayşe Yılmaz", university: "İstanbul Teknik Üniversitesi", department: "Elektrik-Elektronik Mühendisliği" },
    { email: "mehmet@marmara.edu.tr", name: "Mehmet Demir", university: "Marmara Üniversitesi", department: "İşletme" },
    { email: "zeynep@ku.edu.tr", name: "Zeynep Kaya", university: "Koç Üniversitesi", department: "Endüstri Mühendisliği" },
    { email: "burak@sabanciuniv.edu", name: "Burak Çelik", university: "Sabancı Üniversitesi", department: "Bilgisayar Mühendisliği" },
    { email: "elif@bahcesehir.edu.tr", name: "Elif Aydın", university: "Bahçeşehir Üniversitesi", department: "Tıp" },
    { email: "emre@ozyegin.edu.tr", name: "Emre Yıldız", university: "Özyeğin Üniversitesi", department: "Bilgisayar Mühendisliği" },
    { email: "selin@bilgi.edu.tr", name: "Selin Doğan", university: "İstanbul Bilgi Üniversitesi", department: "Hukuk" },
    { email: "kerem@yeditepe.edu.tr", name: "Kerem Öztürk", university: "Yeditepe Üniversitesi", department: "Psikoloji" },
  ];

  const users = await Promise.all(
    usersData.map((u) =>
      prisma.user.create({ data: { ...u, password: passwordHash } })
    )
  );
  console.log(`   ✓ ${users.length} kullanıcı oluşturuldu\n`);

  // -- Profesörler --
  console.log("👨‍🏫 Profesörler oluşturuluyor...");
  const usedNames = new Set<string>();
  type ProfRecord = { id: string; name: string; dept: string; uni: string };
  const allProfessors: ProfRecord[] = [];

  for (const uni of UNIVERSITIES) {
    for (const dept of uni.departments) {
      // Skip overridden depts — handled in real-overrides pass below
      if (isOverridden(uni.name, dept.name)) continue;

      const profCount = randomInt(2, 4); // 200 üni × 7 dept × 3 = ~4000 prof
      const batch = [];
      for (let i = 0; i < profCount; i++) {
        batch.push(generateProfessorName(usedNames));
      }
      const created = await Promise.all(
        batch.map((name) =>
          prisma.professor.create({
            data: {
              name,
              department: dept.name,
              university: uni.name,
            },
          })
        )
      );
      created.forEach((p) =>
        allProfessors.push({
          id: p.id,
          name: p.name,
          dept: dept.name,
          uni: uni.name,
        })
      );
    }
  }
  console.log(`   ✓ ${allProfessors.length} kurgusal profesör oluşturuldu`);

  // -- Real overrides: known professors with their actual courses --
  let realProfCount = 0;
  let realCourseCount = 0;
  type CourseRecord = { id: string; name: string; dept: string; profName: string; uni: string };
  const allCourses: CourseRecord[] = [];

  for (const override of REAL_OVERRIDES) {
    for (const profDef of override.professors) {
      const prof = await prisma.professor.create({
        data: {
          name: profDef.name,
          department: override.department,
          university: override.university,
        },
      });
      allProfessors.push({
        id: prof.id,
        name: prof.name,
        dept: override.department,
        uni: override.university,
      });
      realProfCount++;

      for (const courseDef of profDef.courses) {
        const course = await prisma.course.create({
          data: {
            name: courseDef.name,
            code: courseDef.code,
            professorId: prof.id,
          },
        });
        allCourses.push({
          id: course.id,
          name: course.name,
          dept: override.department,
          profName: prof.name,
          uni: override.university,
        });
        realCourseCount++;
      }
    }
  }
  console.log(`   ✓ ${realProfCount} gerçek profesör + ${realCourseCount} ders eklendi (override)\n`);

  // -- Dersler (kurgusal profesörler için) --
  console.log("📚 Kurgusal dersler oluşturuluyor...");

  for (const uni of UNIVERSITIES) {
    for (const dept of uni.departments) {
      // Skip overridden depts — courses already created above
      if (isOverridden(uni.name, dept.name)) continue;

      const profile = getProfile(dept.name);

      const profsInDept = allProfessors.filter(
        (p) => p.uni === uni.name && p.dept === dept.name
      );

      for (const prof of profsInDept) {
        const numCourses = randomInt(2, 3);
        const courseTemplates = randomElements(profile.courses, numCourses);

        const created = await Promise.all(
          courseTemplates.map((tpl) =>
            prisma.course.create({
              data: {
                name: tpl.name,
                code: `${dept.prefix}${tpl.code}`,
                professorId: prof.id,
              },
            })
          )
        );

        created.forEach((c) =>
          allCourses.push({
            id: c.id,
            name: c.name,
            dept: dept.name,
            profName: prof.name,
            uni: uni.name,
          })
        );
      }
    }
  }
  console.log(`   ✓ ${allCourses.length} ders oluşturuldu\n`);

  // -- Sınavlar ve analizler --
  console.log("📝 Sınavlar ve analizler oluşturuluyor (biraz sürebilir)...");
  const examTypes: ExamType[] = ["MIDTERM", "FINAL", "MAKEUP"];
  const semesters = ["Güz", "Bahar", "Yaz"];
  const years = [2022, 2023, 2024, 2025, 2026];

  let examCount = 0;
  for (const course of allCourses) {
    const numExams = randomInt(1, 2);
    const profile = getProfile(course.dept);

    const examPromises = [];
    for (let i = 0; i < numExams; i++) {
      const questionCount = randomInt(8, 25);
      const questionTypes = generateQuestionTypes();
      const topicDistribution = generateTopicDistribution(profile.topics);
      const difficultyScore = randomFloat(3.5, 8.8);
      const summary = generateSummary(
        questionCount,
        difficultyScore,
        course.name,
        Object.keys(topicDistribution),
        questionTypes
      );

      examPromises.push(
        prisma.exam
          .create({
            data: {
              courseId: course.id,
              examType: randomElement(examTypes),
              year: randomElement(years),
              semester: randomElement(semesters),
              fileUrl: `/uploads/sample-${course.id.slice(0, 8)}-${i}.pdf`,
              uploadedById: randomElement(users).id,
            },
          })
          .then((exam) =>
            prisma.examAnalysis.create({
              data: {
                examId: exam.id,
                questionCount,
                questionTypes,
                topicDistribution,
                difficultyScore,
                summary,
              },
            })
          )
      );
    }
    await Promise.all(examPromises);
    examCount += numExams;
  }
  console.log(`   ✓ ${examCount} sınav + analiz oluşturuldu\n`);

  // -- Değerlendirmeler --
  console.log("⭐ Değerlendirmeler oluşturuluyor...");
  let ratingCount = 0;
  for (const prof of allProfessors) {
    const numRatings = randomInt(2, 10);
    const ratingPromises = [];
    for (let i = 0; i < numRatings; i++) {
      ratingPromises.push(
        prisma.professorRating.create({
          data: {
            professorId: prof.id,
            userId: randomElement(users).id,
            difficultyScore: randomInt(2, 5),
            fairnessScore: randomInt(2, 5),
            comment: randomElement(RATING_COMMENTS_TR),
          },
        })
      );
    }
    await Promise.all(ratingPromises);
    ratingCount += numRatings;
  }
  console.log(`   ✓ ${ratingCount} değerlendirme oluşturuldu\n`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Seed tamamlandı (${elapsed}s)\n`);
  console.log(`📊 Özet:`);
  console.log(`   • ${UNIVERSITIES.length} üniversite`);
  console.log(`   • ${allProfessors.length} profesör`);
  console.log(`   • ${allCourses.length} ders`);
  console.log(`   • ${examCount} sınav (her biri analizli)`);
  console.log(`   • ${ratingCount} değerlendirme`);
  console.log(`   • ${users.length} demo kullanıcı`);
  console.log(`\n🔑 Test girişleri (şifre: password123):`);
  console.log(`   • erdemacar1@stu.aydin.edu.tr`);
  console.log(`   • demo@profai.com`);
  console.log(`   • ali@bogazici.edu.tr`);
  console.log(`   • zeynep@ku.edu.tr`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
