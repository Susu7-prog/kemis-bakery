"use client";

import { useState } from "react";
import Form from "next/form";
import Link from "next/link";
import { mainNav } from "@/lib/config/site";
import { cart, useCart } from "@/lib/cart/cart-store";
import { Sheet } from "@/components/ui/sheet";
import { Wordmark } from "./wordmark";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/ui/icons";

const iconButton =
  "relative inline-flex size-11 items-center justify-center rounded-md text-ink transition-colors duration-200 hover:bg-accent-soft";

/** Search, account, cart and mobile menu. Client-side because they open modal surfaces. */
export function HeaderActions() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { count } = useCart();

  return (
    <div className="flex items-center gap-1">
      <button type="button" className={iconButton} aria-label="Search products" aria-haspopup="dialog" onClick={() => setSearchOpen(true)}>
        <SearchIcon />
      </button>
      <Link href="/login" className={`${iconButton} max-lg:hidden`} aria-label="Account">
        <UserIcon />
      </Link>
      <button
        type="button"
        className={iconButton}
        aria-label={count === 1 ? "Cart, 1 item" : `Cart, ${count} items`}
        aria-haspopup="dialog"
        onClick={() => cart.open()}
      >
        <CartIcon />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.6875rem] font-semibold leading-5 text-on-accent"
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      <button type="button" className={`${iconButton} lg:hidden`} aria-label="Open menu" aria-haspopup="dialog" onClick={() => setMenuOpen(true)}>
        <MenuIcon />
      </button>

      {/* Search: slides from the top, submits a real GET to /shop?q= */}
      <Sheet open={searchOpen} onClose={() => setSearchOpen(false)} label="Search products" className="top-0 bottom-auto h-auto w-full open:block">
        <div className="mx-auto flex max-w-(--container-max) items-center gap-3 px-(--gutter) py-4">
          <Form action="/shop" role="search" className="flex flex-1 items-center gap-3" onSubmit={() => setSearchOpen(false)}>
            <label htmlFor="site-search" className="sr-only">Search products</label>
            <SearchIcon className="shrink-0 text-muted" />
            <input
              id="site-search"
              name="q"
              type="search"
              autoComplete="off"
              placeholder="Search breads, pastries, cakes and spices"
              className="h-12 min-w-0 flex-1 bg-transparent text-lead placeholder:text-muted"
            />
            <button type="submit" className="h-11 rounded-md bg-accent px-5 font-medium text-on-accent transition-colors hover:bg-accent-strong">
              Search
            </button>
          </Form>
          <button type="button" className={iconButton} aria-label="Close search" onClick={() => setSearchOpen(false)}>
            <CloseIcon />
          </button>
        </div>
      </Sheet>

      {/* Mobile menu: full screen */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} label="Menu" className="inset-0 h-dvh w-dvw flex-col open:flex">
        <div className="flex h-(--header-height) shrink-0 items-center justify-between px-(--gutter)">
          <Wordmark onClick={() => setMenuOpen(false)} />
          <button type="button" className={iconButton} aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-(--gutter) pb-10 pt-6">
          <ul className="divide-y divide-line border-y border-line">
            {[...mainNav, { label: "Account", href: "/login" }].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-16 items-center justify-between font-display text-title"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Sheet>
    </div>
  );
}
