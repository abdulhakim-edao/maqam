import {
  Coordinates,
  PrayerTimes,
  CalculationMethod,
  Madhab,
  HighLatitudeRule,
} from "adhan";

export const CALC_METHODS = [
  { key: "NorthAmerica", label: "ISNA", sub: "North America" },
  { key: "MuslimWorldLeague", label: "MWL", sub: "Muslim World League" },
  { key: "Egyptian", label: "Egyptian", sub: "Egyptian General Authority" },
  { key: "Karachi", label: "Karachi", sub: "University of Islamic Sciences" },
  { key: "UmmAlQura", label: "Umm al-Qura", sub: "Saudi Arabia" },
  {
    key: "MoonsightingCommittee",
    label: "Moon Sighting",
    sub: "Khalid Shaukat",
  },
];

export function getPrayerTimes(
  latitude,
  longitude,
  date = new Date(),
  methodKey = "NorthAmerica",
  asrMadhab = "standard",
  highLatitude = "middleOfNight",
) {
  const coords = new Coordinates(latitude, longitude);
  const methodFn =
    CalculationMethod[methodKey] ?? CalculationMethod.NorthAmerica;
  const params = methodFn();

  // Asr madhab
  params.madhab = asrMadhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;

  // High latitude rule
  const hlMap = {
    none: null,
    middleOfNight: HighLatitudeRule.MiddleOfTheNight,
    seventhOfNight: HighLatitudeRule.SeventhOfTheNight,
    twilightAngle: HighLatitudeRule.TwilightAngle,
  };
  const hl = hlMap[highLatitude];
  if (hl !== null && hl !== undefined) params.highLatitudeRule = hl;

  return new PrayerTimes(coords, date, params);
}

export function getPrayersList(prayerTimes) {
  return [
    { key: "fajr", name: "Fajr", arabic: "الفجر", time: prayerTimes.fajr },
    {
      key: "sunrise",
      name: "Sunrise",
      arabic: "الشروق",
      time: prayerTimes.sunrise,
    },
    { key: "dhuhr", name: "Dhuhr", arabic: "الظهر", time: prayerTimes.dhuhr },
    { key: "asr", name: "Asr", arabic: "العصر", time: prayerTimes.asr },
    {
      key: "maghrib",
      name: "Maghrib",
      arabic: "المغرب",
      time: prayerTimes.maghrib,
    },
    { key: "isha", name: "Isha", arabic: "العشاء", time: prayerTimes.isha },
  ];
}

export function formatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatCountdown(ms) {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
