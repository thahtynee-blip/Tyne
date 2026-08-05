"use client";

import React, { useState, useEffect } from "react";
import { AppProvider } from "../context/AppContext";
import Header from "./Header";
import Footer from "./Footer";
import CartModal from "./CartModal";
import ProductDetailModal from "./ProductDetailModal";
import ChatWidget from "./ChatWidget";

export default function ClientLayout({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Bind a global helper for opening product details from other client pages
  useEffect(() => {
    window.openProductDetail = (product) => {
      setSelectedProduct(product);
    };
    return () => {
      delete window.openProductDetail;
    };
  }, []);

  return (
    <AppProvider>
      <Header onCartOpen={() => setCartOpen(true)} />
      {children}
      <Footer />
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <ChatWidget />
      <div id="toast-container" className="toast-container"></div>
    </AppProvider>
  );
}
