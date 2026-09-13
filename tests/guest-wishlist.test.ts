import { test } from "node:test";
import assert from "node:assert/strict";
import { loadGuestWishlist } from "../components/storefront/guest-wishlist";

test("guest favourites resolve through public product endpoints and omit removed or inactive products", async t => {
  const paths: string[] = [];
  t.mock.method(globalThis, "fetch", async (url: string) => {
    paths.push(url);
    if (url.endsWith("deleted")) return new Response(null, { status: 404 });
    return Response.json({ product: { _id: url.split("/").at(-1), isActive: !url.endsWith("inactive") } });
  });
  const products = await loadGuestWishlist(["first", "deleted", "inactive", "second"]);
  assert.deepEqual(products.map(p => p._id), ["first", "second"]);
  assert.ok(paths.every(p => p.startsWith("/api/products/")));
});

test("empty guest wishlist makes no product requests", async t => {
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected request"); });
  assert.deepEqual(await loadGuestWishlist([]), []);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("server failures surface as retryable errors rather than an empty wishlist", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(null, { status: 500 }));
  await assert.rejects(loadGuestWishlist(["first"]), /Please try again/);
});

test("large wishlists use batches of at most six and retain saved order", async t => {
  let active = 0;
  let peak = 0;
  t.mock.method(globalThis, "fetch", async (url: string) => {
    active++;
    peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 5));
    active--;
    return Response.json({ product: { _id: url.split("/").at(-1), isActive: true } });
  });
  const ids = Array.from({ length: 14 }, (_, i) => String(i));
  assert.deepEqual((await loadGuestWishlist(ids)).map(p => p._id), ids);
  assert.ok(peak <= 6);
});
