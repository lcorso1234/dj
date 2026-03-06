import { Oswald, Rajdhani } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "DJ Wabick Card",
  description: "Mobile-first baseball business card with vCard and SMS flow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${rajdhani.variable} ${oswald.variable} antialiased`}>{children}</body>
    </html>
  );
}
