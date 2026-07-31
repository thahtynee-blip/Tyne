"use client";

import React, { createContext, useState, useEffect } from "react";
import { defaultProducts } from "../data/products";
import { createClient } from "../utils/supabase/client";

const supabase = createClient();

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

    // Initialize products database from Supabase, fallback to localStorage
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("Product")
          .select("*")
          .order("id", { ascending: true });
        
        if (error) {
          console.error("Error loading products from Supabase:", error);
          const stored = localStorage.getItem("minishop_products");
          if (stored) {
            setProducts(JSON.parse(stored));
          } else {
            setProducts(defaultProducts);
          }
        } else if (data && data.length > 0) {
          setProducts(data);
          localStorage.setItem("minishop_products", JSON.stringify(data));
        } else {
          setProducts(defaultProducts);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        const stored = localStorage.getItem("minishop_products");
        if (stored) setProducts(JSON.parse(stored));
      }
    };

    fetchProducts();

    // Initialize cart
    let storedCart = localStorage.getItem("minishop_cart");
    if (storedCart) setCart(JSON.parse(storedCart));

    // Initialize wishlist
    let storedWishlist = localStorage.getItem("minishop_wishlist");
    if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

    // Listen to Supabase Auth state changes to manage loggedInUser session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = session.user;
        const metadata = user.user_metadata || {};
        
        // Fetch role from Profile table on Supabase
        let userRole = "user";
        try {
          const { data: profile, error: profileErr } = await supabase
            .from("Profile")
            .select("role")
            .eq("id", user.id)
            .single();
            
          if (profileErr || !profile) {
            // Profile does not exist yet (e.g. newly registered user), create it
            const { data: newProfile, error: createErr } = await supabase
              .from("Profile")
              .insert({
                id: user.id,
                email: user.email,
                role: "user"
              })
              .select("role")
              .single();
              
            if (!createErr && newProfile) {
              userRole = newProfile.role;
            }
          } else {
            userRole = profile.role;
          }
        } catch (err) {
          console.error("Error retrieving user role:", err);
        }
        
        const loggedIn = {
          id: user.id,
          name: metadata.name || user.email.split("@")[0],
          email: user.email,
          phone: metadata.phone || "",
          address: metadata.address || "",
          role: userRole
        };
        setLoggedInUser(loggedIn);
        localStorage.setItem("minishop_logged_in_user", JSON.stringify(loggedIn));
      } else {
        setLoggedInUser(null);
        localStorage.removeItem("minishop_logged_in_user");
      }
    });

    // Initialize orders from Supabase, fallback to localStorage
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("Order")
          .select("*")
          .order("createdAt", { ascending: false });
        
        if (error) {
          console.error("Error loading orders from Supabase:", error);
          const stored = localStorage.getItem("minishop_orders");
          if (stored) setOrders(JSON.parse(stored));
        } else if (data) {
          setOrders(data);
          localStorage.setItem("minishop_orders", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        const stored = localStorage.getItem("minishop_orders");
        if (stored) setOrders(JSON.parse(stored));
      }
    };

    fetchOrders();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
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
  const registerUser = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          address: userData.address || ""
        }
      }
    });

    if (error) {
      console.error("Register error:", error);
      showToast(error.message, "warning");
      return false;
    }

    if (data.user) {
      const user = data.user;
      const loggedIn = {
        id: user.id,
        name: userData.name,
        email: user.email,
        phone: userData.phone,
        address: userData.address || "",
        role: "user"
      };
      setLoggedInUser(loggedIn);
      localStorage.setItem("minishop_logged_in_user", JSON.stringify(loggedIn));
    }
    
    showToast("Đăng ký tài khoản thành công!", "success");
    return true;
  };

  const loginUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Login error:", error);
      showToast(error.message, "warning");
      return null;
    }

    const user = data.user;
    
    // Fetch role from Profile table on Supabase
    let role = "user";
    try {
      const { data: profile } = await supabase
        .from("Profile")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile) {
        role = profile.role;
      }
    } catch (err) {
      console.error("Error retrieving user role on login:", err);
    }

    const metadata = user.user_metadata || {};
    const loggedIn = {
      id: user.id,
      name: metadata.name || user.email.split("@")[0],
      email: user.email,
      phone: metadata.phone || "",
      address: metadata.address || "",
      role: role
    };
    setLoggedInUser(loggedIn);
    localStorage.setItem("minishop_logged_in_user", JSON.stringify(loggedIn));

    showToast(`Chào mừng bạn quay lại!`, "success");
    return role;
  };

  const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
    }
    setLoggedInUser(null);
    localStorage.removeItem("minishop_logged_in_user");
    
    // Clear cart and wishlist on logout to avoid carrying over data to the next user
    setCart([]);
    setWishlist([]);
    localStorage.removeItem("minishop_cart");
    localStorage.removeItem("minishop_wishlist");
    
    showToast("Đã đăng xuất tài khoản.", "info");
  };

  const updateProfile = async (name, phone, address) => {
    const { data, error } = await supabase.auth.updateUser({
      data: { name, phone, address }
    });

    if (error) {
      console.error("Update profile error:", error);
      showToast("Lỗi cập nhật hồ sơ trên máy chủ!", "error");
      return;
    }

    if (loggedInUser) {
      const updatedUser = { ...loggedInUser, name, phone, address };
      setLoggedInUser(updatedUser);
      localStorage.setItem("minishop_logged_in_user", JSON.stringify(updatedUser));
      showToast("Đã cập nhật thông tin tài khoản thành công!", "success");
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error("Change password error:", error);
      showToast(error.message, "warning");
      return false;
    }

    showToast("Đổi mật khẩu thành công!", "success");
    return true;
  };

  // --- Order placement ---
  const placeOrder = async (shippingInfo) => {
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
      },
      items: cart
    };

    // Insert into Supabase Order table
    const { error } = await supabase.from("Order").insert({
      id: newOrder.id,
      date: newOrder.date,
      products: newOrder.products,
      total: newOrder.total,
      status: newOrder.status,
      statusName: newOrder.statusName,
      userEmail: newOrder.userEmail,
      shippingInfo: newOrder.shippingInfo,
      items: newOrder.items
    });

    if (error) {
      console.error("Error inserting order in Supabase:", error);
      showToast("Lỗi lưu đơn hàng lên cơ sở dữ liệu!", "error");
      return false;
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem("minishop_orders", JSON.stringify(updatedOrders));

    // Clear cart
    setCart([]);
    localStorage.removeItem("minishop_cart");
    showToast("Đặt hàng thành công! Đơn hàng đã được lưu lại.", "success");
    return newOrder;
  };

  // --- Admin Actions ---
  const adminAddProduct = async (newProduct) => {
    // Add to Supabase Product table
    const { error } = await supabase.from("Product").insert({
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      categoryName: newProduct.categoryName,
      price: newProduct.price,
      image: newProduct.image,
      description: newProduct.description,
      rating: newProduct.rating,
      reviewsCount: newProduct.reviewsCount,
      specs: newProduct.specs
    });

    if (error) {
      console.error("Error inserting product in Supabase:", error);
      showToast("Lỗi lưu sản phẩm lên cơ sở dữ liệu!", "error");
      return;
    }

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem("minishop_products", JSON.stringify(updatedProducts));
    showToast(`Đã thêm sản phẩm "${newProduct.name}"!`, "success");
  };

  const adminUpdateProduct = async (updatedProd) => {
    // Update in Supabase Product table
    const { error } = await supabase.from("Product").update({
      name: updatedProd.name,
      category: updatedProd.category,
      categoryName: updatedProd.categoryName,
      price: updatedProd.price,
      image: updatedProd.image,
      description: updatedProd.description,
      rating: updatedProd.rating,
      reviewsCount: updatedProd.reviewsCount,
      specs: updatedProd.specs
    }).eq("id", updatedProd.id);

    if (error) {
      console.error("Error updating product in Supabase:", error);
      showToast("Lỗi cập nhật sản phẩm trên cơ sở dữ liệu!", "error");
      return;
    }

    const updatedProducts = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProducts(updatedProducts);
    localStorage.setItem("minishop_products", JSON.stringify(updatedProducts));
    showToast(`Đã cập nhật sản phẩm "${updatedProd.name}"!`, "success");
  };

  const adminDeleteProduct = async (productId) => {
    // Delete from Supabase Product table
    const { error } = await supabase.from("Product").delete().eq("id", productId);

    if (error) {
      console.error("Error deleting product from Supabase:", error);
      showToast("Lỗi xóa sản phẩm trên cơ sở dữ liệu!", "error");
      return;
    }

    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem("minishop_products", JSON.stringify(updatedProducts));
    showToast("Đã xóa sản phẩm thành công.", "info");
  };

  const adminCycleOrderStatus = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let nextStatus = "processing";
    let nextName = "Đang xử lý";

    if (order.status === "processing") {
      nextStatus = "shipping";
      nextName = "Đang giao hàng";
    } else if (order.status === "shipping") {
      nextStatus = "completed";
      nextName = "Đã giao hàng";
    }

    const { error } = await supabase
      .from("Order")
      .update({ status: nextStatus, statusName: nextName })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status in Supabase:", error);
      showToast("Lỗi cập nhật trạng thái đơn hàng trên cơ sở dữ liệu!", "error");
      return;
    }

    const updatedOrders = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: nextStatus, statusName: nextName };
      }
      return o;
    });

    setOrders(updatedOrders);
    localStorage.setItem("minishop_orders", JSON.stringify(updatedOrders));
    
    showToast(`Đã chuyển trạng thái đơn ${orderId} thành "${nextName}"`, "info");
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
