"use client";

import React, { useState, useEffect, useContext, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppContext } from "../../context/AppContext";
import ProductCard from "../../components/ProductCard";

function SearchPageContent() {
  const { products, isClient } = useContext(AppContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  // Sync search query from URL
  useEffect(() => {
    const qParam = searchParams.get("q") || "";
    setQuery(qParam);
    setActiveQuery(qParam);
  }, [searchParams]);

  // Filter
  const filteredProducts = products.filter((p) => {
    if (!activeQuery) return false;
    const q = activeQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
  });

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    setActiveQuery("");
    router.push("/search");
  };

  const handleOpenDetail = (product) => {
    if (typeof window !== "undefined" && window.openProductDetail) {
      window.openProductDetail(product);
    }
  };

  return (
    <main className="container" style={{ padding: "40px 24px" }}>
      {/* Big Search Bar on Page */}
      <form onSubmit={handleSearchSubmit} className="search-page-bar">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          placeholder="Nhập tên sản phẩm bạn muốn tìm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <button type="submit">Tìm ngay</button>
      </form>

      {/* Welcome Screen (No search query yet) */}
      {!activeQuery && (
        <div className="empty-state" style={{ padding: "60px 0" }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ fontSize: "3rem", color: "var(--primary-color)", opacity: 0.4, marginBottom: "20px" }}
          ></i>
          <h3>Tìm kiếm sản phẩm</h3>
          <p>Nhập từ khóa vào ô tìm kiếm ở trên để khám phá không gian MiniShop</p>
        </div>
      )}

      {/* Query Tag & Title */}
      {activeQuery && (
        <div className="search-page-header" style={{ marginBottom: "24px" }}>
          <h1>Kết quả tìm kiếm</h1>
          <span className="search-query-tag">"{activeQuery}"</span>
        </div>
      )}

      {/* Result Count Info */}
      {isClient && activeQuery && (
        <p className="search-result-count" style={{ marginBottom: "28px" }}>
          Tìm thấy <span style={{ fontWeight: "600", color: "var(--primary-color)" }}>{filteredProducts.length}</span> sản phẩm cho từ khóa "{activeQuery}"
        </p>
      )}

      {/* Products Grid */}
      {isClient && filteredProducts.length > 0 && (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDetailOpen={handleOpenDetail}
              highlightQuery={activeQuery}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {isClient && activeQuery && filteredProducts.length === 0 && (
        <div className="empty-state">
          <i className="fa-regular fa-face-frown-open"></i>
          <h3>Không tìm thấy sản phẩm</h3>
          <p>Không có sản phẩm nào khớp với từ khóa của bạn. Hãy thử từ khóa khác.</p>
          <button className="btn btn-primary" onClick={handleClearSearch} style={{ marginTop: "16px" }}>
            Xem tất cả sản phẩm
          </button>
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Đang tìm kiếm sản phẩm...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
