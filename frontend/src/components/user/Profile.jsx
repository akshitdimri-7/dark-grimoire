import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import { UnderlineNav } from "@primer/react";
import { BookIcon, RepoIcon } from "@primer/octicons-react";
import { useAuth } from "../../authContext";
import Navbar from "../navbar/Navbar";
import Person4Icon from "@mui/icons-material/Person4";
import LogoutIcon from "@mui/icons-material/Logout";
import HeatMapProfile from "./HeatMap";
import StarredRepositories from "../repo/StarredRepos.jsx";

const Profile = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const userId = localStorage.getItem("userId");

  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const controller = new AbortController();

    if (!userId) {
      setError("User not logged in");
      setLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/userProfile/${userId}`,
          { signal: controller.signal }
        );
        setUserDetails(response.data);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.error("Cannot fetch user details: ", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
    return () => controller.abort();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setCurrentUser(null);
    navigate("/auth", { replace: true });
  };

  return (
    <>
      <Navbar />

      <div className="profile-container">

        <UnderlineNav aria-label="Profile Navigation" className="profile-nav">
          <UnderlineNav.Item
            aria-current={activeTab === "overview" ? "page" : undefined}
            icon={BookIcon}
            onClick={() => setActiveTab("overview")}
            sx={{ color: "white", "&:hover": { textDecoration: "underline" } }}
          >
            Overview
          </UnderlineNav.Item>

          <UnderlineNav.Item
            aria-current={activeTab === "starred" ? "page" : undefined}
            icon={RepoIcon}
            onClick={() => setActiveTab("starred")}
            sx={{
              color: "whitesmoke",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Starred Repositories
          </UnderlineNav.Item>
        </UnderlineNav>

        <button
          onClick={handleLogout}
          className="logout-btn"
          id="logout"
          aria-label="Logout"
        >
          <div className="logout-container">
            <LogoutIcon /> Logout
          </div>
        </button>

        <div className="profile-page-wrapper">
          {loading && <p className="info-text">Loading profile...</p>}
          {error && <p className="error-text">{error}</p>}

          {/* -------- OVERVIEW TAB -------- */}
          {activeTab === "overview" && (
            <>
              {!loading && !error && userDetails && (
                <div className="user-profile-section">
                  <Person4Icon className="profile-image" />

                  <div className="name">
                    <h3>{userDetails?.data?.username || "User"}</h3>
                  </div>

                  {userDetails?.data?._id !== userId && (
                    <button className="follow-btn">Follow</button>
                  )}

                  <div className="follower">
                    <p>{userDetails?.data?.followers || 0} Followers</p>
                    <p>{userDetails?.data?.following || 0} Following</p>
                  </div>
                </div>
              )}

              <div className="heat-map-profile">
                <HeatMapProfile />
              </div>
            </>
          )}

          {/* -------- STARRED TAB -------- */}
          {activeTab === "starred" && (
            <StarredRepositories />
          )}

        </div>
      </div>
    </>
  );
};

export default Profile;
