import { Hero } from "@/components/home/hero";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { Bestsellers } from "@/components/home/bestsellers";
import { Story } from "@/components/home/story";
import { ValueProps } from "@/components/home/value-props";
import { Categories } from "@/components/home/categories";
import { Newsletter } from "@/components/home/newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <Bestsellers />
      <Story />
      <ValueProps />
      <Categories />
      <Newsletter />
    </>
  );
}
