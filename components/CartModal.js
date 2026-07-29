"use client";

import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../context/AppContext";

export default function CartModal({ isOpen, onClose }) {
  const {
    isClient,
    cart,
    removeFromCart,
    updateCartQuantity,
    placeOrder,
    loggedInUser
  } = useContext(AppContext);

  const [checkoutStep, setCheckoutStep] = useState("cart"); // "cart" or "checkout"
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  // Autofill form when user is logged in
  useEffect(() => {
    if (loggedInUser) {
      setShippingName(loggedInUser.name || "");
      setShippingPhone(loggedInUser.phone || "");
      setShippingAddress(loggedInUser.address || "");
    }
  }, [loggedInUser, isOpen]);

  if (!isOpen) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    setCheckoutStep("checkout");
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    placeOrder({
      name: shippingName,
      phone: shippingPhone,
      address: shippingAddress
    });

    setCheckoutStep("cart");
    onClose();
  };

  return (
    <div className={`cart-modal ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h3>
            <i className="fa-solid fa-bag-shopping"></i>{" "}
            {checkoutStep === "cart" ? "Giỏ Hàng Của Bạn" : "Thông Tin Giao Hàng"}
          </h3>
          <button
            className="close-cart-btn"
            onClick={onClose}
            aria-label="Đóng giỏ hàng"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {checkoutStep === "cart" ? (
          /* CART LIST STEP */
          <>
            <div className="cart-items-container">
              {isClient && cart.length === 0 ? (
                <div className="empty-cart-msg">
                  <i className="fa-solid fa-basket-shopping"></i>
                  <p>Giỏ hàng của bạn đang trống</p>
                </div>
              ) : (
                isClient &&
                cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-img-preview"
                      style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                    />
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <span className="cart-item-price">{formatPrice(item.price)}</span>
                      <div className="cart-item-controls">
                        <button
                          className="quantity-btn"
                          onClick={() => updateCartQuantity(item.id, -1)}
                        >
                          -
                        </button>
                        <span className="cart-item-qty">{item.quantity}</span>
                        <button
                          className="quantity-btn"
                          onClick={() => updateCartQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.id)}
                      aria-label="Xóa sản phẩm"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span>Tổng tiền:</span>
                <span className="cart-total-price">
                  {isClient ? formatPrice(totalPrice) : "0đ"}
                </span>
              </div>
              <button
                className="btn btn-primary btn-block"
                onClick={handleCheckoutClick}
                disabled={isClient && cart.length === 0}
              >
                Tiến Hành Thanh Toán
              </button>
            </div>
          </>
        ) : (
          /* CHECKOUT FORM STEP */
          <form className="auth-form" onSubmit={handleSubmitOrder} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", flex: 1, overflowY: "auto" }}>
            <div className="form-group">
              <label>Họ và Tên người nhận</label>
              <div className="form-input-wrapper">
                <i className="fa-regular fa-user" style={{ left: "16px" }}></i>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: "46px" }}
                  placeholder="Nguyễn Văn A"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Số điện thoại nhận hàng</label>
              <div className="form-input-wrapper">
                <i className="fa-solid fa-phone" style={{ left: "16px" }}></i>
                <input
                  type="tel"
                  className="form-control"
                  style={{ paddingLeft: "46px" }}
                  placeholder="0987654321"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Địa chỉ giao hàng</label>
              <div className="form-input-wrapper">
                <i className="fa-solid fa-map-location-dot" style={{ left: "16px" }}></i>
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: "46px" }}
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginTop: "auto", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px" }}>
              <div className="cart-total-row" style={{ marginBottom: "16px" }}>
                <span>Tổng số tiền:</span>
                <span className="cart-total-price" style={{ color: "var(--primary-color)", fontWeight: "700" }}>{formatPrice(totalPrice)}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="btn"
                  style={{ flex: 1, background: "rgba(0,0,0,0.05)", border: "none" }}
                  onClick={() => setCheckoutStep("cart")}
                >
                  Quay lại
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Xác Nhận Đặt Hàng
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
