import type { Product } from "@/types";

/**
 * Catalogue source of truth until the Supabase `products` table exists.
 * Field names and shapes match the planned table so the swap stays in lib/products.ts.
 */
const p = (slug: string): string => `/products/${slug}.svg`;

export const products: Product[] = [
  {
    id: "dd132556-de18-54e0-b4fe-060152fcddba", slug: "agege-loaf", name: "Agege Loaf", category: "breads",
    description: "Soft, tight-crumbed white loaf in the Agege style. Slices cleanly for sandwiches and toasts well.",
    price: 2200, stock: 40, imageUrl: p("agege-loaf"), galleryUrls: [p("agege-loaf"), p("agege-loaf-detail")], badge: "Bestseller",
  },
  {
    id: "bdfd408e-af5c-5d5c-a9e6-a5b3f22b8ea5", slug: "coconut-bread", name: "Coconut Bread", category: "breads",
    description: "A lightly sweet round loaf with toasted coconut in the dough and on the crust.",
    price: 2800, stock: 18, imageUrl: p("coconut-bread"), galleryUrls: [p("coconut-bread"), p("coconut-bread-detail")],
  },
  {
    id: "2d9d617f-1cbe-534e-8032-f83caa75e435", slug: "sweet-potato-millet-loaf", name: "Sweet Potato & Millet Loaf", category: "breads",
    description: "A slow-fermented tin loaf with roasted sweet potato and millet. Moist, nutty and good for a week.",
    price: 4500, stock: 12, imageUrl: p("sweet-potato-millet-loaf"), galleryUrls: [p("sweet-potato-millet-loaf"), p("sweet-potato-millet-loaf-detail")], badge: "New",
  },
  {
    id: "39fdcb07-d720-5a17-bf85-8f98b8ab0e47", slug: "honey-wheat-loaf", name: "Honey Whole-Wheat Loaf", category: "breads",
    description: "A dense, soft whole-wheat sandwich loaf sweetened with honey instead of refined sugar.",
    price: 3400, stock: 4, imageUrl: p("honey-wheat-loaf"), galleryUrls: [p("honey-wheat-loaf"), p("honey-wheat-loaf-detail")],
  },
  {
    id: "ac57f397-838c-541c-aa5f-45b3b10be637", slug: "meat-pie-box", name: "Beef Meat Pie, Box of 6", category: "pastries",
    description: "Flaky butter pastry filled with spiced beef, potato and carrot. Best warmed for ten minutes.",
    price: 5400, stock: 25, imageUrl: p("meat-pie-box"), galleryUrls: [p("meat-pie-box"), p("meat-pie-box-detail")], badge: "Bestseller",
  },
  {
    id: "cae70d36-49a8-5932-8e42-b9a25a99a9bb", slug: "puff-puff-box", name: "Puff Puff, Box of 20", category: "pastries",
    description: "Golden, airy fried dough balls with a hint of nutmeg. Made on the day you collect them.",
    price: 3000, stock: 30, imageUrl: p("puff-puff-box"), galleryUrls: [p("puff-puff-box"), p("puff-puff-box-detail")], badge: "Bestseller",
  },
  {
    id: "0d3a0f93-4b90-55f8-9083-70017e64b601", slug: "chin-chin-jar", name: "Chin Chin Jar, 500 g", category: "pastries",
    description: "Crunchy, lightly spiced fried pastry cubes in a reusable glass jar. Keeps for weeks.",
    price: 4200, stock: 22, imageUrl: p("chin-chin-jar"), galleryUrls: [p("chin-chin-jar"), p("chin-chin-jar-detail")],
  },
  {
    id: "2d317757-5821-5cd3-9c8d-bde389c3d134", slug: "hibiscus-cinnamon-rolls", name: "Hibiscus Cinnamon Rolls, Box of 4", category: "pastries",
    description: "Soft rolls swirled with cinnamon and a tart hibiscus filling, finished with a light glaze.",
    price: 4800, stock: 14, imageUrl: p("hibiscus-cinnamon-rolls"), galleryUrls: [p("hibiscus-cinnamon-rolls"), p("hibiscus-cinnamon-rolls-detail")], badge: "New",
  },
  {
    id: "0704e5d3-8052-5edc-9ed5-1feaa8747388", slug: "spiced-banana-bread", name: "Spiced Banana Bread", category: "cakes",
    description: "Ripe banana, ginger and cinnamon in a moist loaf with a crisp, caramelised top.",
    price: 3500, stock: 16, imageUrl: p("spiced-banana-bread"), galleryUrls: [p("spiced-banana-bread"), p("spiced-banana-bread-detail")],
  },
  {
    id: "a9d3e179-35ec-5a3d-b30e-cf6cfd8bb6d0", slug: "ginger-pound-cake", name: "Ginger Pound Cake", category: "cakes",
    description: "A buttery pound cake with fresh and ground ginger. Dense, sunny and excellent with tea.",
    price: 6500, stock: 9, imageUrl: p("ginger-pound-cake"), galleryUrls: [p("ginger-pound-cake"), p("ginger-pound-cake-detail")],
  },
  {
    id: "850d6690-25c3-5a99-add2-81229b92fae9", slug: "hibiscus-layer-cake", name: "Hibiscus Layer Cake", category: "cakes",
    description: "Two vanilla sponge layers, cream cheese frosting and a deep red hibiscus drip. Serves 10 to 12.",
    price: 14000, stock: 5, imageUrl: p("hibiscus-layer-cake"), galleryUrls: [p("hibiscus-layer-cake"), p("hibiscus-layer-cake-detail")], badge: "New",
  },
  {
    id: "09a9de59-aa86-50c3-9214-169691394056", slug: "coconut-lime-cake", name: "Coconut & Lime Cake", category: "cakes",
    description: "Coconut sponge brushed with lime syrup and covered in lime cream. Serves 10 to 12.",
    price: 12500, stock: 0, imageUrl: p("coconut-lime-cake"), galleryUrls: [p("coconut-lime-cake"), p("coconut-lime-cake-detail")],
  },
  {
    id: "0a949ce0-7c97-5fad-be9b-b2b5731cc826", slug: "suya-spice-yaji", name: "Suya Spice (Yaji), 150 g", category: "spices",
    description: "Roasted peanut, ginger, paprika and chilli blended for suya, grilled chicken and roasted plantain.",
    price: 2500, stock: 60, imageUrl: p("suya-spice-yaji"), galleryUrls: [p("suya-spice-yaji"), p("suya-spice-yaji-detail")], badge: "Bestseller",
  },
  {
    id: "2a24a3dc-883f-5c9c-89c3-ff9e4ff33fdf", slug: "jollof-spice-blend", name: "Jollof Spice Blend, 120 g", category: "spices",
    description: "Thyme, curry, bay, garlic and dried pepper in the ratio we use for party jollof.",
    price: 2400, stock: 45, imageUrl: p("jollof-spice-blend"), galleryUrls: [p("jollof-spice-blend"), p("jollof-spice-blend-detail")],
  },
  {
    id: "452b0103-1352-5bef-8939-5dce1a22d283", slug: "zobo-spice-mix", name: "Zobo Spice Mix, 100 g", category: "spices",
    description: "Ginger, cloves and dried pineapple peel for brewing zobo, or for spiced bakes.",
    price: 2200, stock: 38, imageUrl: p("zobo-spice-mix"), galleryUrls: [p("zobo-spice-mix"), p("zobo-spice-mix-detail")],
  },
  {
    id: "8e7a4937-284c-5957-8ecc-cec7ce9e26f9", slug: "spice-discovery-box", name: "Spice Discovery Box", category: "spices",
    description: "Small jars of yaji, jollof blend and zobo mix in a gift box. A good place to start.",
    price: 8900, stock: 20, imageUrl: p("spice-discovery-box"), galleryUrls: [p("spice-discovery-box"), p("spice-discovery-box-detail")], badge: "New",
  },
];

/** The hand-picked set shown in the homepage featured collection. */
export const featuredCollection = {
  title: "The hibiscus edit",
  description:
    "Zobo season, baked. Tart hibiscus folded into rolls and cake, plus the spice mix behind the drink.",
  productSlugs: ["hibiscus-cinnamon-rolls", "hibiscus-layer-cake", "zobo-spice-mix"],
} as const;
