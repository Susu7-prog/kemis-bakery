import type { Product } from "@/types";

/**
 * Catalogue source of truth until the Supabase `products` table exists.
 * Field names and shapes match the planned table so the swap stays in lib/products.ts.
 */
const p = (slug: string): string => `/products/${slug}.svg`;

export const products: Product[] = [
  {
    id: "prd_agege_loaf", slug: "agege-loaf", name: "Agege Loaf", category: "breads",
    description: "Soft, tight-crumbed white loaf in the Agege style. Slices cleanly for sandwiches and toasts well.",
    price: 2200, stock: 40, imageUrl: p("agege-loaf"), badge: "Bestseller",
  },
  {
    id: "prd_coconut_bread", slug: "coconut-bread", name: "Coconut Bread", category: "breads",
    description: "A lightly sweet round loaf with toasted coconut in the dough and on the crust.",
    price: 2800, stock: 18, imageUrl: p("coconut-bread"),
  },
  {
    id: "prd_sweet_potato_millet", slug: "sweet-potato-millet-loaf", name: "Sweet Potato & Millet Loaf", category: "breads",
    description: "A slow-fermented tin loaf with roasted sweet potato and millet. Moist, nutty and good for a week.",
    price: 4500, stock: 12, imageUrl: p("sweet-potato-millet-loaf"), badge: "New",
  },
  {
    id: "prd_honey_wheat", slug: "honey-wheat-loaf", name: "Honey Whole-Wheat Loaf", category: "breads",
    description: "A dense, soft whole-wheat sandwich loaf sweetened with honey instead of refined sugar.",
    price: 3400, stock: 4, imageUrl: p("honey-wheat-loaf"),
  },
  {
    id: "prd_meat_pie_box", slug: "meat-pie-box", name: "Beef Meat Pie, Box of 6", category: "pastries",
    description: "Flaky butter pastry filled with spiced beef, potato and carrot. Best warmed for ten minutes.",
    price: 5400, stock: 25, imageUrl: p("meat-pie-box"), badge: "Bestseller",
  },
  {
    id: "prd_puff_puff_box", slug: "puff-puff-box", name: "Puff Puff, Box of 20", category: "pastries",
    description: "Golden, airy fried dough balls with a hint of nutmeg. Made on the day you collect them.",
    price: 3000, stock: 30, imageUrl: p("puff-puff-box"), badge: "Bestseller",
  },
  {
    id: "prd_chin_chin_jar", slug: "chin-chin-jar", name: "Chin Chin Jar, 500 g", category: "pastries",
    description: "Crunchy, lightly spiced fried pastry cubes in a reusable glass jar. Keeps for weeks.",
    price: 4200, stock: 22, imageUrl: p("chin-chin-jar"),
  },
  {
    id: "prd_hibiscus_rolls", slug: "hibiscus-cinnamon-rolls", name: "Hibiscus Cinnamon Rolls, Box of 4", category: "pastries",
    description: "Soft rolls swirled with cinnamon and a tart hibiscus filling, finished with a light glaze.",
    price: 4800, stock: 14, imageUrl: p("hibiscus-cinnamon-rolls"), badge: "New",
  },
  {
    id: "prd_banana_bread", slug: "spiced-banana-bread", name: "Spiced Banana Bread", category: "cakes",
    description: "Ripe banana, ginger and cinnamon in a moist loaf with a crisp, caramelised top.",
    price: 3500, stock: 16, imageUrl: p("spiced-banana-bread"),
  },
  {
    id: "prd_ginger_pound", slug: "ginger-pound-cake", name: "Ginger Pound Cake", category: "cakes",
    description: "A buttery pound cake with fresh and ground ginger. Dense, sunny and excellent with tea.",
    price: 6500, stock: 9, imageUrl: p("ginger-pound-cake"),
  },
  {
    id: "prd_hibiscus_layer", slug: "hibiscus-layer-cake", name: "Hibiscus Layer Cake", category: "cakes",
    description: "Two vanilla sponge layers, cream cheese frosting and a deep red hibiscus drip. Serves 10 to 12.",
    price: 14000, stock: 5, imageUrl: p("hibiscus-layer-cake"), badge: "New",
  },
  {
    id: "prd_coconut_lime", slug: "coconut-lime-cake", name: "Coconut & Lime Cake", category: "cakes",
    description: "Coconut sponge brushed with lime syrup and covered in lime cream. Serves 10 to 12.",
    price: 12500, stock: 0, imageUrl: p("coconut-lime-cake"),
  },
  {
    id: "prd_yaji", slug: "suya-spice-yaji", name: "Suya Spice (Yaji), 150 g", category: "spices",
    description: "Roasted peanut, ginger, paprika and chilli blended for suya, grilled chicken and roasted plantain.",
    price: 2500, stock: 60, imageUrl: p("suya-spice-yaji"), badge: "Bestseller",
  },
  {
    id: "prd_jollof_blend", slug: "jollof-spice-blend", name: "Jollof Spice Blend, 120 g", category: "spices",
    description: "Thyme, curry, bay, garlic and dried pepper in the ratio we use for party jollof.",
    price: 2400, stock: 45, imageUrl: p("jollof-spice-blend"),
  },
  {
    id: "prd_zobo_mix", slug: "zobo-spice-mix", name: "Zobo Spice Mix, 100 g", category: "spices",
    description: "Ginger, cloves and dried pineapple peel for brewing zobo, or for spiced bakes.",
    price: 2200, stock: 38, imageUrl: p("zobo-spice-mix"),
  },
  {
    id: "prd_discovery_box", slug: "spice-discovery-box", name: "Spice Discovery Box", category: "spices",
    description: "Small jars of yaji, jollof blend and zobo mix in a gift box. A good place to start.",
    price: 8900, stock: 20, imageUrl: p("spice-discovery-box"), badge: "New",
  },
];

/** The hand-picked set shown in the homepage featured collection. */
export const featuredCollection = {
  title: "The hibiscus edit",
  description:
    "Zobo season, baked. Tart hibiscus folded into rolls and cake, plus the spice mix behind the drink.",
  productSlugs: ["hibiscus-cinnamon-rolls", "hibiscus-layer-cake", "zobo-spice-mix"],
} as const;
