import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";

const FIXED_VCARD_NOTE = "President of the United States";

function cleanValue(value = "") {
  return String(value).replace(/[\r\n]/g, " ").trim();
}

function cleanFileName(value = "contact.vcf") {
  const safe = cleanValue(value).replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe.toLowerCase().endsWith(".vcf") ? safe : `${safe}.vcf`;
}

function escapeVcard(value = "") {
  return cleanValue(value)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldVcardLine(line) {
  const maxLength = 75;
  const chunks = [];
  let remaining = line;

  while (remaining.length > maxLength) {
    chunks.push(remaining.slice(0, maxLength));
    remaining = ` ${remaining.slice(maxLength)}`;
  }
  chunks.push(remaining);
  return chunks;
}

function getEmbeddedPhoto(photoKey) {
  if (photoKey !== "player") return null;
  try {
    const imagePath = path.join(process.cwd(), "public", "player-head.jpg");
    const base64 = readFileSync(imagePath).toString("base64");
    return foldVcardLine(`PHOTO;ENCODING=b;TYPE=JPEG:${base64}`);
  } catch {
    return null;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const firstName = cleanValue(searchParams.get("firstName") || "DJ");
  const lastName = cleanValue(searchParams.get("lastName") || "Wabick");
  const email = cleanValue(searchParams.get("email") || "");
  const phone = cleanValue(searchParams.get("phone") || "").replace(/[^\d+]/g, "");
  const company = cleanValue(searchParams.get("company") || "President");
  const notes = FIXED_VCARD_NOTE;
  const photo = cleanValue(searchParams.get("photo") || "");
  const filename = cleanFileName(searchParams.get("filename") || `${firstName}-${lastName}.vcf`);
  const photoLines = getEmbeddedPhoto(photo);

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Contact";

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVcard(lastName)};${escapeVcard(firstName)};;;`,
    `FN:${escapeVcard(fullName)}`,
    `ORG:${escapeVcard(company)}`,
    "TITLE:Baseball Player",
    ...(photoLines || []),
    phone ? `TEL;TYPE=CELL,VOICE:${escapeVcard(phone)}` : "",
    email ? `EMAIL;TYPE=INTERNET:${escapeVcard(email)}` : "",
    notes ? `NOTE:${escapeVcard(notes)}` : "",
    "END:VCARD",
  ].filter(Boolean);

  // CRLF is safer for iOS Contacts import and broad Android parser compatibility.
  const vcard = `${lines.join("\r\n")}\r\n`;

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
