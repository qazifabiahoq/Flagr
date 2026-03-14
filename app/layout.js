import './globals.css';

export const metadata = {
  title: 'Flagr | Fraud Intelligence Dashboard',
  description: 'B2B fraud intelligence platform for bank risk and compliance teams',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy-900 text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
