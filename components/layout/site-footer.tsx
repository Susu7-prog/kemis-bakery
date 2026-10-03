import { Container } from "./container";
import { Wordmark } from "./wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Wordmark />
        <p className="text-caption text-muted">
          &copy; {new Date().getFullYear()} NOVA. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
