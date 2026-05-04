import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import "./globals.css";
import React from "react";

export const metadata: Metadata = {
  title: "MenuManager",
  description:
    "Gestión sencilla de menús diarios y comandas para restaurantes desde ordenador y PDA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-screen flex flex-col">
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
