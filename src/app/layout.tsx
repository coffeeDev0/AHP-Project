import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outil AHP — Aide à la Décision",
  description:
    "Processus d'Analyse Hiérarchique — prise de décision multicritère basée sur la méthode de Saaty",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <header className="site-header">
          <div className="container">
            <div className="header-inner">
              <span className="header-logo">Outil AHP</span>
              <span className="header-subtitle">
                Processus d&apos;Analyse Hiérarchique · Saaty (1980)
              </span>
            </div>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p>Outil AHP · 2026</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
