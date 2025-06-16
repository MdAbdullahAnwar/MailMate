import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import AuthLayout from "./components/Layout/AuthLayout";

import MainLayout from "./components/Layout/MainLayout";
import Compose from "./pages/Compose";

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 to-indigo-100 text-gray-800">
      {!isAuthPage && <Header />}

      <main className={`flex-grow ${!isAuthPage ? "my-2 py-4 px-3 sm:px-8" : ""}`}>
        <Routes>
          
          <Route
            path="/sign-in/*"
            element={
              <AuthLayout>
                <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
                  <SignIn routing="path" path="/sign-in" afterSignInUrl="/" />
                </div>
              </AuthLayout>
            }
          />
          
          <Route
            path="/sign-up/*"
            element={
              <AuthLayout>
                <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
                  <SignUp routing="path" path="/sign-up" afterSignUpUrl="/" />
                </div>
              </AuthLayout>
            }
          />

          <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/compose" element={<Compose />} />
          </Route>

        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
