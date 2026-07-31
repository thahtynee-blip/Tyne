"use client";

import React, { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { AppContext } from "../context/AppContext";
import SearchBarSuggestions from "./SearchBarSuggestions";
import { useRouter } from "next/navigation";

export default function Header({ onCartOpen }) {
  const { loggedInUser, logoutUser, cart, wishlist, isClient } = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function closeDropdown(e) {
      if (e.target.closest("#user-dropdown")) return;
      setDropdownOpen(false);
    }
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  const totalCartQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  return (
    <header id="main-header" className="main-header">
      <div className="container header-container">
        <Link href="/" className="logo">
          <span className="logo-accent">Mini</span>Shop
        </Link>

        {/* Search Bar Component */}
        <SearchBarSuggestions />

        {/* Navigation links */}
        <nav className="nav-links">
          <Link href="/">Trang Chủ</Link>
          <Link href="/products">Cửa Hàng</Link>
          <Link href="/products?category=do-thu-cong">Đồ Thủ Công</Link>
          <Link href="/products?category=do-my-nghe">Đồ Mỹ Nghệ</Link>
          <Link href="/products?category=noi-that-gia-dung">Nội Thất</Link>
        </nav>

        {/* Action icons / Account dropdown */}
        <div className="header-actions">
          {/* Wishlist Button */}
          {isClient && loggedInUser?.role !== "admin" && (
            <Link
              href="/profile?tab=wishlist"
              className="wishlist-btn"
              aria-label="Sản phẩm yêu thích"
            >
              <i className="fa-regular fa-heart"></i>
              {wishlist.length > 0 && (
                <span className="wishlist-badge">{wishlist.length}</span>
              )}
            </Link>
          )}

          {/* Cart Button */}
          {isClient && loggedInUser?.role !== "admin" && (
            <button
              id="cart-btn"
              className="cart-btn"
              aria-label="Xem giỏ hàng"
              onClick={onCartOpen}
            >
              <i className="fa-solid fa-bag-shopping"></i>
              {totalCartQty > 0 && (
                <span className="cart-badge">{totalCartQty}</span>
              )}
            </button>
          )}

          {/* User Account / Login Button */}
          {isClient && loggedInUser ? (
            <div className={`user-dropdown ${dropdownOpen ? "open" : ""}`} id="user-dropdown">
              <button
                className="user-dropdown-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
              >
                <i className="fa-solid fa-user-check"></i>
                <span>Chào, {loggedInUser.name.split(" ")[0]}</span>
              </button>
              <div className="user-dropdown-menu">
                {loggedInUser.role !== "admin" ? (
                  <>
                    <Link href="/profile?tab=profile-info" className="user-dropdown-item">
                      <i className="fa-solid fa-user-leaf"></i> Trang cá nhân
                    </Link>
                    <Link href="/profile?tab=orders" className="user-dropdown-item">
                      <i className="fa-solid fa-clock-rotate-left"></i> Đơn hàng
                    </Link>
                  </>
                ) : (
                  <Link href="/admin" className="user-dropdown-item">
                    <i className="fa-solid fa-chart-line"></i> Quản trị Admin
                  </Link>
                )}
                <div className="user-dropdown-divider"></div>
                <div className="user-dropdown-item" onClick={handleLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="login-btn">
              <i className="fa-regular fa-user"></i>
              <span>Đăng Nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
