import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./config/supabase";

import Layout from "./pages/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Acount from "./pages/Acount"; 
import Status from "./pages/Status";
import Services from "./pages/Services";
import Job from "./pages/Job";
import Relationship from "./pages/Relationship";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F5C5E] to-[#0C4F50]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Login page - WITHOUT Layout */}
        <Route path="/" element={!session ? <Login /> : <Navigate to="/home" />} />
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/home" />} />
        
        {/* Protected pages - WITH Layout */}
        <Route element={session ? <Layout /> : <Navigate to="/" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/acount" element={<Acount />} />
          <Route path="/services" element={<Services />} />
          <Route path="/status" element={<Status />} />
          <Route path="/job" element={<Job />} />
          <Route path="/relationship" element={<Relationship />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;