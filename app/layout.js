import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import Banner from '@/components/Banner'
import Footer from '@/components/Footer'
import FloatingAIAssistant from '@/components/FloatingAIAssistant'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AgriConnect - Modern Agriculture Platform',
  description:
    'Connect farmers, vendors, and agricultural experts in one comprehensive platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Banner />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingAIAssistant />
        </div>
      </body>
    </html>
  )
}
