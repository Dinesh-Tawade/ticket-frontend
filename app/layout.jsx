import Header from './components/public/Header'
import Footer from './components/public/Footer'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-grow container mx-auto p-4'>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}