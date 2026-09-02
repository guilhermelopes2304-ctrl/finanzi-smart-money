export type BrandLogo = {
  name: string;
  logoUrl: string;
  match: RegExp;
};

const brands: readonly BrandLogo[] = [
  { name: "Uber", logoUrl: "https://cdn.simpleicons.org/uber", match: /\buber\b/i },
  { name: "99", logoUrl: "https://www.google.com/s2/favicons?sz=128&domain_url=99app.com", match: /\b99(?:pop|taxi)?\b/i },
  { name: "iFood", logoUrl: "https://cdn.simpleicons.org/ifood", match: /\bifood\b/i },
  { name: "Netflix", logoUrl: "https://cdn.simpleicons.org/netflix", match: /\bnetflix\b/i },
  { name: "Prime Video", logoUrl: "https://cdn.simpleicons.org/amazonprime", match: /\bprime\s*video\b|\bamazon\s*prime\b/i },
  { name: "Spotify", logoUrl: "https://cdn.simpleicons.org/spotify", match: /\bspotify\b/i },
  { name: "Smart Fit", logoUrl: "https://www.google.com/s2/favicons?sz=128&domain_url=smartfit.com.br", match: /\bsmart\s*fit\b/i },
  { name: "Gympass", logoUrl: "https://www.google.com/s2/favicons?sz=128&domain_url=wellhub.com", match: /\bgympass\b|\bwellhub\b/i },
  { name: "Mercado Livre", logoUrl: "https://cdn.simpleicons.org/mercadolibre", match: /\bmercado\s*livre\b|\bmercadolivre\b/i },
  { name: "Google", logoUrl: "https://cdn.simpleicons.org/google", match: /\bgoogle\b/i },
  { name: "Apple", logoUrl: "https://cdn.simpleicons.org/apple", match: /\bapple\b|\bicloud\b/i },
  { name: "McDonald's", logoUrl: "https://cdn.simpleicons.org/mcdonalds", match: /\bmc\s?donald'?s\b/i },
];

export function getBrandLogo(description: string): BrandLogo | null {
  const value = description.trim();
  return brands.find((brand) => brand.match.test(value)) ?? null;
}
