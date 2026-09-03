export type BrandLogo = {
  name: string;
  logoUrl: string;
  match: RegExp;
};

const logo = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

const brands: readonly BrandLogo[] = [
  { name: "Uber", logoUrl: logo("uber"), match: /\buber\b/i },
  { name: "99", logoUrl: logo("99designs"), match: /\b99(?:pop|taxi)?\b/i },
  { name: "iFood", logoUrl: logo("ifood"), match: /\bifood\b/i },
  { name: "Rappi", logoUrl: logo("rappi"), match: /\brappi\b/i },
  { name: "Netflix", logoUrl: logo("netflix"), match: /\bnetflix\b/i },
  { name: "Prime Video", logoUrl: logo("primevideo"), match: /\bprime\s*video\b|\bamazon\s*prime\b/i },
  { name: "Disney+", logoUrl: logo("disneyplus"), match: /\bdisney\+?\b/i },
  { name: "Max", logoUrl: logo("max"), match: /\bhbo\s*max\b|\bmax\b/i },
  { name: "Spotify", logoUrl: logo("spotify"), match: /\bspotify\b/i },
  { name: "YouTube", logoUrl: logo("youtube"), match: /\byoutube\b/i },
  { name: "Smart Fit", logoUrl: logo("smart"), match: /\bsmart\s*fit\b/i },
  { name: "Gympass", logoUrl: logo("wellhub"), match: /\bgympass\b|\bwellhub\b/i },
  { name: "Mercado Livre", logoUrl: logo("mercadolibre"), match: /\bmercado\s*livre\b|\bmercadolivre\b/i },
  { name: "Amazon", logoUrl: logo("amazon"), match: /\bamazon\b/i },
  { name: "Google", logoUrl: logo("google"), match: /\bgoogle\b/i },
  { name: "Apple", logoUrl: logo("apple"), match: /\bapple\b|\bicloud\b/i },
  { name: "Samsung", logoUrl: logo("samsung"), match: /\bsamsung\b/i },
  { name: "McDonald's", logoUrl: logo("mcdonalds"), match: /\bmc\s?donald'?s\b/i },
  { name: "Burger King", logoUrl: logo("burgerking"), match: /\bburger\s*king\b/i },
  { name: "Starbucks", logoUrl: logo("starbucks"), match: /\bstarbucks\b/i },
  { name: "Shell", logoUrl: logo("shell"), match: /\bshell\b/i },
  { name: "Petrobras", logoUrl: logo("petrobras"), match: /\bpetrobras\b|\bbr\s*posto\b/i },
  { name: "Nubank", logoUrl: logo("nubank"), match: /\bnubank\b|\bnu\s*bank\b/i },
  { name: "PicPay", logoUrl: logo("picpay"), match: /\bpicpay\b/i },
  { name: "PayPal", logoUrl: logo("paypal"), match: /\bpaypal\b/i },
  { name: "Dropbox", logoUrl: logo("dropbox"), match: /\bdropbox\b/i },
  { name: "Adobe", logoUrl: logo("adobe"), match: /\badobe\b/i },
];

export function getBrandLogo(description: string): BrandLogo | null {
  const value = description.trim();
  if (!value) return null;
  return brands.find((brand) => brand.match.test(value)) ?? null;
}
