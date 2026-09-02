export type BrandLogo = {
  name: string;
  logoUrl: string;
  match: RegExp;
};

const brands: readonly BrandLogo[] = [
  { name: "Uber", logoUrl: "https://logo.clearbit.com/uber.com", match: /\buber\b/i },
  { name: "99", logoUrl: "https://logo.clearbit.com/99app.com", match: /\b99(?:pop|taxi)?\b/i },
  { name: "iFood", logoUrl: "https://logo.clearbit.com/ifood.com.br", match: /\bifood\b/i },
  { name: "Netflix", logoUrl: "https://logo.clearbit.com/netflix.com", match: /\bnetflix\b/i },
  { name: "Prime Video", logoUrl: "https://logo.clearbit.com/primevideo.com", match: /\bprime\s*video\b|\bamazon\s*prime\b/i },
  { name: "Spotify", logoUrl: "https://logo.clearbit.com/spotify.com", match: /\bspotify\b/i },
  { name: "Smart Fit", logoUrl: "https://logo.clearbit.com/smartfit.com.br", match: /\bsmart\s*fit\b/i },
  { name: "Gympass", logoUrl: "https://logo.clearbit.com/gympass.com", match: /\bgympass\b|\bwellhub\b/i },
  { name: "Mercado Livre", logoUrl: "https://logo.clearbit.com/mercadolivre.com.br", match: /\bmercado\s*livre\b|\bmercadolivre\b/i },
  { name: "Google", logoUrl: "https://logo.clearbit.com/google.com", match: /\bgoogle\b/i },
  { name: "Apple", logoUrl: "https://logo.clearbit.com/apple.com", match: /\bapple\b|\bicloud\b/i },
  { name: "McDonald's", logoUrl: "https://logo.clearbit.com/mcdonalds.com", match: /\bmc\s?donald'?s\b/i },
];

export function getBrandLogo(description: string): BrandLogo | null {
  const value = description.trim();
  return brands.find((brand) => brand.match.test(value)) ?? null;
}
