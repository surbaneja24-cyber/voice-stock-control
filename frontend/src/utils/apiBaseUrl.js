// Resuelve el origen del backend según el entorno.
// En producción (Vercel) se devuelve "" a propósito: el frontend llama a
// rutas relativas (/api/...) que vercel.json reescribe hacia el backend,
// de modo que la cookie de sesión sea same-origin y no la bloqueen
// Safari (ITP) ni los navegadores in-app de Android.
export function getApiBaseUrl() {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;

  if (window.location.hostname === "localhost") return "http://localhost:5001";

  // Túneles de GitHub Codespaces: el frontend vive en el puerto -5173
  // y el backend en el -5001, en el mismo host.
  if (window.location.hostname.includes("-5173")) {
    return `${window.location.protocol}//${window.location.hostname.replace("-5173", "-5001")}`;
  }

  return "";
}
