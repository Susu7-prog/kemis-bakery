export type NavLink = { label: string; href: string };

export type CategorySlug = "breads" | "pastries" | "cakes" | "spices";

export type Category = {
  slug: CategorySlug;
  name: string;
  blurb: string;
};

export type ProductBadge = "Bestseller" | "New";

/** Mirrors the planned `products` table. `price` is whole naira. */
export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: CategorySlug;
  stock: number;
  badge?: ProductBadge;
};

export type ProductSort = "featured" | "price-asc" | "price-desc" | "name";
