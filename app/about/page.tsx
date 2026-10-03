import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "How Kemi's Artisanal African Bakery & Spice Shop bakes and blends in small batches.",
};

export default function AboutPage() {
  return (
    <Container className="py-10 sm:py-16">
      <h1 className="max-w-3xl text-headline">A bakery and spice shop for the food we grew up on.</h1>
      <div className="mt-10 max-w-2xl space-y-5 text-lead">
        <p>
          Kemi&rsquo;s bakes African breads, pastries and cakes in small batches, and blends spices
          for everyday cooking. Everything starts from whole, recognisable ingredients.
        </p>
        <p>
          We bake for the orders we have, which keeps things fresh and keeps waste low. Our spice
          blends are roasted and ground in small amounts, so they smell the way they should when
          you open the jar.
        </p>
        <p>
          Every product page lists what is in it, and we&rsquo;re always happy to answer questions
          about ingredients before you order.
        </p>
      </div>
      <div className="mt-10"><ButtonLink href="/shop" size="lg">Shop the bakery</ButtonLink></div>
    </Container>
  );
}
