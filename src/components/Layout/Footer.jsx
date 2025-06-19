const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 text-gray-100 py-3 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm sm:text-base">
        <p>
          © 2025 <span className="font-semibold text-white">MailMate</span> · Built with
          <span className="text-red-400 mx-1">❤️</span> {" and 🧠 by "}
          <span className="text-gray-900 font-bold">Abdullah</span>
        </p>
        <p className="mt-1 text-md text-white-500">
          Crafted with: React ⚛️ | Redux Toolkit 🔄 | Clerk 🔐 | Firebase 🗄️ | Tailwind CSS 🎨 | ShadCN 🏗️ |  Toastify 🔔 | Lucide Icons ✨
        </p>
      </div>
    </footer>
  );
};

export default Footer;
