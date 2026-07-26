export const NAV_LOADING_EVENT = "bravio:nav-loading";

/** Signal the global NavigationProgress overlay for programmatic navigations. */
export function signalNavigationStart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(NAV_LOADING_EVENT));
}
