import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../photo/bg_image.jpg";
import { supabase } from "../config/supabaseClient";
import toast, { Toaster } from "react-hot-toast";

function Status() {
  const navigate = useNavigate();
  const [myApplications, setMyApplications] = useState([]);
  const [applicantRequests, setApplicantRequests] = useState([]);
  const [viewMode, setViewMode] = useState("myApplications");
  const [applicationFilter, setApplicationFilter] = useState("all");
  const [applicantFilter, setApplicantFilter] = useState("all");
  const [selectedApplicationRole, setSelectedApplicationRole] = useState("all");
  const [showProfile, setShowProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobAppsModal, setShowJobAppsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const STATUS_BADGES = {
    all: { bg: "rgba(255,255,255,0.2)", color: "#fff", label: "All", icon: "🔄" },
    pending: { bg: "rgba(251, 191, 36, 0.3)", color: "#FBBF24", label: "Pending", icon: "⏳" },
    accepted: { bg: "rgba(16, 185, 129, 0.3)", color: "#10B981", label: "Accepted", icon: "✅" },
    rejected: { bg: "rgba(239, 68, 68, 0.3)", color: "#EF4444", label: "Rejected", icon: "❌" }
  };

  const getUserId = () => {
    let id = localStorage.getItem("userId");
    if (!id) {
      id = `user_${Date.now()}`;
      localStorage.setItem("userId", id);
    }
    return id;
  };

  // Load my applications (jobs I applied for)
  const loadMyApplications = async () => {
    const userId = getUserId();
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userId)
        .order("applied_at", { ascending: false });
      
      if (error) throw error;
      
      const formattedApps = data.map(app => ({
        id: app.id,
        jobId: app.job_id,
        roleType: app.role_type,
        jobTitle: app.job_title,
        company: app.company,
        companyName: app.company_name,
        location: app.location,
        appliedAt: app.applied_at,
        applicantName: app.applicant_name,
        applicantContact: app.applicant_contact,
        applicantProfession: app.applicant_profession,
        applicantSkills: app.applicant_skills || [],
        status: app.status,
        postedByHR: app.posted_by_hr,
        roleName: app.role_name
      }));
      
      setMyApplications(formattedApps);
    } catch (error) {
      console.error("Error loading my applications:", error);
      toast.error("Failed to load applications");
    }
  };

  // Load applicant requests (applications for jobs I posted)
  const loadApplicantRequests = async () => {
    const userId = getUserId();
    try {
      const { data: myJobs, error: jobsError } = await supabase
        .from("hiring_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (jobsError) throw jobsError;
      
      if (myJobs.length === 0) {
        setApplicantRequests([]);
        return;
      }
      
      const jobIds = myJobs.map(job => job.id);
      const { data: applications, error: appsError } = await supabase
        .from("applications")
        .select("*")
        .in("job_id", jobIds)
        .order("applied_at", { ascending: false });
      
      if (appsError) throw appsError;
      
      const jobsWithApplications = await Promise.all(myJobs.map(async (job) => {
        const jobApplications = applications.filter(app => app.job_id === job.id);
        
        const applicantsWithProfiles = await Promise.all(jobApplications.map(async (app) => {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("id", app.user_id)
            .single();
          
          const { data: userProjects } = await supabase
            .from("user_projects")
            .select("*")
            .eq("user_id", app.user_id);
          
          return {
            ...app,
            fullProfile: userData,
            projects: userProjects || []
          };
        }));
        
        return {
          ...job,
          applications: applicantsWithProfiles
        };
      }));
      
      setApplicantRequests(jobsWithApplications);
    } catch (error) {
      console.error("Error loading applicant requests:", error);
      toast.error("Failed to load applicant requests");
    }
  };

  // Update application status
  const updateStatus = async (appToUpdate, newStatus) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", appToUpdate.id);
      
      if (error) throw error;
      
      toast.success(`Application ${newStatus === "accepted" ? "accepted" : newStatus === "rejected" ? "rejected" : "updated"}!`);
      
      await loadMyApplications();
      await loadApplicantRequests();
      
      if (showJobAppsModal) {
        await loadApplicantRequests();
        const updatedJob = applicantRequests.find(j => j.id === selectedJob?.id);
        if (updatedJob) setSelectedJob(updatedJob);
      }
      
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const viewFullProfile = async (userId, applicantData = null) => {
    try {
      let userData;
      let userProjects;
      
      if (applicantData && applicantData.fullProfile) {
        userData = applicantData.fullProfile;
        userProjects = applicantData.projects || [];
      } else {
        const { data: userDataResult } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();
        
        const { data: projectsResult } = await supabase
          .from("user_projects")
          .select("*")
          .eq("user_id", userId);
        
        userData = userDataResult;
        userProjects = projectsResult || [];
      }
      
      setSelectedApplicant({
        ...userData,
        projects: userProjects,
        applicantName: userData?.full_name || userData?.fullName,
        applicantProfession: userData?.profession,
        applicantSkills: userData?.skills || [],
        bio: userData?.description || "No description provided"
      });
      setShowProfile(true);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const getFilteredApplications = () => {
    let filtered = [...myApplications];
    
    if (applicationFilter !== "all") {
      filtered = filtered.filter(app => app.status === applicationFilter);
    }
    
    if (selectedApplicationRole !== "all") {
      filtered = filtered.filter(app => app.roleType === selectedApplicationRole);
    }
    
    return filtered;
  };

  const getFilteredApplicants = () => {
    if (!selectedJob) return [];
    
    let filtered = [...selectedJob.applications];
    
    if (applicantFilter !== "all") {
      filtered = filtered.filter(app => app.status === applicantFilter);
    }
    
    return filtered;
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "Recently";
    const now = new Date();
    const applied = new Date(dateStr);
    const diffMs = now - applied;
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

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const userId = getUserId();
      setCurrentUserId(userId);
      
      if (viewMode === "myApplications") {
        await loadMyApplications();
      } else {
        await loadApplicantRequests();
      }
      
      setIsLoading(false);
    };
    init();
  }, [viewMode]);

  const filteredApplications = getFilteredApplications();
  const applicationCounts = {
    all: myApplications.length,
    pending: myApplications.filter(a => a.status === "pending").length,
    accepted: myApplications.filter(a => a.status === "accepted").length,
    rejected: myApplications.filter(a => a.status === "rejected").length
  };

  const totalApplicants = applicantRequests.reduce((total, job) => total + job.applications.length, 0);
  const pendingApplicants = applicantRequests.reduce((total, job) => total + job.applications.filter(a => a.status === "pending").length, 0);
  const acceptedApplicants = applicantRequests.reduce((total, job) => total + job.applications.filter(a => a.status === "accepted").length, 0);
  const rejectedApplicants = applicantRequests.reduce((total, job) => total + job.applications.filter(a => a.status === "rejected").length, 0);

  const applicantCounts = {
    all: totalApplicants,
    pending: pendingApplicants,
    accepted: acceptedApplicants,
    rejected: rejectedApplicants
  };

  const viewJobApplications = (job) => {
    setSelectedJob(job);
    setShowJobAppsModal(true);
  };

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <Toaster position="top-center" />
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white drop-shadow-lg">📋 Status</h1>
            <p className="text-white/80 font-medium drop-shadow">
              {viewMode === "myApplications" 
                ? `You have applied to ${myApplications.length} jobs`
                : `${totalApplicants} total applications received`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-xl shadow-lg font-bold hover:bg-white/30 border border-white/30 text-white transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setViewMode("myApplications")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all backdrop-blur-md ${
              viewMode === "myApplications"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                : "bg-white/10 text-white/80 border border-white/30 hover:bg-white/20"
            }`}
          >
            📋 My Applications
          </button>
          <button
            onClick={() => setViewMode("applicantRequests")}
            className={`flex-1 py-3 rounded-xl font-bold transition-all backdrop-blur-md ${
              viewMode === "applicantRequests"
                ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                : "bg-white/10 text-white/80 border border-white/30 hover:bg-white/20"
            }`}
          >
            📌 Applicant Requests
          </button>
        </div>

        {/* MY APPLICATIONS VIEW */}
        {viewMode === "myApplications" && (
          <>
            {/* Role Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedApplicationRole("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all backdrop-blur-md ${
                  selectedApplicationRole === "all"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "bg-white/10 text-white/80 border border-white/30 hover:bg-white/20"
                }`}
              >
                🔄 All Roles
              </button>
              <button
                onClick={() => setSelectedApplicationRole("mainRole")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all backdrop-blur-md ${
                  selectedApplicationRole === "mainRole"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "bg-white/10 text-white/80 border border-white/30 hover:bg-white/20"
                }`}
              >
                💼 Main Role
              </button>
              <button
                onClick={() => setSelectedApplicationRole("newRole")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all backdrop-blur-md ${
                  selectedApplicationRole === "newRole"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "bg-white/10 text-white/80 border border-white/30 hover:bg-white/20"
                }`}
              >
                🆕 New Role
              </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["all", "pending", "accepted", "rejected"].map(stat => {
                const badge = STATUS_BADGES[stat];
                return (
                  <button
                    key={stat}
                    onClick={() => setApplicationFilter(stat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1 ${
                      applicationFilter === stat
                        ? "bg-white text-slate-900 shadow-lg"
                        : "bg-white/10 text-white/80 border border-white/30 hover:bg-white/20"
                    }`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                      {applicationCounts[stat]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Applications List */}
            {isLoading ? (
              <div className="text-center py-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-white">
                Loading...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-white/60 font-medium">
                {applicationFilter === "all" 
                  ? "You haven't applied to any jobs yet."
                  : `No ${applicationFilter} applications found.`}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app, index) => {
                  const badge = STATUS_BADGES[app.status] || STATUS_BADGES.pending;
                  const displayTitle = app.jobTitle || app.roleName || "Application";
                  const displayCompany = app.company || app.companyName || "Company";

                  return (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/20 hover:bg-white/15 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-extrabold text-white">{displayTitle}</h3>
                            {app.roleType === "mainRole" ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                                💼 Main Role
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/30 text-orange-200 border border-orange-400/30">
                                🆕 New Role
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/70 font-medium">
                            🏢 {displayCompany} • 📍 {app.location || "Remote"} • {getRelativeTime(app.appliedAt)}
                          </p>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 backdrop-blur-sm"
                          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.color}40` }}
                        >
                          {badge.icon} {badge.label}
                        </span>
                      </div>

                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div>
                            <p className="text-xs font-bold text-indigo-300 uppercase">Applied As</p>
                            <p className="font-bold text-white">{app.applicantName}</p>
                            {app.applicantProfession && (
                              <p className="text-xs text-white/70">{app.applicantProfession}</p>
                            )}
                          </div>
                          <button
                            onClick={() => viewFullProfile(app.user_id, null)}
                            className="text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-indigo-700 shadow-lg transition-all"
                          >
                            👁️ View Full Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* APPLICANT REQUESTS VIEW */}
        {viewMode === "applicantRequests" && (
          <>
            {/* Status Filter Tabs for Applicants */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["all", "pending", "accepted", "rejected"].map(stat => {
                const badge = STATUS_BADGES[stat];
                return (
                  <button
                    key={stat}
                    onClick={() => setApplicantFilter(stat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1 ${
                      applicantFilter === stat
                        ? "bg-white text-slate-900 shadow-lg"
                        : "bg-white/10 text-white/80 border border-white/30 hover:bg-white/20"
                    }`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                      {applicantCounts[stat]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Jobs List with Applicants */}
            {isLoading ? (
              <div className="text-center py-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-white">
                Loading...
              </div>
            ) : applicantRequests.length === 0 ? (
              <div className="text-center py-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-white/60 font-medium">
                No applications received for your posted jobs yet.
              </div>
            ) : (
              <div className="space-y-4">
                {applicantRequests.map((job) => {
                  let filteredJobApplicants = job.applications;
                  if (applicantFilter !== "all") {
                    filteredJobApplicants = job.applications.filter(app => app.status === applicantFilter);
                  }
                  
                  if (filteredJobApplicants.length === 0) return null;
                  
                  return (
                    <div
                      key={job.id}
                      className="bg-white/10 backdrop-blur-md p-6 rounded-3xl shadow-lg border border-white/20 hover:bg-white/15 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-extrabold text-white">{job.company_name}</h3>
                          <p className="text-sm text-white/70 font-medium">
                            📍 {job.location} • {job.job_type === "fulltime" ? "⏰ Full Time" : "🕐 Part Time"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">{filteredJobApplicants.length}</div>
                          <div className="text-xs text-white/60">Applicants</div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {job.role && (
                          <div className="bg-indigo-500/20 rounded-xl p-3 border border-indigo-400/30">
                            <p className="text-xs font-bold text-indigo-300">💼 MAIN ROLE</p>
                            <p className="text-sm font-bold text-white">{job.role}</p>
                            <p className="text-xs text-white/70 mt-1">👥 {job.no_of_employee || 0} positions</p>
                          </div>
                        )}
                        {job.new_role && (
                          <div className="bg-orange-500/20 rounded-xl p-3 border border-orange-400/30">
                            <p className="text-xs font-bold text-orange-300">🆕 NEW ROLE</p>
                            <p className="text-sm font-bold text-white">{job.new_role}</p>
                            <p className="text-xs text-white/70 mt-1">👥 {job.no_of_new_employee || 0} positions</p>
                          </div>
                        )}
                      </div>

                      {/* View Applicants Button */}
                      {filteredJobApplicants.length > 0 && (
                        <button
                          onClick={() => viewJobApplications(job)}
                          className="w-full py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all"
                        >
                          📋 View {filteredJobApplicants.length} Applicant{filteredJobApplicants.length !== 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Job Applications Modal - Shows applicants with role badges */}
      {showJobAppsModal && selectedJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl max-h-[85vh] overflow-y-auto border border-white/30">
            <div className="sticky top-0 bg-white/10 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/20">
              <div>
                <h3 className="text-xl font-black text-white">Applicants for {selectedJob.company_name}</h3>
                <p className="text-xs text-white/60 mt-1">
                  {selectedJob.role && `💼 ${selectedJob.role}`} 
                  {selectedJob.new_role && ` • 🆕 ${selectedJob.new_role}`}
                </p>
              </div>
              <button onClick={() => setShowJobAppsModal(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-all">
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-3">
              {getFilteredApplicants().map((app, idx) => {
                const badge = STATUS_BADGES[app.status] || STATUS_BADGES.pending;
                return (
                  <div key={idx} className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-white">{app.applicant_name}</p>
                          {/* Role Badge */}
                          {app.role_type === "mainRole" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                              💼 Main Role
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/30 text-orange-200 border border-orange-400/30">
                              🆕 New Role
                            </span>
                          )}
                          {/* Status Badge */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: badge.bg, color: badge.color }}>
                            {badge.icon} {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 mt-1">{app.applicant_profession}</p>
                        <p className="text-xs text-white/50 mt-1">Applied {getRelativeTime(app.applied_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      {app.status === "pending" ? (
                        <>
                          <button
                            onClick={() => updateStatus(app, "accepted")}
                            className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all"
                          >
                            ✅ Accept
                          </button>
                          <button
                            onClick={() => updateStatus(app, "rejected")}
                            className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all"
                          >
                            ❌ Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => updateStatus(app, "pending")}
                          className="w-full py-2 bg-white/20 text-white rounded-lg text-xs font-bold hover:bg-white/30 transition-all"
                        >
                          Reset to Pending
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => viewFullProfile(app.user_id, app)}
                      className="w-full mt-2 py-2 bg-indigo-500/30 text-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-500/50 transition-all"
                    >
                      👁️ View Full Profile with Photo
                    </button>
                  </div>
                );
              })}
              {getFilteredApplicants().length === 0 && (
                <div className="text-center py-10 text-white/60">
                  No {applicantFilter !== "all" ? applicantFilter : ""} applicants found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Profile Modal with Photo */}
      {showProfile && selectedApplicant && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md w-full max-w-md rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border border-white/30">
            <div className="sticky top-0 bg-white/10 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/20">
              <h2 className="text-xl font-black text-white">Complete Profile</h2>
              <button onClick={() => setShowProfile(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30 text-white transition-all">
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Profile Photo */}
              <div className="text-center mb-6">
                <div className="w-28 h-28 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-3 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-4xl">
                  {selectedApplicant.profile_pic ? (
                    <img src={selectedApplicant.profile_pic} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    selectedApplicant.gender === "Female" ? "👩" : "👨"
                  )}
                </div>
                <h3 className="text-2xl font-black text-white">{selectedApplicant.applicantName || selectedApplicant.full_name || "Applicant"}</h3>
                <p className="text-indigo-300 font-bold mt-1">{selectedApplicant.applicantProfession || selectedApplicant.profession || "Professional"}</p>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-[10px] font-bold text-white/60 uppercase">🎂 Age</p>
                  <p className="font-bold text-white text-sm">
                    {selectedApplicant.dob ? new Date().getFullYear() - new Date(selectedApplicant.dob).getFullYear() : "N/A"} years
                  </p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-[10px] font-bold text-white/60 uppercase">⚧ Gender</p>
                  <p className="font-bold text-white text-sm">{selectedApplicant.gender || "Not specified"}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-[10px] font-bold text-white/60 uppercase">📞 Contact</p>
                  <p className="font-bold text-white text-sm">{selectedApplicant.contact || "N/A"}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-[10px] font-bold text-white/60 uppercase">📍 Location</p>
                  <p className="font-bold text-white text-sm">{selectedApplicant.location || "N/A"}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20 col-span-2">
                  <p className="text-[10px] font-bold text-white/60 uppercase">🎓 Qualification</p>
                  <p className="font-bold text-white text-sm">{selectedApplicant.qualification || "Not specified"}</p>
                </div>
              </div>

              {/* Family Details */}
              {(selectedApplicant.father_name || selectedApplicant.fatherName) && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-white/60 uppercase mb-2">👨‍👩‍👧 Family Details</p>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-sm text-white"><strong>Father's Name:</strong> {selectedApplicant.father_name || selectedApplicant.fatherName}</p>
                    {selectedApplicant.religion && <p className="text-sm text-white mt-1"><strong>Religion:</strong> {selectedApplicant.religion}</p>}
                  </div>
                </div>
              )}

              {/* Employment Details */}
              <div className="mb-6">
                <p className="text-xs font-bold text-white/60 uppercase mb-2">💼 Employment Details</p>
                <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                  <p className="text-sm text-white"><strong>Profession:</strong> {selectedApplicant.applicantProfession || selectedApplicant.profession}</p>
                  <p className="text-sm text-white mt-1"><strong>Employment Status:</strong> {selectedApplicant.employment_status || selectedApplicant.employmentStatus || "Not specified"}</p>
                  {selectedApplicant.monthly_income && <p className="text-sm text-white mt-1"><strong>Monthly Income:</strong> ₹{selectedApplicant.monthly_income}</p>}
                </div>
              </div>

              {/* Relationship Status */}
              {selectedApplicant.status && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-white/60 uppercase mb-2">💑 Relationship Status</p>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-sm text-white">{selectedApplicant.status}</p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedApplicant.applicantSkills && selectedApplicant.applicantSkills.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-white/60 uppercase mb-2">🛠️ Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.applicantSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-lg text-xs font-bold border border-indigo-400/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {selectedApplicant.projects && selectedApplicant.projects.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-white/60 uppercase mb-2">🚀 Projects ({selectedApplicant.projects.length})</p>
                  <div className="space-y-2">
                    {selectedApplicant.projects.map((proj, i) => (
                      <div key={i} className="bg-white/10 rounded-xl p-3 border border-white/20">
                        <p className="font-bold text-white text-sm">{proj.title}</p>
                        {proj.description && <p className="text-xs text-white/70 mt-1">{proj.description}</p>}
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 mt-1 inline-block hover:underline">
                            🔗 View Project
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* About Me */}
              {selectedApplicant.bio && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-white/60 uppercase mb-2">📝 About Me</p>
                  <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                    <p className="text-sm text-white/90 leading-relaxed">{selectedApplicant.bio}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowProfile(false)}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Status;