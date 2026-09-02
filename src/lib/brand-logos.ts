export type BrandLogo = {
  name: string;
  logoUrl: string;
  match: RegExp;
};

const logo = (slug: string) => `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

const brands: readonly BrandLogo[] = [
  { name: "Uber", logoUrl: logo("uber"), match: /\buber\b/i },
  { name: "99", logoUrl: logo("99designs"), match: /\b99(?:pop|taxi)?\b/i },
  { name: "iFood", logoUrl: logo("ifood"), match: /\bifood\b/i },
  { name: "Netflix", logoUrl: logo("netflix"), match: /\bnetflix\b/i },
  { name: "Prime Video", logoUrl: logo("primevideo"), match: /\bprime\s*video\b|\bamazon\s*prime\b/i },
  { name: "Spotify", logoUrl: logo("spotify"), match: /\bspotify\b/i },
  { name: "Smart Fit", logoUrl: logo("smart"), match: /\bsmart\s*fit\b/i },
  { name: "Gympass", logoUrl: logo("wellhub"), match: /\bgympass\b|\bwellhub\b/i },
  { name: "Mercado Livre", logoUrl: logo("mercadolibre"), match: /\bmercado\s*livre\b|\bmercadolivre\b/i },
  { name: "Google", logoUrl: logo("google"), match: /\bgoogle\b/i },
  { name: "Apple", logoUrl: logo("apple"), match: /\bapple\b|\bicloud\b/i },
  { name: "McDonald's", logoUrl: logo("mcdonalds"), match: /\bmc\s?donald'?s\b/i },
];

export function getBrandLogo(description: string): BrandLogo | null {
  const value = description.trim();
  return brands.find((brand) => brand.match.test(value)) ?? null;
}
