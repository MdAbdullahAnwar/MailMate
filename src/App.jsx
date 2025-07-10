import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";

import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Compose = lazy(() => import("./pages/Compose"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Starred = lazy(() => import("./pages/Starred"));
const Sent = lazy(() => import("./pages/Sent"));
const Trash = lazy(() => import("./pages/Trash"));
const Header = lazy(() => import("./components/Layout/Header"));
const Footer = lazy(() => import("./components/Layout/Footer"));
const MainLayout = lazy(() => import("./components/Layout/MainLayout"));
const AuthLayout = lazy(() => import("./components/Layout/AuthLayout"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute"));

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname.startsWith("/sign-in") || location.pathname.startsWith("/sign-up");

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 to-indigo-100 text-gray-800">
      <Suspense fallback={<div className="text-center py-20"></div>}>
        {!isAuthPage && <Header />}
      </Suspense>

      <main className={`flex-grow ${!isAuthPage ? "my-2 py-4 px-3 sm:px-8" : ""}`}>
        <Suspense fallback={<div className="text-center py-20">Loading Page...</div>}>
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
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/starred" element={<Starred />} />
              <Route path="/sent" element={<Sent />} />
              <Route path="/trash" element={<Trash />} />
            </Route>
          </Routes>
        </Suspense>
      </main>

      <Suspense fallback={<div className="text-center py-4"></div>}>
        {!isAuthPage && <Footer />}
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Suspense fallback={<div className="text-center py-10">Loading App...</div>}>
        <AppContent />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
