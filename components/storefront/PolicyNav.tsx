"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { POLICIES } from "@/lib/policies";
import { PolicyIcon } from "./PolicyIcon";

/**
 * Side navigation between policies. Sticky column on desktop; on phones it
 * collapses into a horizontally scrolling row of chips above the content, so
 * switching policy never means scrolling back to the top of a long page.
 */
export function PolicyNav() {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);

  // On phones the list is a horizontal scroller; bring the current policy's
  // chip into view. Only the list scrolls — never the page.
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>("a.is-active");
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    list.scrollLeft = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);

  return (
    <nav className="policy-nav" aria-label="Store policies">
      <p className="policy-nav-title">Store policies</p>
      <ul ref={listRef}>
        {POLICIES.map((p) => {
          const href = `/policies/${p.slug}`;
          const active = pathname === href;
          return (
            <li key={p.slug}>
              <Link href={href} aria-current={active ? "page" : undefined} className={active ? "is-active" : undefined}>
                <PolicyIcon name={p.icon} size={16} />
                <span>{p.navLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
