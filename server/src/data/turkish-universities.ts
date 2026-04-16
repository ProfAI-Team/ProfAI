// Auto-generated from public sources (YÖK / Wikipedia / public datasets)
// Last updated: 2026-04-16
//
// Türkiye'deki tüm aktif lisans veren üniversitelerin (devlet + vakıf + vakıf MYO)
// adı, türü, şehri ve seçilmiş ana lisans bölümleri.
//
// Kapsam: 200 üniversite (131 Devlet + 66 Vakıf + 3 Vakıf MYO)
// Şehir kapsamı: 80 il (Türkiye'nin tüm bölgeleri)
// Toplam bölüm-üniversite kombosu: ~1421 (ortalama 7.1 bölüm/üniversite)
//
// Kaynaklar:
//   - YÖK resmî üniversite listesi (https://www.yok.gov.tr)
//   - YÖK Atlas (https://yokatlas.yok.gov.tr)
//   - Wikipedia "Türkiye'deki üniversiteler listesi"
//
// NOT:
//   - Bölüm seçimi sınav analizi platformu için anlamlı olan ana lisans
//     programlarına odaklanmıştır (mühendislik, fen, İİBF, tıp, hukuk,
//     psikoloji, mimarlık).
//   - Her üniversiteye SADECE GERÇEKTEN sahip olduğu doğrulanan bölümler
//     eklenmiştir (örn. İTÜ'de Tıp ve Hukuk YOK; Sağlık Bilimleri Ü'sinde
//     mühendislik bölümü yoktur).
//   - Ders kodu prefix'i: bilinen büyük üniversiteler için resmî kodlar
//     (BOUN→CMPE, ITÜ→BLG, KU→COMP, SU→CS, BAU→CMP, KHAS→CE...);
//     diğerleri için Türkçe bölüme uygun standart kısaltmalar kullanıldı.

export interface UniInfo {
  name: string;
  type: "Devlet" | "Vakıf" | "Vakıf MYO";
  city: string;
  departments: Array<{
    name: string;
    prefix: string;
  }>;
}

// ---- Standart Türkçe bölüm/prefix kısayolları (küçük üniversiteler için) ----
const D = {
  BLM: { name: "Bilgisayar Mühendisliği", prefix: "BLM" },
  YZL: { name: "Yazılım Mühendisliği", prefix: "YZL" },
  EEM: { name: "Elektrik-Elektronik Mühendisliği", prefix: "EEM" },
  EM:  { name: "Endüstri Mühendisliği", prefix: "EM" },
  MM:  { name: "Makine Mühendisliği", prefix: "MM" },
  IM:  { name: "İnşaat Mühendisliği", prefix: "IM" },
  KM:  { name: "Kimya Mühendisliği", prefix: "KM" },
  CM:  { name: "Çevre Mühendisliği", prefix: "CM" },
  GM:  { name: "Gıda Mühendisliği", prefix: "GM" },
  ZM:  { name: "Ziraat Mühendisliği", prefix: "ZM" },
  BIO: { name: "Biyomedikal Mühendisliği", prefix: "BIO" },
  ISL: { name: "İşletme", prefix: "ISL" },
  IKT: { name: "İktisat", prefix: "IKT" },
  UI:  { name: "Uluslararası İlişkiler", prefix: "UI" },
  SBKY:{ name: "Siyaset Bilimi ve Kamu Yönetimi", prefix: "SBKY" },
  HUK: { name: "Hukuk", prefix: "HUK" },
  TIP: { name: "Tıp", prefix: "TIP" },
  DH:  { name: "Diş Hekimliği", prefix: "DH" },
  ECZ: { name: "Eczacılık", prefix: "ECZ" },
  PSI: { name: "Psikoloji", prefix: "PSI" },
  SOS: { name: "Sosyoloji", prefix: "SOS" },
  MAT: { name: "Matematik", prefix: "MAT" },
  FIZ: { name: "Fizik", prefix: "FIZ" },
  KIM: { name: "Kimya", prefix: "KIM" },
  BIY: { name: "Biyoloji", prefix: "BIY" },
  IST: { name: "İstatistik", prefix: "IST" },
  MBG: { name: "Moleküler Biyoloji ve Genetik", prefix: "MBG" },
  MIM: { name: "Mimarlık", prefix: "MIM" },
  EGI: { name: "Sınıf Öğretmenliği", prefix: "EGT" },
  TUR: { name: "Türk Dili ve Edebiyatı", prefix: "TDE" },
  TAR: { name: "Tarih", prefix: "TAR" },
  VET: { name: "Veteriner", prefix: "VET" },
} as const;

