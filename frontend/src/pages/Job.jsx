import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bgImage from "../photo/bg_image.jpg";
import { supabase } from "../config/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

const fmt = (n) => (n ? `₹${Number(n).toLocaleString("en-IN")}` : "");

const jobTypeColor = {
  fulltime: { bg: "#E6F1FB", color: "#185FA5", border: "#C3DEFF" },
  parttime: { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
};

const FILTER_TABS = [
  { key: "all", label: "🔁 All" },
  { key: "fulltime", label: "⏰ Full Time" },
  { key: "parttime", label: "🕐 Part Time" },
];

const skillPalette = [
  { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
  { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  { bg: "#FDF2F8", color: "#9D174D", border: "#F9A8D4" },
  { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7" },
  { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  { bg: "#FEF9C3", color: "#854D0E", border: "#FDE047" },
  { bg: "#FFF1F2", color: "#9F1239", border: "#FECDD3" },
];

const ALL_SKILL_KEYWORDS = [
  "React", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
  "UI/UX", "Figma", "Excel", "Marketing", "Sales", "Design",
  "Communication", "Leadership", "MS Office", "PHP", "Flutter", "SQL",
  "MongoDB", "Firebase", "MySQL", "Django", "Spring Boot", "Dart",
  "CSS", "HTML", "Redux", "Express", "Git", "Docker", "AWS"
];

const EXPERIENCE_LEVELS = [
  "Fresher OK", "0-1 Years", "1-3 Years", "3-5 Years", "5+ Years"
];

const getRequirements = (job, roleType = "main") => {
  const prefix = roleType === "newRole" ? "newRole" : "mainRole";
  const skillsKey = `${prefix}Skills`;
  const expKey = `${prefix}Experience`;
  let skills = job.skills || job[skillsKey] || parseSkills(job.description || job.newRoleDescription || "");
  let experience = job.experience || job[expKey] || "Fresher OK";
  if (job.companyName) {
    skills = job[skillsKey] || parseSkills((roleType === "newRole" ? job.newRoleDescription : job.description) || "");
    experience = job[expKey] || EXPERIENCE_LEVELS[0];
  }
  return { requiredSkills: Array.isArray(skills) ? skills : [], experienceLevel: experience };
};

const inp = {
  width: "100%", padding: "11px", borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.3)", fontSize: "14px", boxSizing: "border-box",
  marginBottom: "12px", outline: "none", background: "rgba(255,255,255,0.95)",
  transition: "all 0.3s ease"
};

const btn = (bg, color = "#fff") => ({
  padding: "12px 20px", borderRadius: "10px", border: "none",
  background: bg, color, fontWeight: "700", cursor: "pointer", fontSize: "14px",
  transition: "all 0.3s ease"
});

const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
  backdropFilter: "blur(8px)"
};

const modalStyle = {
  background: "rgba(255,255,255,0.15)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "24px",
  padding: "28px",
  width: "90%",
  maxWidth: "400px",
  maxHeight: "85vh",
  overflowY: "auto",
  border: "1px solid rgba(255,255,255,0.3)",
  boxShadow: "0 25px 45px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.2) inset"
};

const getRelativeTime = (postedAt) => {
  if (!postedAt) return "Recently";
  const now = new Date();
  const posted = new Date(postedAt);
  const diffMs = now - posted;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
};

const parseSkills = (text = "") =>
  ALL_SKILL_KEYWORDS.filter(sk => text.toLowerCase().includes(sk.toLowerCase()));

const PicUpload = ({ pic, id, emoji = "📷", onChange, borderColor = "#185FA5" }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
    <label htmlFor={id} style={{ cursor: "pointer" }}>
      {pic
        ? <img src={pic} alt="p" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: `3px solid ${borderColor}` }} />
        : <div style={{ width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", border: `2px dashed ${borderColor}` }}>{emoji}</div>
      }
    </label>
    <input id={id} type="file" accept="image/*" onChange={onChange} style={{ display: "none" }} />
    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginTop: "6px" }}>Photo tap karke lagao</span>
  </div>
);

const FilterTabs = ({ active, onChange, counts }) => (
  <div style={{ display: "flex", gap: "8px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: "14px", padding: "6px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.2)" }}>
    {FILTER_TABS.map(f => {
      const isActive = active === f.key;
      const bg = isActive ? f.key === "parttime" ? "#15803D" : f.key === "fulltime" ? "#185FA5" : "#1a1a1a" : "transparent";
      return (
        <button key={f.key} onClick={() => onChange(f.key)} style={{ flex: 1, padding: "11px 4px", border: "none", borderRadius: "10px", background: bg, color: isActive ? "#fff" : "rgba(255,255,255,0.8)", fontWeight: "700", cursor: "pointer", fontSize: "12px", transition: "all 0.2s" }}>
          <div>{f.label}</div>
          <div style={{ fontSize: "13px", fontWeight: "800", marginTop: "2px", color: isActive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)" }}>{counts[f.key] ?? 0}</div>
        </button>
      );
    })}
  </div>
);

const getUserId = () => {
  let id = localStorage.getItem("userId");
  if (!id) {
    id = `user_${Date.now()}`;
    localStorage.setItem("userId", id);
  }
  return id;
};

const checkApplied = async (jobId, roleType) => {
  const userId = getUserId();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("job_id", jobId)
    .eq("user_id", userId)
    .eq("role_type", roleType);
  
  if (error) return false;
  return data && data.length > 0;
};

const saveApplicantCount = async (jobId, roleType) => {
  console.log("Application saved for job:", jobId, roleType);
};

const UnifiedJobCard = ({ job, type = "regular", onApply, extraApplicants, currentUserId, onEdit, onDelete }) => {
  const jt = jobTypeColor[job.jobType] || jobTypeColor.fulltime;
  const isLogoImage = job.logo && job.logo.startsWith("data:");
  const totalApplicants = (job.applicants || 0) + (extraApplicants || 0);
  const postedTime = job.postedAt ? getRelativeTime(job.postedAt) : (job.posted || "Recently");
  const hasMainRole = type === "hiring" && job.role;
  const hasNewRole = type === "hiring" && job.newRole;
  const [mainApplied, setMainApplied] = useState(false);
  const [newApplied, setNewApplied] = useState(false);
  const mainCount = extraApplicants?.mainRole || 0;
  const newCount = extraApplicants?.newRole || 0;
  const isOwner = currentUserId && job.user_id === currentUserId;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const mainSkills = job.mainRoleSkills || job.skills || [];
  const newSkills = job.newRoleSkills || [];

  useEffect(() => {
    const checkStatus = async () => {
      if (type === "hiring") {
        const mainAppliedStatus = await checkApplied(job.id, "mainRole");
        const newAppliedStatus = await checkApplied(job.id, "newRole");
        setMainApplied(mainAppliedStatus);
        setNewApplied(newAppliedStatus);
      }
    };
    checkStatus();
  }, [job.id, type]);

  const handleDelete = () => {
    if (onDelete) onDelete(job.id);
    setConfirmDelete(false);
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", borderRadius: "18px", padding: "18px", boxShadow: "0 4px 18px rgba(0,0,0,0.1)", marginBottom: "14px", border: job.isNew ? "2px solid #7FFF00" : "1px solid rgba(255,255,255,0.2)", position: "relative", transition: "all 0.3s ease" }}>
      {job.isNew && (
        <div style={{ position: "absolute", top: "-10px", left: "16px", background: "#3B6D11", color: "#fff", fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "20px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#7FFF00", display: "inline-block" }}></span>
          New
        </div>
      )}
      
      {isOwner && type === "hiring" && !confirmDelete && (
        <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px", zIndex: 5 }}>
          <button onClick={() => onEdit && onEdit(job)} style={{ padding: "5px 10px", borderRadius: "8px", background: "rgba(238,242,255,0.9)", color: "#4338CA", fontWeight: "700", fontSize: "12px", cursor: "pointer", border: "none", transition: "all 0.2s" }}>
            ✏️ Edit
          </button>
          <button onClick={() => setConfirmDelete(true)} style={{ padding: "5px 10px", borderRadius: "8px", background: "rgba(255,241,242,0.9)", color: "#E24B4A", fontWeight: "700", fontSize: "12px", cursor: "pointer", border: "none", transition: "all 0.2s" }}>
            🗑️ Delete
          </button>
        </div>
      )}
      
      {confirmDelete && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, padding: "20px" }}>
          <p style={{ margin: "0 0 16px", fontSize: "14px", color: "white", fontWeight: "700", textAlign: "center" }}>⚠️ Delete this job post?</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setConfirmDelete(false)} style={{ ...btn("rgba(255,255,255,0.2)", "white"), padding: "8px 20px", fontSize: "13px", border: "1px solid rgba(255,255,255,0.3)" }}>Cancel</button>
            <button onClick={handleDelete} style={{ ...btn("#E24B4A"), padding: "8px 20px", fontSize: "13px" }}>Delete</button>
          </div>
        </div>
      )}
      
      {isOwner && type === "hiring" && !confirmDelete && (
        <div style={{ position: "absolute", top: "10px", left: "10px", background: "rgba(236,72,153,0.8)", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", color: "white", fontWeight: "bold", zIndex: 5 }}>
          Your Post
        </div>
      )}
      
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
        <div style={{ width: 50, height: 50, borderRadius: "13px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0, border: "1px solid rgba(255,255,255,0.3)", overflow: "hidden" }}>
          {type === "hiring" && job.companyLogo ?
            <img src={job.companyLogo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
            (isLogoImage ? <img src={job.logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (job.logo || "🏢"))
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: "0 0 3px", fontSize: "15px", fontWeight: "800", color: "white" }}>
            {type === "hiring" ? job.companyName : job.title}
          </h3>
          <p style={{ margin: "0 0 5px", fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>
            🏢 {type === "hiring" ? job.companyName : job.company}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>📍 {job.location}</span>
            {type !== "hiring" && <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>⭐ {job.experience}</span>}
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "7px", marginTop: "12px", flexWrap: "wrap" }}>
        <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: jt.bg, color: jt.color, border: `1px solid ${jt.border}` }}>
          {job.jobType === "fulltime" ? "⏰ Full Time" : "🕐 Part Time"}
        </span>
        {(job.salaryMin > 0 || job.salaryMax > 0) && (
          <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", background: "rgba(254,249,195,0.3)", color: "#FDE047", border: "1px solid rgba(253,224,71,0.5)" }}>
            💰 {fmt(job.salaryMin)} – {fmt(job.salaryMax)}
          </span>
        )}
        <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
          🕒 {postedTime}
        </span>
      </div>

      {type === "hiring" ? (
        <>
          {hasMainRole && (
            <div style={{ background: "rgba(238,242,255,0.2)", backdropFilter: "blur(5px)", borderRadius: "14px", padding: "14px", marginTop: "14px", border: "1px solid rgba(199,210,254,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <p style={{ margin: "0 0 1px", fontSize: "10px", color: "#A5B4FC", fontWeight: "800", letterSpacing: "0.5px" }}>💼 MAIN ROLE</p>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#C7D2FE" }}>{job.role}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {job.noOfEmployee > 0 && <p style={{ margin: "0 0 1px", fontSize: "11px", color: "#A5B4FC", fontWeight: "700" }}>👥 {job.noOfEmployee} needed</p>}
                </div>
              </div>
              {job.description && <p style={{ margin: "0 0 8px", fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{job.description}</p>}
              {mainSkills.length > 0 && (
                <div style={{ marginTop: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <p style={{ margin: "0 0 7px", fontSize: "11px", color: "#A5B4FC", fontWeight: "700" }}>🛠️ REQUIRED SKILLS</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {mainSkills.map((sk, i) => {
                      const pal = skillPalette[i % skillPalette.length];
                      return <span key={sk} style={{ padding: "4px 11px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", background: pal.bg, color: pal.color, border: `1px solid ${pal.border}` }}>{sk}</span>;
                    })}
                  </div>
                </div>
              )}
              {!isOwner && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#A5B4FC", fontWeight: "600" }}>👥 {mainCount} applied</span>
                  <button onClick={() => onApply(job, "mainRole")} disabled={mainApplied}
                    style={{ padding: "8px 18px", borderRadius: "10px", border: "none", background: mainApplied ? "rgba(199,210,254,0.5)" : "#4338CA", color: mainApplied ? "#6366F1" : "#fff", fontWeight: "700", fontSize: "12px", cursor: mainApplied ? "default" : "pointer", transition: "all 0.2s" }}>
                    {mainApplied ? "✓ Applied" : "Apply →"}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {hasNewRole && (
            <div style={{ background: "rgba(255,247,237,0.2)", backdropFilter: "blur(5px)", borderRadius: "14px", padding: "14px", marginTop: "10px", border: "1px solid rgba(254,215,170,0.5)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <p style={{ margin: "0 0 1px", fontSize: "10px", color: "#FBBF24", fontWeight: "800", letterSpacing: "0.5px" }}>🆕 NEW ROLE</p>
                  <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#FED7AA" }}>{job.newRole}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {job.noOfNewEmployee > 0 && <p style={{ margin: "0 0 1px", fontSize: "11px", color: "#FBBF24", fontWeight: "700" }}>👥 {job.noOfNewEmployee} needed</p>}
                  {(job.newRoleSalaryMin > 0 || job.newRoleSalaryMax > 0) && (
                    <p style={{ margin: 0, fontSize: "11px", color: "#FBBF24", fontWeight: "700" }}>💰 {fmt(job.newRoleSalaryMin)} – {fmt(job.newRoleSalaryMax)}</p>
                  )}
                </div>
              </div>
              {job.newRoleDescription && <p style={{ margin: "0 0 8px", fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{job.newRoleDescription}</p>}
              {newSkills.length > 0 && (
                <div style={{ marginTop: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <p style={{ margin: "0 0 7px", fontSize: "11px", color: "#FBBF24", fontWeight: "700" }}>🛠️ REQUIRED SKILLS</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {newSkills.map((sk, i) => {
                      const pal = skillPalette[i % skillPalette.length];
                      return <span key={sk} style={{ padding: "4px 11px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", background: pal.bg, color: pal.color, border: `1px solid ${pal.border}` }}>{sk}</span>;
                    })}
                  </div>
                </div>
              )}
              {!isOwner && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#FBBF24", fontWeight: "600" }}>👥 {newCount} applied</span>
                  <button onClick={() => onApply(job, "newRole")} disabled={newApplied}
                    style={{ padding: "8px 18px", borderRadius: "10px", border: "none", background: newApplied ? "rgba(254,215,170,0.5)" : "#C2410C", color: newApplied ? "#C2410C" : "#fff", fontWeight: "700", fontSize: "12px", cursor: newApplied ? "default" : "pointer", transition: "all 0.2s" }}>
                    {newApplied ? "✓ Applied" : "Apply →"}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {job.contact && !isOwner && (
            <a href={`tel:${job.contact}`} style={{ textDecoration: "none", display: "block", marginTop: "12px" }}>
              <button style={{ width: "100%", padding: "11px", borderRadius: "12px", border: "none", background: "#3B6D11", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}>
                📞 Contact Employer
              </button>
            </a>
          )}
        </>
      ) : (
        <>
          {job.description && <p style={{ margin: "10px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{job.description}</p>}
          {job.skills && job.skills.length > 0 && (
            <div style={{ marginTop: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ margin: "0 0 7px", fontSize: "11px", color: "#A5B4FC", fontWeight: "700" }}>🛠️ REQUIRED SKILLS</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {job.skills.map((sk, i) => {
                  const pal = skillPalette[i % skillPalette.length];
                  return <span key={sk} style={{ padding: "4px 11px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", background: pal.bg, color: pal.color, border: `1px solid ${pal.border}` }}>{sk}</span>;
                })}
              </div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>👥 {totalApplicants} applicants</span>
            <button onClick={() => onApply(job, "mainRole")} style={{ padding: "9px 22px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #185FA5, #1e40af)", color: "#fff", fontWeight: "700", fontSize: "13px", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)", transition: "all 0.2s" }}>
              Apply Now →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ApplyModal = ({ job, onClose, onApplied }) => {
  const userAccount = JSON.parse(localStorage.getItem("userAccount") || "null");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const skills = job.skills || job.mainRoleSkills || [];

  useEffect(() => {
    const checkStatus = async () => {
      const userId = getUserId();
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", job.id)
        .eq("user_id", userId)
        .eq("role_type", "mainRole");
      
      setAlreadyApplied(data && data.length > 0);
    };
    checkStatus();
  }, [job.id]);

  const handleApply = async () => {
    if (!userAccount || alreadyApplied || isSubmitting) return;
    
    setIsSubmitting(true);
    const userId = getUserId();
    
    const applicationData = {
      job_id: job.id,
      user_id: userId,
      role_type: "mainRole",
      job_title: job.title || job.role,
      company: job.company || job.companyName,
      company_name: job.company || job.companyName,
      location: job.location,
      applied_at: new Date().toISOString(),
      applicant_name: userAccount.fullName,
      applicant_contact: userAccount.contact,
      applicant_profession: userAccount.profession,
      applicant_skills: userAccount.skills || [],
      status: "pending",
      posted_by_hr: job.user_id || null,
      role_name: job.role
    };
    
    const { error } = await supabase
      .from("applications")
      .insert(applicationData);
    
    setIsSubmitting(false);
    
    if (error) {
      console.error("Error applying:", error);
      toast.error("Failed to apply: " + error.message);
    } else {
      toast.success("Application sent successfully!");
      saveApplicantCount(job.id, "mainRole");
      onApplied && onApplied();
      setSent(true);
    }
  };

  return (
    <div style={overlay}>
      <div style={modalStyle}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ margin: "0 0 8px", color: "white", fontSize: "20px", fontWeight: "800" }}>Application Sent!</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: "0 0 20px" }}>
              <strong>{job.company || job.companyName}</strong> ko teri application gayi.<br />Shortlist hue toh contact karenge!
            </p>
            <button onClick={onClose} style={{ padding: "12px 30px", borderRadius: "12px", border: "none", background: "#185FA5", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "14px", transition: "all 0.2s" }}>Done ✓</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "white" }}>Apply for Job</h3>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "16px", color: "white" }}>✕</button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "14px", padding: "14px", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <p style={{ margin: "0 0 3px", fontWeight: "800", fontSize: "15px", color: "white" }}>{job.title || job.role}</p>
              <p style={{ margin: "0 0 5px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>🏢 {job.company || job.companyName} • 📍 {job.location}</p>
              {(job.salaryMin > 0 || job.salaryMax > 0) && (
                <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#A5B4FC" }}>💰 {fmt(job.salaryMin)} – {fmt(job.salaryMax)}/mo</p>
              )}
            </div>
            {skills.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px 14px", marginBottom: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <p style={{ margin: "0 0 8px", fontSize: "11px", color: "#FDE047", fontWeight: "800" }}>🛠️ REQUIRED SKILLS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {skills.map((sk, i) => {
                    const pal = skillPalette[i % skillPalette.length];
                    return <span key={sk} style={{ padding: "4px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "700", background: pal.bg, color: pal.color, border: `1px solid ${pal.border}` }}>{sk}</span>;
                  })}
                </div>
              </div>
            )}
            {userAccount ? (
              <div style={{ background: "rgba(59,109,17,0.2)", borderRadius: "14px", padding: "14px", marginBottom: "16px", border: "1px solid rgba(59,109,17,0.3)" }}>
                <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#7FFF00", fontWeight: "700" }}>✅ Teri profile se apply hoga:</p>
                <p style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: "800", color: "white" }}>{userAccount.fullName}</p>
                <p style={{ margin: "0 0 2px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>💼 {userAccount.profession}</p>
                {userAccount.skills?.length > 0 && (
                  <p style={{ margin: "0 0 2px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>🛠️ {userAccount.skills.slice(0, 4).join(", ")}{userAccount.skills.length > 4 ? "..." : ""}</p>
                )}
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>📞 {userAccount.contact}</p>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#FCA5A5", fontWeight: "600" }}>⚠️ Pehle Account mein Job Profile banao — tab apply kar sakte ho.</p>
              </div>
            )}
            {alreadyApplied ? (
              <div style={{ background: "rgba(59,109,17,0.2)", borderRadius: "12px", padding: "12px", textAlign: "center", border: "1px solid rgba(59,109,17,0.3)" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#7FFF00", fontWeight: "700" }}>✅ Pehle se apply kar chuke ho!</p>
              </div>
            ) : (
              <button onClick={handleApply} disabled={!userAccount || isSubmitting} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: userAccount ? "#185FA5" : "#ccc", color: "#fff", fontWeight: "700", fontSize: "15px", cursor: userAccount ? "pointer" : "not-allowed", opacity: isSubmitting ? 0.7 : 1, transition: "all 0.2s" }}>
                {isSubmitting ? "⏳ Submitting..." : "🚀 Submit Application"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const HiringApplyModal = ({ job, roleType, onClose, onApplied }) => {
  const userAccount = JSON.parse(localStorage.getItem("userAccount") || "null");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const roleInfo = {
    mainRole: {
      name: job.role, desc: job.description,
      salary: job.salaryMin && job.salaryMax ? `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}` : "",
      color: "#4338CA", bg: "#EEF2FF", border: "#C7D2FE", label: "MAIN ROLE",
    },
    newRole: {
      name: job.newRole, desc: job.newRoleDescription,
      salary: job.newRoleSalaryMin && job.newRoleSalaryMax ? `${fmt(job.newRoleSalaryMin)} – ${fmt(job.newRoleSalaryMax)}` : "",
      color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA", label: "NEW ROLE",
    },
  };
  const ri = roleInfo[roleType];

  useEffect(() => {
    const checkStatus = async () => {
      const userId = getUserId();
      const { data } = await supabase
        .from("applications")
        .select("*")
        .eq("job_id", job.id)
        .eq("user_id", userId)
        .eq("role_type", roleType);
      
      setAlreadyApplied(data && data.length > 0);
    };
    checkStatus();
  }, [job.id, roleType]);

  const handleApply = async () => {
    if (!userAccount || alreadyApplied || isSubmitting) return;
    
    setIsSubmitting(true);
    const userId = getUserId();
    
    const applicationData = {
      job_id: job.id,
      user_id: userId,
      role_type: roleType,
      job_title: ri.name,
      company: job.companyName,
      company_name: job.companyName,
      location: job.location,
      applied_at: new Date().toISOString(),
      applicant_name: userAccount.fullName,
      applicant_contact: userAccount.contact,
      applicant_profession: userAccount.profession,
      applicant_skills: userAccount.skills || [],
      status: "pending",
      posted_by_hr: job.user_id || null,
      role_name: ri.name
    };
    
    const { error } = await supabase
      .from("applications")
      .insert(applicationData);
    
    setIsSubmitting(false);
    
    if (error) {
      console.error("Error applying:", error);
      toast.error("Failed to apply: " + error.message);
    } else {
      toast.success("Application sent successfully!");
      onApplied && onApplied();
      setSent(true);
    }
  };

  return (
    <div style={overlay}>
      <div style={modalStyle}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎉</div>
            <h3 style={{ margin: "0 0 8px", color: "white", fontSize: "20px", fontWeight: "800" }}>Application Sent!</h3>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", margin: "0 0 6px" }}><strong>{job.companyName}</strong> ko teri application gayi.</p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: "0 0 20px" }}>Role: <strong style={{ color: ri.color }}>{ri.name}</strong></p>
            <button onClick={onClose} style={{ padding: "12px 30px", borderRadius: "12px", border: "none", background: "#3B6D11", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "14px", transition: "all 0.2s" }}>Done ✓</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: "800", color: "white" }}>Apply at {job.companyName}</h3>
                <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>📍 {job.location}</p>
              </div>
              <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "16px", color: "white" }}>✕</button>
            </div>
            <div style={{ background: ri.bg, borderRadius: "14px", padding: "14px", marginBottom: "12px", border: `1px solid ${ri.border}` }}>
              <p style={{ margin: "0 0 2px", fontSize: "10px", color: ri.color, fontWeight: "800" }}>{ri.label}</p>
              <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "800", color: ri.color }}>{ri.name}</p>
              {ri.salary && <p style={{ margin: "0 0 8px", fontSize: "12px", color: ri.color, fontWeight: "700" }}>💰 {ri.salary}/mo</p>}
              {ri.desc && (
                <div style={{ borderTop: `1px solid ${ri.border}`, paddingTop: "8px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "10px", color: ri.color, fontWeight: "700" }}>📝 JOB DESCRIPTION</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>{ri.desc}</p>
                </div>
              )}
            </div>
            {userAccount ? (
              <div style={{ background: "rgba(59,109,17,0.2)", borderRadius: "14px", padding: "14px", marginBottom: "16px", border: "1px solid rgba(59,109,17,0.3)" }}>
                <p style={{ margin: "0 0 7px", fontSize: "12px", color: "#7FFF00", fontWeight: "700" }}>✅ Teri profile se apply hoga:</p>
                <p style={{ margin: "0 0 3px", fontSize: "14px", fontWeight: "800", color: "white" }}>{userAccount.fullName}</p>
                <p style={{ margin: "0 0 2px", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>💼 {userAccount.profession}</p>
                {userAccount.skills?.length > 0 && <p style={{ margin: "0 0 2px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>🛠️ {userAccount.skills.slice(0, 4).join(", ")}{userAccount.skills.length > 4 ? "..." : ""}</p>}
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>📞 {userAccount.contact}</p>
              </div>
            ) : (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "12px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#FCA5A5", fontWeight: "600" }}>⚠️ Pehle Account mein Job Profile banao — tab apply kar sakte ho.</p>
              </div>
            )}
            {alreadyApplied ? (
              <div style={{ background: "rgba(59,109,17,0.2)", borderRadius: "12px", padding: "12px", textAlign: "center", border: "1px solid rgba(59,109,17,0.3)" }}>
                <p style={{ margin: 0, fontSize: "14px", color: "#7FFF00", fontWeight: "700" }}>✅ Is role ke liye pehle se apply kar chuke ho!</p>
              </div>
            ) : (
              <button onClick={handleApply} disabled={!userAccount || isSubmitting}
                style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: userAccount ? "#3B6D11" : "#ccc", color: "#fff", fontWeight: "700", fontSize: "15px", cursor: userAccount ? "pointer" : "not-allowed", opacity: isSubmitting ? 0.7 : 1, transition: "all 0.2s" }}>
                {isSubmitting ? "⏳ Submitting..." : "🚀 Submit Application"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const InlineHiringModal = ({ onClose, onPost, initialData = null }) => {
  const [companyLogo, setCompanyLogo] = useState(initialData?.companyLogo || null);
  const [hireForm, setHireForm] = useState({
    companyName: initialData?.companyName || "",
    jobType: initialData?.jobType || "fulltime",
    location: initialData?.location || "",
    contact: initialData?.contact || "",
    salaryMin: initialData?.salaryMin || "",
    salaryMax: initialData?.salaryMax || "",
    role: initialData?.role || "",
    noOfEmployee: initialData?.noOfEmployee || "",
    description: initialData?.description || "",
    mainRoleSkills: initialData?.mainRoleSkills || [],
    mainRoleExperience: initialData?.mainRoleExperience || "",
    newRoleSalaryMin: initialData?.newRoleSalaryMin || "",
    newRoleSalaryMax: initialData?.newRoleSalaryMax || "",
    newRole: initialData?.newRole || "",
    noOfNewEmployee: initialData?.noOfNewEmployee || "",
    newRoleDescription: initialData?.newRoleDescription || "",
    newRoleSkills: initialData?.newRoleSkills || [],
    newRoleExperience: initialData?.newRoleExperience || "",
  });
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState({ show: false, message: "", type: "" });
  const [showNewRole, setShowNewRole] = useState(!!initialData?.newRole);
  const [newSkill, setNewSkill] = useState("");
  const [newRoleNewSkill, setNewRoleNewSkill] = useState("");

  const showToastMessage = (message, type = "success") => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: "", type: "" }), 3000);
  };

  const picToBase64 = (file, cb) => { const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(file); };

  const addMainSkill = () => {
    if (newSkill.trim() && !hireForm.mainRoleSkills.includes(newSkill.trim())) {
      setHireForm(prev => ({
        ...prev,
        mainRoleSkills: [...prev.mainRoleSkills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeMainSkill = (skill) => {
    setHireForm(prev => ({
      ...prev,
      mainRoleSkills: prev.mainRoleSkills.filter(s => s !== skill)
    }));
  };

  const addNewRoleSkill = () => {
    if (newRoleNewSkill.trim() && !hireForm.newRoleSkills.includes(newRoleNewSkill.trim())) {
      setHireForm(prev => ({
        ...prev,
        newRoleSkills: [...prev.newRoleSkills, newRoleNewSkill.trim()]
      }));
      setNewRoleNewSkill("");
    }
  };

  const removeNewRoleSkill = (skill) => {
    setHireForm(prev => ({
      ...prev,
      newRoleSkills: prev.newRoleSkills.filter(s => s !== skill)
    }));
  };

  useEffect(() => {
    const mainSkills = parseSkills(hireForm.description);
    const newSkills = parseSkills(hireForm.newRoleDescription);
    if (mainSkills.length > 0) {
      setHireForm(prev => ({
        ...prev,
        mainRoleSkills: [...new Set([...prev.mainRoleSkills, ...mainSkills])]
      }));
    }
    if (newSkills.length > 0) {
      setHireForm(prev => ({
        ...prev,
        newRoleSkills: [...new Set([...prev.newRoleSkills, ...newSkills])]
      }));
    }
  }, [hireForm.description, hireForm.newRoleDescription]);

  const getLocation = async (pos) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
      const data = await res.json();
      return data.address.city || data.address.town || data.address.village || data.display_name;
    } catch { return `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`; }
  };

  const autoLocation = () => {
    if (navigator.geolocation) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = await getLocation(pos);
        setHireForm(f => ({ ...f, location: loc }));
        setDetectingLocation(false);
      }, () => setDetectingLocation(false));
    }
  };

  const totalEmployees = (parseInt(hireForm.noOfEmployee) || 0) + (parseInt(hireForm.noOfNewEmployee) || 0);

  const handlePost = async () => {
    if (isSubmitting) return;
    
    if (!hireForm.companyName || !hireForm.role || !hireForm.location) {
      showToastMessage("Company name, role aur location bharo!", "error");
      return;
    }

    setIsSubmitting(true);

    const userId = getUserId();
    const userAccount = JSON.parse(localStorage.getItem("userAccount") || "null");
    const isAdmin = userAccount?.isAdmin === true;

    const postId = initialData?.id || Date.now();
    const postData = {
      id: postId,
      user_id: userId,
      company_name: hireForm.companyName,
      company_logo: companyLogo,
      job_type: hireForm.jobType,
      location: hireForm.location,
      contact: hireForm.contact,
      salary_min: Number(hireForm.salaryMin) || 0,
      salary_max: Number(hireForm.salaryMax) || 0,
      role: hireForm.role,
      no_of_employee: parseInt(hireForm.noOfEmployee) || 0,
      description: hireForm.description,
      main_role_skills: hireForm.mainRoleSkills,
      main_role_experience: hireForm.mainRoleExperience,
      new_role: hireForm.newRole,
      no_of_new_employee: parseInt(hireForm.noOfNewEmployee) || 0,
      new_role_description: hireForm.newRoleDescription,
      new_role_skills: hireForm.newRoleSkills,
      new_role_experience: hireForm.newRoleExperience,
      new_role_salary_min: Number(hireForm.newRoleSalaryMin) || 0,
      new_role_salary_max: Number(hireForm.newRoleSalaryMax) || 0,
      posted_by_hr: isAdmin ? userId : null,
      created_at: new Date().toISOString(),
      is_new: true
    };

    try {
      const { error } = await supabase
        .from("hiring_posts")
        .upsert(postData, { onConflict: "id" });

      if (error) {
        console.error("Error saving to Supabase:", error);
        showToastMessage("Failed to save hiring post: " + error.message, "error");
        setIsSubmitting(false);
        return;
      }

      showToastMessage(initialData ? "Post updated successfully!" : "Hiring post created successfully!", "success");
      
      if (onPost) {
        await onPost(postData);
      }
      
      setTimeout(() => {
        setIsSubmitting(false);
        if (onClose) onClose();
      }, 1500);
      
    } catch (err) {
      console.error("Error:", err);
      showToastMessage("Something went wrong!", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modalStyle}>
        {showToast.show && (
          <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 2000 }}>
            <div style={{ padding: "12px 24px", borderRadius: "12px", background: showToast.type === "success" ? "#10B981" : showToast.type === "error" ? "#EF4444" : "#3B82F6", color: "white", fontWeight: "600", fontSize: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", backdropFilter: "blur(10px)" }}>
              {showToast.message}
            </div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, color: "white", fontSize: "20px", fontWeight: "800" }}>{initialData ? "✏️ Edit Post" : "🏢 Post a Hiring"}</h3>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "16px", color: "white" }}>✕</button>
        </div>
        
        <PicUpload pic={companyLogo} id="cLogoJob" emoji="🏢" onChange={e => picToBase64(e.target.files[0], setCompanyLogo)} borderColor="#3B6D11" />
        
        <input style={inp} placeholder="Company Name *" value={hireForm.companyName} onChange={e => setHireForm(f => ({ ...f, companyName: e.target.value }))} />
        
        <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "6px", display: "block", fontWeight: "600" }}>Job Type</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {["fulltime", "parttime"].map(t => (
            <button key={t} type="button" onClick={() => setHireForm(f => ({ ...f, jobType: t }))}
              style={{ flex: 1, padding: "10px", borderRadius: "10px", border: `2px solid ${hireForm.jobType === t ? "#185FA5" : "rgba(255,255,255,0.3)"}`, background: hireForm.jobType === t ? "#E6F1FB" : "rgba(255,255,255,0.1)", fontWeight: "600", cursor: "pointer", fontSize: "13px", color: hireForm.jobType === t ? "#185FA5" : "white", transition: "all 0.2s" }}>
              {t === "fulltime" ? "⏰ Full Time" : "🕐 Part Time"}
            </button>
          ))}
        </div>
        
        <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "6px", display: "block", fontWeight: "600" }}>Location *</label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="Enter or auto-detect" value={hireForm.location} onChange={e => setHireForm(f => ({ ...f, location: e.target.value }))} />
          <button type="button" onClick={autoLocation} disabled={detectingLocation}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "none", background: detectingLocation ? "#94c4a8" : "#3B6D11", color: "#fff", cursor: detectingLocation ? "not-allowed" : "pointer", fontSize: "18px", minWidth: "46px", transition: "all 0.2s" }}>
            {detectingLocation ? "⏳" : "📍"}
          </button>
        </div>
        
        <input style={inp} placeholder="Contact No." type="tel" value={hireForm.contact} onChange={e => setHireForm(f => ({ ...f, contact: e.target.value }))} />

        {/* MAIN ROLE Section */}
        <div style={{ background: "rgba(238,242,255,0.2)", borderRadius: "12px", padding: "14px", marginBottom: "12px", border: "1px solid rgba(199,210,254,0.5)" }}>
          <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "800", color: "#C7D2FE" }}>💼 MAIN ROLE</p>
          <input style={inp} placeholder="Role * (e.g. React Developer)" value={hireForm.role} onChange={e => setHireForm(f => ({ ...f, role: e.target.value }))} />
          <input style={inp} placeholder="No. of Employees" type="number" value={hireForm.noOfEmployee} onChange={e => setHireForm(f => ({ ...f, noOfEmployee: e.target.value }))} />
          
          <label style={{ fontSize: "12px", color: "#C7D2FE", marginBottom: "6px", display: "block", fontWeight: "600" }}>Salary Range</label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <input style={{ ...inp, marginBottom: 0 }} type="number" placeholder="Min ₹" value={hireForm.salaryMin} onChange={e => setHireForm(f => ({ ...f, salaryMin: e.target.value }))} />
            <span style={{ alignSelf: "center", color: "rgba(255,255,255,0.6)" }}>—</span>
            <input style={{ ...inp, marginBottom: 0 }} type="number" placeholder="Max ₹" value={hireForm.salaryMax} onChange={e => setHireForm(f => ({ ...f, salaryMax: e.target.value }))} />
          </div>
          
          <label style={{ fontSize: "12px", color: "#C7D2FE", marginBottom: "6px", display: "block", fontWeight: "600" }}>📝 Description</label>
          <textarea style={{ ...inp, height: "80px", resize: "vertical", fontFamily: "inherit", marginBottom: "6px" }}
            placeholder="Role description likho..." value={hireForm.description} onChange={e => setHireForm(f => ({ ...f, description: e.target.value }))} />
          
          <label style={{ fontSize: "12px", color: "#C7D2FE", marginBottom: "6px", display: "block", fontWeight: "600" }}>⭐ Experience Level</label>
          <select style={inp} value={hireForm.mainRoleExperience} onChange={e => setHireForm(f => ({ ...f, mainRoleExperience: e.target.value }))}>
            <option value="">Select Experience</option>
            {EXPERIENCE_LEVELS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
          </select>
          
          <label style={{ fontSize: "12px", color: "#C7D2FE", marginBottom: "6px", display: "block", fontWeight: "600" }}>🛠️ Required Skills</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
            {hireForm.mainRoleSkills.map((skill, i) => (
              <span key={i} style={{ padding: "4px 10px", borderRadius: "12px", background: skillPalette[i % skillPalette.length].bg, color: skillPalette[i % skillPalette.length].color, fontSize: "11px", fontWeight: "700", border: `1px solid ${skillPalette[i % skillPalette.length].border}` }}>
                {skill} <button onClick={() => removeMainSkill(skill)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "5px", color: "inherit" }}>✕</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="Add skill" list="main-skills" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addMainSkill()} />
            <button type="button" onClick={addMainSkill} style={{ ...btn("#4338CA", "#fff"), padding: "10px 18px", fontSize: "14px" }}>+ Add</button>
          </div>
          <datalist id="main-skills">{ALL_SKILL_KEYWORDS.map(sk => <option key={sk} value={sk} />)}</datalist>
        </div>

        {/* NEW ROLE Toggle Button */}
        <button
          type="button"
          onClick={() => setShowNewRole(!showNewRole)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            borderRadius: "10px",
            border: `2px solid ${showNewRole ? "#C2410C" : "rgba(255,255,255,0.3)"}`,
            background: showNewRole ? "rgba(255,247,237,0.3)" : "rgba(255,255,255,0.1)",
            color: showNewRole ? "#FED7AA" : "white",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          {showNewRole ? "− Hide New Role" : "+ Add New Role (Optional)"}
        </button>

        {/* NEW ROLE Section (Optional) */}
        {showNewRole && (
          <div style={{ background: "rgba(255,247,237,0.2)", borderRadius: "12px", padding: "14px", marginBottom: "12px", border: "1px solid rgba(254,215,170,0.5)" }}>
            <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "800", color: "#FED7AA" }}>🆕 NEW ROLE</p>
            <input style={inp} placeholder="New Role (e.g. Helper, Assistant)" value={hireForm.newRole} onChange={e => setHireForm(f => ({ ...f, newRole: e.target.value }))} />
            <input style={inp} placeholder="No. of Employees" type="number" value={hireForm.noOfNewEmployee} onChange={e => setHireForm(f => ({ ...f, noOfNewEmployee: e.target.value }))} />
            
            <label style={{ fontSize: "12px", color: "#FED7AA", marginBottom: "6px", display: "block", fontWeight: "600" }}>Salary Range</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input style={{ ...inp, marginBottom: 0 }} type="number" placeholder="Min ₹" value={hireForm.newRoleSalaryMin} onChange={e => setHireForm(f => ({ ...f, newRoleSalaryMin: e.target.value }))} />
              <span style={{ alignSelf: "center", color: "rgba(255,255,255,0.6)" }}>—</span>
              <input style={{ ...inp, marginBottom: 0 }} type="number" placeholder="Max ₹" value={hireForm.newRoleSalaryMax} onChange={e => setHireForm(f => ({ ...f, newRoleSalaryMax: e.target.value }))} />
            </div>
            
            <label style={{ fontSize: "12px", color: "#FED7AA", marginBottom: "6px", display: "block", fontWeight: "600" }}>📝 Description</label>
            <textarea style={{ ...inp, height: "80px", resize: "vertical", fontFamily: "inherit", marginBottom: "6px" }}
              placeholder="New role description..." value={hireForm.newRoleDescription} onChange={e => setHireForm(f => ({ ...f, newRoleDescription: e.target.value }))} />
            
            <label style={{ fontSize: "12px", color: "#FED7AA", marginBottom: "6px", display: "block", fontWeight: "600" }}>⭐ Experience Level</label>
            <select style={inp} value={hireForm.newRoleExperience} onChange={e => setHireForm(f => ({ ...f, newRoleExperience: e.target.value }))}>
              <option value="">Select Experience</option>
              {EXPERIENCE_LEVELS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
            </select>
            
            <label style={{ fontSize: "12px", color: "#FED7AA", marginBottom: "6px", display: "block", fontWeight: "600" }}>🛠️ Required Skills</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
              {hireForm.newRoleSkills.map((skill, i) => (
                <span key={i} style={{ padding: "4px 10px", borderRadius: "12px", background: skillPalette[i % skillPalette.length].bg, color: skillPalette[i % skillPalette.length].color, fontSize: "11px", fontWeight: "700", border: `1px solid ${skillPalette[i % skillPalette.length].border}` }}>
                  {skill} <button onClick={() => removeNewRoleSkill(skill)} style={{ background: "none", border: "none", cursor: "pointer", marginLeft: "5px", color: "inherit" }}>✕</button>
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="Add skill" list="new-skills" value={newRoleNewSkill} onChange={e => setNewRoleNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addNewRoleSkill()} />
              <button type="button" onClick={addNewRoleSkill} style={{ ...btn("#C2410C", "#fff"), padding: "10px 18px", fontSize: "14px" }}>+ Add</button>
            </div>
            <datalist id="new-skills">{ALL_SKILL_KEYWORDS.map(sk => <option key={sk} value={sk} />)}</datalist>
          </div>
        )}

        {totalEmployees > 0 && (
          <div style={{ background: "rgba(59,109,17,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(59,109,17,0.3)" }}>
            <span style={{ fontSize: "14px", color: "#7FFF00", fontWeight: "700" }}>👥 Total Positions</span>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#7FFF00" }}>{totalEmployees}</span>
          </div>
        )}
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={onClose} style={{ ...btn("rgba(255,255,255,0.2)", "white"), flex: 1, border: "1px solid rgba(255,255,255,0.3)" }}>Cancel</button>
          <button type="button" onClick={handlePost} disabled={isSubmitting} style={{ ...btn("#3B6D11"), flex: 1, opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "⏳ Posting..." : initialData ? "Update ✓" : "Post Hiring ↗"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
export default function Job() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const [currentUserId, setCurrentUserId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchRole, setSearchRole] = useState(state.role || "");
  const [searchLocation, setSearchLocation] = useState(state.location || "");
  const [salaryMin, setSalaryMin] = useState(state.salaryMin || "");
  const [salaryMax, setSalaryMax] = useState(state.salaryMax || "");
  const [showFilters, setShowFilters] = useState(false);
  const [applyJob, setApplyJob] = useState(null);
  const [hiringApplyData, setHiringApplyData] = useState(null);
  const [hiringPosts, setHiringPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMyPostsOnly, setShowMyPostsOnly] = useState(false);

  const isHiring = state.from === "hiring";

  useEffect(() => {
    const userId = getUserId();
    setCurrentUserId(userId);
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from("hiring_posts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      const formatted = data.map(post => ({
        id: post.id,
        user_id: post.user_id,
        companyName: post.company_name,
        companyLogo: post.company_logo,
        jobType: post.job_type,
        location: post.location,
        contact: post.contact,
        salaryMin: post.salary_min,
        salaryMax: post.salary_max,
        role: post.role,
        noOfEmployee: post.no_of_employee,
        description: post.description,
        mainRoleSkills: post.main_role_skills,
        mainRoleExperience: post.main_role_experience,
        newRole: post.new_role,
        noOfNewEmployee: post.no_of_new_employee,
        newRoleDescription: post.new_role_description,
        newRoleSkills: post.new_role_skills,
        newRoleExperience: post.new_role_experience,
        newRoleSalaryMin: post.new_role_salary_min,
        newRoleSalaryMax: post.new_role_salary_max,
        postedByHR: post.posted_by_hr,
        postedAt: post.created_at,
        isNew: true
      }));
      setHiringPosts(formatted);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadPosts();
      setLoading(false);
    };
    init();
    if (state.jobType) setActiveFilter(state.jobType);
  }, []);

  const deleteJobPost = async (jobId) => {
    const { error } = await supabase
      .from("hiring_posts")
      .delete()
      .eq("id", jobId);
    
    if (error) {
      toast.error("Failed to delete post!");
    } else {
      toast.success("Job post deleted successfully!");
      await loadPosts();
    }
  };

  const editJobPost = (post) => {
    setEditingPost(post);
    setShowEditModal(true);
  };

  const handleEditUpdate = async () => {
    await loadPosts();
    setShowEditModal(false);
    setEditingPost(null);
  };

  let jobsToShow = [...hiringPosts];
  if (showMyPostsOnly && currentUserId) {
    jobsToShow = jobsToShow.filter(job => job.user_id === currentUserId);
  }

  const allJobsForSearch = [...jobsToShow];

  const baseJobs = allJobsForSearch.filter(job => {
    const jobTitle = (job.title || job.companyName || "").toLowerCase();
    const jobCompany = (job.company || job.companyName || "").toLowerCase();
    const jobLocation = (job.location || "").toLowerCase();
    const jobDescription = (job.description || "").toLowerCase();
    
    const mainRole = (job.role || "").toLowerCase();
    const mainRoleDesc = (job.description || "").toLowerCase();
    const mainRoleSkills = (job.mainRoleSkills || []).map(s => s.toLowerCase());
    
    const newRole = (job.newRole || "").toLowerCase();
    const newRoleDesc = (job.newRoleDescription || "").toLowerCase();
    const newRoleSkills = (job.newRoleSkills || []).map(s => s.toLowerCase());
    
    const locOk = !searchLocation || jobLocation.includes(searchLocation.toLowerCase());
    const salMinOk = !salaryMin || (job.salaryMax || 0) >= Number(salaryMin);
    const salMaxOk = !salaryMax || (job.salaryMin || 0) <= Number(salaryMax);
    
    let roleOk = true;
    if (searchRole) {
      const searchWords = searchRole.toLowerCase().split(' ').filter(w => w.length > 0);
      
      roleOk = searchWords.every(word => {
        return jobTitle.includes(word) ||
               jobCompany.includes(word) ||
               jobLocation.includes(word) ||
               jobDescription.includes(word) ||
               mainRole.includes(word) ||
               mainRoleDesc.includes(word) ||
               mainRoleSkills.some(skill => skill.includes(word)) ||
               newRole.includes(word) ||
               newRoleDesc.includes(word) ||
               newRoleSkills.some(skill => skill.includes(word));
      });
    }
    
    return roleOk && locOk && salMinOk && salMaxOk;
  });

  const filteredJobs = baseJobs.filter(j => activeFilter === "all" || j.jobType === activeFilter);
  const jobCounts = { 
    all: baseJobs.length, 
    fulltime: baseJobs.filter(j => j.jobType === "fulltime").length, 
    parttime: baseJobs.filter(j => j.jobType === "parttime").length 
  };

  const goBack = () => navigate(-1);

  const handleUnifiedApply = (job, roleType = "mainRole") => {
    if (job.companyName && (job.role || job.newRole)) {
      setHiringApplyData({ job, roleType });
    } else {
      setApplyJob(job);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundImage: `url(${bgImage})`, 
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
        <div style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          padding: "30px 50px",
          borderRadius: "20px",
          color: "white",
          fontSize: "18px",
          fontWeight: "600",
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
        }}>
          Loading jobs...
        </div>
      </div>
    );
  }

  // ── HIRING VIEW (Post a Job) with Premium Glass Design ──
  if (isHiring) {
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
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Toaster position="top-center" />
        <div style={{ maxWidth: "500px", width: "100%", margin: "0 auto" }}>
          <div style={{ 
            background: "rgba(255,255,255,0.15)", 
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "32px", 
            padding: "30px", 
            boxShadow: "0 25px 45px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.2) inset",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <button 
                onClick={() => navigate("/job")} 
                style={{ 
                  background: "rgba(255,255,255,0.2)", 
                  backdropFilter: "blur(10px)", 
                  border: "1px solid rgba(255,255,255,0.3)", 
                  borderRadius: "12px", 
                  padding: "10px 14px", 
                  cursor: "pointer", 
                  fontSize: "18px", 
                  color: "white",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.transform = "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                ←
              </button>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>🏢 Post a Job</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Create your job posting with Main Role + Optional New Role</p>
              </div>
            </div>
            
            <InlineHiringModal
              initialData={null}
              onClose={() => navigate("/job")}
              onPost={() => { loadPosts(); navigate("/job"); }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── JOB SEARCH VIEW with Premium Glass Design ──
  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      padding: "20px",
      position: "relative" 
    }}>
      <Toaster position="top-center" />
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        
        {/* Edit Modal */}
        {showEditModal && editingPost && (
          <div style={overlay}>
            <div style={modalStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, color: "white", fontSize: "20px", fontWeight: "800" }}>✏️ Edit Job Post</h3>
                <button onClick={() => setShowEditModal(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "16px", color: "white" }}>✕</button>
              </div>
              <InlineHiringModal
                initialData={editingPost}
                onClose={() => setShowEditModal(false)}
                onPost={handleEditUpdate}
              />
            </div>
          </div>
        )}

        {/* Header Section */}
        <div style={{ 
          background: "rgba(255,255,255,0.15)", 
          backdropFilter: "blur(10px)",
          borderRadius: "20px", 
          padding: "20px", 
          marginBottom: "20px",
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button 
              onClick={goBack} 
              style={{ 
                background: "rgba(255,255,255,0.2)", 
                backdropFilter: "blur(10px)", 
                border: "1px solid rgba(255,255,255,0.3)", 
                borderRadius: "12px", 
                padding: "10px 14px", 
                cursor: "pointer", 
                fontSize: "18px", 
                color: "white",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "white", textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>💼 Job Search</h2>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>{filteredJobs.length} jobs found</p>
            </div>
            <button 
              onClick={() => setShowFilters(f => !f)} 
              style={{ 
                marginLeft: "auto", 
                border: "none", 
                borderRadius: "12px", 
                padding: "10px 14px", 
                cursor: "pointer", 
                fontSize: "13px", 
                fontWeight: "700", 
                background: showFilters ? "#185FA5" : "rgba(255,255,255,0.2)", 
                backdropFilter: "blur(10px)", 
                color: showFilters ? "#fff" : "white", 
                border: showFilters ? "none" : "1px solid rgba(255,255,255,0.3)",
                transition: "all 0.3s ease"
              }}
            >
              🔧 Filters
            </button>
          </div>
        </div>

        {/* My Posts Toggle Button */}
        {currentUserId && (
          <div style={{ marginBottom: "16px" }}>
            <button
              onClick={() => setShowMyPostsOnly(!showMyPostsOnly)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: `2px solid ${showMyPostsOnly ? "#EC4899" : "rgba(255,255,255,0.3)"}`,
                background: showMyPostsOnly ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                backdropFilter: "blur(5px)",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = showMyPostsOnly ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = showMyPostsOnly ? "rgba(236,72,153,0.3)" : "rgba(255,255,255,0.1)";
              }}
            >
              📋 {showMyPostsOnly ? "Showing My Posts Only" : "Show My Posts"}
            </button>
          </div>
        )}

        {/* Search and Filters Section */}
        <div style={{ 
          background: "rgba(255,255,255,0.15)", 
          backdropFilter: "blur(10px)", 
          borderRadius: "16px", 
          padding: "16px", 
          marginBottom: "16px", 
          border: "1px solid rgba(255,255,255,0.2)"
        }}>
          <div style={{ position: "relative", marginBottom: showFilters ? "12px" : 0 }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>🔍</span>
            <input 
              style={{ 
                width: "100%", 
                padding: "12px 12px 12px 40px", 
                borderRadius: "12px", 
                border: "1px solid rgba(255,255,255,0.3)", 
                fontSize: "14px", 
                boxSizing: "border-box", 
                outline: "none", 
                background: "rgba(255,255,255,0.95)",
                transition: "all 0.3s ease"
              }}
              placeholder="Role, skill ya company search karo..." 
              value={searchRole} 
              onChange={e => setSearchRole(e.target.value)} 
            />
          </div>
          {showFilters && (
            <>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", pointerEvents: "none" }}>📍</span>
                <input 
                  style={{ 
                    width: "100%", 
                    padding: "10px 10px 10px 36px", 
                    borderRadius: "10px", 
                    border: "1px solid rgba(255,255,255,0.3)", 
                    fontSize: "14px", 
                    boxSizing: "border-box", 
                    outline: "none", 
                    background: "rgba(255,255,255,0.95)"
                  }}
                  placeholder="Location filter..." 
                  value={searchLocation} 
                  onChange={e => setSearchLocation(e.target.value)} 
                />
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <input 
                  style={{ 
                    flex: 1, 
                    padding: "10px", 
                    borderRadius: "10px", 
                    border: "1px solid rgba(255,255,255,0.3)", 
                    fontSize: "14px", 
                    boxSizing: "border-box", 
                    outline: "none", 
                    background: "rgba(255,255,255,0.95)"
                  }} 
                  type="number" 
                  placeholder="Min Salary ₹" 
                  value={salaryMin} 
                  onChange={e => setSalaryMin(e.target.value)} 
                />
                <span style={{ alignSelf: "center", color: "rgba(255,255,255,0.8)", fontWeight: "700" }}>—</span>
                <input 
                  style={{ 
                    flex: 1, 
                    padding: "10px", 
                    borderRadius: "10px", 
                    border: "1px solid rgba(255,255,255,0.3)", 
                    fontSize: "14px", 
                    boxSizing: "border-box", 
                    outline: "none", 
                    background: "rgba(255,255,255,0.95)"
                  }} 
                  type="number" 
                  placeholder="Max Salary ₹" 
                  value={salaryMax} 
                  onChange={e => setSalaryMax(e.target.value)} 
                />
              </div>
              <button 
                onClick={() => { 
                  setSearchRole(""); 
                  setSearchLocation(""); 
                  setSalaryMin(""); 
                  setSalaryMax(""); 
                  setActiveFilter("all"); 
                }}
                style={{ 
                  padding: "8px 16px", 
                  borderRadius: "8px", 
                  border: "1px solid rgba(255,255,255,0.3)", 
                  background: "rgba(255,255,255,0.2)", 
                  color: "white", 
                  fontWeight: "600", 
                  cursor: "pointer", 
                  fontSize: "13px",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
              >
                🔄 Reset All
              </button>
            </>
          )}
        </div>

        {/* Active Search Tags */}
        {(state.role || state.location || state.salaryMin) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {state.role && (
              <span style={{ 
                padding: "6px 14px", 
                borderRadius: "20px", 
                fontSize: "12px", 
                fontWeight: "700", 
                background: "rgba(230,241,251,0.3)", 
                color: "#C7D2FE", 
                border: "1px solid rgba(195,222,255,0.5)",
                backdropFilter: "blur(5px)"
              }}>
                🔍 {state.role}
              </span>
            )}
            {state.location && (
              <span style={{ 
                padding: "6px 14px", 
                borderRadius: "20px", 
                fontSize: "12px", 
                fontWeight: "700", 
                background: "rgba(240,253,244,0.3)", 
                color: "#BBF7D0", 
                border: "1px solid rgba(187,247,208,0.5)",
                backdropFilter: "blur(5px)"
              }}>
                📍 {state.location}
              </span>
            )}
            {state.salaryMin && (
              <span style={{ 
                padding: "6px 14px", 
                borderRadius: "20px", 
                fontSize: "12px", 
                fontWeight: "700", 
                background: "rgba(254,249,195,0.3)", 
                color: "#FDE047", 
                border: "1px solid rgba(253,224,71,0.5)",
                backdropFilter: "blur(5px)"
              }}>
                💰 {fmt(state.salaryMin)} – {fmt(state.salaryMax)}
              </span>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <FilterTabs active={activeFilter} onChange={setActiveFilter} counts={jobCounts} />

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div style={{ 
            background: "rgba(255,255,255,0.15)", 
            backdropFilter: "blur(10px)", 
            borderRadius: "20px", 
            padding: "50px 20px", 
            textAlign: "center", 
            border: "1px solid rgba(255,255,255,0.2)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔎</div>
            <h3 style={{ margin: "0 0 8px", color: "white" }}>Koi job nahi mili</h3>
            {showMyPostsOnly ? (
              <button 
                onClick={() => navigate("/job", { state: { from: "hiring" } })}
                style={{ 
                  padding: "10px 24px", 
                  borderRadius: "10px", 
                  border: "none", 
                  background: "#3B6D11", 
                  color: "#fff", 
                  fontWeight: "700", 
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#4a8e2f"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#3B6D11"}
              >
                ➕ Post Your First Job
              </button>
            ) : (
              <button 
                onClick={() => setShowMyPostsOnly(true)}
                style={{ 
                  padding: "10px 24px", 
                  borderRadius: "10px", 
                  border: "none", 
                  background: "#EC4899", 
                  color: "#fff", 
                  fontWeight: "700", 
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f06292"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#EC4899"}
              >
                📋 View My Posts
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => {
              return <UnifiedJobCard 
                key={job.id} 
                job={job} 
                type="hiring" 
                onApply={handleUnifiedApply} 
                extraApplicants={{ mainRole: 0, newRole: 0 }}
                currentUserId={currentUserId}
                onEdit={editJobPost}
                onDelete={deleteJobPost}
              />;
            })}
          </div>
        )}
      </div>

      {/* Floating Post Job Button */}
      <button
        onClick={() => navigate("/job", { state: { from: "hiring" } })}
        style={{ 
          position: "fixed", 
          bottom: "30px", 
          right: "20px", 
          padding: "14px 22px", 
          borderRadius: "50px", 
          background: "linear-gradient(135deg, #3B6D11, #5a9e2f)", 
          color: "#fff", 
          border: "none", 
          boxShadow: "0 8px 20px rgba(59,109,17,0.4)", 
          cursor: "pointer", 
          fontSize: "16px", 
          fontWeight: "800", 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          zIndex: 998, 
          transition: "all 0.3s ease",
          fontFamily: "inherit"
        }}
        onMouseEnter={e => { 
          e.currentTarget.style.transform = "scale(1.05)"; 
          e.currentTarget.style.boxShadow = "0 12px 28px rgba(59,109,17,0.5)"; 
        }}
        onMouseLeave={e => { 
          e.currentTarget.style.transform = "scale(1)"; 
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(59,109,17,0.4)"; 
        }}
      >
        <span style={{ fontSize: "20px" }}>➕</span> Post a Job
      </button>

      {applyJob && <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} onApplied={() => {}} />}
      {hiringApplyData && <HiringApplyModal job={hiringApplyData.job} roleType={hiringApplyData.roleType} onClose={() => setHiringApplyData(null)} onApplied={() => {}} />}
    </div>
  );
}