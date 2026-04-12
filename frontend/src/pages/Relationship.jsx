import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../photo/bg_image.jpg";
import { supabase } from "../config/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

// ── userId helper ──────────────────────────────────────
const getUserId = () => {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = `user_${Date.now()}`;
    localStorage.setItem("userId", id);
  }
  return id;
};

const inp = {
  width: "100%", padding: "11px", borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.3)", fontSize: "14px", boxSizing: "border-box",
  marginBottom: "12px", outline: "none", background: "rgba(255,255,255,0.9)"
};
const btn = (bg, color = "#fff") => ({
  padding: "12px 20px", borderRadius: "10px", border: "none",
  background: bg, color, fontWeight: "700", cursor: "pointer", fontSize: "14px"
});

const relStatusOptions = [
  { value: "Single", emoji: "💚", label: "Single" },
  { value: "Divorced", emoji: "💔", label: "Divorced" },
  { value: "Widower", emoji: "🕊️", label: "Widower" },
];

const relStatusStyle = {
  Single: { bg: "rgba(240,253,244,0.3)", color: "#10B981", border: "rgba(187,247,208,0.5)" },
  Divorced: { bg: "rgba(255,241,242,0.3)", color: "#F43F5E", border: "rgba(254,205,211,0.5)" },
  Widower: { bg: "rgba(245,243,255,0.3)", color: "#8B5CF6", border: "rgba(221,214,254,0.5)" },
};

// Profession Options with icons
const professionOptions = [
  { value: "Software Developer", icon: "💻", category: "Technology" },
  { value: "Web Developer", icon: "🌐", category: "Technology" },
  { value: "Mobile Developer", icon: "📱", category: "Technology" },
  { value: "UI/UX Designer", icon: "🎨", category: "Design" },
  { value: "Graphic Designer", icon: "✏️", category: "Design" },
  { value: "Product Manager", icon: "📊", category: "Management" },
  { value: "Project Manager", icon: "📋", category: "Management" },
  { value: "Marketing Specialist", icon: "📢", category: "Marketing" },
  { value: "Sales Executive", icon: "🤝", category: "Sales" },
  { value: "Data Scientist", icon: "📈", category: "Data" },
  { value: "Data Analyst", icon: "📉", category: "Data" },
  { value: "DevOps Engineer", icon: "⚙️", category: "Technology" },
  { value: "System Administrator", icon: "🖥️", category: "Technology" },
  { value: "Teacher", icon: "👨‍🏫", category: "Education" },
  { value: "Professor", icon: "🎓", category: "Education" },
  { value: "Doctor", icon: "👨‍⚕️", category: "Healthcare" },
  { value: "Nurse", icon: "👩‍⚕️", category: "Healthcare" },
  { value: "Accountant", icon: "💰", category: "Finance" },
  { value: "Financial Analyst", icon: "📊", category: "Finance" },
  { value: "Lawyer", icon: "⚖️", category: "Legal" },
  { value: "Architect", icon: "🏗️", category: "Construction" },
  { value: "Civil Engineer", icon: "🏗️", category: "Construction" },
  { value: "Content Writer", icon: "✍️", category: "Content" },
  { value: "Digital Marketer", icon: "📱", category: "Marketing" },
  { value: "Business Analyst", icon: "📊", category: "Business" },
  { value: "HR Manager", icon: "👥", category: "Human Resources" },
  { value: "Customer Support", icon: "🎧", category: "Support" },
  { value: "Freelancer", icon: "💼", category: "Freelance" },
  { value: "Entrepreneur", icon: "🚀", category: "Business" },
  { value: "Student", icon: "📚", category: "Education" },
  { value: "Other", icon: "🔧", category: "Other" }
];

const getProfessionIcon = (profession) => {
  const found = professionOptions.find(p => p.value === profession);
  return found ? found.icon : "💼";
};

