import { Providers } from './providers'
import '@/index.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'WES OneDesk',
  description: 'Employee Management System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.jpg" type="image/jpeg" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
