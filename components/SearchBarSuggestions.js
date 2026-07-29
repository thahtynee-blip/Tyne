"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SearchBarSuggestions() {
  const { products } = useContext(AppContext);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const dropdownRef = useRef(null);
  const debounceTimer = useRef(null);

  const MAX_SUGGESTIONS = 6;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle typing & filtering with debounce
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const q = val.trim().toLowerCase();
      if (!q) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      const matched = products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.categoryName && p.categoryName.toLowerCase().includes(q))
        )
        .slice(0, MAX_SUGGESTIONS);

      setSuggestions(matched);
      setShowDropdown(true);
      setActiveIndex(-1);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(suggestions.length, prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(-1, prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        const selected = suggestions[activeIndex];
        router.push(`/search?q=${encodeURIComponent(selected.name)}`);
      } else if (activeIndex === suggestions.length && query) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      setShowDropdown(false);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const formatPrice = (v) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
  };

  const highlightMatch = (text, q) => {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} style={{ background: "transparent", color: "var(--primary-color)", fontWeight: "700" }}>{part}</mark> : part
    );
  };

  return (
    <div className="search-bar" id="header-search-bar" ref={dropdownRef}>
      <i className="fa-solid fa-magnifying-glass search-icon"></i>
      <input
        type="text"
        id="search-input"
        placeholder="Tìm kiếm sản phẩm mộc mạc..."
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query.trim() && setShowDropdown(true)}
        autoComplete="off"
      />

      {showDropdown && (
        <div className="search-suggestions">
          {suggestions.length === 0 ? (
            <>
              <div className="suggestion-header">Không tìm thấy sản phẩm nào</div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className="suggestion-view-all"
                onClick={() => setShowDropdown(false)}
              >
                <i className="fa-solid fa-magnifying-glass"></i> Tìm kiếm toàn bộ
              </Link>
            </>
          ) : (
            <>
              <div className="suggestion-header">Gợi ý sản phẩm</div>
              {suggestions.map((product, idx) => (
                <Link
                  key={product.id}
                  href={`/search?q=${encodeURIComponent(product.name)}`}
                  className={`suggestion-item ${activeIndex === idx ? "active" : ""}`}
                  onClick={() => setShowDropdown(false)}
                >
                  <img src={product.image} alt={product.name} />
                  <div className="suggestion-item-info">
                    <div className="suggestion-item-name">
                      {highlightMatch(product.name, query)}
                    </div>
                    <div className="suggestion-item-price">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </Link>
              ))}

              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                className={`suggestion-view-all ${
                  activeIndex === suggestions.length ? "active" : ""
                }`}
                onClick={() => setShowDropdown(false)}
              >
                <i className="fa-solid fa-magnifying-glass"></i> Xem tất cả kết quả cho "
                <strong>{query}</strong>"
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
