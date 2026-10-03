export function Availability({ stock, className = "" }: { stock: number; className?: string }) {
  if (stock < 1) return <p className={`text-caption font-medium text-danger ${className}`}>Sold out</p>;
  if (stock <= 5) return <p className={`text-caption font-medium text-accent ${className}`}>Only {stock} left</p>;
  return <p className={`text-caption text-success ${className}`}>In stock</p>;
}
