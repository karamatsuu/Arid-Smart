// First-launch gate: onboarding (Page 0) shows until completed or skipped.

const KEY = "aridsmart:onboarded";

export function isOnboarded(): boolean {
  return localStorage.getItem(KEY) === "1";
}

export function setOnboarded(): void {
  localStorage.setItem(KEY, "1");
}
