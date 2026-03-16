/**
 * Ramadan detection using the Hijri calendar (Umm al-Qura).
 * Ramadan is month 9 in the Islamic calendar.
 * Returns { isRamadan, day } where day = current day of Ramadan (1-30).
 */
export function getRamadanInfo(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);

    const month = parseInt(parts.find((p) => p.type === "month")?.value ?? "0");
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "1");

    return { isRamadan: month === 9, day };
  } catch {
    return { isRamadan: false, day: 1 };
  }
}
