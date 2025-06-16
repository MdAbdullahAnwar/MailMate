import Header from "./Header";
import Footer from "./Footer";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-100 to-indigo-100 text-gray-800">
      <Header />
      <main className="flex-grow flex items-center justify-center mt-2 py-8 px-4 sm:px-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AuthLayout;
