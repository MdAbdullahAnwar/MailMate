import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-gradient-to-r from-green-500 via-blue-500 to-red-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <h1 className="text-white text-2xl font-extrabold tracking-wide">
          <Link to="/" className="hover:opacity-90">📮 MailMate</Link>
        </h1>

        <SignedIn>
          <div className="flex items-center gap-4">
            <nav className="hidden sm:flex gap-6 text-white text-lg font-medium">
              <Link 
                to="/" 
                className={`hover:underline ${isActive('/') ? 'text-yellow-300 font-bold underline' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/dashboard" 
                className={`hover:underline ${isActive('/dashboard') ? 'text-yellow-300 font-bold underline' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className={`hover:underline ${isActive('/profile') ? 'text-yellow-300 font-bold underline' : ''}`}
              >
                Profile
              </Link>
            </nav>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </SignedIn>

        <SignedOut>
          <nav className="flex gap-4 text-white text-lg font-lg">
            <Link 
              to="/sign-in" 
              className={`hover:underline ${isActive('/sign-in') ? 'text-yellow-300 font-bold underline' : ''}`}
            >
              Sign In
            </Link>
            <Link 
              to="/sign-up" 
              className={`hover:underline ${isActive('/sign-up') ? 'text-yellow-300 font-bold underline' : ''}`}
            >
              Sign Up
            </Link>
          </nav>
        </SignedOut>
      </div>
    </header>
  );
};

export default Header;
