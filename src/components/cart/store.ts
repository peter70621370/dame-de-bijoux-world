// Panier conservé dans le navigateur (localStorage) : aucune donnée n'est
// envoyée à un serveur, la commande part uniquement par WhatsApp.

export type CartItem = {
  key: string;
  slug: string;
  variant?: string;
  quantity: number;
};

const STORAGE_KEY = "ddb-commande-v1";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
    items = Array.isArray(parsed) ? parsed.filter((i) => i && i.slug && i.quantity > 0) : [];
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Navigation privée ou stockage bloqué : le panier reste valable pour la visite.
  }
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      loaded = false;
      load();
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot() {
    load();
    return items;
  },
  getServerSnapshot() {
    return EMPTY;
  },
  add(slug: string, variant: string | undefined, quantity = 1) {
    load();
    const key = variant ? `${slug}::${variant}` : slug;
    const existing = items.find((i) => i.key === key);
    commit(
      existing
        ? items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i))
        : [...items, { key, slug, variant, quantity }],
    );
  },
  setQuantity(key: string, quantity: number) {
    commit(
      quantity <= 0
        ? items.filter((i) => i.key !== key)
        : items.map((i) => (i.key === key ? { ...i, quantity } : i)),
    );
  },
  clear() {
    commit([]);
  },
};