const ProfessionInput = ({ value, onChange, placeholder = "Profession" }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredProfessions, setFilteredProfessions] = useState([]);

  useEffect(() => { setSearchTerm(value); }, [value]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    onChange(term);
    if (term.length > 0) {
      setFilteredProfessions(professionOptions.filter(p => p.value.toLowerCase().includes(term.toLowerCase())));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectProfession = (prof) => {
    setSearchTerm(prof.value);
    onChange(prof.value);
    setShowSuggestions(false);
  };

  return (
    <div style={{ position: "relative", marginBottom: "12px" }}>
      <input
        style={inp}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => searchTerm && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && filteredProfessions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0,
          background: "#fff", border: "1px solid #ddd", borderRadius: "10px",
          maxHeight: "250px", overflowY: "auto", zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}>
          {filteredProfessions.map(prof => (
            <div key={prof.value} onClick={() => selectProfession(prof)}
              style={{ padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: "10px" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
            >
              <span style={{ fontSize: "20px" }}>{prof.icon}</span>
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>{prof.value}</div>
                <div style={{ fontSize: "11px", color: "#888" }}>{prof.category}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PicUpload = ({ pic, id, emoji = "💕", onChange, borderColor = "#E24B4A" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
    <label htmlFor={id} style={{ cursor: "pointer" }}>
      {pic
        ? <img src={pic} alt="p" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: `3px solid ${borderColor}` }} />
        : <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", border: `2px dashed ${borderColor}` }}>{emoji}</div>
      }
    </label>
    <input id={id} type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginTop: "6px" }}>Photo tap karke lagao</span>
  </div>
);

function Relationship() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("matches");
  const [profilePic, setProfilePic] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAllProfiles, setShowAllProfiles] = useState(false);
  const [showAcceptedList, setShowAcceptedList] = useState(false);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  
  const [filters, setFilters] = useState({
    name: "",
    profession: "",
    age: "",
    religion: "",
    income: "",
    location: "",
    status: "",
    qualification: "",
    gender: ""
  });
  
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: "", type: "" });
  const [form, setForm] = useState({
    fullName: "", fatherName: "", religion: "", dob: "", contact: "",
    location: "", gender: "Male", profession: "", employmentStatus: "Employed",
    monthlyIncome: "", qualification: "", status: "Single", description: ""
  });
  const [relProfile, setRelProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);

  const showToastMessage = (message, type = "success") => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: "", type: "" }), 3000);
  };

  // Load all relationship profiles from Supabase
  const loadAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("relationship_profiles")
        .select("*");
      
      if (error) throw error;
      
      const matches = data.map(profile => ({
        id: profile.user_id,
        name: profile.full_name || "",
        age: profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 25,
        gender: profile.gender || "Male",
        status: profile.status || "Single",
        profession: profile.profession || "",
        location: profile.location || "",
        religion: profile.religion || "",
        monthlyIncome: profile.monthly_income || "0",
        qualification: profile.qualification || "",
        bio: profile.description || "",
        fatherName: profile.father_name || "",
        contact: profile.contact || "",
        employmentStatus: profile.employment_status || "Employed",
        pic: profile.profile_pic,
        compatibility: Math.floor(Math.random() * 30) + 70
      }));
      
      setAllProfiles(matches);
      
      const userId = getUserId();
      if (showAllProfiles) {
        setFilteredMatches(matches);
      } else {
        setFilteredMatches(matches.filter(p => p.id !== userId));
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    }
  };

  // Load current user's profile
  const loadMyProfile = async () => {
    const userId = getUserId();
    try {
      const { data, error } = await supabase
        .from("relationship_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (data && !error) {
        const mapped = {
          fullName: data.full_name || "",
          fatherName: data.father_name || "",
          religion: data.religion || "",
          dob: data.dob || "",
          contact: data.contact || "",
          location: data.location || "",
          gender: data.gender || "Male",
          profession: data.profession || "",
          employmentStatus: data.employment_status || "Employed",
          monthlyIncome: data.monthly_income || "",
          qualification: data.qualification || "",
          status: data.status || "Single",
          description: data.description || "",
          profilePic: data.profile_pic || null,
        };
        setRelProfile(mapped);
        setProfilePic(mapped.profilePic);
        setForm(mapped);
      }
    } catch (error) {
      console.error("Error loading my profile:", error);
    }
  };

  // Load requests from Supabase
  const loadRequests = async () => {
    const userId = getUserId();
    try {
      // Load sent requests
      const { data: sentData, error: sentError } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("sender_id", userId)
        .order("created_at", { ascending: false });
      
      if (!sentError && sentData) {
        const sent = sentData.map(req => ({
          id: req.receiver_id,
          requestId: req.id,
          sentTo: req.receiver_name,
          sentBy: req.sender_name,
          sentAt: req.created_at,
          status: req.status,
          profession: req.receiver_profession || "",
          location: req.receiver_location || "",
          gender: req.receiver_gender || "Male"
        }));
        setSentRequests(sent);
        localStorage.setItem("sentRequests", JSON.stringify(sent));
      }
      
      // Load received requests (pending)
      const { data: receivedData, error: receivedError } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("receiver_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (!receivedError && receivedData) {
        const received = receivedData.map(req => ({
          requestId: req.id,
          senderName: req.sender_name,
          senderId: req.sender_id,
          profession: req.sender_profession || "",
          location: req.sender_location || "",
          gender: req.sender_gender || "Male",
          status: req.status,
          sentAt: req.created_at
        }));
        setReceivedRequests(received);
        localStorage.setItem("receivedRequests", JSON.stringify(received));
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  // Load accepted requests with full profile data
  const loadAcceptedRequests = async () => {
    const userId = getUserId();
    try {
      const { data, error } = await supabase
        .from("connection_requests")
        .select("*")
        .eq("receiver_id", userId)
        .eq("status", "accepted")
        .order("updated_at", { ascending: false });
      
      if (!error && data) {
        const accepted = await Promise.all(data.map(async (req) => {
          // Fetch full profile data from relationship_profiles
          const { data: profileData } = await supabase
            .from("relationship_profiles")
            .select("*")
            .eq("user_id", req.sender_id)
            .single();
          
          return {
            id: req.sender_id,
            name: req.sender_name,
            profession: req.sender_profession,
            location: req.sender_location,
            gender: req.sender_gender,
            acceptedAt: req.updated_at,
            // Full profile details
            fullProfile: profileData ? {
              fullName: profileData.full_name,
              fatherName: profileData.father_name,
              religion: profileData.religion,
              dob: profileData.dob,
              contact: profileData.contact,
              location: profileData.location,
              gender: profileData.gender,
              profession: profileData.profession,
              employmentStatus: profileData.employment_status,
              monthlyIncome: profileData.monthly_income,
              qualification: profileData.qualification,
              status: profileData.status,
              description: profileData.description,
              profilePic: profileData.profile_pic,
              age: profileData.dob ? new Date().getFullYear() - new Date(profileData.dob).getFullYear() : 25,
            } : null
          };
        }));
        setAcceptedRequests(accepted);
      }
    } catch (error) {
      console.error("Error loading accepted requests:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadAllProfiles();
      await loadMyProfile();
      await loadRequests();
      await loadAcceptedRequests();
      setLoading(false);
    };
    init();
  }, []);

  const toggleShowAll = () => {
    const userId = getUserId();
    if (!showAllProfiles) {
      setFilteredMatches(allProfiles);
      setShowAllProfiles(true);
      showToastMessage("Showing all profiles (including yours)", "info");
    } else {
      setFilteredMatches(allProfiles.filter(p => p.id !== userId));
      setShowAllProfiles(false);
      showToastMessage("Showing only other profiles", "info");
    }
  };

  // Filter function
  useEffect(() => {
    let filtered = [...allProfiles];
    const userId = getUserId();
    if (!showAllProfiles) {
      filtered = filtered.filter(p => p.id !== userId);
    }
    
    if (filters.name.trim()) {
      filtered = filtered.filter(match => match.name.toLowerCase().includes(filters.name.toLowerCase().trim()));
    }
    if (filters.profession.trim()) {
      filtered = filtered.filter(match => match.profession.toLowerCase().includes(filters.profession.toLowerCase().trim()));
    }
    if (filters.age) {
      const ageNum = parseInt(filters.age);
      if (!isNaN(ageNum)) {
        filtered = filtered.filter(match => match.age === ageNum);
      }
    }
    if (filters.religion.trim()) {
      filtered = filtered.filter(match => match.religion && match.religion.toLowerCase().includes(filters.religion.toLowerCase().trim()));
    }
    if (filters.income) {
      const incomeNum = parseInt(filters.income);
      if (!isNaN(incomeNum)) {
        filtered = filtered.filter(match => parseInt(match.monthlyIncome) >= incomeNum);
      }
    }
    if (filters.location.trim()) {
      filtered = filtered.filter(match => match.location.toLowerCase().includes(filters.location.toLowerCase().trim()));
    }
    if (filters.status) {
      filtered = filtered.filter(match => match.status === filters.status);
    }
    if (filters.qualification.trim()) {
      filtered = filtered.filter(match => match.qualification && match.qualification.toLowerCase().includes(filters.qualification.toLowerCase().trim()));
    }
    if (filters.gender) {
      filtered = filtered.filter(match => match.gender === filters.gender);
    }
    
    setFilteredMatches(filtered);
  }, [filters, allProfiles, showAllProfiles]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      name: "",
      profession: "",
      age: "",
      religion: "",
      income: "",
      location: "",
      status: "",
      qualification: "",
      gender: ""
    });
    showToastMessage("All filters cleared!", "info");
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(v => v && v.toString().trim() !== "").length;
  };

  const saveProfile = async () => {
    if (!form.fullName || !form.contact || !form.profession) {
      showToastMessage("Please fill all required fields!", "error");
      return;
    }
    
    setSaving(true);
    const userId = getUserId();
    
    const supabaseData = {
      user_id: userId,
      full_name: form.fullName,
      father_name: form.fatherName,
      religion: form.religion,
      dob: form.dob,
      contact: form.contact,
      location: form.location,
      gender: form.gender,
      status: form.status,
      profession: form.profession,
      employment_status: form.employmentStatus,
      monthly_income: form.monthlyIncome,
      qualification: form.qualification,
      description: form.description,
      profile_pic: profilePic || null,
    };
    
    const { error } = await supabase
      .from("relationship_profiles")
      .upsert(supabaseData, { onConflict: "user_id" });
    
    setSaving(false);
    
    if (error) {
      console.error(error);
      showToastMessage("Error saving profile!", "error");
    } else {
      showToastMessage("Profile saved successfully! 🎉", "success");
      setRelProfile(form);
      await loadAllProfiles();
    }
  };

  const picToBase64 = (file, cb) => {
    const r = new FileReader();
    r.onload = () => cb(r.result);
    r.readAsDataURL(file);
  };

  // Send request - Save to Supabase
  const sendRequest = async (match) => {
    if (!relProfile) {
      showToastMessage("Please create your profile first!", "error");
      setTab("profile");
      return;
    }
    
    if (sentRequests.some(req => req.id === match.id)) {
      showToastMessage(`Request already sent to ${match.name}`, "info");
      return;
    }
    
    const userId = getUserId();
    const currentUserName = relProfile.fullName;
    
    const requestData = {
      sender_id: userId,
      receiver_id: match.id,
      sender_name: currentUserName,
      receiver_name: match.name,
      sender_profession: relProfile.profession,
      receiver_profession: match.profession,
      sender_location: relProfile.location,
      receiver_location: match.location,
      sender_gender: relProfile.gender,
      receiver_gender: match.gender,
      status: "pending",
      created_at: new Date().toISOString()
    };
    
    try {
      const { data, error } = await supabase
        .from("connection_requests")
        .insert(requestData)
        .select();
      
      if (error) throw error;
      
      const newRequest = {
        id: match.id,
        requestId: data[0].id,
        sentTo: match.name,
        sentBy: currentUserName,
        sentAt: new Date().toISOString(),
        status: "pending",
        profession: match.profession,
        location: match.location,
        gender: match.gender
      };
      
      const updatedSent = [...sentRequests, newRequest];
      setSentRequests(updatedSent);
      localStorage.setItem("sentRequests", JSON.stringify(updatedSent));
      
      showToastMessage(`💌 Request sent to ${match.name}!`, "success");
      await loadRequests();
    } catch (error) {
      console.error("Error sending request:", error);
      showToastMessage("Failed to send request!", "error");
    }
  };

  // Withdraw request
  const withdrawRequest = async (request) => {
    try {
      const { error } = await supabase
        .from("connection_requests")
        .delete()
        .eq("id", request.requestId);
      
      if (error) throw error;
      
      const updatedSent = sentRequests.filter(req => req.id !== request.id);
      setSentRequests(updatedSent);
      localStorage.setItem("sentRequests", JSON.stringify(updatedSent));
      
      showToastMessage(`✓ Request to ${request.sentTo} has been withdrawn`, "success");
      await loadRequests();
    } catch (error) {
      console.error("Error withdrawing request:", error);
      showToastMessage("Failed to withdraw request!", "error");
    }
  };

  // Accept request
  const acceptRequest = async (request) => {
    try {
      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", request.requestId);
      
      if (error) throw error;
      
      const updated = receivedRequests.map(req => 
        req.requestId === request.requestId ? { ...req, status: "accepted" } : req
      );
      setReceivedRequests(updated);
      localStorage.setItem("receivedRequests", JSON.stringify(updated));
      
      showToastMessage(`✅ You accepted ${request.senderName}'s request!`, "success");
      await loadRequests();
      await loadAcceptedRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      showToastMessage("Failed to accept request!", "error");
    }
  };

  // Reject request
  const rejectRequest = async (request) => {
    try {
      const { error } = await supabase
        .from("connection_requests")
        .delete()
        .eq("id", request.requestId);
      
      if (error) throw error;
      
      const updated = receivedRequests.filter(req => req.requestId !== request.requestId);
      setReceivedRequests(updated);
      localStorage.setItem("receivedRequests", JSON.stringify(updated));
      
      showToastMessage(`❌ Rejected ${request.senderName}'s request`, "info");
      await loadRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToastMessage("Failed to reject request!", "error");
    }
  };

  const viewProfile = (profile) => {
    setSelectedProfile(profile);
    setShowProfileModal(true);
  };

  const closeModal = () => {
    setShowProfileModal(false);
    setSelectedProfile(null);
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8f9fa" }}>
        <p style={{ color: "#888", fontSize: "16px" }}>⏳ Loading profiles...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      padding: "20px", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center",
      position: "relative"
    }}>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      {showToast.show && (
        <div style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          animation: "slideDown 0.3s ease"
        }}>
          <div style={{
            padding: "12px 24px",
            borderRadius: "12px",
            background: showToast.type === "success" ? "#10B981" : showToast.type === "error" ? "#EF4444" : "#3B82F6",
            color: "white",
            fontWeight: "600",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            backdropFilter: "blur(10px)"
          }}>
            {showToast.message}
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `}
      </style>

      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* HEADER with Glass Effect */}
        <div style={{ 
          background: "rgba(255,255,255,0.15)", 
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "24px", 
          padding: "24px", 
          marginBottom: "20px", 
          boxShadow: "0 12px 35px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.3)"
        }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <button onClick={() => navigate("/")} style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(5px)", border: "none", fontSize: "22px", cursor: "pointer", borderRadius: "12px", padding: "8px 12px", color: "white" }}>🏠</button>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>💕 Relationship</h1>
          </div>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "4px", gap: "4px" }}>
            <button onClick={() => setTab("matches")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: tab === "matches" ? "rgba(236,72,153,0.8)" : "transparent", color: tab === "matches" ? "#fff" : "rgba(255,255,255,0.8)", fontWeight: "700", cursor: "pointer", backdropFilter: "blur(5px)" }}>
              💑 Matches
            </button>
            <button onClick={() => setTab("sent")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: tab === "sent" ? "rgba(16,185,129,0.8)" : "transparent", color: tab === "sent" ? "#fff" : "rgba(255,255,255,0.8)", fontWeight: "700", cursor: "pointer", backdropFilter: "blur(5px)" }}>
              📤 Sent ({sentRequests.length})
            </button>
            <button onClick={() => setTab("received")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: tab === "received" ? "rgba(59,130,246,0.8)" : "transparent", color: tab === "received" ? "#fff" : "rgba(255,255,255,0.8)", fontWeight: "700", cursor: "pointer", backdropFilter: "blur(5px)" }}>
              📥 Received ({receivedRequests.filter(r => r.status === "pending").length})
            </button>
            <button onClick={() => setTab("profile")} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: tab === "profile" ? "rgba(236,72,153,0.8)" : "transparent", color: tab === "profile" ? "#fff" : "rgba(255,255,255,0.8)", fontWeight: "700", cursor: "pointer", backdropFilter: "blur(5px)" }}>
              👤 Profile
            </button>
          </div>
        </div>

        {/* Profile View Modal - Detailed View */}
        {showProfileModal && selectedProfile && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }} onClick={closeModal}>
            <div style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "25px",
              padding: "30px",
              width: "100%",
              maxWidth: "400px",
              maxHeight: "85vh",
              overflow: "auto",
              backdropFilter: "blur(15px)",
              WebkitBackdropFilter: "blur(15px)",
              border: "1px solid rgba(255,255,255,0.2)",
              position: "relative"
            }} onClick={(e) => e.stopPropagation()}>
              <button onClick={closeModal} style={{
                position: "sticky",
                top: "0",
                right: "0",
                float: "right",
                background: "rgba(255,255,255,0.2)",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                width: "35px",
                height: "35px",
                borderRadius: "50%",
                color: "white",
                marginBottom: "10px"
              }}>✕</button>
              
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FECDD3, #FDA4AF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "40px",
                  margin: "0 auto",
                  border: "3px solid #EC4899"
                }}>
                  {selectedProfile.gender === "Female" ? "👩" : "👨"}
                </div>
                <h2 style={{ margin: "10px 0 5px", color: "white", fontSize: "22px" }}>{selectedProfile.name}</h2>
                <p style={{ color: "#EC4899", fontWeight: "700", margin: "0 0 8px" }}>
                  {getProfessionIcon(selectedProfile.profession)} {selectedProfile.profession}
                </p>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  background: relStatusStyle[selectedProfile.status]?.bg || "rgba(255,255,255,0.1)",
                  color: relStatusStyle[selectedProfile.status]?.color || "white"
                }}>
                  {relStatusOptions.find(o => o.value === selectedProfile.status)?.emoji} {selectedProfile.status}
                </span>
              </div>

              <div style={{ 
                textAlign: "left",
                background: "rgba(255,255,255,0.1)",
                padding: "15px",
                borderRadius: "15px",
                marginBottom: "15px"
              }}>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>🎂</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Age:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.age} Years</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>📞</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Contact No.:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.contact || "N/A"}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>👨‍💼</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Father's Name:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.fatherName || "N/A"}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>🕉️</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Religion:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.religion || "N/A"}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>🚻</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Gender:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.gender}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>{getProfessionIcon(selectedProfile.profession)}</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Profession:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.profession || "N/A"}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>🛠️</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Work Status:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.employmentStatus || "N/A"}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>🎓</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Qualification:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.qualification || "N/A"}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>💰</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Monthly Income:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>₹{selectedProfile.monthlyIncome}</span>
                </div>
                <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
                  <span>📍</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "100px" }}>Location:</span>
                  <span style={{ fontWeight: "600", color: "white" }}>{selectedProfile.location || "N/A"}</span>
                </div>
              </div>

              {selectedProfile.bio && (
                <div style={{ 
                  textAlign: "left",
                  background: "rgba(255,255,255,0.1)",
                  padding: "15px",
                  borderRadius: "15px",
                  marginBottom: "15px"
                }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "800", color: "#EC4899" }}>📝 About Me</p>
                  <p style={{ margin: 0, fontSize: "13px", color: "white", lineHeight: 1.6 }}>{selectedProfile.bio}</p>
                </div>
              )}

              <button onClick={closeModal}
                style={{ ...btn("rgba(255,255,255,0.2)", "white"), width: "100%", marginTop: "10px", border: "1.5px solid white", padding: "12px" }}>
                Close
              </button>
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div style={{ 
            background: "rgba(255,255,255,0.15)", 
            backdropFilter: "blur(10px)",
            borderRadius: "20px", 
            padding: "28px", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <h3 style={{ margin: "0 0 20px", textAlign: "center", color: "white", fontSize: "18px", fontWeight: "800", textShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>💝 My Profile</h3>
            
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <input type="file" id="profilePic" onChange={e => picToBase64(e.target.files[0], setProfilePic)} style={{ display: "none" }} />
              <label htmlFor="profilePic" style={{ cursor: "pointer", display: "block" }}>
                {profilePic ? (
                  <img src={profilePic} alt="profile" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", border: "4px solid #EC4899", boxShadow: "0 8px 25px rgba(236,72,153,0.4)" }} />
                ) : (
                  <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #FECDD3, #FDA4AF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", border: "4px solid #fff", boxShadow: "0 8px 25px rgba(0,0,0,0.2)" }}>💕</div>
                )}
              </label>
              <p style={{ margin: "8px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>Tap to change photo</p>
            </div>

            <input style={inp} placeholder="Full Name *" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            <input style={inp} placeholder="Father's Name" value={form.fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} />
            
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <select style={{ ...inp, flex: 1, marginBottom: 0 }} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            
            <input style={inp} placeholder="Religion" value={form.religion} onChange={e => setForm(f => ({ ...f, religion: e.target.value }))} />
            <input style={inp} placeholder="Contact *" type="tel" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
            
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input style={{ ...inp, flex: 1, marginBottom: 0 }} placeholder="City" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              <button style={{ padding: "12px 16px", borderRadius: "10px", background: "#EC4899", color: "#fff", border: "none", fontSize: "16px", cursor: "pointer" }}>📍</button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {relStatusOptions.map(({ value, emoji, label }) => {
                const st = relStatusStyle[value];
                const active = form.status === value;
                return (
                  <button key={value} onClick={() => setForm(f => ({ ...f, status: value }))}
                    style={{
                      flex: 1, padding: "12px", borderRadius: "12px", border: `2px solid ${active ? st.border : "rgba(255,255,255,0.3)"}`,
                      background: active ? st.bg : "rgba(255,255,255,0.1)", color: active ? st.color : "white", fontWeight: "700", cursor: "pointer", backdropFilter: "blur(5px)"
                    }}>
                    {emoji} {label}
                  </button>
                );
              })}
            </div>

            <ProfessionInput value={form.profession} onChange={(val) => setForm(f => ({ ...f, profession: val }))} placeholder="Profession *" />
            <input style={inp} type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
            <input style={inp} placeholder="Monthly Income ₹" type="number" value={form.monthlyIncome} onChange={e => setForm(f => ({ ...f, monthlyIncome: e.target.value }))} />
            <input style={inp} placeholder="Qualification" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} />
            
            <textarea style={{ ...inp, height: "100px", padding: "12px", resize: "vertical" }} placeholder="About me / expectations..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <button onClick={saveProfile} disabled={saving} style={{ ...btn("#EC4899"), width: "100%", padding: "14px", fontSize: "16px", boxShadow: "0 4px 15px rgba(236,72,153,0.4)", opacity: saving ? 0.7 : 1 }}>
              {saving ? "⏳ Saving..." : "💝 Update Profile"}
            </button>
          </div>
        )}

        {tab === "matches" && (
          <div style={{ 
            background: "rgba(255,255,255,0.15)", 
            backdropFilter: "blur(10px)",
            borderRadius: "20px", 
            padding: "24px", 
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            {/* ALL Button */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <button 
                onClick={toggleShowAll}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  border: `2px solid ${showAllProfiles ? "#EC4899" : "rgba(255,255,255,0.3)"}`,
                  background: showAllProfiles ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.1)",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  backdropFilter: "blur(5px)"
                }}
              >
                🌍 {showAllProfiles ? "Hide My Profile" : "Show All Profiles"}
              </button>
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: `1px solid ${getActiveFilterCount() > 0 ? "#EC4899" : "rgba(255,255,255,0.3)"}`,
                background: getActiveFilterCount() > 0 ? "rgba(236,72,153,0.2)" : "rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: "600",
                cursor: "pointer",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backdropFilter: "blur(5px)"
              }}
            >
              🔍 {showFilters ? "Hide Filters" : "Show Filters"} 
              {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()} active)`}
            </button>

            {showFilters && (
              <div style={{ 
                marginBottom: "20px", 
                padding: "16px", 
                background: "rgba(255,255,255,0.1)", 
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(5px)"
              }}>
                <div style={{ display: "grid", gap: "10px" }}>
                  <input style={inp} placeholder="🔍 Name" value={filters.name} onChange={(e) => updateFilter("name", e.target.value)} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <select style={{ ...inp, flex: 1, marginBottom: 0 }} value={filters.gender} onChange={(e) => updateFilter("gender", e.target.value)}>
                      <option value="">All Genders</option>
                      <option value="Male">👨 Male</option>
                      <option value="Female">👩 Female</option>
                      <option value="Other">👤 Other</option>
                    </select>
                    <input style={{ ...inp, flex: 1, marginBottom: 0 }} placeholder="🎂 Age" type="number" value={filters.age} onChange={(e) => updateFilter("age", e.target.value)} />
                  </div>
                  <input style={inp} placeholder="💼 Profession" value={filters.profession} onChange={(e) => updateFilter("profession", e.target.value)} />
                  <input style={inp} placeholder="🛐 Religion" value={filters.religion} onChange={(e) => updateFilter("religion", e.target.value)} />
                  <input style={inp} placeholder="💰 Min Income (₹)" type="number" value={filters.income} onChange={(e) => updateFilter("income", e.target.value)} />
                  <input style={inp} placeholder="📍 Location" value={filters.location} onChange={(e) => updateFilter("location", e.target.value)} />
                  <select style={inp} value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
                    <option value="">All Status</option>
                    <option value="Single">💚 Single</option>
                    <option value="Divorced">💔 Divorced</option>
                    <option value="Widower">🕊️ Widower</option>
                  </select>
                  <input style={inp} placeholder="🎓 Qualification" value={filters.qualification} onChange={(e) => updateFilter("qualification", e.target.value)} />
                  <button onClick={clearAllFilters} style={{ padding: "10px", borderRadius: "10px", border: "1px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.2)", color: "#FCA5A5", fontWeight: "600", cursor: "pointer", marginTop: "4px" }}>
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}

            <h3 style={{ margin: "0 0 16px", textAlign: "center", color: "white", fontSize: "16px" }}>
              💑 {filteredMatches.length} Profiles
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {filteredMatches.map(match => {
                const isRequestSent = sentRequests.some(req => req.id === match.id);
                const isCurrentUser = match.id === getUserId();
                return (
                  <div key={match.id} style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "10px", 
                    padding: "16px", 
                    background: isCurrentUser ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.1)", 
                    borderRadius: "16px", 
                    border: isCurrentUser ? "1px solid rgba(236,72,153,0.5)" : "1px solid rgba(255,255,255,0.2)",
                    backdropFilter: "blur(5px)",
                    position: "relative"
                  }}>
                    {isCurrentUser && (
                      <div style={{ 
                        position: "absolute", 
                        top: "10px", 
                        right: "10px", 
                        background: "rgba(236,72,153,0.8)", 
                        padding: "2px 10px", 
                        borderRadius: "15px", 
                        fontSize: "10px", 
                        color: "white",
                        fontWeight: "bold"
                      }}>
                        You
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div onClick={() => viewProfile(match)} style={{ 
                        width: 50, 
                        height: 50, 
                        borderRadius: "50%", 
                        background: "rgba(255,255,255,0.2)", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontSize: "24px", 
                        cursor: "pointer",
                        border: "2px solid rgba(255,255,255,0.3)"
                      }}>
                        {match.gender === "Female" ? "👩" : "👨"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h4 onClick={() => viewProfile(match)} style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "white", cursor: "pointer" }}>
                            {match.name}
                          </h4>
                          <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "12px", background: relStatusStyle[match.status]?.bg || "rgba(255,255,255,0.1)", color: relStatusStyle[match.status]?.color || "white" }}>
                            {relStatusOptions.find(o => o.value === match.status)?.emoji} {match.status}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "11px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>
                          <span>{getProfessionIcon(match.profession)} {match.profession}</span>
                          <span>📍 {match.location?.split(",")[0]}</span>
                          <span>🎂 {match.age} yrs</span>
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "18px", fontWeight: "900", background: "linear-gradient(135deg, #10B981, #34D399)", color: "#fff", width: 45, height: 45, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {match.compatibility}%
                        </div>
                        <span style={{ fontSize: "9px", color: "#34D399", fontWeight: "700" }}>Match!</span>
                      </div>
                    </div>
                    {!isCurrentUser && (
                      <button onClick={() => sendRequest(match)} disabled={isRequestSent}
                        style={{ padding: "8px", borderRadius: "10px", border: "none", background: isRequestSent ? "rgba(203,213,225,0.5)" : "#EC4899", color: "#fff", fontWeight: "600", cursor: isRequestSent ? "not-allowed" : "pointer", fontSize: "12px", width: "100%" }}>
                        {isRequestSent ? "✓ Request Sent" : "💌 Send Request"}
                      </button>
                    )}
                    {isCurrentUser && (
                      <button onClick={() => setTab("profile")}
                        style={{ padding: "8px", borderRadius: "10px", border: "1px solid rgba(236,72,153,0.5)", background: "rgba(236,72,153,0.2)", color: "#EC4899", fontWeight: "600", cursor: "pointer", fontSize: "12px", width: "100%" }}>
                        ✏️ Edit Your Profile
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            
            {filteredMatches.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: "48px", margin: 0 }}>😔</p>
                <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "12px" }}>No profiles found</p>
                {getActiveFilterCount() > 0 && (
                  <button onClick={clearAllFilters} style={{ ...btn("#EC4899"), marginTop: "16px" }}>Clear All Filters</button>
                )}
              </div>
            )}
            
            {!relProfile ? (
              <button style={{ marginTop: "20px", padding: "12px", borderRadius: "16px", background: "rgba(255,255,255,0.1)", color: "white", border: "2px dashed rgba(255,255,255,0.3)", fontWeight: "700", fontSize: "14px", width: "100%", cursor: "pointer" }} onClick={() => setTab("profile")}>
                ➕ First create your profile
              </button>
            ) : (
              <button style={{ marginTop: "20px", padding: "12px", borderRadius: "16px", background: "#EC4899", color: "#fff", border: "none", fontWeight: "700", fontSize: "14px", width: "100%", cursor: "pointer", boxShadow: "0 4px 12px rgba(236,72,153,0.3)" }} onClick={() => setTab("profile")}>
                👤 Edit My Profile
              </button>
            )}
          </div>
        )}

        {tab === "sent" && (
          <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: "20px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
            <h3 style={{ margin: "0 0 20px", textAlign: "center", color: "white", fontSize: "18px", fontWeight: "800" }}>📤 Sent Requests</h3>
            {sentRequests.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: "48px", margin: 0 }}>📭</p>
                <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "12px" }}>No requests sent yet</p>
                <button onClick={() => setTab("matches")} style={{ ...btn("#EC4899"), marginTop: "16px" }}>Browse Matches</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {sentRequests.map(req => (
                  <div key={req.id} style={{ padding: "16px", background: "rgba(255,255,255,0.1)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                      <div onClick={() => viewProfile(req)} style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", cursor: "pointer" }}>
                        {req.gender === "Female" ? "👩" : "👨"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 onClick={() => viewProfile(req)} style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "white", cursor: "pointer" }}>
                          {req.sentTo}
                        </h4>
                        <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{req.profession} • {req.location}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>Sent {new Date(req.sentAt).toLocaleDateString()}</p>
                      </div>
                      <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", background: "rgba(251,191,36,0.3)", color: "#FBBF24" }}>Pending</span>
                    </div>
                    <button onClick={() => withdrawRequest(req)} style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.2)", color: "#FCA5A5", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                      ↩️ Withdraw Request
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "received" && (
          <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: "20px", padding: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
            
            {/* Toggle Buttons - Pending / Accepted List */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button 
                onClick={() => setShowAcceptedList(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: `2px solid ${!showAcceptedList ? "#10B981" : "rgba(255,255,255,0.3)"}`,
                  background: !showAcceptedList ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                📥 Pending ({receivedRequests.filter(r => r.status === "pending").length})
              </button>
              <button 
                onClick={() => setShowAcceptedList(true)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: `2px solid ${showAcceptedList ? "#EC4899" : "rgba(255,255,255,0.3)"}`,
                  background: showAcceptedList ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.1)",
                  color: "white",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                ✅ Accepted ({acceptedRequests.length})
              </button>
            </div>

            {!showAcceptedList ? (
              // Pending Requests View
              <>
                <h3 style={{ margin: "0 0 20px", textAlign: "center", color: "white", fontSize: "18px", fontWeight: "800" }}>📥 Pending Requests</h3>
                {receivedRequests.filter(r => r.status === "pending").length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ fontSize: "48px", margin: 0 }}>📪</p>
                    <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "12px" }}>No pending requests</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {receivedRequests.filter(r => r.status === "pending").map(req => (
                      <div key={req.requestId} style={{ padding: "16px", background: "rgba(255,255,255,0.1)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                          <div onClick={() => viewProfile(req)} style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", cursor: "pointer" }}>
                            {req.gender === "Female" ? "👩" : "👨"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 onClick={() => viewProfile(req)} style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "white", cursor: "pointer" }}>
                              {req.senderName}
                            </h4>
                            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{req.profession} • {req.location}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button onClick={() => acceptRequest(req)} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "none", background: "#10B981", color: "#fff", fontWeight: "600", cursor: "pointer" }}>
                            ✅ Accept
                          </button>
                          <button onClick={() => rejectRequest(req)} style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.5)", background: "rgba(239,68,68,0.2)", color: "#FCA5A5", fontWeight: "600", cursor: "pointer" }}>
                            ❌ Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Accepted List View - Clickable Profiles
              <>
                <h3 style={{ margin: "0 0 20px", textAlign: "center", color: "white", fontSize: "18px", fontWeight: "800" }}>✅ Accepted Connections</h3>
                {acceptedRequests.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px" }}>
                    <p style={{ fontSize: "48px", margin: 0 }}>💔</p>
                    <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "12px" }}>No accepted connections yet</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {acceptedRequests.map(acc => (
                      <div 
                        key={acc.id} 
                        onClick={() => {
                          if (acc.fullProfile) {
                            setSelectedProfile({
                              name: acc.name,
                              age: acc.fullProfile.age,
                              gender: acc.gender,
                              status: acc.fullProfile.status,
                              profession: acc.profession,
                              location: acc.location,
                              religion: acc.fullProfile.religion,
                              monthlyIncome: acc.fullProfile.monthlyIncome,
                              qualification: acc.fullProfile.qualification,
                              bio: acc.fullProfile.description,
                              fatherName: acc.fullProfile.fatherName,
                              contact: acc.fullProfile.contact,
                              employmentStatus: acc.fullProfile.employmentStatus,
                              pic: acc.fullProfile.profilePic,
                              compatibility: Math.floor(Math.random() * 30) + 70
                            });
                            setShowProfileModal(true);
                          }
                        }}
                        style={{ 
                          padding: "16px", 
                          background: "rgba(16,185,129,0.15)", 
                          borderRadius: "16px", 
                          border: "1px solid rgba(16,185,129,0.5)",
                          cursor: "pointer",
                          transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                            {acc.gender === "Female" ? "👩" : "👨"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "white" }}>{acc.name}</h4>
                            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>{getProfessionIcon(acc.profession)} {acc.profession} • 📍 {acc.location?.split(",")[0]}</p>
                            <p style={{ margin: "2px 0 0", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>Accepted on {new Date(acc.acceptedAt).toLocaleDateString()}</p>
                          </div>
                          <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", background: "rgba(16,185,129,0.3)", color: "#34D399" }}>Connected 💚</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Relationship;