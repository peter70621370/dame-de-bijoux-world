"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartProduct } from "@/lib/products";
import { cartStore, type CartItem } from "./store";

export type CartLine = CartItem & { product: CartProduct };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: CartProduct, variant?: string, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  toast: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

/** `products` : articles en ligne ; un article retiré du site disparaît aussi des paniers. */
export function CartProvider({ products, children }: { products: CartProduct[]; children: ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = useMemo(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return items.flatMap((item) => {
      const product = bySlug.get(item.slug);
      return product ? [{ ...item, product }] : [];
    });
  }, [items, products]);

  const add = useCallback((product: CartProduct, variant?: string, quantity = 1) => {
    cartStore.add(product.slug, variant, quantity);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(`${product.name}${variant ? ` · ${variant}` : ""}`);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      total: lines.reduce((n, l) => n + l.quantity * l.product.price, 0),
      isOpen,
      open: () => {
        setToast(null);
        setOpen(true);
      },
      close: () => setOpen(false),
      add,
      setQuantity: cartStore.setQuantity,
      clear: cartStore.clear,
      toast,
    }),
    [lines, isOpen, add, toast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
