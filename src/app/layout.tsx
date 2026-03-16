import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgendaFácil | Agendamento Inteligente para Pequenos Negócios",
  description: "Receba agendamentos automaticamente pelo WhatsApp. O sistema moderno, simples e extremamente intuitivo para barbearias, clínicas e estéticas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  );
}
