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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
