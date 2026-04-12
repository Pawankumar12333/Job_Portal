import { useState, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { supabase } from "../config/supabase";
import {
  FaBars,
  FaHome,
  FaUser,
  FaServicestack,
  FaBriefcase,
  FaHeart,
  FaInfoCircle,
  FaSignOutAlt,
} from "react-icons/fa";

function Layout() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/home" },
    { name: "Account", icon: <FaUser />, path: "/acount" },
    { name: "Services", icon: <FaServicestack />, path: "/services" },
    { name: "Job", icon: <FaBriefcase />, path: "/job" },
    { name: "Relationship", icon: <FaHeart />, path: "/relationship" },
    { name: "Status", icon: <FaInfoCircle />, path: "/status" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    setOpen(false);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-950 text-white transform transition-transform duration-300 z-30 shadow-xl
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {user && (
          <div className="p-4 border-b border-blue-700 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold truncate">{user.email?.split('@')[0]}</p>
                <p className="text-xs text-blue-300 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <ul className="p-4 space-y-2">
          {menuItems.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                navigate(item.path);
                setOpen(false);
              }}
              className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-700 transition-all duration-200 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </li>
          ))}
          
          <li
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-600 transition-all duration-200 group mt-8 border-t border-blue-700 pt-4"
          >
            <span className="text-xl group-hover:scale-110 transition-transform"><FaSignOutAlt /></span>
            <span className="font-medium">Logout</span>
          </li>
        </ul>
      </div>

      {/* Menu Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-40 p-2.5 text-white bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <FaBars />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Content */}
      <div className="flex-1 h-full overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;