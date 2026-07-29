"use client";

import React, { createContext, useState, useEffect } from "react";
import { defaultProducts } from "../data/products";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [users, setUsers] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // Initialize state from localStorage (only run in client side)
  useEffect(() => {
    setIsClient(true);

    // Initialize products database
    let storedProducts = localStorage.getItem("minishop_products");
    if (!storedProducts) {
      localStorage.setItem("minishop_products", JSON.stringify(defaultProducts));
      setProducts(defaultProducts);
    } else {
      setProducts(JSON.parse(storedProducts));
    }

    // Initialize cart
    let storedCart = localStorage.getItem("minishop_cart");
    if (storedCart) setCart(JSON.parse(storedCart));

    // Initialize wishlist
    let storedWishlist = localStorage.getItem("minishop_wishlist");
    if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

    // Initialize users database
    let storedUsers = localStorage.getItem("minishop_users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Default test user
      const defaultUsers = [
        {
          name: "Nguyễn Văn A",
          email: "test@minishop.com",
          phone: "0987654321",
          password: "123456",
          address: "123 Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh"
        }
      ];
      localStorage.setItem("minishop_users", JSON.stringify(defaultUsers));
      setUsers(defaultUsers);
    }

    // Initialize logged in user
    let storedUser = localStorage.getItem("minishop_logged_in_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser.email && parsedUser.email.toLowerCase() === "test@minishop.com") {
        parsedUser.role = "admin";
      }
      setLoggedInUser(parsedUser);
    }

    // Initialize orders
    let storedOrders = localStorage.getItem("minishop_orders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      // Mock orders list
      setOrders([]);
    }
  }, []);

  // --- Utility Toast Handler (Client side) ---
  const showToast = (message, type = "success") => {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let icon = '<i class="fa-solid fa-circle-check" style="color: var(--primary-color);"></i>';
    if (type === "info") {
      icon = '<i class="fa-solid fa-circle-info" style="color: var(--secondary-color);"></i>';
    } else if (type === "warning") {
      icon = '<i class="fa-solid fa-circle-exclamation" style="color: var(--accent-color);"></i>';
    }
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // --- Cart Actions ---
  const addToCart = (productId, quantity = 1) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;

    let updatedCart = [...cart];
    const index = updatedCart.findIndex(item => item.id === productId);

    if (index !== -1) {
      updatedCart[index].quantity += quantity;
    } else {
      updatedCart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        categoryName: p.categoryName,
        quantity: quantity
      });
    }

    setCart(updatedCart);
    localStorage.setItem("minishop_cart", JSON.stringify(updatedCart));
    showToast(`Đã thêm "${p.name}" vào giỏ hàng!`, "success");
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem("minishop_cart", JSON.stringify(updatedCart));
    showToast("Đã xóa sản phẩm khỏi giỏ hàng.", "info");
  };

  const updateCartQuantity = (productId, amount) => {
    let updatedCart = cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + amount;
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    });

    setCart(updatedCart);
    localStorage.setItem("minishop_cart", JSON.stringify(updatedCart));
  };

  // --- Wishlist Actions ---
  const toggleWishlist = (productId) => {
    const id = Number(productId);
    const p = products.find(prod => prod.id === id);
    let updatedWishlist = [...wishlist];
    const idx = updatedWishlist.indexOf(id);

    if (idx === -1) {
      updatedWishlist.push(id);
      showToast(`Đã thêm "${p?.name || 'Sản phẩm'}" vào yêu thích!`, "success");
    } else {
      updatedWishlist.splice(idx, 1);
      showToast(`Đã bỏ thích "${p?.name || 'Sản phẩm'}".`, "info");
    }

    setWishlist(updatedWishlist);
    localStorage.setItem("minishop_wishlist", JSON.stringify(updatedWishlist));
  };

  // --- Authentication Actions ---
  const registerUser = (userData) => {
    // Check duplicate
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      showToast("Email này đã được đăng ký!", "warning");
      return false;
    }

    const updatedUsers = [...users, userData];
    setUsers(updatedUsers);
    localStorage.setItem("minishop_users", JSON.stringify(updatedUsers));
    
    // Automatically log in
    setLoggedInUser(userData);
    localStorage.setItem("minishop_logged_in_user", JSON.stringify(userData));
    showToast("Đăng ký tài khoản thành công!", "success");
    return true;
  };

  const loginUser = (email, password) => {
    // Check admin (case-insensitive email)
    if (email && email.toLowerCase() === "test@minishop.com" && password === "123456") {
      const adminSession = {
        name: "Nguyễn Văn A",
        email: "test@minishop.com",
        phone: "0987654321",
        address: "123 Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh",
        role: "admin"
      };
      setLoggedInUser(adminSession);
      localStorage.setItem("minishop_logged_in_user", JSON.stringify(adminSession));
      showToast("Đăng nhập thành công!", "success");
      return "admin";
    }

    // Check client user
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      setLoggedInUser(found);
      localStorage.setItem("minishop_logged_in_user", JSON.stringify(found));
      showToast(`Chào mừng bạn quay lại, ${found.name}!`, "success");
      return "user";
    }

    showToast("Email hoặc mật khẩu không chính xác.", "warning");
    return null;
  };

  const logoutUser = () => {
    setLoggedInUser(null);
    localStorage.removeItem("minishop_logged_in_user");
    showToast("Đã đăng xuất tài khoản.", "info");
  };

  const updateProfile = (name, phone, address) => {
    if (!loggedInUser) return;

    const updatedUser = { ...loggedInUser, name, phone, address };
    setLoggedInUser(updatedUser);
    localStorage.setItem("minishop_logged_in_user", JSON.stringify(updatedUser));

    // Update in users database
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === loggedInUser.email.toLowerCase()) {
        return { ...u, name, phone, address };
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem("minishop_users", JSON.stringify(updatedUsers));
    showToast("Đã cập nhật thông tin tài khoản thành công!", "success");
  };

  const changePassword = (oldPassword, newPassword) => {
    if (!loggedInUser) return false;

    // Check in users db
    const userIndex = users.findIndex(u => u.email.toLowerCase() === loggedInUser.email.toLowerCase());
    
    let dbPassword = "password123";
    if (userIndex !== -1) {
      dbPassword = users[userIndex].password;
    }

    if (oldPassword !== dbPassword) {
      showToast("Mật khẩu hiện tại không đúng.", "warning");
      return false;
    }

    if (userIndex !== -1) {
      const updatedUsers = [...users];
      updatedUsers[userIndex].password = newPassword;
      setUsers(updatedUsers);
      localStorage.setItem("minishop_users", JSON.stringify(updatedUsers));
      showToast("Đổi mật khẩu thành công!", "success");
      return true;
    }

    showToast("Tài khoản hệ thống thử nghiệm không thể đổi mật khẩu thật.", "info");
    return false;
  };

  // --- Order placement ---
  const placeOrder = (shippingInfo) => {
    if (cart.length === 0) return false;

    const newOrder = {
      id: "MS-" + Math.floor(Math.random() * 90000 + 10000),
      date: new Date().toLocaleDateString("vi-VN"),
      products: cart.map(c => `${c.name} (x${c.quantity})`).join(", "),
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: "processing",
      statusName: "Đang xử lý",
      userEmail: loggedInUser ? loggedInUser.email : "guest@minishop.com",
      shippingInfo: shippingInfo || {
        name: loggedInUser?.name || "Khách vãng lai",
        phone: loggedInUser?.phone || "",
        address: loggedInUser?.address || ""
      }
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem("minishop_orders", JSON.stringify(updatedOrders));

    // Clear cart
    setCart([]);
    localStorage.removeItem("minishop_cart");
    showToast("Đặt hàng thành công! Đơn hàng đã được lưu lại.", "success");
    return newOrder;
  };

  // --- Admin Actions ---
  const adminAddProduct = (newProduct) => {
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem("minishop_products", JSON.stringify(updatedProducts));
    showToast(`Đã thêm sản phẩm "${newProduct.name}"!`, "success");
  };

  const adminUpdateProduct = (updatedProd) => {
    const updatedProducts = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(updatedProducts);
    localStorage.setItem("minishop_products", JSON.stringify(updatedProducts));
    showToast(`Đã cập nhật sản phẩm "${updatedProd.name}"!`, "success");
  };

  const adminDeleteProduct = (productId) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem("minishop_products", JSON.stringify(updatedProducts));
    showToast("Đã xóa sản phẩm thành công.", "info");
  };

  const adminCycleOrderStatus = (orderId) => {
    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        let nextStatus = "processing";
        let nextName = "Đang xử lý";

        if (o.status === "processing") {
          nextStatus = "shipping";
          nextName = "Đang giao hàng";
        } else if (o.status === "shipping") {
          nextStatus = "completed";
          nextName = "Đã giao hàng";
        }

        return { ...o, status: nextStatus, statusName: nextName };
      }
      return o;
    });

    setOrders(updatedOrders);
    localStorage.setItem("minishop_orders", JSON.stringify(updatedOrders));
    
    const changed = updatedOrders.find(o => o.id === orderId);
    showToast(`Đã chuyển trạng thái đơn ${orderId} thành "${changed?.statusName}"`, "info");
  };

  return (
    <AppContext.Provider
      value={{
        isClient,
        products,
        cart,
        wishlist,
        users,
        loggedInUser,
        orders,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        registerUser,
        loginUser,
        logoutUser,
        updateProfile,
        changePassword,
        placeOrder,
        adminAddProduct,
        adminUpdateProduct,
        adminDeleteProduct,
        adminCycleOrderStatus,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
