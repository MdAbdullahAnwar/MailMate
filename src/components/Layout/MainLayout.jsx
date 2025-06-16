import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <div className="flex flex-col max-h-screen bg-gradient-to-br from-pink-10 to-indigo-10">
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-grow ml-36">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
