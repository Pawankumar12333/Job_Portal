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
  marginBottom: "12px", outline: "none", background: "rgba(255,255,255,0.95)"
};
const btn = (bg, color = "#fff") => ({
  padding: "12px 20px", borderRadius: "10px", border: "none",
  background: bg, color, fontWeight: "700", cursor: "pointer", fontSize: "14px"
});
const overlay = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
};
const modal = {
  background: "#ffffff", borderRadius: "16px", padding: "28px",
  width: "90%", maxWidth: "400px", maxHeight: "85vh", overflowY: "auto"
};
const statusColor = {
  Student:    { bg: "#EEF2FF", color: "#4338CA", border: "#C7D2FE" },
  Fresher:    { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  Experience: { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
};
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
const suggestedSkills = [
  "React", "Node.js", "Python", "Java", "JavaScript", "TypeScript",
  "UI/UX", "Figma", "Excel", "Marketing", "Sales", "Design",
  "Communication", "Leadership", "MS Office", "PHP", "Flutter", "SQL"
];

const relStatusOptions = [
  { value: "Single",   emoji: "💚", label: "Single" },
  { value: "Divorced", emoji: "💔", label: "Divorced" },
  { value: "Widower",  emoji: "🕊️", label: "Widower" },
];

const relStatusStyle = {
  Single:   { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
  Divorced: { bg: "#FFF1F2", color: "#9F1239", border: "#FECDD3" },
  Widower:  { bg: "#F5F3FF", color: "#6D28D9", border: "#DDD6FE" },
};

// ── PROFESSION OPTIONS ─────────────────────────────────────
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

// ── PROFESSION INPUT ───────────────────────────────────────
const ProfessionInput = ({ value, onChange, placeholder = "Profession (e.g. Developer, Teacher)" }) => {
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

// ── SUB-COMPONENTS ─────────────────────────────────────────
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

const AdminToggle = ({ isAdmin, onChange }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "10px", marginBottom: "20px",
    background: isAdmin ? "rgba(255,247,237,0.3)" : "rgba(255,255,255,0.15)",
    border: `2px solid ${isAdmin ? "#FED7AA" : "rgba(255,255,255,0.3)"}`,
    borderRadius: "14px", padding: "12px 18px", transition: "all 0.25s",
    backdropFilter: "blur(5px)"
  }}>
    <span style={{ fontSize: "20px" }}>{isAdmin ? "🏢" : "👤"}</span>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: isAdmin ? "#FED7AA" : "white" }}>
        {isAdmin ? "Admin / HR Mode" : "User Mode"}
      </p>
      <p style={{ margin: 0, fontSize: "11px", color: isAdmin ? "#FED7AA" : "rgba(255,255,255,0.8)" }}>
        {isAdmin ? "Sirf company info chahiye" : "Full job profile banao"}
      </p>
    </div>
    <div onClick={() => onChange(!isAdmin)}
      style={{ width: "46px", height: "26px", borderRadius: "13px", background: isAdmin ? "#C2410C" : "rgba(255,255,255,0.3)", position: "relative", cursor: "pointer", transition: "background 0.25s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: "3px", left: isAdmin ? "23px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", transition: "left 0.25s" }} />
    </div>
  </div>
);

const AdminForm = ({ adminForm, setAdminForm, autoLocation }) => (
  <>
    <div style={{ background: "rgba(255,247,237,0.2)", border: "1px solid #FED7AA", borderRadius: "12px", padding: "10px 14px", marginBottom: "16px", display: "flex", gap: "8px", alignItems: "center", backdropFilter: "blur(5px)" }}>
      <span style={{ fontSize: "16px" }}>🏢</span>
      <p style={{ margin: 0, fontSize: "12px", color: "#FED7AA", fontWeight: "700", lineHeight: 1.4 }}>
        Admin / HR account — sirf company details fill karo
      </p>
    </div>
    <input style={inp} placeholder="Company Name *" value={adminForm.companyName} onChange={e => setAdminForm(f => ({ ...f, companyName: e.target.value }))} />
    <input style={inp} placeholder="Contact Number 📞 *" type="tel" value={adminForm.contact} onChange={e => setAdminForm(f => ({ ...f, contact: e.target.value }))} />
    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
      <input style={{ ...inp, flex: 1, marginBottom: 0 }} placeholder="Location *" value={adminForm.location} onChange={e => setAdminForm(f => ({ ...f, location: e.target.value }))} />
      <button type="button" onClick={() => autoLocation(loc => setAdminForm(f => ({ ...f, location: loc })))}
        style={{ ...btn("#C2410C"), padding: "10px 14px", fontSize: "18px" }}>📍</button>
    </div>
  </>
);

const InfoRow = ({ icon, label, val, textColor = "#333" }) => {
  const getProfessionIcon = () => {
    if (label === "Profession" && val) {
      const profession = professionOptions.find(p => p.value === val);
      if (profession) return profession.icon;
    }
    return icon;
  };
  return (
    <div style={{ display: "flex", gap: "10px", fontSize: "14px", marginBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "6px" }}>
      <span style={{ fontSize: "16px" }}>{getProfessionIcon()}</span>
      <span style={{ color: "rgba(255,255,255,0.7)", minWidth: "110px" }}>{label}:</span>
      <span style={{ fontWeight: "600", color: textColor }}>{val || "Not set"}</span>
    </div>
  );
};

const StatusSelector = ({ value, onChange, experienceYears, onExpChange }) => (
  <div style={{ marginBottom: "12px" }}>
    <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "8px", display: "block", fontWeight: "600" }}>Current Status</label>
    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
      {["Student", "Fresher", "Experience"].map(s => (
        <button key={s} type="button" onClick={() => onChange(s)}
          style={{
            flex: 1, padding: "10px 6px", borderRadius: "10px", cursor: "pointer",
            fontSize: "12px", fontWeight: "700",
            border: `2px solid ${value === s ? statusColor[s].border : "rgba(255,255,255,0.3)"}`,
            background: value === s ? statusColor[s].bg : "rgba(255,255,255,0.1)",
            color: value === s ? statusColor[s].color : "white",
          }}>
          {s === "Student" ? "🎓 Student" : s === "Fresher" ? "🌱 Fresher" : "⭐ Exp"}
        </button>
      ))}
    </div>
    {value === "Experience" && (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,247,237,0.2)", borderRadius: "10px", padding: "10px 14px", border: "1px solid #FED7AA" }}>
        <span>⭐</span>
        <span style={{ fontSize: "13px", color: "#FED7AA", fontWeight: "600", whiteSpace: "nowrap" }}>Years:</span>
        <input type="number" min="1" max="50" placeholder="e.g. 3" value={experienceYears}
          onChange={e => onExpChange(e.target.value)}
          style={{ flex: 1, padding: "6px 10px", borderRadius: "8px", border: "1px solid #FED7AA", fontSize: "14px", outline: "none", background: "rgba(255,255,255,0.9)", fontWeight: "700", color: "#C2410C" }} />
        <span style={{ fontSize: "13px", color: "#FED7AA", fontWeight: "600" }}>Yrs</span>
      </div>
    )}
  </div>
);

