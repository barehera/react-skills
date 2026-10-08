const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
]

export function formatRelativeDate(isoDate: string, now = Date.now()) {
  const seconds = Math.round((new Date(isoDate).getTime() - now) / 1000)

  for (const [unit, unitSeconds] of units) {
    if (Math.abs(seconds) >= unitSeconds) {
      return formatter.format(Math.round(seconds / unitSeconds), unit)
    }
  }

  return formatter.format(seconds, "second")
}
