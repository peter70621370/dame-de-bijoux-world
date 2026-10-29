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
import { getProduct, type Product } from "@/lib/products";
import { cartStore, type CartItem } from "./store";

export type CartLine = CartItem & { product: Product };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, variant?: string, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  toast: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  );
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lines = useMemo(
    () =>
      items.flatMap((item) => {
        const product = getProduct(item.slug);
        return product ? [{ ...item, product }] : [];
      }),
    [items],
  );

  const add = useCallback((product: Product, variant?: string, quantity = 1) => {
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
