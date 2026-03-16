export const HIJRI_MONTHS = [
  "Muḥarram",
  "Ṣafar",
  "Rabīʿ al-Awwal",
  "Rabīʿ al-Thānī",
  "Jumādā al-Ūlā",
  "Jumādā al-Ākhirah",
  "Rajab",
  "Shaʿbān",
  "Ramaḍān",
  "Shawwāl",
  "Dhū al-Qaʿdah",
  "Dhū al-Ḥijjah",
];

export const HIJRI_MONTHS_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الثاني",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

export const KEY_EVENTS = [
  { month: 1, day: 1, name: "Islamic New Year", arabic: "رأس السنة الهجرية" },
  { month: 1, day: 10, name: "Day of Ashura", arabic: "يوم عاشوراء" },
  { month: 3, day: 12, name: "Mawlid an-Nabī", arabic: "المولد النبوي" },
  { month: 7, day: 27, name: "Laylat al-Miʿrāj", arabic: "ليلة المعراج" },
  { month: 8, day: 15, name: "Laylat al-Barāʾah", arabic: "ليلة البراءة" },
  { month: 9, day: 1, name: "Ramadan Begins", arabic: "بداية رمضان" },
  { month: 9, day: 27, name: "Laylat al-Qadr", arabic: "ليلة القدر" },
  { month: 10, day: 1, name: "Eid al-Fiṭr", arabic: "عيد الفطر" },
  { month: 12, day: 9, name: "Day of Arafah", arabic: "يوم عرفة" },
  { month: 12, day: 10, name: "Eid al-Aḍḥā", arabic: "عيد الأضحى" },
];

export function getHijriParts(date) {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);
    return {
      year: parseInt(parts.find((p) => p.type === "year")?.value ?? "0"),
      month: parseInt(parts.find((p) => p.type === "month")?.value ?? "0"),
      day: parseInt(parts.find((p) => p.type === "day")?.value ?? "0"),
    };
  } catch {
    return { year: 0, month: 0, day: 0 };
  }
}

export function getHijriMonthDays(referenceDate = new Date()) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);

  const refH = getHijriParts(ref);
  const { month: targetMonth, year: targetYear } = refH;

  // Approximate first day of this Hijri month, then scan ±3 days to find exact
  const approxFirst = new Date(ref);
  approxFirst.setDate(approxFirst.getDate() - refH.day + 1);

  let firstDay = new Date(approxFirst);
  for (let offset = -3; offset <= 3; offset++) {
    const d = new Date(approxFirst);
    d.setDate(d.getDate() + offset);
    const h = getHijriParts(d);
    if (h.day === 1 && h.month === targetMonth && h.year === targetYear) {
      firstDay = d;
      break;
    }
  }

  // Collect all days in this Hijri month (29 or 30 days)
  const days = [];
  const d = new Date(firstDay);
  for (let i = 0; i < 31; i++) {
    const h = getHijriParts(d);
    if (h.month !== targetMonth || h.year !== targetYear) break;
    const isToday = d.getTime() === today.getTime();
    const event =
      KEY_EVENTS.find((e) => e.month === h.month && e.day === h.day) ?? null;
    days.push({ gregorian: new Date(d), hijri: h, isToday, event });
    d.setDate(d.getDate() + 1);
  }

  return {
    days,
    month: targetMonth,
    year: targetYear,
    firstWeekday: firstDay.getDay(), // 0=Sun … 6=Sat
  };
}

export function getUpcomingEvents(limit = 6) {
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 366 && events.length < limit; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const h = getHijriParts(d);
    const ev = KEY_EVENTS.find((e) => e.month === h.month && e.day === h.day);
    if (ev)
      events.push({
        ...ev,
        gregorian: new Date(d),
        hijriYear: h.year,
        daysUntil: i,
      });
  }
  return events;
}
