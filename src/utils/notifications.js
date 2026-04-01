const NAMES = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

let handles = [];

export function scheduleNotifications(prayerTimes) {
  clearScheduled();
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;

  const now = Date.now();
  for (const [key, name] of Object.entries(NAMES)) {
    const t = prayerTimes[key];
    if (!t) continue;
    const ms = t.getTime() - now;
    if (ms < 0) continue;
    const id = setTimeout(() => {
      try {
        new Notification(`🕌 ${name} Prayer Time`, {
          body: `It is time for ${name} prayer`,
          icon: "/icons/icon-192.png",
          tag: `maqam-${key}`,
          silent: false,
        });
      } catch (_) {
        /* ignore if notification is blocked */
      }
    }, ms);
    handles.push(id);
  }
}

export function clearScheduled() {
  handles.forEach(clearTimeout);
  handles = [];
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return await Notification.requestPermission();
}

export function getPermissionStatus() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}
