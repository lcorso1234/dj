"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const DJ_CONTACT = {
  firstName: "DJ",
  lastName: "Wabick",
  phone: "7082809865",
  company: "President",
  notes: "President of the United States",
};

function normalizePhone(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function splitName(name) {
  const trimmed = name.trim();
  if (!trimmed) return ["Network", "Contact"];
  const parts = trimmed.split(/\s+/);
  const first = parts[0];
  const last = parts.slice(1).join(" ") || "Contact";
  return [first, last];
}

function toQuery(params) {
  return new URLSearchParams(params).toString();
}

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");

  const deviceProfile = useMemo(() => {
    if (typeof navigator === "undefined") return { ios: false, samsung: false };
    const ua = navigator.userAgent || "";
    return {
      ios: /iPhone|iPad|iPod/i.test(ua),
      samsung: /SamsungBrowser|SM-/i.test(ua),
    };
  }, []);

  const djVcardPath = useMemo(() => {
    return `/api/vcard?${toQuery({
      firstName: DJ_CONTACT.firstName,
      lastName: DJ_CONTACT.lastName,
      phone: DJ_CONTACT.phone,
      company: DJ_CONTACT.company,
      notes: DJ_CONTACT.notes,
      photo: "player",
      filename: "DJ-Wabick.vcf",
    })}`;
  }, []);

  const djSmsTarget = useMemo(() => normalizePhone(DJ_CONTACT.phone), []);

  function saveDjAndPrompt() {
    const link = document.createElement("a");
    link.href = djVcardPath;
    link.download = "DJ-Wabick.vcf";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setShowForm(true);
  }

  function openSmsComposer(event) {
    event.preventDefault();

    const normalizedPhone = normalizePhone(senderPhone);
    const [firstName, lastName] = splitName(senderName);

    const shareQuery = toQuery({
      firstName,
      lastName,
      phone: normalizedPhone,
      email: senderEmail.trim(),
      company: "DJ Network",
      notes: "President of the United States",
      photo: "player",
      filename: `${firstName}-${lastName}.vcf`,
    });

    const origin = window.location.origin;
    const shareableSenderCard = `${origin}/api/vcard?${shareQuery}`;

    const messageBody = deviceProfile.samsung
      ? `Added to DJ Wabick's network. My contact card: ${shareableSenderCard}`
      : [
          "You were just added to DJ Wabick's network.",
          "",
          `My name: ${senderName || `${firstName} ${lastName}`}`,
          `My email: ${senderEmail.trim()}`,
          `My phone: ${normalizedPhone}`,
          "",
          `Save my contact: ${shareableSenderCard}`,
        ].join("\n");

    const encodedBody = encodeURIComponent(messageBody);
    const smsUri = deviceProfile.ios
      ? `sms:${djSmsTarget}&body=${encodedBody}`
      : `sms:${djSmsTarget}?body=${encodedBody}`;

    window.location.href = smsUri;
  }

  return (
    <main className="app-shell">
      <section className="card-stage">
        <article className="player-card" aria-label="DJ Wabick digital baseball business card">
          <div className="card-header-line" />

          <div className="player-photo-wrap">
            <Image
              src="/player.jpg"
              alt="DJ Wabick baseball player card photo"
              width={560}
              height={720}
              priority
              className="player-photo"
            />
            <div className="photo-gloss" aria-hidden="true" />
          </div>

          <button
            type="button"
            className="save-cta jiggle"
            onClick={saveDjAndPrompt}
            aria-label="Save DJ contact and open text flow"
          >
            <span className="cta-text">Save Contact + Start Text</span>
          </button>

          <footer className="card-footer">
            <p>Built in America, on earth.</p>
            <p className="tagline">Making relationships built to last, the American Way.</p>
          </footer>
        </article>

        {showForm ? (
          <section className="text-form-wrap" aria-live="polite">
            <h3>Send Automated Intro Text</h3>
            <p>
              Fill in your info, then your phone&apos;s SMS app opens with a prefilled message and one shareable
              contact link.
            </p>

            <form className="text-form" onSubmit={openSmsComposer}>
              <label htmlFor="senderName">Your Name (optional)</label>
              <input
                id="senderName"
                name="senderName"
                type="text"
                placeholder="Your full name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />

              <label htmlFor="senderEmail">Your Email</label>
              <input
                id="senderEmail"
                name="senderEmail"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />

              <label htmlFor="senderPhone">Your Phone Number</label>
              <input
                id="senderPhone"
                name="senderPhone"
                type="tel"
                inputMode="tel"
                placeholder="7082809865"
                required
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
              />

              <button type="submit" className="text-submit">
                Open Text Message
              </button>
            </form>

            <p className="compat-note">
              Compatibility tweak active: Samsung Messages uses a compact one-line template for better URL handling;
              iOS uses a recipient-targeted `sms:number&body=` deep link optimized for Contacts import flow.
            </p>
          </section>
        ) : null}
      </section>
    </main>
  );
}
