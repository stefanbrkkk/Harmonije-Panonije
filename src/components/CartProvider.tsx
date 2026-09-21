"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { Product } from "@/src/data/siteContent";

type CartItem = { product: Product; quantity: number };
type AddOptions = { notify?: boolean; openDrawer?: boolean };

/** One feedback event per addition: unique sequence, product and live count. */
export type CartNotice = { seq: number; product: Product; quantity: number };

/** Upper bound keeps quantities (and the generated draft) reasonable. */
const MAX_QUANTITY = 99;

type CartContextValue = {
  items: CartItem[];
  count: number;
  isOpen: boolean;
  notice: CartNotice | null;
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
  // Deliberately in-memory only (HP-34): inquiry drafts reset on reload.
  // No product, quantity or personal data is persisted anywhere.
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [notice, setNotice] = useState<CartNotice | null>(null);
  const seqRef = useRef(0);

  const add = useCallback((product: Product, options: AddOptions = {}) => {
    let quantity = 1;
    setItems((current) => {
      const found = current.find((item) => item.product.id === product.id);
      if (found) {
        quantity = Math.min(MAX_QUANTITY, found.quantity + 1);
        return current.map((item) =>
          item.product.id === product.id ? { ...item, quantity } : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    if (options.notify !== false) {
      seqRef.current += 1;
      setNotice({ seq: seqRef.current, product, quantity });
    }
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
