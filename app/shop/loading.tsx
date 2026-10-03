import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-10 sm:py-16" >
      <div role="status" aria-label="Loading products">
        <div className="h-12 w-40 animate-pulse rounded-md bg-line" />
        <ul className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i}>
              <div className="aspect-4/5 animate-pulse rounded-md bg-line" />
              <div className="mt-4 h-4 w-2/3 animate-pulse rounded-sm bg-line" />
              <div className="mt-2 h-4 w-1/3 animate-pulse rounded-sm bg-line" />
            </li>
          ))}
        </ul>
        <span className="sr-only">Loading products</span>
      </div>
    </Container>
  );
}
