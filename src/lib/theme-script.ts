// Dijalankan di <head> sebelum halaman dirender, supaya class `light`/`dark`
// sudah terpasang di <html> sebelum paint pertama (tidak ada kedipan tema).
// Logikanya sama dengan applyTheme di ThemeProvider: storageKey "theme",
// default "system".
export const themeInitScript = `(function () {
  try {
    var theme = localStorage.getItem("theme")
    if (theme !== "dark" && theme !== "light" && theme !== "system") theme = "system"
    var resolved =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme
    var root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(resolved)
  } catch (error) {}
})()`
