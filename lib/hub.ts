import type { LocalData } from "@/lib/types"

const STORAGE_KEY = "all-for-one:v2"

const emptyLocal: LocalData = { usage: {}, readLater: [], notes: "", activity: {} }

export function loadLocalData(): LocalData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...emptyLocal, ...JSON.parse(raw) } : emptyLocal
  } catch {
    return emptyLocal
  }
}

export function saveLocalData(data: LocalData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or blocked (private mode): the hub still works for this session.
  }
}

/** Local calendar day as YYYY-MM-DD, `offset` days from today. */
export function dayKey(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function faviconUrl(url: string) {
  // domain_url (full origin) resolves subdomain icons; domain= collapses calendar/mail.google.com to the Google "G".
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(`https://${getDomain(url)}`)}&sz=64`
}

/** Accepts "github.com" or "https://github.com" and returns a full URL, or null. */
export function normalizeUrl(input: string) {
  const value = input.trim()
  if (!value || /\s/.test(value)) return null
  try {
    const url = new URL(/^[a-z]+:\/\//i.test(value) ? value : `https://${value}`)
    return url.hostname.includes(".") ? url.toString() : null
  } catch {
    return null
  }
}

export function titleFromUrl(url: string) {
  const name = getDomain(url).split(".")[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function greeting(hour: number) {
  if (hour < 5) return { lead: "Boa", accent: "madrugada" }
  if (hour < 12) return { lead: "Bom", accent: "dia" }
  if (hour < 18) return { lead: "Boa", accent: "tarde" }
  return { lead: "Boa", accent: "noite" }
}

export function openUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}
