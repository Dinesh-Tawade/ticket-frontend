import Header from './components/public/Header'
import Footer from './components/public/Footer'
import Providers from "@/app/providers";

import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='flex flex-col min-h-screen'>
        <Providers>
          <Header />
          
          <main className='flex-grow container mx-auto p-4'>
          {children}
          </main>

          <Footer />
        </Providers>
      


      </body>
    </html>
  )
}