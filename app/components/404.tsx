import LOGO from "../assets/yoc-logo.png";
import React from "react";
import "../styles/tailwind.css";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <img src={LOGO} alt="YOC Logo" width={120} height={120} />
      <h1 className="mt-6 text-6xl font-bold text-gray-800">404</h1>
      <p className="text-lg text-gray-500 mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
    </div>
  );
}
