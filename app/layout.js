import "./globals.css";
import ClientLayout from "../components/ClientLayout";

export const metadata = {
  title: "MiniShop - Đồ Thủ Công Mỹ Nghệ & Nội Thất Mộc Mạc",
  description: "Trang thương mại điện tử chuyên cung cấp các sản phẩm thủ công, đồ mỹ nghệ và nội thất thân thiện môi trường phong cách Japandi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
