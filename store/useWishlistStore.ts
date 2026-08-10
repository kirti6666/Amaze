"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Wishlist, guest-first.
 *
 * It used to be server-only: toggling while logged out threw, and the button
 * bounced you to /login. That's a lot of friction for "save this for later",
 * so the list now lives in localStorage and works on the first tap with no
 * account at all.
 *
 * When an account IS present the server stays the source of truth, and the two
 * are reconciled by union rather than overwrite:
 *  - `load()` merges the server's ids into whatever is stored locally, so
 *    something saved as a guest survives logging in;
 *  - `mergeIntoAccount()` runs after login/register and pushes anything local
 *    up to the server;
 *  - `toggle()` writes locally first and syncs in the background, so a logged
 *    -out toggle is a success rather than an error.
 *
 * Ids are held as an array internally (JSON-serialisable, so `persist` works
 * without a custom reviver) but exposed as a Set via `ids`, which is the shape
 * the existing components already read.
 */

interface WishlistState {
  /** Backing store — persisted. */
  _ids: string[];
  /** Set view for callers: `ids.has(productId)`. Rebuilt whenever _ids changes. */
  ids: Set<string>;
  loaded: boolean;
  loading: boolean;
  merging: boolean;
  load: () => Promise<void>;
  has: (productId: string) => boolean;
  /** Optimistic; never throws for logged-out users. Returns the new state. */
  toggle: (productId: string) => Promise<boolean>;
  mergeIntoAccount: () => Promise<void>;
}

/** Keeps the Set view in step with the persisted array. */
function withIds(list: string[]) {
  return { _ids: list, ids: new Set(list) };
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      _ids: [],
      ids: new Set<string>(),
      loaded: false,
      loading: false,
      merging: false,

      load: async () => {
        if (get().loaded || get().loading) return;
        set({ loading: true });
        try {
          const res = await fetch("/api/wishlist?ids=true");
          if (res.ok) {
            const data = await res.json();
            const serverIds: string[] = data.ids ?? [];
            // Union, not replace — a guest who saved three things and then
            // logged in keeps all three plus whatever was already on the account.
            const merged = Array.from(new Set([...get()._ids, ...serverIds]));
            set({ ...withIds(merged), loaded: true });
          } else {
            // 401 means logged out, which is now a normal state, not a failure.
            set({ loaded: true });
          }
        } catch {
          set({ loaded: true });
        } finally {
          set({ loading: false });
        }
      },

      has: (productId) => get().ids.has(productId),

      toggle: async (productId) => {
        const currentlyIn = get().ids.has(productId);
        const next = currentlyIn
          ? get()._ids.filter((id) => id !== productId)
          : [...get()._ids, productId];
        set(withIds(next));

        // Best-effort server sync. A 401 (guest) is expected and ignored: the
        // local list is authoritative until they sign in, at which point
        // mergeIntoAccount pushes it up.
        try {
          if (currentlyIn) {
            await fetch(`/api/wishlist?product=${productId}`, { method: "DELETE" });
          } else {
            await fetch("/api/wishlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ productId }),
            });
          }
        } catch {
          // Network failure — keep the local change rather than yanking the
          // heart back under the user's finger.
        }
        return !currentlyIn;
      },

      /**
       * Push the local list to the server after login/register.
       *
       * Failures are swallowed on purpose: an unsynced wishlist is a minor
       * annoyance, and an error toast in someone's first moment inside their
       * new account would be worse. Local ids are kept either way, so the next
       * `load()` reconciles again rather than losing anything.
       */
      mergeIntoAccount: async () => {
        const ids = get()._ids;
        if (ids.length === 0) return;
        set({ merging: true });
        try {
          await Promise.allSettled(
            ids.map((productId) =>
              fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
              })
            )
          );
        } finally {
          set({ merging: false });
        }
      },
    }),
    {
      name: "tiger-wishlist",
      storage: createJSONStorage(() => localStorage),
      // Only the array is stored; the Set view and the loading flags are
      // rebuilt on rehydrate so a reload can't restore a stuck spinner.
      partialize: (s) => ({ _ids: s._ids }),
      onRehydrateStorage: () => (state) => {
        if (state) state.ids = new Set(state._ids);
      },
    }
  )
);
