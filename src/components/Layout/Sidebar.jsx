import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, useUser } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnreadCount } from "../../store/emailSlice";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useUser();

  const unreadCount = useSelector((state) => state.email.unreadCount);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      dispatch(fetchUnreadCount(user.primaryEmailAddress.emailAddress));
    }
  }, [dispatch, user]);

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { name: "Compose", icon: "✏️", path: "/compose" },
    { name: "Inbox", icon: "📥", path: "/inbox", count: unreadCount },
    { name: "Starred", icon: "⭐", path: "/starred" },
    { name: "Sent", icon: "📤", path: "/sent" },
    { name: "Drafts", icon: "📝", path: "/drafts", count: 2 },
    { name: "Trash", icon: "🗑️", path: "/trash" },
  ];

  return (
    <SignedIn>
      <div className="w-64 bg-gradient-to-b from-violet-250 to-purple-400 shadow-lg h-[calc(100vh-8.75rem)] fixed left-0 top-16 z-10">
        <div className="p-4 overflow-y-auto h-full">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-3 rounded-lg mb-2 transition-all ${
                isActive(item.path)
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {item.count > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </SignedIn>
  );
};

export default Sidebar;
