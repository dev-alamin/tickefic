import { useState, useEffect } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch"; // Fixed import
import { __ } from "@wordpress/i18n";
import AuthManager from "./AuthManager";

const User = ({ user, isLoading = false }) => {

  // 1. Prevent "Flash of Unauthenticated Content"
  if (isLoading) {
    return (
      <div className="p-10 text-center animate-pulse text-slate-400">
        {__("Verifying session...", "tickefic")}
      </div>
    );
  }

  return (
    <div className="tickefic-user-container mb-4">
      {user ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold">
            {__("Welcome,", "tickefic")} {user.name}
          </h2>
          <p className="text-slate-500 text-sm">
            {__("You are logged in and can manage tickets.", "tickefic")}
          </p>
          {/* Add a Logout button here later */}
        </div>
      ) : (
        <AuthManager />
      )}
    </div>
  );
};

export default User;
