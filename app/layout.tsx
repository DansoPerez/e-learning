import type { Metadata, Viewport } from "next";
import { Source_Sans_3, JetBrains_Mono } from "next/font/google";
import { getServerSession } from "@/lib/session";
import { Header } from "@/components/layout/header";
import { ConditionalFooter } from "@/components/layout/conditional-footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PLATFORM_NAME } from "@/lib/constants";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans-app",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-app",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: PLATFORM_NAME,
    template: `%s | ${PLATFORM_NAME}`,
  },
  description:
    "A secure e-learning marketplace connecting students and instructors.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="en" className={`${sourceSans.variable} ${jetbrainsMono.variable} h-full light`} style={{ colorScheme: "light" }}>
      <body className="flex min-h-full flex-col antialiased">
        <AuthProvider session={session}>
          <Header initialSession={session} />
          <main className="min-w-0 flex-1">{children}</main>
          <ConditionalFooter initialSession={session} />
        </AuthProvider>
      </body>
    </html>
  );
}
