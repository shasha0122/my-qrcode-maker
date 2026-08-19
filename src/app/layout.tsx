import type { Metadata } from "next";
import { Merriweather, Montserrat, Source_Code_Pro } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-merriweather",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
});

export const metadata: Metadata = {
  title: "QR 생성기",
  description: "URL과 텍스트를 QR 코드로 만들고 계정에 저장하세요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${montserrat.variable} ${merriweather.variable} ${sourceCodePro.variable} h-full antialiased`}
    >
      <body className={`${montserrat.className} flex min-h-full flex-col`}>
        <Providers>
          <SiteHeader />
          <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
