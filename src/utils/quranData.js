// Standard Medina Mushaf (Hafs 'an 'Asim) — 604 pages
// Each entry: [startPage, arabicName, transliteration]
export const SURAHS = [
  [1, "الفاتحة", "Al-Fātiḥah"],
  [2, "البقرة", "Al-Baqarah"],
  [50, "آل عمران", "Āl ʿImrān"],
  [77, "النساء", "An-Nisāʾ"],
  [106, "المائدة", "Al-Māʾidah"],
  [128, "الأنعام", "Al-Anʿām"],
  [151, "الأعراف", "Al-Aʿrāf"],
  [177, "الأنفال", "Al-Anfāl"],
  [187, "التوبة", "At-Tawbah"],
  [208, "يونس", "Yūnus"],
  [221, "هود", "Hūd"],
  [235, "يوسف", "Yūsuf"],
  [249, "الرعد", "Ar-Raʿd"],
  [255, "إبراهيم", "Ibrāhīm"],
  [262, "الحجر", "Al-Ḥijr"],
  [267, "النحل", "An-Naḥl"],
  [282, "الإسراء", "Al-Isrāʾ"],
  [293, "الكهف", "Al-Kahf"],
  [305, "مريم", "Maryam"],
  [312, "طه", "Ṭā Hā"],
  [322, "الأنبياء", "Al-Anbiyāʾ"],
  [333, "الحج", "Al-Ḥajj"],
  [342, "المؤمنون", "Al-Muʾminūn"],
  [350, "النور", "An-Nūr"],
  [359, "الفرقان", "Al-Furqān"],
  [367, "الشعراء", "Ash-Shuʿarāʾ"],
  [377, "النمل", "An-Naml"],
  [385, "القصص", "Al-Qaṣaṣ"],
  [396, "العنكبوت", "Al-ʿAnkabūt"],
  [404, "الروم", "Ar-Rūm"],
  [411, "لقمان", "Luqmān"],
  [415, "السجدة", "As-Sajdah"],
  [418, "الأحزاب", "Al-Aḥzāb"],
  [428, "سبأ", "Sabaʾ"],
  [434, "فاطر", "Fāṭir"],
  [440, "يس", "Yā Sīn"],
  [446, "الصافات", "Aṣ-Ṣāffāt"],
  [453, "ص", "Ṣād"],
  [458, "الزمر", "Az-Zumar"],
  [467, "غافر", "Ghāfir"],
  [477, "فصلت", "Fuṣṣilat"],
  [483, "الشورى", "Ash-Shūrā"],
  [489, "الزخرف", "Az-Zukhruf"],
  [496, "الدخان", "Ad-Dukhān"],
  [499, "الجاثية", "Al-Jāthiyah"],
  [502, "الأحقاف", "Al-Aḥqāf"],
  [507, "محمد", "Muḥammad"],
  [511, "الفتح", "Al-Fatḥ"],
  [515, "الحجرات", "Al-Ḥujurāt"],
  [518, "ق", "Qāf"],
  [520, "الذاريات", "Adh-Dhāriyāt"],
  [523, "الطور", "Aṭ-Ṭūr"],
  [526, "النجم", "An-Najm"],
  [528, "القمر", "Al-Qamar"],
  [531, "الرحمن", "Ar-Raḥmān"],
  [534, "الواقعة", "Al-Wāqiʿah"],
  [537, "الحديد", "Al-Ḥadīd"],
  [542, "المجادلة", "Al-Mujādilah"],
  [545, "الحشر", "Al-Ḥashr"],
  [549, "الممتحنة", "Al-Mumtaḥanah"],
  [551, "الصف", "Aṣ-Ṣaff"],
  [553, "الجمعة", "Al-Jumuʿah"],
  [554, "المنافقون", "Al-Munāfiqūn"],
  [556, "التغابن", "At-Taghābun"],
  [558, "الطلاق", "Aṭ-Ṭalāq"],
  [560, "التحريم", "At-Taḥrīm"],
  [562, "الملك", "Al-Mulk"],
  [564, "القلم", "Al-Qalam"],
  [566, "الحاقة", "Al-Ḥāqqah"],
  [568, "المعارج", "Al-Maʿārij"],
  [570, "نوح", "Nūḥ"],
  [572, "الجن", "Al-Jinn"],
  [574, "المزمل", "Al-Muzzammil"],
  [575, "المدثر", "Al-Muddaththir"],
  [577, "القيامة", "Al-Qiyāmah"],
  [578, "الإنسان", "Al-Insān"],
  [580, "المرسلات", "Al-Mursalāt"],
  [582, "النبأ", "An-Nabaʾ"],
  [583, "النازعات", "An-Nāziʿāt"],
  [585, "عبس", "ʿAbasa"],
  [586, "التكوير", "At-Takwīr"],
  [587, "الانفطار", "Al-Infiṭār"],
  [587, "المطففين", "Al-Muṭaffifīn"],
  [589, "الانشقاق", "Al-Inshiqāq"],
  [590, "البروج", "Al-Burūj"],
  [591, "الطارق", "Aṭ-Ṭāriq"],
  [591, "الأعلى", "Al-Aʿlā"],
  [592, "الغاشية", "Al-Ghāshiyah"],
  [593, "الفجر", "Al-Fajr"],
  [594, "البلد", "Al-Balad"],
  [595, "الشمس", "Ash-Shams"],
  [595, "الليل", "Al-Layl"],
  [596, "الضحى", "Aḍ-Ḍuḥā"],
  [596, "الشرح", "Ash-Sharḥ"],
  [597, "التين", "At-Tīn"],
  [597, "العلق", "Al-ʿAlaq"],
  [598, "القدر", "Al-Qadr"],
  [598, "البينة", "Al-Bayyinah"],
  [599, "الزلزلة", "Az-Zalzalah"],
  [599, "العاديات", "Al-ʿĀdiyāt"],
  [600, "القارعة", "Al-Qāriʿah"],
  [600, "التكاثر", "At-Takāthur"],
  [601, "العصر", "Al-ʿAṣr"],
  [601, "الهمزة", "Al-Humazah"],
  [601, "الفيل", "Al-Fīl"],
  [602, "قريش", "Quraysh"],
  [602, "الماعون", "Al-Māʿūn"],
  [602, "الكوثر", "Al-Kawthar"],
  [603, "الكافرون", "Al-Kāfirūn"],
  [603, "النصر", "An-Naṣr"],
  [603, "المسد", "Al-Masad"],
  [604, "الإخلاص", "Al-Ikhlāṣ"],
  [604, "الفلق", "Al-Falaq"],
  [604, "الناس", "An-Nās"],
];

