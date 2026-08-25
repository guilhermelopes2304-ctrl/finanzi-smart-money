import { readFileSync, writeFileSync } from "node:fs";

const source = "public/finanzzi-approved.webp.b64";
const target = "public/finanzzi-approved.webp";

const base64 = readFileSync(source, "utf8").trim();
writeFileSync(target, Buffer.from(base64, "base64"));
console.log(`FINANZZI brand asset prepared: ${target}`);
