"use client";

import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useContext(AppContext);
  const [qty, setQty] = useState(1);

  // Reset quantity when switching products
  useEffect(() => {
    setQty(1);
  }, [product]);

  if (!product) return null;

  const formatPrice = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const handleAddToCart = () => {
    addToCart(product.id, qty);
    onClose();
  };

  return (
    <div className="detail-modal open" onClick={onClose}>
      <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-detail-btn"
          onClick={onClose}
          aria-label="Đóng chi tiết sản phẩm"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        <div className="detail-grid">
          {/* Product Image Section */}
          <div className="detail-image-sec">
            <img id="detail-img" src={product.image} alt={product.name} />
          </div>

          {/* Product Info Section */}
          <div className="detail-info-sec">
            <span className="detail-category">{product.categoryName}</span>
            <h2 className="detail-name">{product.name}</h2>
            
            <div className="detail-rating-row">
              <span className="stars">
                <i className="fa-solid fa-star"></i> {product.rating}
              </span>
              <span className="reviews-count">({product.reviewsCount} đánh giá)</span>
            </div>

            <div className="detail-price">{formatPrice(product.price)}</div>
            <p className="detail-desc">{product.description}</p>
            
            {/* Specs Table */}
            {product.specs && (
              <div className="detail-specifications">
                <h3>Thông số sản phẩm</h3>
                <table id="detail-specs-table">
                  <tbody>
                    {Object.entries(product.specs).map(([key, val]) => (
                      <tr key={key}>
                        <td className="spec-label" style={{ fontWeight: "600", padding: "6px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>{key}</td>
                        <td className="spec-value" style={{ padding: "6px 12px", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Action Row: Quantity + Add Button */}
            <div className="detail-action-row" style={{ display: "flex", gap: "16px", marginTop: "24px", alignItems: "center" }}>
              <div className="detail-qty-selector" style={{ display: "flex", alignItems: "center", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "var(--border-radius-sm)", overflow: "hidden" }}>
                <button
                  className="qty-control-btn"
                  onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                  style={{ width: "36px", height: "36px", background: "none", border: "none", cursor: "pointer" }}
                >
                  -
                </button>
                <input
                  type="number"
                  id="detail-qty-input"
                  value={qty}
                  readOnly
                  style={{ width: "40px", height: "36px", border: "none", textAlign: "center", fontWeight: "600", outline: "none" }}
                />
                <button
                  className="qty-control-btn"
                  onClick={() => setQty((prev) => prev + 1)}
                  style={{ width: "36px", height: "36px", background: "none", border: "none", cursor: "pointer" }}
                >
                  +
                </button>
              </div>
              
              <button
                className="btn btn-primary btn-grow"
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                Thêm Vào Giỏ Hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
