import { Container } from "./container";
import { Wordmark } from "./wordmark";

/** Foundation header: wordmark only. Navigation, search, account and cart arrive in Phase 2. */
export function SiteHeader() {
  return (
    <Container as="header" className="flex h-(--header-height) items-center">
      <Wordmark />
    </Container>
  );
}
