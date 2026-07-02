import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 1. Importamos nuestro componente
import Navbar from "../components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-commerce Libros",
  description: "Tienda online de libros",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* 2. Colocamos el Navbar aquí para que aparezca en todas partes */}
        <Navbar />
        {/* El contenido de tus páginas (Home, Login, etc.) se inyectará aquí abajo */}
        {children}
      </body>
    </html>
  );
}