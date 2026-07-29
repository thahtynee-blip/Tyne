"use client";

import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function ProductCard({ product, onDetailOpen, highlightQuery = "" }) {
  const { addToCart, wishlist, toggleWishlist } = useContext(AppContext);

  const isLiked = wishlist.includes(product.id);

  const formatPrice = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  // Highlights text that matches search query
  const highlightText = (text, query) => {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{
            background: "rgba(60,98,85,0.15)",
            color: "var(--primary-color)",
            fontWeight: "700",
            borderRadius: "3px",
            padding: "0 2px"
          }}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <article className="product-card">
      <div
        className="product-img-wrapper"
        onClick={() => onDetailOpen(product)}
        style={{ cursor: "pointer" }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />
        <span className="product-badge">{product.categoryName}</span>
        
        {/* Heart button */}
        <button
          className={`wishlist-toggle-btn ${isLiked ? "active" : ""}`}
          onClick={handleHeartClick}
          aria-label="Yêu thích sản phẩm"
        >
          <i className={`${isLiked ? "fa-solid" : "fa-regular"} fa-heart`}></i>
        </button>
      </div>

      <div className="product-info">
        <h3
          className="product-name"
          onClick={() => onDetailOpen(product)}
          style={{ cursor: "pointer" }}
        >
          {highlightText(product.name, highlightQuery)}
        </h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            aria-label="Thêm vào giỏ hàng"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </article>
  );
}
