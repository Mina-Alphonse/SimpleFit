import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimpleFit | سيمبل فيت - Fitness & Nutrition Architecture",
  description: "Quantitative nutrition engine and smart workout tracking engineered for real life.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="dark">
      <body className="antialiased min-h-screen bg-background text-foreground flex flex-col">
        {children}
      </body>
    </html>
  );
}
