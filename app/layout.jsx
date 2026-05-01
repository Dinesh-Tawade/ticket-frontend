import { ReduxProvider } from "@/app/providers/ReduxProvider";
import ReactQueryProvider from "@/app/providers/ReactQueryProvider";
import Header from "@/app/components/public/Header";
import Footer from "@/app/components/public/Footer";
import "./globals.css";

export const metadata = {
  title: "Booking App",
  description: "Movie Ticket Booking App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          {/* <Header/> */}
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </ReduxProvider>
        {/* <Footer/> */}
      </body>
    </html>
  );
}