const SkillsInput = ({ form, setForm, skillInput, setSkillInput }) => {
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (form.skills.includes(s)) { setSkillInput(""); return; }
    setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  };
  const removeSkill = (skill) => setForm(f => ({ ...f, skills: f.skills.filter(sk => sk !== skill) }));
  const handleSkillKeyDown = (e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } };
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "8px", display: "block", fontWeight: "600" }}>🛠️ Skills</label>
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="Apni skill type karo..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleSkillKeyDown} />
        <button type="button" onClick={addSkill} style={{ ...btn("#185FA5"), padding: "10px 18px", borderRadius: "10px", fontSize: "16px", flexShrink: 0 }}>Add</button>
      </div>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", margin: "0 0 8px" }}>Enter ya comma daba ke bhi add kar sakte ho</p>
      {form.skills.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px", padding: "10px", background: "rgba(255,255,255,0.1)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)" }}>
          {form.skills.map((sk, i) => {
            const pal = skillPalette[i % skillPalette.length];
            return (
              <span key={sk} style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", background: pal.bg, color: pal.color, border: `1px solid ${pal.border}` }}>
                {sk}
                <button type="button" onClick={() => removeSkill(sk)} style={{ background: "none", border: "none", cursor: "pointer", color: pal.color, fontSize: "15px", padding: "0", lineHeight: 1, fontWeight: "900" }}>×</button>
              </span>
            );
          })}
        </div>
      )}
      <div>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: "700", display: "block", marginBottom: "6px" }}>QUICK ADD:</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {suggestedSkills.filter(s => !form.skills.includes(s)).map(s => (
            <button key={s} type="button" onClick={() => setForm(f => ({ ...f, skills: [...f.skills, s] }))}
              style={{ padding: "4px 10px", borderRadius: "15px", border: "1px dashed rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: "12px", cursor: "pointer", fontWeight: "600" }}>
              + {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectsSection = ({ projects, setProjects, projectForm, setProjectForm, showProjectForm, setShowProjectForm, editingProjectIndex, setEditingProjectIndex, userId, showToastMessage }) => {
  const saveProject = async () => {
    if (!projectForm.title.trim()) { 
      showToastMessage("Project title bharo!", "error");
      return; 
    }
    
    let updated;
    if (editingProjectIndex !== null) {
      updated = projects.map((p, i) => i === editingProjectIndex ? { ...projectForm, id: p.id } : p);
      if (updated[editingProjectIndex].id) {
        const { error } = await supabase
          .from('user_projects')
          .update({
            title: projectForm.title,
            description: projectForm.description,
            url: projectForm.url
          })
          .eq('id', updated[editingProjectIndex].id);
        if (error) console.error("Update error:", error);
      }
      setEditingProjectIndex(null);
    } else {
      updated = [...projects, { ...projectForm }];
      if (userId) {
        const { data, error } = await supabase.from('user_projects').insert({
          user_id: userId,
          title: projectForm.title,
          description: projectForm.description,
          url: projectForm.url
        }).select();
        if (data && !error) {
          updated[updated.length - 1].id = data[0].id;
        }
      }
    }
    setProjects(updated);
    setProjectForm({ title: "", description: "", url: "" });
    setShowProjectForm(false);
    showToastMessage(editingProjectIndex !== null ? "Project updated!" : "Project added!", "success");
  };
  
  const deleteProject = async (index) => {
    const projectToDelete = projects[index];
    if (projectToDelete.id) {
      await supabase.from('user_projects').delete().eq('id', projectToDelete.id);
    }
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    showToastMessage("Project deleted!", "info");
  };
  
  const editProject = (index) => {
    setProjectForm({ title: projects[index].title, description: projects[index].description || "", url: projects[index].url || "" });
    setEditingProjectIndex(index);
    setShowProjectForm(true);
  };
  
  const cancelProject = () => {
    setProjectForm({ title: "", description: "", url: "" });
    setEditingProjectIndex(null);
    setShowProjectForm(false);
  };
  
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", fontWeight: "700" }}>🚀 Projects <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: "400" }}>(Optional)</span></label>
        {!showProjectForm && (
          <button type="button" onClick={() => setShowProjectForm(true)} style={{ ...btn("#185FA5"), padding: "6px 14px", fontSize: "12px", borderRadius: "8px" }}>+ Add Project</button>
        )}
      </div>
      {showProjectForm && (
        <div style={{ background: "rgba(238,242,255,0.2)", backdropFilter: "blur(5px)", borderRadius: "12px", padding: "14px", marginBottom: "12px", border: "1px solid rgba(199,210,254,0.5)" }}>
          <p style={{ fontSize: "13px", fontWeight: "700", color: "#C7D2FE", margin: "0 0 10px" }}>
            {editingProjectIndex !== null ? "✏️ Edit Project" : "➕ New Project"}
          </p>
          <input style={inp} placeholder="Project Title *" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} />
          <textarea style={{ ...inp, height: "70px", resize: "vertical", fontFamily: "inherit" }}
            placeholder="Project Description (optional)" value={projectForm.description}
            onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-60%)", fontSize: "16px" }}>🔗</span>
            <input style={{ ...inp, paddingLeft: "34px", marginBottom: "10px" }} placeholder="Project URL (optional)"
              value={projectForm.url} onChange={e => setProjectForm({ ...projectForm, url: e.target.value })} type="url" />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={cancelProject} style={{ ...btn("rgba(255,255,255,0.2)", "white"), flex: 1, padding: "9px", border: "1px solid rgba(255,255,255,0.3)" }}>Cancel</button>
            <button type="button" onClick={saveProject} style={{ ...btn("#185FA5"), flex: 1, padding: "9px" }}>
              {editingProjectIndex !== null ? "Update" : "Save Project"}
            </button>
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {projects.map((p, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", border: "1px solid rgba(255,255,255,0.2)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: "0 0 2px", fontWeight: "700", fontSize: "14px", color: "white" }}>🚀 {p.title}</p>
                {p.description && <p style={{ margin: "0 0 4px", fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{p.description}</p>}
                {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#A5B4FC", fontWeight: "600", wordBreak: "break-all" }}>🔗 {p.url}</a>}
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginLeft: "8px" }}>
                <button type="button" onClick={() => editProject(i)} style={{ background: "rgba(238,242,255,0.3)", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "13px", color: "#C7D2FE" }}>✏️</button>
                <button type="button" onClick={() => deleteProject(i)} style={{ background: "rgba(255,241,242,0.3)", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", fontSize: "13px", color: "#FCA5A5" }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {projects.length === 0 && !showProjectForm && (
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", textAlign: "center", padding: "10px", margin: 0 }}>Koi project nahi — + Add Project click karo</p>
      )}
    </div>
  );
};

// ── FULL JOB FORM ──────────────────────────────────────────
const JobForm = ({
  profilePic, onPicChange, form, setForm,
  skillInput, setSkillInput,
  projects, setProjects, projectForm, setProjectForm,
  showProjectForm, setShowProjectForm,
  editingProjectIndex, setEditingProjectIndex, autoLocation,
  isAdmin, setIsAdmin, adminForm, setAdminForm, userId, showToastMessage,
}) => (
  <>
    <PicUpload pic={profilePic} id="jobPicForm" onChange={onPicChange} borderColor="#185FA5" />
    <AdminToggle isAdmin={isAdmin} onChange={setIsAdmin} />

    {isAdmin ? (
      <AdminForm adminForm={adminForm} setAdminForm={setAdminForm} autoLocation={autoLocation} />
    ) : (
      <>
        <input style={inp} placeholder="Full Name *" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
        <input style={inp} type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
        <input style={inp} placeholder="Contact Number" type="tel" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <button type="button" onClick={() => autoLocation(loc => setForm(f => ({ ...f, location: loc })))}
            style={{ ...btn("#185FA5"), padding: "10px 14px", fontSize: "18px" }}>📍</button>
        </div>
        <ProfessionInput value={form.profession} onChange={(val) => setForm(f => ({ ...f, profession: val }))} placeholder="Profession (e.g. Developer, Teacher)" />
        <input style={inp} placeholder="Qualification (e.g. B.Tech, MBA)" value={form.qualification} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} />
        <StatusSelector
          value={form.currentStatus}
          onChange={val => setForm(f => ({ ...f, currentStatus: val, experienceYears: val !== "Experience" ? "" : f.experienceYears }))}
          experienceYears={form.experienceYears}
          onExpChange={val => setForm(f => ({ ...f, experienceYears: val }))}
        />
        <SkillsInput form={form} setForm={setForm} skillInput={skillInput} setSkillInput={setSkillInput} />
        <ProjectsSection
          projects={projects} setProjects={setProjects}
          projectForm={projectForm} setProjectForm={setProjectForm}
          showProjectForm={showProjectForm} setShowProjectForm={setShowProjectForm}
          editingProjectIndex={editingProjectIndex} setEditingProjectIndex={setEditingProjectIndex}
          userId={userId}
          showToastMessage={showToastMessage}
        />
        <div style={{ marginBottom: "4px" }}>
          <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginBottom: "8px", display: "block", fontWeight: "600" }}>
            📝 About / Description <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: "400" }}>(Optional)</span>
          </label>
          <textarea style={{ ...inp, height: "90px", resize: "vertical", fontFamily: "inherit", marginBottom: 0 }}
            placeholder="Apne baare mein kuch batao..." value={form.description || ""}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>
      </>
    )}
  </>
);

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
function Account() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState({ show: false, message: "", type: "" });

  const [step, setStep] = useState("check");
  const [activeProfile, setActiveProfile] = useState("job");

  const [account, setAccount] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [form, setForm] = useState({
    fullName: "", dob: "", contact: "", location: "",
    profession: "", gender: "", qualification: "",
    currentStatus: "", experienceYears: "", skills: [], description: ""
  });
  const [editingJob, setEditingJob] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Admin state ──
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ companyName: "", contact: "", location: "" });

  const [projects, setProjects] = useState([]);
  const [projectForm, setProjectForm] = useState({ title: "", description: "", url: "" });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);

  const [relAccount, setRelAccount] = useState(null);
  const [relPic, setRelPic] = useState(null);
  const [relForm, setRelForm] = useState({
    fullName: "", fatherName: "", religion: "", dob: "", contact: "",
    location: "", gender: "Male", interests: "", bio: "",
    status: "Single",
    profession: "", employmentStatus: "Employed",
    monthlyIncome: "", qualification: "", description: ""
  });
  const [editingRel, setEditingRel] = useState(false);
  const [showRelCreate, setShowRelCreate] = useState(false);

  const showToastMessage = (message, type = "success") => {
    setShowToast({ show: true, message, type });
    setTimeout(() => setShowToast({ show: false, message: "", type: "" }), 3000);
  };

  // ── Load on mount ──────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem("userAccount");
    const savedRel = localStorage.getItem("relAccount");
    const savedProjects = localStorage.getItem("userProjects");

    if (saved) {
      const p = JSON.parse(saved);
      setAccount(p); setProfilePic(p.profilePic);
      setForm({ ...p, skills: p.skills || [] });
      if (p.isAdmin) {
        setIsAdmin(true);
        setAdminForm({ companyName: p.companyName || "", contact: p.contact || "", location: p.location || "" });
      }
      setStep("view");
    } else {
      loadFromSupabase();
    }

    if (savedRel) {
      const r = JSON.parse(savedRel);
      setRelAccount(r); setRelPic(r.profilePic); setRelForm(r);
    }
    if (savedProjects) setProjects(JSON.parse(savedProjects));
  }, []);

  // ── Load from Supabase ────────────────────────────────
  const loadFromSupabase = async () => {
    const userId = getUserId();
    try {
      // Load from users table
      const { data: jobData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (jobData) {
        const mapped = {
          fullName: jobData.full_name || "",
          dob: jobData.dob || "",
          contact: jobData.contact || "",
          location: jobData.location || "",
          profession: jobData.profession || "",
          qualification: jobData.qualification || "",
          currentStatus: jobData.current_status || "",
          experienceYears: jobData.experience_years || "",
          skills: jobData.skills || [],
          description: jobData.description || "",
          profilePic: jobData.profile_pic || null,
          isAdmin: jobData.is_admin || false,
          companyName: jobData.company_name || "",
          id: jobData.id,
        };
        localStorage.setItem("userAccount", JSON.stringify(mapped));
        setAccount(mapped);
        setProfilePic(mapped.profilePic);
        setForm({ ...mapped, skills: mapped.skills || [] });
        if (mapped.isAdmin) {
          setIsAdmin(true);
          setAdminForm({ companyName: mapped.companyName, contact: mapped.contact, location: mapped.location });
        }
        setStep("view");
      } else {
        setStep("create");
      }

      // Load projects from user_projects table
      const { data: projData } = await supabase
        .from("user_projects")
        .select("*")
        .eq("user_id", userId);
      if (projData && projData.length > 0) {
        const projs = projData.map(p => ({ title: p.title, description: p.description, url: p.url }));
        setProjects(projs);
        localStorage.setItem("userProjects", JSON.stringify(projs));
      }

      // Load rel profile from relationship_profiles table
      const { data: relData } = await supabase
        .from("relationship_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (relData) {
        const mappedRel = {
          fullName: relData.full_name || "",
          fatherName: relData.father_name || "",
          religion: relData.religion || "",
          dob: relData.dob || "",
          contact: relData.contact || "",
          location: relData.location || "",
          gender: relData.gender || "Male",
          status: relData.status || "Single",
          profession: relData.profession || "",
          employmentStatus: relData.employment_status || "Employed",
          monthlyIncome: relData.monthly_income || "",
          qualification: relData.qualification || "",
          description: relData.description || "",
          profilePic: relData.profile_pic || null,
        };
        localStorage.setItem("relAccount", JSON.stringify(mappedRel));
        setRelAccount(mappedRel);
        setRelPic(mappedRel.profilePic);
        setRelForm(mappedRel);
      }
    } catch (err) {
      console.error("Supabase load error:", err);
      setStep("create");
    }
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

  const getLocation = async (pos) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
      const data = await res.json();
      return data.address.city || data.address.town || data.address.village || data.display_name;
    } catch {
      return `${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`;
    }
  };

  const autoLocation = (setter) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const loc = await getLocation(pos);
        setter(loc);
      });
    }
  };

  const picToBase64 = (file, cb) => {
    const r = new FileReader();
    r.onload = () => cb(r.result);
    r.readAsDataURL(file);
  };

  // ── Save Job Profile ───────────────────────────────────
  const handleCreateJob = async () => {
    const userId = getUserId();
    setSaving(true);

    if (isAdmin) {
      if (!adminForm.companyName || !adminForm.contact || !adminForm.location) {
        showToastMessage("Company name, contact aur location bharo!", "error");
        setSaving(false);
        return;
      }

      const supabaseData = {
        id: userId,
        is_admin: true,
        company_name: adminForm.companyName,
        full_name: adminForm.companyName,
        contact: adminForm.contact,
        location: adminForm.location,
        profile_pic: profilePic || null,
      };

      const { error } = await supabase
        .from("users")
        .upsert(supabaseData, { onConflict: "id" });

      if (error) {
        console.error(error);
        showToastMessage("❌ Supabase mein save nahi hua!", "error");
        setSaving(false);
        return;
      }

      const localData = {
        isAdmin: true,
        companyName: adminForm.companyName,
        fullName: adminForm.companyName,
        contact: adminForm.contact,
        location: adminForm.location,
        profilePic,
        id: userId,
      };

      localStorage.setItem("userAccount", JSON.stringify(localData));
      localStorage.setItem("loggedInHR", JSON.stringify({ id: userId, name: adminForm.companyName }));
      setAccount(localData);
      showToastMessage("🏢 Admin profile save ho gaya!", "success");

    } else {
      if (!form.fullName) {
        showToastMessage("Full name bharo!", "error");
        setSaving(false);
        return;
      }

      const supabaseData = {
        id: userId,
        full_name: form.fullName,
        dob: form.dob,
        contact: form.contact,
        location: form.location,
        profession: form.profession,
        qualification: form.qualification,
        current_status: form.currentStatus,
        experience_years: form.experienceYears,
        skills: form.skills,
        description: form.description,
        profile_pic: profilePic || null,
        is_admin: false,
      };

      const { error } = await supabase
        .from("users")
        .upsert(supabaseData, { onConflict: "id" });

      if (error) {
        console.error(error);
        showToastMessage("❌ Supabase mein save nahi hua!", "error");
        setSaving(false);
        return;
      }

      // Save projects to Supabase
      if (projects.length > 0) {
        await supabase.from("user_projects").delete().eq("user_id", userId);
        const { error: projErr } = await supabase.from("user_projects").insert(
          projects.map(p => ({ title: p.title, description: p.description || "", url: p.url || "", user_id: userId }))
        );
        if (projErr) console.error("Projects save error:", projErr);
      }

      const localData = { ...form, profilePic, isAdmin: false, id: userId };
      localStorage.setItem("userAccount", JSON.stringify(localData));
      localStorage.removeItem("loggedInHR");
      setAccount(localData);
      showToastMessage("💼 Job profile save ho gaya!", "success");
    }

    setSaving(false);
    setStep("view");
    setEditingJob(false);
  };

  // ── Save Relationship Profile ──────────────────────────
  const handleCreateRel = async () => {
    if (!relForm.fullName || !relForm.contact || !relForm.profession) {
      showToastMessage("Name, contact aur profession bharo!", "error");
      return;
    }

    const userId = getUserId();
    setSaving(true);

    const supabaseData = {
      user_id: userId,
      full_name: relForm.fullName,
      father_name: relForm.fatherName,
      religion: relForm.religion,
      dob: relForm.dob,
      contact: relForm.contact,
      location: relForm.location,
      gender: relForm.gender,
      status: relForm.status,
      profession: relForm.profession,
      employment_status: relForm.employmentStatus,
      monthly_income: relForm.monthlyIncome,
      qualification: relForm.qualification,
      description: relForm.description,
      profile_pic: relPic || null,
    };

    const { error } = await supabase
      .from("relationship_profiles")
      .upsert(supabaseData, { onConflict: "user_id" });

    if (error) {
      console.error(error);
      showToastMessage("❌ Heart profile save nahi hua!", "error");
      setSaving(false);
      return;
    }

    const localData = { ...relForm, profilePic: relPic };
    localStorage.setItem("relAccount", JSON.stringify(localData));
    setRelAccount(localData);
    showToastMessage("💕 Heart profile save ho gaya!", "success");
    setSaving(false);
    setShowRelCreate(false);
    setEditingRel(false);
  };

  const jobFormProps = {
    profilePic, onPicChange: e => picToBase64(e.target.files[0], setProfilePic),
    form, setForm, skillInput, setSkillInput,
    projects, setProjects, projectForm, setProjectForm,
    showProjectForm, setShowProjectForm,
    editingProjectIndex, setEditingProjectIndex, autoLocation,
    isAdmin, setIsAdmin, adminForm, setAdminForm,
    userId, showToastMessage,
  };

  // ── Loading state with Glass Effect ──────────────────────────────────────
  if (step === "check") {
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
          ⏳ Loading profile...
        </div>
      </div>
    );
  }

  // ── CREATE with Glass Effect Design ─────────────────────────────
  if (step === "create") {
    return (
      <div style={{ 
        minHeight: "100vh", 
        backgroundImage: `url(${bgImage})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "20px",
        position: "relative"
      }}>
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
        
        {/* Toast Notification */}
        {showToast.show && (
          <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 2000 }}>
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
        
        <div style={{ 
          background: "rgba(255,255,255,0.15)", 
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "32px", 
          padding: "40px 30px", 
          width: "100%", 
          maxWidth: "460px", 
          boxShadow: "0 25px 50px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2) inset",
          border: "1px solid rgba(255,255,255,0.3)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{
              width: "60px",
              height: "60px",
              background: "linear-gradient(135deg, #185FA5, #1e40af)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 20px rgba(24,95,165,0.3)"
            }}>
              <span style={{ fontSize: "28px" }}>🚀</span>
            </div>
            <h2 style={{ 
              textAlign: "center", 
              marginBottom: "8px",
              fontSize: "28px",
              fontWeight: "900",
              background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.8))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Setup Your Profile</h2>
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.7)", marginBottom: "0", fontSize: "14px" }}>Create your account to get started</p>
          </div>
          
          <JobForm {...jobFormProps} />
          
          <button 
            type="button" 
            onClick={handleCreateJob} 
            disabled={saving}
            style={{ 
              ...btn(isAdmin ? "#C2410C" : "#185FA5"), 
              width: "100%", 
              marginTop: "16px", 
              padding: "14px",
              opacity: saving ? 0.7 : 1,
              borderRadius: "14px",
              fontSize: "16px",
              fontWeight: "800",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
            }}
          >
            {saving ? "⏳ Saving..." : isAdmin ? "🏢 Create Admin Account" : "✨ Create Account ✨"}
          </button>
          
          <p style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
            By creating an account, you agree to our Terms & Conditions
          </p>
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ──────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      {/* TAB SWITCHER */}
      <div style={{ display: "flex", width: "100%", maxWidth: "400px", background: "#fff", borderRadius: "15px", padding: "6px", marginBottom: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        {[["job", "💼 Job"], ["relationship", "❤️ Love"]].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setActiveProfile(key)}
            style={{ flex: 1, padding: "12px", border: "none", borderRadius: "12px", background: activeProfile === key ? (key === "job" ? "#185FA5" : "#E24B4A") : "transparent", color: activeProfile === key ? "#fff" : "#666", fontWeight: "700", cursor: "pointer", transition: "0.3s" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Rest of the main view remains the same */}
      {/* ══ JOB TAB ══ */}
      {activeProfile === "job" && account && (
        <>
          {editingJob ? (
            <div style={{
              background: "rgba(255, 255, 255, 0.1)", borderRadius: "20px", padding: "28px",
              width: "100%", maxWidth: "400px", boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)"
            }}>
              <h3 style={{ textAlign: "center", marginBottom: "16px", color: "white" }}>✏️ Edit Job Profile</h3>
              <JobForm {...jobFormProps} />
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button type="button" onClick={() => { setEditingJob(false); setShowProjectForm(false); }} style={{ ...btn("rgba(255,255,255,0.2)", "white"), flex: 1, border: "1px solid rgba(255,255,255,0.3)" }}>Cancel</button>
                <button type="button" onClick={handleCreateJob} disabled={saving}
                  style={{ ...btn(isAdmin ? "#C2410C" : "#185FA5"), flex: 1, opacity: saving ? 0.7 : 1 }}>
                  {saving ? "⏳ Saving..." : "Update Profile"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: "rgba(255, 255, 255, 0.1)", borderRadius: "25px", padding: "30px",
              width: "100%", maxWidth: "400px", boxShadow: "0 15px 35px rgba(0,0,0,0.06)",
              textAlign: "center", marginBottom: "20px",
              backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)"
            }}>
              {/* Admin view */}
              {account.isAdmin ? (
                <>
                  {account.profilePic
                    ? <img src={account.profilePic} alt="p" style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "4px solid #FFF7ED", marginBottom: "12px" }} />
                    : <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", margin: "0 auto 12px" }}>🏢</div>
                  }
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: "20px", padding: "5px 14px", marginBottom: "12px" }}>
                    <span style={{ fontSize: "14px" }}>🏢</span>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#C2410C" }}>Admin / HR Account</span>
                  </div>
                  <h2 style={{ margin: "0 0 16px", color: "white" }}>{account.companyName}</h2>
                  <div style={{ textAlign: "left", background: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "15px", marginBottom: "14px" }}>
                    <InfoRow icon="📞" label="Contact" val={account.contact} textColor="white" />
                    <InfoRow icon="📍" label="Location" val={account.location} textColor="white" />
                  </div>
                </>
              ) : (
                <>
                  {account.profilePic
                    ? <img src={account.profilePic} alt="p" style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "4px solid #f0f4ff", marginBottom: "15px" }} />
                    : <div style={{ width: 110, height: 110, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", margin: "0 auto 15px" }}>👤</div>
                  }
                  <h2 style={{ margin: "0 0 4px", color: "white" }}>{account.fullName}</h2>

                  {account.profession && (() => {
                    const profession = professionOptions.find(p => p.value === account.profession);
                    return (
                      <p style={{ color: "#185FA5", fontWeight: "700", margin: "0 0 12px" }}>
                        {profession ? profession.icon : "💼"} {account.profession}
                      </p>
                    );
                  })()}

                  {account.currentStatus && (
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "18px" }}>
                      <span style={{ padding: "6px 16px", borderRadius: "25px", fontSize: "13px", fontWeight: "800", background: statusColor[account.currentStatus]?.bg, color: statusColor[account.currentStatus]?.color, border: `1px solid ${statusColor[account.currentStatus]?.border}` }}>
                        {account.currentStatus === "Student" ? "🎓" : account.currentStatus === "Fresher" ? "🌱" : "⭐"} {account.currentStatus}
                        {account.currentStatus === "Experience" && account.experienceYears ? ` — ${account.experienceYears} Yr${account.experienceYears > 1 ? "s" : ""}` : ""}
                      </span>
                    </div>
                  )}

                  <div style={{ textAlign: "left", background: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "15px", marginBottom: "14px" }}>
                    <InfoRow icon="📅" label="Date of Birth" val={account.dob} textColor="white" />
                    <InfoRow icon="📞" label="Contact" val={account.contact} textColor="white" />
                    <InfoRow icon="🎓" label="Qualification" val={account.qualification} textColor="white" />
                    <InfoRow icon="📍" label="Location" val={account.location} textColor="white" />
                  </div>

                  {account.skills && account.skills.length > 0 && (
                    <div style={{ textAlign: "left", background: "rgba(255,255,255,0.1)", padding: "16px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "14px" }}>
                      <p style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "800", color: "white" }}>🛠️ Skills</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {account.skills.map((sk, i) => {
                          const pal = skillPalette[i % skillPalette.length];
                          return <span key={sk} style={{ padding: "5px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", background: pal.bg, color: pal.color, border: `1px solid ${pal.border}` }}>{sk}</span>;
                        })}
                      </div>
                    </div>
                  )}

                  {projects.length > 0 && (
                    <div style={{ textAlign: "left", background: "rgba(255,255,255,0.1)", padding: "16px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "14px" }}>
                      <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "800", color: "white" }}>🚀 Projects ({projects.length})</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {projects.map((p, i) => (
                          <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
                            <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "14px", color: "white" }}>🚀 {p.title}</p>
                            {p.description && <p style={{ margin: "0 0 6px", fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{p.description}</p>}
                            {p.url && <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#185FA5", fontWeight: "600", textDecoration: "none", wordBreak: "break-all" }}>🔗 View Project</a>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {account.description && (
                    <div style={{ textAlign: "left", background: "rgba(255,255,255,0.1)", padding: "16px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "14px" }}>
                      <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "800", color: "white" }}>📝 About Me</p>
                      <p style={{ margin: 0, fontSize: "13px", color: "white", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{account.description}</p>
                    </div>
                  )}
                </>
              )}

              <button type="button" onClick={() => setEditingJob(true)}
                style={{ ...btn(account.isAdmin ? "#FFF7ED" : "#f0f4ff", account.isAdmin ? "#C2410C" : "#185FA5"), width: "100%", border: `1.5px solid ${account.isAdmin ? "#C2410C" : "#185FA5"}` }}>
                ✏️ Edit / Update Profile
              </button>
            </div>
          )}
        </>
      )}

      {/* ══ RELATIONSHIP TAB ══ */}
      {activeProfile === "relationship" && (
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {!relAccount && !showRelCreate && (
            <div style={{ background: "rgba(255, 255, 255, 0.1)", backdropFilter: "blur(10px)", borderRadius: "20px", padding: "32px", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.06)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>💕</div>
              <h3 style={{ margin: "0 0 8px", color: "white" }}>Relationship Profile</h3>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", marginBottom: "20px" }}>Abhi tak koi heart profile nahi. Banao!</p>
              <button type="button" onClick={() => setShowRelCreate(true)} style={{ ...btn("#E24B4A"), width: "100%" }}>+ Create Heart Profile</button>
            </div>
          )}

          {(showRelCreate || editingRel) && (
            <div style={{
              background: "rgba(255, 255, 255, 0.15)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)",
              borderRadius: "30px", padding: "30px 25px",
              boxShadow: "0 25px 45px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.2) inset",
              border: "1px solid rgba(255,255,255,0.3)"
            }}>
              <h3 style={{ textAlign: "center", marginBottom: "25px", fontSize: "24px", fontWeight: "700", background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.8))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {editingRel ? "✨ Edit Heart Profile ✨" : "💕 Create Heart Profile 💕"}
              </h3>

              <PicUpload pic={relPic} id="relPic" emoji="💕" onChange={e => picToBase64(e.target.files[0], setRelPic)} borderColor="#E24B4A" />

              <input style={{ ...inp, background: "rgba(255,255,255,0.9)", border: "none" }} placeholder="Full Name *" value={relForm.fullName} onChange={e => setRelForm(f => ({ ...f, fullName: e.target.value }))} />
              <input style={{ ...inp, background: "rgba(255,255,255,0.9)", border: "none" }} placeholder="Father's Name" value={relForm.fatherName} onChange={e => setRelForm(f => ({ ...f, fatherName: e.target.value }))} />
              <input style={{ ...inp, background: "rgba(255,255,255,0.9)", border: "none" }} placeholder="Religion" value={relForm.religion} onChange={e => setRelForm(f => ({ ...f, religion: e.target.value }))} />
              <input style={{ ...inp, background: "rgba(255,255,255,0.9)", border: "none" }} placeholder="Contact Number 📞 *" type="tel" value={relForm.contact} onChange={e => setRelForm(f => ({ ...f, contact: e.target.value }))} />

              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", marginBottom: "6px", display: "block", fontWeight: "600" }}>Gender</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
                {["Male", "Female", "Other"].map(g => (
                  <button key={g} type="button" onClick={() => setRelForm(f => ({ ...f, gender: g }))}
                    style={{ flex: 1, padding: "10px", borderRadius: "10px", border: `2px solid ${relForm.gender === g ? "#E24B4A" : "rgba(255,255,255,0.3)"}`, background: relForm.gender === g ? "#E24B4A" : "rgba(255,255,255,0.2)", color: relForm.gender === g ? "#fff" : "white", fontWeight: "600", cursor: "pointer" }}>
                    {g}
                  </button>
                ))}
              </div>

              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", marginBottom: "8px", display: "block", fontWeight: "600" }}>💑 Relationship Status</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
                {relStatusOptions.map(({ value, emoji, label }) => {
                  const st = relStatusStyle[value];
                  const isActive = relForm.status === value;
                  return (
                    <button key={value} type="button" onClick={() => setRelForm(f => ({ ...f, status: value }))}
                      style={{ flex: 1, padding: "10px 6px", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: "700", border: `2px solid ${isActive ? st.border : "rgba(255,255,255,0.3)"}`, background: isActive ? st.bg : "rgba(255,255,255,0.2)", color: isActive ? st.color : "white", transition: "all 0.2s" }}>
                      {emoji} {label}
                    </button>
                  );
                })}
              </div>

              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", marginBottom: "6px", display: "block", fontWeight: "600" }}>Employment Status</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
                {["Employed", "Unemployed"].map(s => (
                  <button key={s} type="button" onClick={() => setRelForm(f => ({ ...f, employmentStatus: s }))}
                    style={{ flex: 1, padding: "10px", borderRadius: "10px", border: `2px solid ${relForm.employmentStatus === s ? "#E24B4A" : "rgba(255,255,255,0.3)"}`, background: relForm.employmentStatus === s ? "#E24B4A" : "rgba(255,255,255,0.2)", color: relForm.employmentStatus === s ? "#fff" : "white", fontWeight: "600", cursor: "pointer" }}>
                    {s}
                  </button>
                ))}
              </div>

              <ProfessionInput value={relForm.profession} onChange={(val) => setRelForm(f => ({ ...f, profession: val }))} placeholder="Profession *" />
              <input style={{ ...inp, background: "rgba(255,255,255,0.9)", border: "none" }} placeholder="Qualification (e.g. B.Tech, MBA)" value={relForm.qualification} onChange={e => setRelForm(f => ({ ...f, qualification: e.target.value }))} />
              <input style={{ ...inp, background: "rgba(255,255,255,0.9)", border: "none" }} placeholder="Monthly Income (₹)" type="number" value={relForm.monthlyIncome} onChange={e => setRelForm(f => ({ ...f, monthlyIncome: e.target.value }))} />

              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <input style={{ ...inp, background: "rgba(255,255,255,0.9)", border: "none", flex: 1, marginBottom: 0 }} placeholder="Location" value={relForm.location} onChange={e => setRelForm(f => ({ ...f, location: e.target.value }))} />
                <button type="button" onClick={() => autoLocation(loc => setRelForm(f => ({ ...f, location: loc })))}
                  style={{ ...btn("#E24B4A"), padding: "10px 15px", fontSize: "18px", borderRadius: "10px" }}>📍</button>
              </div>

              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", marginBottom: "6px", display: "block", fontWeight: "600" }}>Date of Birth</label>
              <input style={{ ...inp, background: "rgba(255,255,255,0.9)", border: "none" }} type="date" value={relForm.dob} onChange={e => setRelForm(f => ({ ...f, dob: e.target.value }))} />

              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", marginBottom: "6px", display: "block", fontWeight: "600" }}>
                📝 About / Description <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: "400" }}>(Optional)</span>
              </label>
              <textarea style={{ ...inp, height: "90px", resize: "vertical", fontFamily: "inherit", background: "rgba(255,255,255,0.9)", border: "none" }}
                placeholder="Apne baare mein kuch batao — personality, hobbies, expectations..."
                value={relForm.description || ""} onChange={e => setRelForm(f => ({ ...f, description: e.target.value }))} />

              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={() => { setShowRelCreate(false); setEditingRel(false); }}
                  style={{ ...btn("rgba(255,255,255,0.2)", "white"), flex: 1, border: "1px solid rgba(255,255,255,0.5)" }}>Cancel</button>
                <button type="button" onClick={handleCreateRel} disabled={saving}
                  style={{ ...btn("#E24B4A"), flex: 1, boxShadow: "0 4px 15px rgba(226,75,74,0.3)", opacity: saving ? 0.7 : 1 }}>
                  {saving ? "⏳ Saving..." : editingRel ? "✨ Update Profile ✨" : "💕 Save Heart Profile 💕"}
                </button>
              </div>
            </div>
          )}

          {relAccount && !showRelCreate && !editingRel && (
            <div style={{ background: "rgba(255, 255, 255, 0.1)", borderRadius: "25px", padding: "30px", boxShadow: "0 15px 35px rgba(0,0,0,0.06)", textAlign: "center", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
              {relAccount.profilePic
                ? <img src={relAccount.profilePic} alt="p" style={{ width: 100, height: 100, borderRadius: "50%", border: "4px solid #fff", objectFit: "cover", marginBottom: "15px", boxShadow: "0 8px 20px rgba(226,75,74,0.2)" }} />
                : <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#FFF5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 15px" }}>💕</div>
              }
              <h2 style={{ margin: "0", color: "white" }}>{relAccount.fullName}</h2>

              {relAccount.profession && (() => {
                const profession = professionOptions.find(p => p.value === relAccount.profession);
                return (
                  <p style={{ color: "white", fontWeight: "700", margin: "8px 0" }}>
                    {profession ? profession.icon : "💼"} {relAccount.profession}
                  </p>
                );
              })()}

              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px", margin: "15px 0" }}>
                {relAccount.status && (() => {
                  const opt = relStatusOptions.find(o => o.value === relAccount.status);
                  const st  = relStatusStyle[relAccount.status] || { bg: "#f0f0f0", color: "#555", border: "#ddd" };
                  return (
                    <span style={{ padding: "6px 16px", borderRadius: "25px", fontSize: "13px", fontWeight: "800", background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                      {opt?.emoji} {relAccount.status}
                    </span>
                  );
                })()}
                <span style={{ padding: "6px 14px", background: "rgba(255,255,255,0.2)", color: "white", borderRadius: "25px", fontSize: "12px", fontWeight: "800" }}>
                  🎂 {calculateAge(relAccount.dob)} Years
                </span>
              </div>

              <div style={{ textAlign: "left", marginTop: "20px", background: "rgba(255, 255, 255, 0.1)", padding: "20px", borderRadius: "20px", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <InfoRow icon="📞" label="Contact No." val={relAccount.contact} textColor="white" />
                <InfoRow icon="👨‍💼" label="Father's Name" val={relAccount.fatherName} textColor="white" />
                <InfoRow icon="🕉️" label="Religion" val={relAccount.religion} textColor="white" />
                <InfoRow icon="🚻" label="Gender" val={relAccount.gender} textColor="white" />
                <InfoRow icon="💼" label="Profession" val={relAccount.profession} textColor="white" />
                <InfoRow icon="🛠️" label="Work Status" val={relAccount.employmentStatus} textColor="white" />
                <InfoRow icon="🎓" label="Qualification" val={relAccount.qualification} textColor="white" />
                <InfoRow icon="💰" label="Monthly Income" val={relAccount.monthlyIncome ? `₹${relAccount.monthlyIncome}` : "N/A"} textColor="white" />
                <InfoRow icon="📍" label="Location" val={relAccount.location} textColor="white" />
              </div>

              {relAccount.description && (
                <div style={{ textAlign: "left", marginTop: "14px", background: "rgba(255, 255, 255, 0.15)", padding: "16px", borderRadius: "15px", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "800", color: "white" }}>📝 About Me</p>
                  <p style={{ margin: 0, fontSize: "13px", color: "white", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{relAccount.description}</p>
                </div>
              )}

              <button type="button" onClick={() => setEditingRel(true)}
                style={{ ...btn("rgba(255,255,255,0.2)", "white"), width: "100%", marginTop: "20px", border: "1.5px solid white" }}>
                ✏️ Edit / Update Heart Profile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Account;