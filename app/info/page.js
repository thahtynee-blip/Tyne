"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function InfoPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("brand-story");

  useEffect(() => {
    // Map URL tab keys to internal section IDs
    const tab = searchParams.get("tab");
    if (tab) {
      // Normalize news/news-events tab names
      if (tab === "news" || tab === "news-events") {
        setActiveTab("news");
      } else if (tab === "shipping-policy" || tab === "delivery-policy") {
        setActiveTab("shipping-policy");
      } else {
        setActiveTab(tab);
      }
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    router.push(`/info?tab=${tabName}`);
  };

  return (
    <div className="container info-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "30px", margin: "40px auto 60px" }}>
      {/* Sidebar Navigation */}
      <aside className="info-sidebar" style={{ background: "#fff", padding: "24px", borderRadius: "var(--border-radius-md)", border: "1px solid rgba(0,0,0,0.04)", height: "fit-content" }}>
        <div className="info-sidebar-group">
          <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "12px", paddingLeft: "12px" }}>Về MiniShop</h4>
          <nav className="info-nav" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              className={`info-link ${activeTab === "brand-story" ? "active" : ""}`}
              onClick={() => handleTabChange("brand-story")}
              style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
            >
              <i className="fa-solid fa-seedling"></i> Câu chuyện thương hiệu
            </button>
            <button
              className={`info-link ${activeTab === "green-journey" ? "active" : ""}`}
              onClick={() => handleTabChange("green-journey")}
              style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
            >
              <i className="fa-solid fa-leaf"></i> Hành trình xanh
            </button>
            <button
              className={`info-link ${activeTab === "news" ? "active" : ""}`}
              onClick={() => handleTabChange("news")}
              style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
            >
              <i className="fa-regular fa-newspaper"></i> Tin tức & Sự kiện
            </button>
            <button
              className={`info-link ${activeTab === "careers" ? "active" : ""}`}
              onClick={() => handleTabChange("careers")}
              style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
            >
              <i className="fa-solid fa-briefcase"></i> Tuyển dụng
            </button>
          </nav>
        </div>
        
        <div className="info-sidebar-group mt-20" style={{ marginTop: "24px" }}>
          <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "12px", paddingLeft: "12px" }}>Chính sách & Hỗ trợ</h4>
          <nav className="info-nav" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              className={`info-link ${activeTab === "shopping-guide" ? "active" : ""}`}
              onClick={() => handleTabChange("shopping-guide")}
              style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
            >
              <i className="fa-solid fa-cart-shopping"></i> Hướng dẫn mua sắm
            </button>
            <button
              className={`info-link ${activeTab === "shipping-policy" ? "active" : ""}`}
              onClick={() => handleTabChange("shipping-policy")}
              style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
            >
              <i className="fa-solid fa-truck-fast"></i> Chính sách giao hàng
            </button>
            <button
              className={`info-link ${activeTab === "return-policy" ? "active" : ""}`}
              onClick={() => handleTabChange("return-policy")}
              style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
            >
              <i className="fa-solid fa-box-open"></i> Chính sách đổi trả
            </button>
            <button
              className={`info-link ${activeTab === "privacy-policy" ? "active" : ""}`}
              onClick={() => handleTabChange("privacy-policy")}
              style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
            >
              <i className="fa-solid fa-shield-halved"></i> Bảo mật thông tin
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="info-content-area" style={{ background: "#fff", padding: "40px", borderRadius: "var(--border-radius-md)", border: "1px solid rgba(0,0,0,0.04)" }}>
        
        {/* Tab 1: Brand Story */}
        {activeTab === "brand-story" && (
          <section className="info-section">
            <h2>MiniShop - Nơi Tôn Vinh Giá Trị Thủ Công & Tổ Ấm Việt</h2>
            <p>Ra đời từ tình yêu với những nét đẹp mộc mạc và bàn tay tài hoa của các nghệ nhân làng nghề Việt Nam, MiniShop không chỉ là một cửa hàng nội thất, mà là một không gian truyền cảm hứng. Chúng tôi tin rằng mỗi vật dụng trong nhà không chỉ để dùng, mà còn chứa đựng một câu chuyện, một linh hồn và một lời nhắc nhở về sự bình yên.</p>
            <p>MiniShop len lỏi khắp các làng nghề truyền thống từ Bắc chí Nam, chọn lọc những chất liệu tự nhiên nhất như mây, tre, gỗ, gốm... để mang đến cho không gian sống của bạn sự ấm áp, tinh tế và đậm chất nghệ thuật.</p>
          </section>
        )}

        {/* Tab 2: Green Journey */}
        {activeTab === "green-journey" && (
          <section className="info-section">
            <h2>Phát triển bền vững cùng thiên nhiên</h2>
            <p>Tại MiniShop, "Xanh" không chỉ là màu sắc, mà là kim chỉ nam trong mọi hoạt động:</p>
            <ul>
              <li><strong>Nguyên liệu thân thiện:</strong> 100% sản phẩm thủ công được làm từ nguyên liệu tái tạo và dễ phân hủy sinh học (tre, nứa, bèo tây, gỗ keo).</li>
              <li><strong>Quy trình không hóa chất:</strong> Chúng tôi cam kết sử dụng các phương pháp xử lý tự nhiên, phủ sơn an toàn sinh học (bio-paint), không gây hại cho sức khỏe và môi trường.</li>
              <li><strong>Bao bì tái chế:</strong> MiniShop loại bỏ hoàn toàn túi nilon trong khâu đóng gói. 100% bao bì là hộp giấy carton tái chế và màng bọc từ xơ dừa tự nhiên.</li>
            </ul>
          </section>
        )}

        {/* Tab 3: News & Events */}
        {activeTab === "news" && (
          <section className="info-section">
            <h2>Nhịp đập MiniShop</h2>
            <div className="news-item">
              <span className="news-tag highlight">Cập nhật</span>
              <p>Ra mắt bộ sưu tập "Thu Mộc" - Gốm sứ Bát Tràng phong cách Minimalist.</p>
            </div>
            <div className="news-item">
              <span className="news-tag event">Sự kiện</span>
              <p>Workshop "Tự tay đan giỏ mây" tổ chức tại không gian MiniShop Concept Store vào cuối tuần này. Đăng ký ngay để nhận ưu đãi!</p>
            </div>
            <div className="news-item">
              <span className="news-tag community">Cộng đồng</span>
              <p>MiniShop quyên góp 10% doanh thu tháng 7 để hỗ trợ dự án trồng cây xanh bảo vệ rừng phòng hộ.</p>
            </div>
          </section>
        )}

        {/* Tab 4: Careers */}
        {activeTab === "careers" && (
          <section className="info-section">
            <h2>Gia nhập ngôi nhà chung MiniShop</h2>
            <p>Chúng tôi luôn tìm kiếm những tâm hồn đồng điệu, yêu thích nghệ thuật thủ công và mong muốn mang giá trị tốt đẹp đến cho khách hàng.</p>
            <h4>Các vị trí đang tuyển:</h4>
            <ul className="careers-list">
              <li>Chuyên viên Tư vấn Nội thất & Decor (Full-time)</li>
              <li>Quản lý cửa hàng (Store Manager)</li>
              <li>Thực tập sinh Marketing / Content Creator (Yêu cầu có gu thẩm mỹ)</li>
            </ul>
            <p className="mt-20"><em>Gửi CV và Portfolio của bạn về: <strong>tuyendung@minishop.com</strong></em></p>
          </section>
        )}

        {/* Tab 5: Shopping Guide */}
        {activeTab === "shopping-guide" && (
          <section className="info-section">
            <h2>Mua sắm dễ dàng, trải nghiệm trọn vẹn</h2>
            <ol className="step-list">
              <li><strong>Tìm kiếm sản phẩm:</strong> Sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục (Đồ thủ công, Đồ mỹ nghệ, Nội thất).</li>
              <li><strong>Thêm vào giỏ hàng:</strong> Nhấn biểu tượng (+) hoặc nút "Thêm vào giỏ" tại trang chi tiết sản phẩm.</li>
              <li><strong>Thanh toán:</strong> Kiểm tra giỏ hàng, điền thông tin giao hàng và chọn phương thức thanh toán.</li>
              <li><strong>Xác nhận:</strong> Đơn hàng sẽ được xác nhận qua Email/Zalo và đóng gói cẩn thận trước khi giao đến tay bạn.</li>
            </ol>
          </section>
        )}

        {/* Tab 6: Shipping Policy */}
        {activeTab === "shipping-policy" && (
          <section className="info-section">
            <h2>Nhanh chóng & An toàn</h2>
            <ul className="policy-list">
              <li><i className="fa-solid fa-motorcycle"></i> <strong>Nội thành TP.HCM & Hà Nội:</strong> Giao hàng trong vòng 24h. Miễn phí vận chuyển cho đơn hàng từ 500.000đ.</li>
              <li><i className="fa-solid fa-truck"></i> <strong>Các tỉnh thành khác:</strong> Thời gian giao hàng từ 3 - 5 ngày làm việc. Phí vận chuyển đồng giá 35.000đ.</li>
              <li><i className="fa-solid fa-couch"></i> <strong>Sản phẩm cồng kềnh (Nội thất):</strong> MiniShop có đội ngũ vận chuyển và lắp đặt tận nơi. Phí dịch vụ sẽ được nhân viên tư vấn báo trước khi chốt đơn.</li>
              <li><i className="fa-solid fa-shield-cat"></i> <strong>Bảo hiểm hàng hóa:</strong> 100% sản phẩm gốm sứ/thủy tinh được bảo hiểm bể vỡ trong quá trình vận chuyển.</li>
            </ul>
          </section>
        )}

        {/* Tab 7: Return Policy */}
        {activeTab === "return-policy" && (
          <section className="info-section">
            <h2>An tâm tuyệt đối với MiniShop</h2>
            <p>Chúng tôi áp dụng chính sách <strong>"1 đổi 1"</strong> hoặc hoàn tiền 100% trong vòng 7 ngày kể từ khi nhận hàng nếu:</p>
            <ul className="check-list">
              <li><i className="fa-solid fa-check"></i> Sản phẩm bị lỗi từ nhà sản xuất hoặc hư hỏng do vận chuyển.</li>
              <li><i className="fa-solid fa-check"></i> Sản phẩm không đúng với mô tả hoặc hình ảnh trên website.</li>
            </ul>
            <div className="alert-box">
              <strong>Điều kiện:</strong> Sản phẩm còn nguyên vẹn tem mác, chưa qua sử dụng và còn giữ biên lai mua hàng.
            </div>
          </section>
        )}

        {/* Tab 8: Privacy Policy */}
        {activeTab === "privacy-policy" && (
          <section className="info-section">
            <h2>Bảo vệ dữ liệu của bạn là ưu tiên hàng đầu</h2>
            <ul className="privacy-list">
              <li>MiniShop cam kết <strong>không mua bán, trao đổi hay chia sẻ</strong> thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại.</li>
              <li>Thông tin của bạn (Tên, Số điện thoại, Địa chỉ, Email) chỉ được sử dụng nội bộ để xử lý đơn hàng, giao hàng và cung cấp các dịch vụ chăm sóc khách hàng.</li>
              <li>Hệ thống website được mã hóa <strong>SSL chuẩn quốc tế</strong>, đảm bảo an toàn tuyệt đối cho các giao dịch thanh toán trực tuyến.</li>
            </ul>
          </section>
        )}

      </main>
    </div>
  );
}

export default function InfoPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Đang tải thông tin...</div>}>
      <InfoPageContent />
    </Suspense>
  );
}
