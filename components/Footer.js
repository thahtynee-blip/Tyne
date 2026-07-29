import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="main-footer">
      <div className="container footer-grid">
        <div className="footer-col brand-col">
          <Link href="/" className="logo">
            <span className="logo-accent">Mini</span>Shop
          </Link>
          <p className="footer-about">
            Tôn vinh vẻ đẹp mộc mạc và tinh tế của các sản phẩm thủ công, đem thiên nhiên vào cuộc sống thường nhật của mọi gia đình Việt.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="Pinterest"><i className="fa-brands fa-pinterest-p"></i></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Về MiniShop</h4>
          <ul>
            <li><Link href="/info?tab=brand-story">Câu chuyện thương hiệu</Link></li>
            <li><Link href="/info?tab=green-journey">Hành trình xanh</Link></li>
            <li><Link href="/info?tab=news-events">Tin tức & Sự kiện</Link></li>
            <li><Link href="/info?tab=careers">Tuyển dụng</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Chính Sách & Hỗ Trợ</h4>
          <ul>
            <li><Link href="/info?tab=shopping-guide">Hướng dẫn mua sắm</Link></li>
            <li><Link href="/info?tab=delivery-policy">Chính sách giao hàng</Link></li>
            <li><Link href="/info?tab=return-policy">Chính sách đổi trả 7 ngày</Link></li>
            <li><Link href="/info?tab=privacy-policy">Bảo mật thông tin</Link></li>
          </ul>
        </div>

        <div className="footer-col newsletter-col">
          <h4>Đăng Ký Bản Tin</h4>
          <p>Để nhận những ưu đãi đặc biệt và tin tức mới nhất về các sản phẩm của MiniShop.</p>
          <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert("Cảm ơn bạn đã đăng ký!"); }}>
            <input type="email" placeholder="Email của bạn..." required />
            <button type="submit" className="btn btn-primary"><i className="fa-solid fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; 2026 MiniShop. Bảo lưu mọi quyền. Phát triển với sự tỉ mỉ & tình yêu sản phẩm Việt.</p>
          <p>Chuyển đổi sang Next.js App Router</p>
        </div>
      </div>
    </footer>
  );
}