// Juz start pages (index 0 = juz 1)
export const JUZ_PAGES = [
  1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 221, 241, 262, 282, 302, 322,
  342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

export const TOTAL_PAGES = 604;

export const PAGE_IMG = (page) =>
  `https://cdn.islamic.network/quran/images/high-resolution/page${String(page).padStart(3, "0")}.png`;

export const PAGE_IMG_FALLBACK = (page) =>
  `https://cdn.islamic.network/quran/images/page${String(page).padStart(3, "0")}.png`;

export function getSurahForPage(page) {
  for (let i = SURAHS.length - 1; i >= 0; i--) {
    if (page >= SURAHS[i][0])
      return { num: i + 1, ar: SURAHS[i][1], en: SURAHS[i][2] };
  }
  return null;
}

export function getJuzForPage(page) {
  let juz = 1;
  for (let i = 0; i < JUZ_PAGES.length; i++) {
    if (page >= JUZ_PAGES[i]) juz = i + 1;
    else break;
  }
  return juz;
}

// Hizb start pages — 60 Hizb (2 per Juz, 2nd starts at the midpoint of each Juz)
export const HIZB_PAGES = JUZ_PAGES.flatMap((start, i) => {
  const end = JUZ_PAGES[i + 1] ?? 605;
  return [start, Math.floor((start + end) / 2)];
});

export function getHizbForPage(page) {
  let hizb = 1;
  for (let i = 0; i < HIZB_PAGES.length; i++) {
    if (page >= HIZB_PAGES[i]) hizb = i + 1;
    else break;
  }
  return hizb;
}

// Rub' al-Hizb (quarter-hizb) — 240 entries, 4 per hizb
export const HIZB_QUARTER_PAGES = HIZB_PAGES.flatMap((start, i) => {
  const end = HIZB_PAGES[i + 1] ?? 605;
  const len = end - start;
  return [
    start,
    start + Math.floor(len / 4),
    start + Math.floor(len / 2),
    start + Math.floor((len * 3) / 4),
  ];
});

const QUARTER_SYMS = ["", "¼ ", "½ ", "¾ "];

export function getHizbQuarterForPage(page) {
  let idx = 0;
  for (let i = 0; i < HIZB_QUARTER_PAGES.length; i++) {
    if (page >= HIZB_QUARTER_PAGES[i]) idx = i;
    else break;
  }
  const hizb = Math.floor(idx / 4) + 1;
  const quarter = idx % 4;
  return `${QUARTER_SYMS[quarter]}Hizb ${hizb}`;
}
