"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/src/data/siteContent";

type CartItem = { product: Product; quantity: number };
type AddOptions = { notify?: boolean; openDrawer?: boolean };

type CartContextValue = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  notice: Product | null;
  add: (product: Product, options?: AddOptions) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  dismissNotice: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [notice, setNotice] = useState<Product | null>(null);

  const add = useCallback((product: Product, options: AddOptions = {}) => {
    setItems((current) => {
      const found = current.find((item) => item.product.id === product.id);
      if (found) {
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    if (options.notify !== false) setNotice(product);
    if (options.openDrawer) setOpen(true);
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.product.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const open = useCallback(() => { setNotice(null); setOpen(true); }, []);
  const close = useCallback(() => setOpen(false), []);
  const dismissNotice = useCallback(() => setNotice(null), []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({ items, count, isOpen, notice, add, decrement, remove, clear, open, close, dismissNotice }),
    [items, count, isOpen, notice, add, decrement, remove, clear, open, close, dismissNotice],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
