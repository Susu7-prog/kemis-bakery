"use client";

import { useSyncExternalStore } from "react";

/**
 * Client cart: a tiny external store persisted in localStorage.
 * It stores display snapshots only. Prices shown here are for convenience; the
 * server re-reads prices from the database at checkout and never trusts these.
 */
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  maxQuantity: number;
};

export type CartProductInput = {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
};

const STORAGE_KEY = "kemis-cart-v2";
const MAX_PER_LINE = 20;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
let isOpen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function clampQuantity(quantity: number, maxQuantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.max(1, Math.min(Math.floor(quantity), maxQuantity, MAX_PER_LINE));
}

/** Drops anything malformed so a corrupted or tampered store can't break the UI. */
function sanitize(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return EMPTY;
  const clean: CartItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (
      typeof r.productId !== "string" || typeof r.slug !== "string" ||
      typeof r.name !== "string" || typeof r.imageUrl !== "string" ||
      typeof r.price !== "number" || !Number.isFinite(r.price) || r.price < 0 ||
      typeof r.maxQuantity !== "number" || r.maxQuantity < 1 ||
      typeof r.quantity !== "number"
    ) continue;
    if (clean.some((i) => i.productId === r.productId)) continue;
    clean.push({
      productId: r.productId, slug: r.slug, name: r.name, imageUrl: r.imageUrl,
      price: r.price, maxQuantity: Math.floor(r.maxQuantity),
      quantity: clampQuantity(r.quantity, Math.floor(r.maxQuantity)),
    });
  }
  return clean.length ? clean : EMPTY;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) items = sanitize(JSON.parse(raw));
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next.length ? next : EMPTY;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage can be unavailable (private mode, quota). The cart still works in memory.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    loaded = false;
    items = EMPTY;
    load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return items;
};
const getServerSnapshot = () => EMPTY;

export const cart = {
  add(product: CartProductInput, quantity = 1) {
    load();
    if (product.stock < 1) return;
    const existing = items.find((i) => i.productId === product.id);
    if (existing) {
      commit(items.map((i) =>
        i.productId === product.id
          ? { ...i, quantity: clampQuantity(i.quantity + quantity, i.maxQuantity) }
          : i,
      ));
    } else {
      commit([
        ...items,
        {
          productId: product.id, slug: product.slug, name: product.name,
          price: product.price, imageUrl: product.imageUrl,
          maxQuantity: product.stock,
          quantity: clampQuantity(quantity, product.stock),
        },
      ]);
    }
    cart.open();
  },
  setQuantity(productId: string, quantity: number) {
    load();
    if (!Number.isFinite(quantity) || quantity < 1) {
      cart.remove(productId);
      return;
    }
    commit(items.map((i) =>
      i.productId === productId ? { ...i, quantity: clampQuantity(quantity, i.maxQuantity) } : i,
    ));
  },
  remove(productId: string) {
    load();
    commit(items.filter((i) => i.productId !== productId));
  },
  clear() {
    load();
    commit([]);
  },
  /** Applies authoritative price and stock from the server after a rejected checkout. */
  applyServerLines(lines: { productId: string; price: number; stock: number }[]) {
    load();
    commit(
      items
        .map((item) => {
          const line = lines.find((l) => l.productId === item.productId);
          if (!line) return item;
          const maxQuantity = Math.max(0, Math.floor(line.stock));
          return { ...item, price: line.price, maxQuantity, quantity: maxQuantity > 0 ? clampQuantity(item.quantity, maxQuantity) : 0 };
        })
        .filter((item) => item.quantity > 0 && item.maxQuantity > 0),
    );
  },
  /** Caps a line at the stock the server reported, removing it if nothing is left. */
  limitStock(productId: string, available: number) {
    load();
    const maxQuantity = Math.max(0, Math.floor(available));
    commit(
      items
        .map((i) => (i.productId === productId ? { ...i, maxQuantity, quantity: maxQuantity > 0 ? clampQuantity(i.quantity, maxQuantity) : 0 } : i))
        .filter((i) => i.quantity > 0 && i.maxQuantity > 0),
    );
  },
  open() {
    isOpen = true;
    emit();
  },
  close() {
    isOpen = false;
    emit();
  },
};

export function useCart() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const count = current.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = current.reduce((sum, i) => sum + i.quantity * i.price, 0);
  return { items: current, count, subtotal };
}

export function useCartOpen() {
  return useSyncExternalStore(subscribe, () => isOpen, () => false);
}

/** False during server rendering and hydration, true once the saved cart has been read. */
export function useCartHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
