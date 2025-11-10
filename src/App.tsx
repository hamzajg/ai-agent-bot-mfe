import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { default as LandingApp } from "@modules/landing/LandingApp";
import { AuthWrapper } from "@modules/auth";
import AdminApp from "@modules/dashboard/AdminApp";
import { DashboardHeader } from "@modules/auth";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingApp />} />
        <Route path="/dashboard/*" element={
          <AuthWrapper>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <DashboardHeader />
              <AdminApp />
            </div>
          </AuthWrapper>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
