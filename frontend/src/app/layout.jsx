import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./global.css";
import Providers from "./providers";
import UIEffects from "@/components/ui/UIEffects";
import { themeInitScript } from "@/lib/theme";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "GitLab ",
  description:
    "Multi-agent content generation for GitLab release notes, docs, and blogs.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        {/* Sets data-theme before first paint to avoid a theme flash */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-paper font-sans text-body antialiased">
        <UIEffects />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
