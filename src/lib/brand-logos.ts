export type BrandLogo = {
  name: string;
  logoUrl: string;
  match: RegExp;
};

const favicon = (domain: string) =>
  `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(`https://${domain}`)}`;

const brands: readonly BrandLogo[] = [
  { name: "Uber", logoUrl: favicon("uber.com"), match: /\buber\b/i },
  { name: "99", logoUrl: favicon("99app.com"), match: /\b99(?:pop|taxi)?\b/i },
  { name: "iFood", logoUrl: favicon("ifood.com.br"), match: /\bifood\b/i },
  { name: "Netflix", logoUrl: favicon("netflix.com"), match: /\bnetflix\b/i },
  { name: "Prime Video", logoUrl: favicon("primevideo.com"), match: /\bprime\s*video\b|\bamazon\s*prime\b/i },
  { name: "Spotify", logoUrl: favicon("spotify.com"), match: /\bspotify\b/i },
  { name: "Smart Fit", logoUrl: favicon("smartfit.com.br"), match: /\bsmart\s*fit\b/i },
  { name: "Gympass", logoUrl: favicon("wellhub.com"), match: /\bgympass\b|\bwellhub\b/i },
  { name: "Mercado Livre", logoUrl: favicon("mercadolivre.com.br"), match: /\bmercado\s*livre\b|\bmercadolivre\b/i },
  { name: "Google", logoUrl: favicon("google.com"), match: /\bgoogle\b/i },
  { name: "Apple", logoUrl: favicon("apple.com"), match: /\bapple\b|\bicloud\b/i },
  { name: "McDonald's", logoUrl: favicon("mcdonalds.com"), match: /\bmc\s?donald'?s\b/i },
];

export function getBrandLogo(description: string): BrandLogo | null {
  const value = description.trim();
  return brands.find((brand) => brand.match.test(value)) ?? null;
}
