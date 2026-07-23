"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { HttpTypes } from "@medusajs/types";
import { sdk } from "@/lib/sdk";

const CART_FIELDS =
  "*items,*items.product,*items.variant,*items.variant.options,*region,*shipping_methods";

type CartContextValue = {
  cart?: HttpTypes.StoreCart;
  count: number;
  busy: boolean;
  regionId?: string;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  refresh: () => Promise<HttpTypes.StoreCart | undefined>;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  regionId,
  children,
}: {
  regionId?: string;
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<HttpTypes.StoreCart>();
  const [busy, setBusy] = useState(false);

  const fetchCart = useCallback(async (id: string) => {
    const { cart } = await sdk.store.cart.retrieve(id, { fields: CART_FIELDS });
    return cart;
  }, []);

  // Reconcile the stored cart on mount and whenever the active region changes
  // (locale switch): re-point the cart at the new region so prices re-cost.
  useEffect(() => {
    let active = true;
    (async () => {
      const id =
        typeof window !== "undefined" ? localStorage.getItem("cart_id") : null;
      if (!id) return;
      try {
        let current = await fetchCart(id);
        if (regionId && current.region_id !== regionId) {
          const { cart: updated } = await sdk.store.cart.update(id, {
            region_id: regionId,
          });
          current = updated;
        }
        if (active) setCart(current);
      } catch {
        localStorage.removeItem("cart_id");
        if (active) setCart(undefined);
      }
    })();
    return () => {
      active = false;
    };
  }, [regionId, fetchCart]);

  const ensureCart = useCallback(async (): Promise<string> => {
    const existing = localStorage.getItem("cart_id");
    if (existing) return existing;
    if (!regionId) throw new Error("No region available to create a cart.");
    const { cart: created } = await sdk.store.cart.create({
      region_id: regionId,
    });
    localStorage.setItem("cart_id", created.id);
    setCart(created);
    return created.id;
  }, [regionId]);

  const refresh = useCallback(async () => {
    const id = localStorage.getItem("cart_id");
    if (!id) return undefined;
    const current = await fetchCart(id);
    setCart(current);
    return current;
  }, [fetchCart]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      setBusy(true);
      try {
        const id = await ensureCart();
        await sdk.store.cart.createLineItem(id, {
          variant_id: variantId,
          quantity,
        });
        setCart(await fetchCart(id));
      } finally {
        setBusy(false);
      }
    },
    [ensureCart, fetchCart],
  );

  const setQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      const id = localStorage.getItem("cart_id");
      if (!id) return;
      setBusy(true);
      try {
        if (quantity <= 0) {
          await sdk.store.cart.deleteLineItem(id, lineId);
        } else {
          await sdk.store.cart.updateLineItem(id, lineId, { quantity });
        }
        setCart(await fetchCart(id));
      } finally {
        setBusy(false);
      }
    },
    [fetchCart],
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      const id = localStorage.getItem("cart_id");
      if (!id) return;
      setBusy(true);
      try {
        await sdk.store.cart.deleteLineItem(id, lineId);
        setCart(await fetchCart(id));
      } finally {
        setBusy(false);
      }
    },
    [fetchCart],
  );

  const clear = useCallback(() => {
    localStorage.removeItem("cart_id");
    setCart(undefined);
  }, []);

  const count = cart?.items?.reduce((n, i) => n + (i.quantity ?? 0), 0) ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        count,
        busy,
        regionId,
        addItem,
        setQuantity,
        removeItem,
        refresh,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
