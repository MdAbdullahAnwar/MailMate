import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignedIn, useUser } from "@clerk/clerk-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUnreadCount, fetchTrashCount, fetchSentCount } from "../../store/emailSlice";
import useSyncMailCounts from "../../hooks/useSyncMailCounts";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useUser();

  useSyncMailCounts(user?.primaryEmailAddress?.emailAddress);

  const unreadCount = useSelector((state) => state.email.unreadCount);
  const trashCount = useSelector((state) => state.email.trashCount);
  const sentCount = useSelector((state) => state.email.sentCount);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      dispatch(fetchUnreadCount(email));
      dispatch(fetchTrashCount(email));
      dispatch(fetchSentCount(email));
    }
  }, [dispatch, user]);

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { name: "Compose", icon: "✏️", path: "/compose" },
    { name: "Inbox", icon: "📥", path: "/inbox", count: unreadCount },
    { name: "Starred", icon: "⭐", path: "/starred" },
    { name: "Sent", icon: "📤", path: "/sent", count: sentCount },
    { name: "Drafts", icon: "📝", path: "/drafts", count: 2 },
    { name: "Trash", icon: "🗑️", path: "/trash", count: trashCount },
  ];

  return (
    <SignedIn>
      <aside className="w-64 bg-gradient-to-b from-violet-300 to-purple-500 fixed top-16 left-0 h-[calc(100vh-8.75rem)] z-10 shadow-md">
        <nav className="p-4 overflow-y-auto h-full">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center p-3 rounded-lg mb-2 transition-colors ${
                isActive(item.path)
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100 text-white"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {item.count > 0 && (
                <span className="bg-white text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
    </SignedIn>
  );
};

export default Sidebar;
