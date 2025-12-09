import './globals.css'

export const metadata = {
  title: 'FIFA 2026 Bracket Simulator',
  description: 'Simulate the FIFA World Cup 2026 tournament',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