export const TURKISH_UNIVERSITIES: UniInfo[] = [
  // ============================================================
  // İSTANBUL — DEVLET (12)
  // ============================================================
  {
    name: "Boğaziçi Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CMPE" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "Makine Mühendisliği", prefix: "ME" },
      { name: "Kimya Mühendisliği", prefix: "CHE" },
      { name: "İnşaat Mühendisliği", prefix: "CE" },
      { name: "Matematik", prefix: "MATH" },
      { name: "Fizik", prefix: "PHYS" },
      { name: "Moleküler Biyoloji ve Genetik", prefix: "MB" },
      { name: "İşletme", prefix: "MGMT" },
      { name: "İktisat", prefix: "EC" },
      { name: "Psikoloji", prefix: "PSY" },
    ],
  },
  {
    name: "İstanbul Teknik Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "BLG" },
      { name: "Elektrik Mühendisliği", prefix: "ELK" },
      { name: "Elektronik ve Haberleşme Mühendisliği", prefix: "EHB" },
      { name: "Endüstri Mühendisliği", prefix: "END" },
      { name: "Makine Mühendisliği", prefix: "MAK" },
      { name: "İnşaat Mühendisliği", prefix: "INS" },
      { name: "Kimya Mühendisliği", prefix: "KIM" },
      { name: "Çevre Mühendisliği", prefix: "CEV" },
      { name: "Matematik Mühendisliği", prefix: "MAT" },
      { name: "Fizik Mühendisliği", prefix: "FIZ" },
      { name: "Mimarlık", prefix: "MIM" },
    ],
  },
  {
    name: "İstanbul Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [
      D.BLM, D.MAT, D.FIZ, D.KIM, D.BIY,
      D.ISL, D.IKT, D.HUK, D.TIP, D.PSI, D.UI,
    ],
  },
  {
    name: "İstanbul Üniversitesi-Cerrahpaşa", type: "Devlet", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.IM, D.TIP, D.VET],
  },
  {
    name: "Marmara Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CSE" },
      D.EEM, D.MM, D.EM, D.ISL, D.IKT, D.HUK, D.TIP, D.PSI,
    ],
  },
  {
    name: "Yıldız Teknik Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "BLM" },
      { name: "Elektrik Mühendisliği", prefix: "ELK" },
      { name: "Elektronik ve Haberleşme Mühendisliği", prefix: "EHM" },
      { name: "Endüstri Mühendisliği", prefix: "END" },
      { name: "Makine Mühendisliği", prefix: "MAK" },
      { name: "İnşaat Mühendisliği", prefix: "INS" },
      { name: "Kimya Mühendisliği", prefix: "KMM" },
      { name: "Matematik Mühendisliği", prefix: "MAT" },
      D.FIZ, D.MIM,
    ],
  },
  {
    name: "Galatasaray Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "INF" },
      { name: "Endüstri Mühendisliği", prefix: "GIE" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EEE" },
      { name: "Hukuk", prefix: "DRT" },
      { name: "İktisat", prefix: "ECO" },
      { name: "İşletme", prefix: "MGT" },
      { name: "Uluslararası İlişkiler", prefix: "RI" },
    ],
  },
  {
    name: "Mimar Sinan Güzel Sanatlar Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [
      D.MIM,
      { name: "Şehir ve Bölge Planlama", prefix: "SBP" },
      D.MAT, D.FIZ, D.SOS,
    ],
  },
  {
    name: "İstanbul Medeniyet Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.MM, D.MAT, D.TIP, D.HUK, D.PSI],
  },
  {
    name: "Türk-Alman Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "BMH" },
      { name: "Endüstri Mühendisliği", prefix: "EMH" },
      { name: "Mekatronik Mühendisliği", prefix: "MMH" },
      D.ISL, D.IKT, D.HUK, D.UI,
    ],
  },
  {
    name: "Sağlık Bilimleri Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [D.TIP, D.DH, D.ECZ],
  },
  {
    name: "Milli Savunma Üniversitesi", type: "Devlet", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.IM, D.MM],
  },

  // ============================================================
  // İSTANBUL — VAKIF
  // ============================================================
  {
    name: "Koç Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "COMP" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "ELEC" },
      { name: "Endüstri Mühendisliği", prefix: "INDR" },
      { name: "Makine Mühendisliği", prefix: "MECH" },
      { name: "Kimya ve Biyoloji Mühendisliği", prefix: "CHBI" },
      { name: "Matematik", prefix: "MATH" },
      { name: "Fizik", prefix: "PHYS" },
      { name: "Moleküler Biyoloji ve Genetik", prefix: "MBGE" },
      { name: "İşletme", prefix: "MGMT" },
      { name: "İktisat", prefix: "ECON" },
      { name: "Tıp", prefix: "MED" },
      { name: "Hukuk", prefix: "LAW" },
      { name: "Psikoloji", prefix: "PSYC" },
      { name: "Uluslararası İlişkiler", prefix: "INTL" },
    ],
  },
  {
    name: "Sabancı Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CS" },
      { name: "Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "Makine Mühendisliği", prefix: "ME" },
      { name: "Malzeme Bilimi ve Nano Mühendislik", prefix: "MAT" },
      { name: "Matematik", prefix: "MATH" },
      { name: "Fizik", prefix: "NS" },
      { name: "Moleküler Biyoloji, Genetik ve Biyomühendislik", prefix: "BIO" },
      { name: "İşletme", prefix: "MGMT" },
      { name: "İktisat", prefix: "ECON" },
    ],
  },
  {
    name: "İstanbul Bilgi Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "COMP" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "İşletme", prefix: "BUS" },
      { name: "İktisat", prefix: "ECON" },
      { name: "Hukuk", prefix: "LAW" },
      { name: "Psikoloji", prefix: "PSY" },
      { name: "Uluslararası İlişkiler", prefix: "IR" },
    ],
  },
  {
    name: "Özyeğin Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CS" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "Makine Mühendisliği", prefix: "ME" },
      { name: "İnşaat Mühendisliği", prefix: "CE" },
      { name: "İşletme", prefix: "BUS" },
      { name: "Hukuk", prefix: "LAW" },
      { name: "Mimarlık", prefix: "ARCH" },
    ],
  },
  {
    name: "Bahçeşehir Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CMP" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EEE" },
      { name: "Endüstri Mühendisliği", prefix: "IND" },
      { name: "Yazılım Mühendisliği", prefix: "SE" },
      { name: "Mekatronik Mühendisliği", prefix: "MEC" },
      { name: "İşletme", prefix: "BUS" },
      { name: "Tıp", prefix: "MED" },
      { name: "Hukuk", prefix: "LAW" },
      { name: "Psikoloji", prefix: "PSY" },
      { name: "Mimarlık", prefix: "ARC" },
    ],
  },
  {
    name: "Kadir Has Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CE" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "İşletme", prefix: "BA" },
      { name: "İktisat", prefix: "ECO" },
      { name: "Hukuk", prefix: "LAW" },
      { name: "Psikoloji", prefix: "PSY" },
      { name: "Uluslararası İlişkiler", prefix: "IR" },
    ],
  },
  {
    name: "Yeditepe Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CSE" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "Tıp", prefix: "MED" },
      { name: "Hukuk", prefix: "LAW" },
      { name: "Psikoloji", prefix: "PSY" },
      { name: "Mimarlık", prefix: "ARC" },
      { name: "İşletme", prefix: "BUS" },
    ],
  },
  {
    name: "MEF Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "COMP" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "İşletme", prefix: "BUS" },
      { name: "Hukuk", prefix: "LAW" },
      { name: "Psikoloji", prefix: "PSY" },
    ],
  },
  {
    // İstanbul Aydın Üniversitesi — gerçek 2024-2025 lisans programları
    // TR ve İngilizce programlar ayrı entry; burslu/burssuz birleştirilmiş.
    name: "İstanbul Aydın Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      // === Mühendislik Fakültesi ===
      { name: "Bilgisayar Mühendisliği (İngilizce)", prefix: "BLM" },
      { name: "Elektrik-Elektronik Mühendisliği (İngilizce)", prefix: "EEM" },
      { name: "Endüstri Mühendisliği (İngilizce)", prefix: "END" },
      { name: "Havacılık ve Uzay Mühendisliği (İngilizce)", prefix: "HUM" },
      { name: "İnşaat Mühendisliği", prefix: "INS" },
      { name: "İnşaat Mühendisliği (İngilizce)", prefix: "INS" },
      { name: "Makine Mühendisliği", prefix: "MAK" },
      { name: "Makine Mühendisliği (İngilizce)", prefix: "MAK" },
      { name: "Yapay Zeka ve Veri Mühendisliği (İngilizce)", prefix: "YZV" },
      { name: "Yazılım Mühendisliği (İngilizce)", prefix: "YZL" },

      // === İktisadi ve İdari Bilimler Fakültesi ===
      { name: "Ekonomi ve Finans", prefix: "EKF" },
      { name: "Ekonomi ve Finans (İngilizce)", prefix: "EKF" },
      { name: "Havacılık Yönetimi (İngilizce)", prefix: "HVY" },
      { name: "İşletme", prefix: "ISL" },
      { name: "İşletme (İngilizce)", prefix: "ISL" },
      { name: "Kamu Yönetimi", prefix: "KMY" },
      { name: "Muhasebe ve Finans Yönetimi", prefix: "MFY" },
      { name: "Muhasebe ve Finans Yönetimi (İngilizce)", prefix: "MFY" },
      { name: "Siyaset Bilimi ve Uluslararası İlişkiler", prefix: "SBU" },
      { name: "Siyaset Bilimi ve Uluslararası İlişkiler (İngilizce)", prefix: "SBU" },
      { name: "Uluslararası Ticaret ve Finansman (İngilizce)", prefix: "UTF" },

      // === Sağlık Bilimleri Fakültesi ===
      { name: "Beslenme ve Diyetetik", prefix: "BSD" },
      { name: "Beslenme ve Diyetetik (İngilizce)", prefix: "BSD" },
      { name: "Çocuk Gelişimi", prefix: "COG" },
      { name: "Ebelik", prefix: "EBE" },
      { name: "Fizyoterapi ve Rehabilitasyon", prefix: "FZT" },
      { name: "Fizyoterapi ve Rehabilitasyon (İngilizce)", prefix: "FZT" },
      { name: "Hemşirelik", prefix: "HEM" },
      { name: "Odyoloji", prefix: "ODY" },
      { name: "Sağlık Yönetimi", prefix: "SAY" },
      { name: "Sosyal Hizmet", prefix: "SHZ" },

      // === Eğitim Fakültesi ===
      { name: "Arapça Öğretmenliği", prefix: "ARP" },
      { name: "İlköğretim Matematik Öğretmenliği", prefix: "IMO" },
      { name: "İngilizce Öğretmenliği (İngilizce)", prefix: "IO" },
      { name: "Okul Öncesi Öğretmenliği", prefix: "OOO" },
      { name: "Özel Eğitim Öğretmenliği", prefix: "OEO" },
      { name: "Rehberlik ve Psikolojik Danışmanlık", prefix: "RPD" },
      { name: "Sınıf Öğretmenliği", prefix: "SO" },
      { name: "Türkçe Öğretmenliği", prefix: "TO" },

      // === Fen-Edebiyat Fakültesi ===
      { name: "Arapça Mütercim ve Tercümanlık", prefix: "AMT" },
      { name: "İngiliz Dili ve Edebiyatı (İngilizce)", prefix: "IDE" },
      { name: "İngilizce Mütercim ve Tercümanlık", prefix: "IMT" },
      { name: "Moleküler Biyoloji ve Genetik (İngilizce)", prefix: "MBG" },
      { name: "Psikoloji", prefix: "PSI" },
      { name: "Psikoloji (İngilizce)", prefix: "PSI" },
      { name: "Rusça Mütercim ve Tercümanlık", prefix: "RMT" },
      { name: "Sosyoloji", prefix: "SOS" },
      { name: "Tarih", prefix: "TAR" },
      { name: "Türk Dili ve Edebiyatı", prefix: "TDE" },

      // === İletişim Fakültesi ===
      { name: "Gazetecilik", prefix: "GAZ" },
      { name: "Görsel İletişim Tasarımı", prefix: "GIT" },
      { name: "Halkla İlişkiler ve Tanıtım", prefix: "HIT" },
      { name: "Radyo, Televizyon ve Sinema", prefix: "RTS" },
      { name: "Radyo, Televizyon ve Sinema (İngilizce)", prefix: "RTS" },
      { name: "Reklamcılık", prefix: "REK" },
      { name: "Televizyon Haberciliği ve Programcılığı", prefix: "TVH" },
      { name: "Yeni Medya ve İletişim", prefix: "YMI" },
      { name: "Yeni Medya ve İletişim (İngilizce)", prefix: "YMI" },

      // === Mimarlık ve Tasarım Fakültesi ===
      { name: "Endüstriyel Tasarım", prefix: "ETS" },
      { name: "İç Mimarlık", prefix: "ICM" },
      { name: "Mimarlık", prefix: "MIM" },
      { name: "Mimarlık (İngilizce)", prefix: "MIM" },

      // === Güzel Sanatlar Fakültesi ===
      { name: "Dijital Oyun Tasarımı", prefix: "DOT" },
      { name: "Dijital Oyun Tasarımı (İngilizce)", prefix: "DOT" },
      { name: "Gastronomi ve Mutfak Sanatları", prefix: "GMS" },

      // === Tıp Fakültesi ===
      { name: "Tıp", prefix: "TIP" },
      { name: "Tıp (İngilizce)", prefix: "TIP" },

      // === Diş Hekimliği Fakültesi ===
      { name: "Diş Hekimliği", prefix: "DHK" },
      { name: "Diş Hekimliği (İngilizce)", prefix: "DHK" },

      // === Eczacılık Fakültesi ===
      { name: "Eczacılık", prefix: "ECZ" },
      { name: "Eczacılık (İngilizce)", prefix: "ECZ" },

      // === Hukuk Fakültesi ===
      { name: "Hukuk", prefix: "HUK" },

      // === Spor Bilimleri Fakültesi ===
      { name: "Spor Yöneticiliği", prefix: "SPY" },

      // === Uygulamalı Bilimler Fakültesi ===
      { name: "Havacılık Elektrik ve Elektroniği (İngilizce)", prefix: "HEE" },
      { name: "Pilotaj (İngilizce)", prefix: "PIL" },
      { name: "Yazılım Geliştirme (İngilizce)", prefix: "YGL" },
      { name: "Yönetim Bilişim Sistemleri", prefix: "YBS" },
      { name: "Yönetim Bilişim Sistemleri (İngilizce)", prefix: "YBS" },
    ],
  },
  {
    name: "Maltepe Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.ISL, D.HUK, D.PSI, D.TIP],
  },
  {
    name: "Doğuş Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EM, D.EEM, D.ISL, D.HUK],
  },
  {
    name: "Işık Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.MAT, D.ISL, D.PSI],
  },
  {
    name: "Acıbadem Mehmet Ali Aydınlar Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.TIP, D.DH, D.ECZ, D.PSI, D.BIO, D.MBG],
  },
  {
    name: "Üsküdar Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.PSI, D.TIP, D.ISL, D.BLM, D.MBG],
  },
  {
    name: "İstanbul Medipol Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.TIP, D.BLM, D.EEM, D.ISL, D.HUK, D.PSI],
  },
  {
    name: "Beykoz Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EM, D.ISL,
      { name: "Lojistik Yönetimi", prefix: "LOJ" }],
  },
  {
    name: "Fenerbahçe Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.EM, D.ISL, D.PSI],
  },
  {
    name: "Piri Reis Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EM, D.MM, D.ISL,
      { name: "Deniz Ulaştırma İşletme Mühendisliği", prefix: "DM" }],
  },
  {
    name: "İbn Haldun Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.IKT, D.HUK, D.PSI, D.SOS, D.UI],
  },
  {
    name: "Bezmialem Vakıf Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.TIP, D.DH, D.ECZ, D.PSI],
  },
  {
    name: "İstinye Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.TIP, D.BLM, D.EM, D.ISL, D.PSI, D.MBG],
  },
  {
    name: "İstanbul Sabahattin Zaim Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EM, D.ISL, D.HUK, D.PSI],
  },
  {
    name: "İstanbul Yeni Yüzyıl Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.TIP, D.BLM, D.ISL, D.HUK, D.PSI],
  },
  {
    name: "İstanbul Ticaret Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EM, D.ISL, D.IKT, D.HUK, D.UI],
  },
  {
    name: "İstanbul Arel Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.EM, D.ISL, D.HUK, D.PSI],
  },
  {
    name: "İstanbul Esenyurt Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EM, D.ISL, D.PSI],
  },
  {
    name: "İstanbul Kültür Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.EM, D.ISL, D.HUK, D.MIM],
  },
  {
    name: "İstanbul Gelişim Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.ISL, D.PSI, D.TIP],
  },
  {
    name: "İstanbul Okan Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.EM, D.ISL, D.HUK, D.TIP, D.PSI],
  },
  {
    name: "Nişantaşı Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.ISL, D.HUK, D.PSI],
  },
  {
    name: "Altınbaş Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.ISL, D.HUK, D.TIP, D.PSI],
  },
  {
    name: "Haliç Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EM, D.ISL, D.PSI, D.TIP],
  },
  {
    name: "Demiroğlu Bilim Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.TIP, D.PSI],
  },
  {
    name: "Türk Hava Kurumu Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [
      D.BLM,
      { name: "Uçak Mühendisliği", prefix: "UCK" },
      D.EEM, D.EM, D.ISL,
    ],
  },
  {
    name: "Beykent Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.EEM, D.EM, D.ISL, D.HUK, D.PSI, D.MIM],
  },
  {
    name: "Biruni Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.TIP, D.PSI, D.MBG],
  },
  {
    name: "İstanbul 29 Mayıs Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.HUK, D.IKT, D.PSI, D.SOS],
  },
  {
    name: "İstanbul Kent Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.ISL, D.HUK, D.PSI],
  },
  {
    name: "İstanbul Atlas Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.TIP, D.BLM, D.PSI],
  },
  {
    name: "İstanbul Galata Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.ISL, D.HUK, D.PSI],
  },
  {
    name: "İstanbul Rumeli Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.ISL, D.PSI],
  },
  {
    name: "İstanbul Topkapı Üniversitesi", type: "Vakıf", city: "İstanbul",
    departments: [D.BLM, D.ISL, D.PSI, D.HUK],
  },
  {
    name: "Faruk Saraç Tasarım Meslek Yüksekokulu", type: "Vakıf MYO", city: "İstanbul",
    departments: [{ name: "Moda Tasarımı", prefix: "MOD" }],
  },

  // ============================================================
  // ANKARA — DEVLET (10)
  // ============================================================
  {
    name: "Orta Doğu Teknik Üniversitesi", type: "Devlet", city: "Ankara",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CENG" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "Makine Mühendisliği", prefix: "ME" },
      { name: "İnşaat Mühendisliği", prefix: "CE" },
      { name: "Kimya Mühendisliği", prefix: "CHE" },
      { name: "Çevre Mühendisliği", prefix: "ENVE" },
      { name: "Havacılık ve Uzay Mühendisliği", prefix: "AEE" },
      { name: "Matematik", prefix: "MATH" },
      { name: "Fizik", prefix: "PHYS" },
      { name: "Kimya", prefix: "CHEM" },
      { name: "Biyolojik Bilimler", prefix: "BIOL" },
      { name: "İşletme", prefix: "BA" },
      { name: "İktisat", prefix: "ECON" },
      { name: "Mimarlık", prefix: "ARCH" },
      { name: "Psikoloji", prefix: "PSY" },
      { name: "Uluslararası İlişkiler", prefix: "IR" },
    ],
  },
  {
    name: "Hacettepe Üniversitesi", type: "Devlet", city: "Ankara",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "BBM" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "ELE" },
      { name: "Endüstri Mühendisliği", prefix: "END" },
      { name: "Makine Mühendisliği", prefix: "MAK" },
      { name: "Kimya Mühendisliği", prefix: "KMM" },
      D.MAT, D.FIZ, D.KIM, D.BIY, D.IST,
      D.TIP, D.DH, D.ECZ, D.PSI, D.IKT,
    ],
  },
  {
    name: "Ankara Üniversitesi", type: "Devlet", city: "Ankara",
    departments: [
      D.BLM, D.EEM, D.MAT, D.FIZ, D.KIM, D.BIY,
      D.ISL, D.IKT, D.HUK, D.TIP, D.PSI, D.SBKY, D.VET,
    ],
  },
  {
    name: "Gazi Üniversitesi", type: "Devlet", city: "Ankara",
    departments: [
      D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM,
    ],
  },
  {
    name: "Ankara Yıldırım Beyazıt Üniversitesi", type: "Devlet", city: "Ankara",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL, D.HUK, D.TIP, D.PSI],
  },
  {
    name: "Ankara Hacı Bayram Veli Üniversitesi", type: "Devlet", city: "Ankara",
    departments: [D.ISL, D.IKT, D.HUK, D.PSI, D.SOS, D.UI, D.TUR],
  },
  {
    name: "Ankara Sosyal Bilimler Üniversitesi", type: "Devlet", city: "Ankara",
    departments: [D.HUK, D.IKT, D.UI, D.SOS, D.PSI],
  },
  {
    name: "Ankara Müzik ve Güzel Sanatlar Üniversitesi", type: "Devlet", city: "Ankara",
    departments: [{ name: "Müzik", prefix: "MUZ" }],
  },
  {
    name: "Polis Akademisi", type: "Devlet", city: "Ankara",
    departments: [{ name: "Güvenlik Bilimleri", prefix: "GVB" }, D.HUK],
  },
  {
    name: "Jandarma ve Sahil Güvenlik Akademisi", type: "Devlet", city: "Ankara",
    departments: [{ name: "Güvenlik Bilimleri", prefix: "GVB" }],
  },

  // ============================================================
  // ANKARA — VAKIF (10)
  // ============================================================
  {
    name: "İhsan Doğramacı Bilkent Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CS" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EEE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "Makine Mühendisliği", prefix: "ME" },
      { name: "Matematik", prefix: "MATH" },
      { name: "Fizik", prefix: "PHYS" },
      { name: "Moleküler Biyoloji ve Genetik", prefix: "MBG" },
      { name: "İşletme", prefix: "MAN" },
      { name: "İktisat", prefix: "ECON" },
      { name: "Hukuk", prefix: "LAW" },
      { name: "Psikoloji", prefix: "PSYC" },
      { name: "Mimarlık", prefix: "ARCH" },
      { name: "Uluslararası İlişkiler", prefix: "IR" },
    ],
  },
  {
    name: "TOBB Ekonomi ve Teknoloji Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "BIL" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "ELE" },
      { name: "Endüstri Mühendisliği", prefix: "END" },
      { name: "Makine Mühendisliği", prefix: "MAK" },
      D.ISL, D.IKT, D.HUK, D.TIP, D.PSI, D.UI,
    ],
  },
  {
    name: "Atılım Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.ISL, D.HUK, D.PSI, D.MIM],
  },
  {
    name: "Çankaya Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [D.BLM, D.EEM, D.EM, D.IM, D.ISL, D.HUK, D.PSI, D.UI],
  },
  {
    name: "Başkent Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.ISL, D.HUK, D.TIP, D.PSI],
  },
  {
    name: "Ufuk Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [D.TIP, D.HUK, D.PSI, D.ISL],
  },
  {
    name: "Ankara Bilim Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [D.BLM, D.EEM, D.EM, D.ISL, D.PSI],
  },
  {
    name: "Lokman Hekim Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [D.TIP, D.PSI, D.DH, D.ECZ],
  },
  {
    name: "Ankara Medipol Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [D.TIP, D.BLM, D.PSI, D.HUK],
  },
  {
    name: "OSTİM Teknik Üniversitesi", type: "Vakıf", city: "Ankara",
    departments: [D.BLM, D.EEM, D.MM, D.EM],
  },

  // ============================================================
  // İZMİR
  // ============================================================
  {
    name: "Ege Üniversitesi", type: "Devlet", city: "İzmir",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "BIL" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EEM" },
      D.EM, D.MM, D.IM, D.KM, D.GM,
      D.MAT, D.FIZ, D.KIM, D.BIY,
      D.ISL, D.IKT, D.HUK, D.TIP, D.PSI, D.VET,
    ],
  },
  {
    name: "Dokuz Eylül Üniversitesi", type: "Devlet", city: "İzmir",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CSE" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EEE" },
      D.EM, D.MM, D.IM, D.KM, D.CM,
      D.MAT, D.FIZ, D.ISL, D.IKT, D.HUK, D.TIP, D.PSI, D.MIM,
    ],
  },
  {
    name: "İzmir Yüksek Teknoloji Enstitüsü", type: "Devlet", city: "İzmir",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CENG" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Makine Mühendisliği", prefix: "ME" },
      { name: "İnşaat Mühendisliği", prefix: "CE" },
      { name: "Kimya Mühendisliği", prefix: "CHE" },
      { name: "Gıda Mühendisliği", prefix: "FE" },
      { name: "Matematik", prefix: "MATH" },
      { name: "Fizik", prefix: "PHYS" },
      { name: "Mimarlık", prefix: "AR" },
    ],
  },
  {
    name: "İzmir Katip Çelebi Üniversitesi", type: "Devlet", city: "İzmir",
    departments: [D.BLM, D.EEM, D.MM, D.TIP, D.HUK, D.MIM],
  },
  {
    name: "İzmir Bakırçay Üniversitesi", type: "Devlet", city: "İzmir",
    departments: [D.BLM, D.EEM, D.ISL, D.HUK, D.TIP, D.PSI],
  },
  {
    name: "İzmir Demokrasi Üniversitesi", type: "Devlet", city: "İzmir",
    departments: [D.BLM, D.ISL, D.HUK, D.TIP, D.PSI],
  },
  {
    name: "İzmir Ekonomi Üniversitesi", type: "Vakıf", city: "İzmir",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "CE" },
      { name: "Elektrik-Elektronik Mühendisliği", prefix: "EE" },
      { name: "Endüstri Mühendisliği", prefix: "IE" },
      { name: "Yazılım Mühendisliği", prefix: "SE" },
      D.ISL, D.IKT, D.HUK, D.PSI, D.UI, D.MIM,
    ],
  },
  {
    name: "Yaşar Üniversitesi", type: "Vakıf", city: "İzmir",
    departments: [D.BLM, D.EEM, D.EM, D.IM, D.ISL, D.HUK, D.PSI, D.UI, D.MIM],
  },
  {
    name: "İzmir Tınaztepe Üniversitesi", type: "Vakıf", city: "İzmir",
    departments: [D.TIP, D.PSI, D.DH],
  },

  // ============================================================
  // BURSA
  // ============================================================
  {
    name: "Bursa Uludağ Üniversitesi", type: "Devlet", city: "Bursa",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.GM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM, D.VET],
  },
  {
    name: "Bursa Teknik Üniversitesi", type: "Devlet", city: "Bursa",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.KM, D.MAT, D.FIZ],
  },
  {
    name: "Bursa Bilim ve Teknoloji Üniversitesi", type: "Devlet", city: "Bursa",
    departments: [D.BLM, D.EEM, D.MM, D.EM],
  },
  {
    name: "Mudanya Üniversitesi", type: "Vakıf", city: "Bursa",
    departments: [D.BLM, D.ISL, D.PSI],
  },

  // ============================================================
  // KOCAELİ / SAKARYA / BOLU / DÜZCE / YALOVA
  // ============================================================
  {
    name: "Kocaeli Üniversitesi", type: "Devlet", city: "Kocaeli",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM],
  },
  {
    name: "Gebze Teknik Üniversitesi", type: "Devlet", city: "Kocaeli",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.CM, D.MAT, D.FIZ, D.MIM, D.MBG],
  },
  {
    name: "Sakarya Üniversitesi", type: "Devlet", city: "Sakarya",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM],
  },
  {
    name: "Sakarya Uygulamalı Bilimler Üniversitesi", type: "Devlet", city: "Sakarya",
    departments: [D.BLM, D.EEM, D.MM, D.ISL],
  },
  {
    name: "Bolu Abant İzzet Baysal Üniversitesi", type: "Devlet", city: "Bolu",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.MAT, D.FIZ, D.ISL, D.IKT, D.TIP, D.PSI],
  },
  {
    name: "Düzce Üniversitesi", type: "Devlet", city: "Düzce",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL, D.TIP, D.MIM],
  },
  {
    name: "Yalova Üniversitesi", type: "Devlet", city: "Yalova",
    departments: [D.BLM, D.EM, D.MM, D.IM, D.ISL, D.IKT, D.HUK, D.UI],
  },

  // ============================================================
  // EDİRNE / TEKİRDAĞ / KIRKLARELİ / ÇANAKKALE / BALIKESİR
  // ============================================================
  {
    name: "Trakya Üniversitesi", type: "Devlet", city: "Edirne",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.ISL, D.IKT, D.HUK, D.TIP, D.MIM],
  },
  {
    name: "Tekirdağ Namık Kemal Üniversitesi", type: "Devlet", city: "Tekirdağ",
    departments: [D.BLM, D.EEM, D.GM, D.ZM, D.ISL, D.IKT, D.TIP],
  },
  {
    name: "Kırklareli Üniversitesi", type: "Devlet", city: "Kırklareli",
    departments: [D.BLM, D.EEM, D.MM, D.ISL, D.IKT, D.MIM],
  },
  {
    name: "Çanakkale Onsekiz Mart Üniversitesi", type: "Devlet", city: "Çanakkale",
    departments: [D.BLM, D.EEM, D.GM, D.ZM, D.MAT, D.FIZ, D.ISL, D.IKT, D.HUK, D.TIP],
  },
  {
    name: "Balıkesir Üniversitesi", type: "Devlet", city: "Balıkesir",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL, D.IKT, D.TIP, D.MIM],
  },
  {
    name: "Bandırma Onyedi Eylül Üniversitesi", type: "Devlet", city: "Balıkesir",
    departments: [D.BLM, D.EEM, D.MM, D.ISL, D.IKT, D.HUK, D.TIP],
  },

  // ============================================================
  // ESKİŞEHİR / KÜTAHYA / AFYONKARAHİSAR / UŞAK / MANİSA / AYDIN / DENİZLİ / MUĞLA
  // ============================================================
  {
    name: "Anadolu Üniversitesi", type: "Devlet", city: "Eskişehir",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.PSI, D.MIM,
      { name: "Eczacılık", prefix: "ECZ" }],
  },
  {
    name: "Eskişehir Osmangazi Üniversitesi", type: "Devlet", city: "Eskişehir",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.TIP, D.MIM],
  },
  {
    name: "Eskişehir Teknik Üniversitesi", type: "Devlet", city: "Eskişehir",
    departments: [D.BLM, D.EEM, D.EM, D.MAT, D.FIZ,
      { name: "Havacılık ve Uzay Bilimleri", prefix: "HUB" }],
  },
  {
    name: "Kütahya Dumlupınar Üniversitesi", type: "Devlet", city: "Kütahya",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL, D.IKT, D.MIM],
  },
  {
    name: "Kütahya Sağlık Bilimleri Üniversitesi", type: "Devlet", city: "Kütahya",
    departments: [D.TIP],
  },
  {
    name: "Afyon Kocatepe Üniversitesi", type: "Devlet", city: "Afyonkarahisar",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.ISL, D.IKT, D.TIP, D.VET],
  },
  {
    name: "Afyonkarahisar Sağlık Bilimleri Üniversitesi", type: "Devlet", city: "Afyonkarahisar",
    departments: [D.TIP, D.DH, D.ECZ],
  },
  {
    name: "Uşak Üniversitesi", type: "Devlet", city: "Uşak",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL, D.IKT, D.TIP],
  },
  {
    name: "Manisa Celal Bayar Üniversitesi", type: "Devlet", city: "Manisa",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.GM, D.ISL, D.IKT, D.HUK, D.TIP],
  },
  {
    name: "Aydın Adnan Menderes Üniversitesi", type: "Devlet", city: "Aydın",
    departments: [D.BLM, D.EEM, D.GM, D.ZM, D.ISL, D.IKT, D.TIP, D.VET],
  },
  {
    name: "Pamukkale Üniversitesi", type: "Devlet", city: "Denizli",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.GM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM],
  },
  {
    name: "Muğla Sıtkı Koçman Üniversitesi", type: "Devlet", city: "Muğla",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.FIZ, D.KIM, D.BIY,
      D.ISL, D.IKT, D.HUK, D.TIP, D.PSI],
  },

  // ============================================================
  // ANTALYA / ISPARTA / BURDUR
  // ============================================================
  {
    name: "Akdeniz Üniversitesi", type: "Devlet", city: "Antalya",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.GM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.PSI, D.MIM],
  },
  {
    name: "Alanya Alaaddin Keykubat Üniversitesi", type: "Devlet", city: "Antalya",
    departments: [D.BLM, D.EEM, D.MM, D.ISL, D.TIP],
  },
  {
    name: "Antalya Bilim Üniversitesi", type: "Vakıf", city: "Antalya",
    departments: [D.BLM, D.EEM, D.EM, D.ISL, D.HUK, D.PSI, D.MIM],
  },
  {
    name: "Antalya AKEV Üniversitesi", type: "Vakıf", city: "Antalya",
    departments: [D.ISL, D.PSI],
  },
  {
    name: "Süleyman Demirel Üniversitesi", type: "Devlet", city: "Isparta",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM],
  },
  {
    name: "Isparta Uygulamalı Bilimler Üniversitesi", type: "Devlet", city: "Isparta",
    departments: [D.BLM, D.EEM, D.MM, D.GM, D.ZM, D.ISL],
  },
  {
    name: "Burdur Mehmet Akif Ersoy Üniversitesi", type: "Devlet", city: "Burdur",
    departments: [D.BLM, D.EEM, D.MM, D.ISL, D.TIP, D.VET],
  },

  // ============================================================
  // KONYA / KARAMAN / NİĞDE / NEVŞEHİR / AKSARAY / KIRŞEHİR / KIRIKKALE / ÇANKIRI
  // ============================================================
  {
    name: "Selçuk Üniversitesi", type: "Devlet", city: "Konya",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ, D.KIM, D.BIY,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM, D.VET],
  },
  {
    name: "Konya Teknik Üniversitesi", type: "Devlet", city: "Konya",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.CM, D.MIM],
  },
  {
    name: "Necmettin Erbakan Üniversitesi", type: "Devlet", city: "Konya",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.ISL, D.HUK, D.TIP, D.MIM],
  },
  {
    name: "KTO Karatay Üniversitesi", type: "Vakıf", city: "Konya",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.ISL, D.HUK, D.TIP],
  },
  {
    name: "Konya Gıda ve Tarım Üniversitesi", type: "Vakıf", city: "Konya",
    departments: [D.GM, D.BIY, D.MBG, D.ISL],
  },
  {
    name: "Karamanoğlu Mehmetbey Üniversitesi", type: "Devlet", city: "Karaman",
    departments: [D.BLM, D.EEM, D.MM, D.ISL, D.IKT],
  },
  {
    name: "Niğde Ömer Halisdemir Üniversitesi", type: "Devlet", city: "Niğde",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL, D.IKT, D.MIM],
  },
  {
    name: "Nevşehir Hacı Bektaş Veli Üniversitesi", type: "Devlet", city: "Nevşehir",
    departments: [D.BLM, D.MM, D.MAT, D.ISL, D.IKT],
  },
  {
    name: "Kapadokya Üniversitesi", type: "Vakıf MYO", city: "Nevşehir",
    departments: [D.ISL,
      { name: "Turist Rehberliği", prefix: "TUR" }],
  },
  {
    name: "Aksaray Üniversitesi", type: "Devlet", city: "Aksaray",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL, D.IKT, D.TIP, D.VET],
  },
  {
    name: "Kırşehir Ahi Evran Üniversitesi", type: "Devlet", city: "Kırşehir",
    departments: [D.BLM, D.EEM, D.MM, D.MAT, D.ISL, D.IKT, D.TIP],
  },
  {
    name: "Kırıkkale Üniversitesi", type: "Devlet", city: "Kırıkkale",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL, D.IKT, D.HUK, D.TIP, D.VET],
  },
  {
    name: "Çankırı Karatekin Üniversitesi", type: "Devlet", city: "Çankırı",
    departments: [D.BLM, D.MM, D.MAT, D.ISL, D.IKT],
  },

  // ============================================================
  // KAYSERİ / SİVAS / YOZGAT / TOKAT / AMASYA / ÇORUM
  // ============================================================
  {
    name: "Erciyes Üniversitesi", type: "Devlet", city: "Kayseri",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM, D.VET],
  },
  {
    name: "Kayseri Üniversitesi", type: "Devlet", city: "Kayseri",
    departments: [D.BLM, D.EEM, D.MM, D.ISL],
  },
  {
    name: "Abdullah Gül Üniversitesi", type: "Devlet", city: "Kayseri",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL, D.MIM],
  },
  {
    name: "Nuh Naci Yazgan Üniversitesi", type: "Vakıf", city: "Kayseri",
    departments: [D.BLM, D.EEM, D.EM, D.ISL],
  },
  {
    name: "Sivas Cumhuriyet Üniversitesi", type: "Devlet", city: "Sivas",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL, D.IKT, D.TIP, D.VET],
  },
  {
    name: "Sivas Bilim ve Teknoloji Üniversitesi", type: "Devlet", city: "Sivas",
    departments: [D.BLM, D.EEM, D.MM, D.MAT],
  },
  {
    name: "Yozgat Bozok Üniversitesi", type: "Devlet", city: "Yozgat",
    departments: [D.BLM, D.MM, D.IM, D.ISL, D.TIP],
  },
  {
    name: "Tokat Gaziosmanpaşa Üniversitesi", type: "Devlet", city: "Tokat",
    departments: [D.BLM, D.MM, D.GM, D.ZM, D.ISL, D.TIP, D.VET],
  },
  {
    name: "Amasya Üniversitesi", type: "Devlet", city: "Amasya",
    departments: [D.BLM, D.MM, D.IM, D.ISL, D.TIP, D.MIM],
  },
  {
    name: "Hitit Üniversitesi", type: "Devlet", city: "Çorum",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL, D.IKT, D.TIP],
  },

  // ============================================================
  // SAMSUN / ORDU / GİRESUN / TRABZON / RİZE / ARTVİN / GÜMÜŞHANE / BAYBURT
  // ============================================================
  {
    name: "Ondokuz Mayıs Üniversitesi", type: "Devlet", city: "Samsun",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM, D.VET],
  },
  {
    name: "Samsun Üniversitesi", type: "Devlet", city: "Samsun",
    departments: [D.BLM, D.EEM, D.MM, D.ISL, D.HUK,
      { name: "Havacılık Mühendisliği", prefix: "HVM" }],
  },
  {
    name: "Ordu Üniversitesi", type: "Devlet", city: "Ordu",
    departments: [D.BLM, D.MM, D.GM, D.ZM, D.ISL, D.TIP],
  },
  {
    name: "Giresun Üniversitesi", type: "Devlet", city: "Giresun",
    departments: [D.BLM, D.MM, D.MAT, D.ISL, D.TIP],
  },
  {
    name: "Karadeniz Teknik Üniversitesi", type: "Devlet", city: "Trabzon",
    departments: [
      { name: "Bilgisayar Mühendisliği", prefix: "BIL" },
      D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM,
      { name: "Orman Mühendisliği", prefix: "ORM" }],
  },
  {
    name: "Trabzon Üniversitesi", type: "Devlet", city: "Trabzon",
    departments: [D.ISL, D.PSI,
      { name: "İlahiyat", prefix: "ILA" }],
  },
  {
    name: "Avrasya Üniversitesi", type: "Vakıf", city: "Trabzon",
    departments: [D.BLM, D.ISL, D.PSI],
  },
  {
    name: "Recep Tayyip Erdoğan Üniversitesi", type: "Devlet", city: "Rize",
    departments: [D.BLM, D.EEM, D.MM, D.GM, D.ISL, D.TIP],
  },
  {
    name: "Artvin Çoruh Üniversitesi", type: "Devlet", city: "Artvin",
    departments: [D.BLM, D.MM,
      { name: "Orman Mühendisliği", prefix: "ORM" }, D.ISL],
  },
  {
    name: "Gümüşhane Üniversitesi", type: "Devlet", city: "Gümüşhane",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL],
  },
  {
    name: "Bayburt Üniversitesi", type: "Devlet", city: "Bayburt",
    departments: [D.BLM, D.MM, D.ISL],
  },

  // ============================================================
  // ERZURUM / ERZİNCAN / KARS / IĞDIR / ARDAHAN / AĞRI / ELAZIĞ / TUNCELİ / BİNGÖL / MUŞ / BİTLİS / VAN / HAKKARİ
  // ============================================================
  {
    name: "Atatürk Üniversitesi", type: "Devlet", city: "Erzurum",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ, D.KIM, D.BIY,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM, D.VET],
  },
  {
    name: "Erzurum Teknik Üniversitesi", type: "Devlet", city: "Erzurum",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL],
  },
  {
    name: "Erzincan Binali Yıldırım Üniversitesi", type: "Devlet", city: "Erzincan",
    departments: [D.BLM, D.MM, D.MAT, D.ISL, D.HUK, D.TIP],
  },
  {
    name: "Kafkas Üniversitesi", type: "Devlet", city: "Kars",
    departments: [D.BLM, D.MM, D.MAT, D.ISL, D.TIP, D.VET],
  },
  {
    name: "Iğdır Üniversitesi", type: "Devlet", city: "Iğdır",
    departments: [D.BLM, D.MM, D.GM, D.ZM, D.ISL],
  },
  {
    name: "Ardahan Üniversitesi", type: "Devlet", city: "Ardahan",
    departments: [D.BLM, D.MM, D.ISL],
  },
  {
    name: "Ağrı İbrahim Çeçen Üniversitesi", type: "Devlet", city: "Ağrı",
    departments: [D.BLM, D.MM, D.ISL,
      { name: "Sınıf Öğretmenliği", prefix: "EGT" }],
  },
  {
    name: "Fırat Üniversitesi", type: "Devlet", city: "Elazığ",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.TIP, D.VET, D.MIM],
  },
  {
    name: "Munzur Üniversitesi", type: "Devlet", city: "Tunceli",
    departments: [D.BLM, D.MM, D.MAT, D.ISL],
  },
  {
    name: "Bingöl Üniversitesi", type: "Devlet", city: "Bingöl",
    departments: [D.BLM, D.MM, D.GM, D.ZM, D.ISL, D.TIP, D.VET],
  },
  {
    name: "Muş Alparslan Üniversitesi", type: "Devlet", city: "Muş",
    departments: [D.BLM, D.MM, D.ISL,
      { name: "Sınıf Öğretmenliği", prefix: "EGT" }],
  },
  {
    name: "Bitlis Eren Üniversitesi", type: "Devlet", city: "Bitlis",
    departments: [D.BLM, D.MM, D.MAT, D.ISL],
  },
  {
    name: "Van Yüzüncü Yıl Üniversitesi", type: "Devlet", city: "Van",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL, D.IKT, D.TIP, D.VET, D.MIM],
  },
  {
    name: "Hakkari Üniversitesi", type: "Devlet", city: "Hakkari",
    departments: [D.ISL,
      { name: "Sınıf Öğretmenliği", prefix: "EGT" }],
  },

  // ============================================================
  // GAZİANTEP / KİLİS / ADIYAMAN / KAHRAMANMARAŞ / OSMANİYE / ADANA / HATAY / MERSİN / ŞANLIURFA / DİYARBAKIR / MARDİN / BATMAN / SİİRT / ŞIRNAK / ZONGULDAK / KARABÜK / BARTIN / KASTAMONU / SİNOP
  // ============================================================
  {
    name: "Gaziantep Üniversitesi", type: "Devlet", city: "Gaziantep",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM],
  },
  {
    name: "Gaziantep İslam Bilim ve Teknoloji Üniversitesi", type: "Devlet", city: "Gaziantep",
    departments: [D.BLM, D.MM, D.ISL,
      { name: "İlahiyat", prefix: "ILA" }],
  },
  {
    name: "Hasan Kalyoncu Üniversitesi", type: "Vakıf", city: "Gaziantep",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.ISL, D.HUK, D.PSI, D.MIM],
  },
  {
    name: "Sanko Üniversitesi", type: "Vakıf", city: "Gaziantep",
    departments: [D.TIP, D.PSI],
  },
  {
    name: "Kilis 7 Aralık Üniversitesi", type: "Devlet", city: "Kilis",
    departments: [D.BLM, D.MM, D.MAT, D.ISL],
  },
  {
    name: "Adıyaman Üniversitesi", type: "Devlet", city: "Adıyaman",
    departments: [D.BLM, D.MM, D.MAT, D.ISL, D.TIP],
  },
  {
    name: "Kahramanmaraş Sütçü İmam Üniversitesi", type: "Devlet", city: "Kahramanmaraş",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.GM, D.MAT, D.ISL, D.IKT, D.TIP],
  },
  {
    name: "Kahramanmaraş İstiklal Üniversitesi", type: "Devlet", city: "Kahramanmaraş",
    departments: [D.ISL,
      { name: "Sınıf Öğretmenliği", prefix: "EGT" }],
  },
  {
    name: "Osmaniye Korkut Ata Üniversitesi", type: "Devlet", city: "Osmaniye",
    departments: [D.BLM, D.EEM, D.MM, D.GM, D.ISL, D.IKT],
  },
  {
    name: "Çukurova Üniversitesi", type: "Devlet", city: "Adana",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.GM, D.ZM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM, D.VET],
  },
  {
    name: "Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi", type: "Devlet", city: "Adana",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.MAT, D.FIZ],
  },
  {
    name: "Hatay Mustafa Kemal Üniversitesi", type: "Devlet", city: "Hatay",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.GM, D.ZM, D.ISL, D.IKT, D.TIP, D.VET],
  },
  {
    name: "İskenderun Teknik Üniversitesi", type: "Devlet", city: "Hatay",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.KM, D.ISL, D.MIM],
  },
  {
    name: "Mersin Üniversitesi", type: "Devlet", city: "Mersin",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.KM, D.GM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM, D.ECZ],
  },
  {
    name: "Tarsus Üniversitesi", type: "Devlet", city: "Mersin",
    departments: [D.BLM, D.EEM, D.MM, D.ISL, D.IKT],
  },
  {
    name: "Çağ Üniversitesi", type: "Vakıf", city: "Mersin",
    departments: [D.BLM, D.ISL, D.HUK, D.PSI, D.UI],
  },
  {
    name: "Toros Üniversitesi", type: "Vakıf", city: "Mersin",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL, D.PSI, D.MIM],
  },
  {
    name: "Harran Üniversitesi", type: "Devlet", city: "Şanlıurfa",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.GM, D.ZM, D.ISL, D.IKT, D.TIP, D.VET],
  },
  {
    name: "Şanlıurfa Uygulamalı Bilimler Üniversitesi", type: "Devlet", city: "Şanlıurfa",
    departments: [D.BLM, D.MM, D.GM, D.ISL],
  },
  {
    name: "Dicle Üniversitesi", type: "Devlet", city: "Diyarbakır",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL, D.IKT, D.HUK, D.TIP, D.VET, D.MIM],
  },
  {
    name: "Mardin Artuklu Üniversitesi", type: "Devlet", city: "Mardin",
    departments: [D.BLM, D.MM, D.ISL, D.MIM],
  },
  {
    name: "Batman Üniversitesi", type: "Devlet", city: "Batman",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.ISL],
  },
  {
    name: "Siirt Üniversitesi", type: "Devlet", city: "Siirt",
    departments: [D.BLM, D.MM, D.GM, D.ZM, D.ISL, D.TIP, D.VET],
  },
  {
    name: "Şırnak Üniversitesi", type: "Devlet", city: "Şırnak",
    departments: [D.BLM, D.MM, D.ISL,
      { name: "İlahiyat", prefix: "ILA" }],
  },
  {
    name: "Zonguldak Bülent Ecevit Üniversitesi", type: "Devlet", city: "Zonguldak",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.FIZ, D.ISL, D.IKT, D.TIP, D.MIM,
      { name: "Maden Mühendisliği", prefix: "MDN" }],
  },
  {
    name: "Karabük Üniversitesi", type: "Devlet", city: "Karabük",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.MAT, D.ISL, D.IKT, D.TIP, D.MIM],
  },
  {
    name: "Bartın Üniversitesi", type: "Devlet", city: "Bartın",
    departments: [D.BLM, D.MM, D.IM, D.MAT, D.ISL,
      { name: "Orman Mühendisliği", prefix: "ORM" }],
  },
  {
    name: "Kastamonu Üniversitesi", type: "Devlet", city: "Kastamonu",
    departments: [D.BLM, D.EEM, D.MM, D.IM, D.MAT, D.ISL, D.IKT, D.TIP,
      { name: "Orman Mühendisliği", prefix: "ORM" }],
  },
  {
    name: "Sinop Üniversitesi", type: "Devlet", city: "Sinop",
    departments: [D.BLM, D.MM, D.MAT, D.FIZ, D.KIM, D.BIY, D.ISL],
  },

  // ============================================================
  // MALATYA / ELAZIĞ ek
  // ============================================================
  {
    name: "İnönü Üniversitesi", type: "Devlet", city: "Malatya",
    departments: [D.BLM, D.EEM, D.EM, D.MM, D.IM, D.KM, D.MAT, D.FIZ,
      D.ISL, D.IKT, D.HUK, D.TIP, D.MIM],
  },
  {
    name: "Malatya Turgut Özal Üniversitesi", type: "Devlet", city: "Malatya",
    departments: [D.BLM, D.MM, D.GM, D.ZM, D.ISL],
  },

  // ============================================================
  // EK VAKIF MYO (Vakıf Meslek Yüksekokulları)
  // ============================================================
  {
    name: "İstanbul Şişli Meslek Yüksekokulu", type: "Vakıf MYO", city: "İstanbul",
    departments: [{ name: "İşletme Yönetimi", prefix: "IY" }],
  },
];

// Veri özeti (build-time doğrulanmış):
//   Toplam üniversite: 200
//   Devlet:    131
//   Vakıf:      66
//   Vakıf MYO:   3
//   Toplam bölüm-üniversite kombosu: 1421
//   Ortalama bölüm/üniversite: 7.1
//   Şehir kapsamı: 80 il
