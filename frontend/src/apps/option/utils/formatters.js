// Number / currency / percentage formatters.

// Returns true for values we want to render as an em-dash placeholder.
function isBlank(v) {
  return v === null || v === undefined || v === "" || Number.isNaN(v);
}

// Indian comma grouping: 1234567 -> "12,34,567"
export function indianComma(value) {
  if (isBlank(value)) return "—";
  const n = Math.round(Number(value));
  const neg = n < 0;
  let s = String(Math.abs(n));
  if (s.length > 3) {
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    s = rest + "," + last3;
  }
  return (neg ? "-" : "") + s;
}

// OI / volume in lakhs: 2350000 -> "23.5 L"
export function lakhs(value, digits = 1) {
  if (isBlank(value) || Number(value) === 0) return "—";
  return (Number(value) / 1e5).toFixed(digits) + " L";
}

// Price with rupee sign: 1234.5 -> "₹1,234.50"
export function rupee(value, digits = 2) {
  if (isBlank(value)) return "—";
  const n = Number(value);
  const fixed = Math.abs(n).toFixed(digits);
  const [intPart, decPart] = fixed.split(".");
  const grouped = indianComma(intPart * (n < 0 ? -1 : 1));
  return "₹" + grouped + (decPart ? "." + decPart : "");
}

// Plain price without currency: 23450 -> "23,450"
export function price(value, digits = 0) {
  if (isBlank(value)) return "—";
  if (digits === 0) return indianComma(value);
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

// Percentage: 60.42 -> "60.4%"
export function pct(value, digits = 1) {
  if (isBlank(value)) return "—";
  return Number(value).toFixed(digits) + "%";
}

// Signed number with + prefix: 256 -> "+256"
export function signed(value, digits = 0) {
  if (isBlank(value)) return "—";
  const n = Number(value);
  return (n > 0 ? "+" : "") + n.toFixed(digits);
}

// Compact rupee for P&L: 18750 -> "₹18,750"
export function rupeeWhole(value) {
  if (isBlank(value)) return "—";
  return "₹" + indianComma(Math.round(Number(value)));
}
