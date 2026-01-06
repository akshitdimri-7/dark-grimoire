import { useState, useEffect, useMemo } from "react";
import "./dashboard.css";
import Navbar from "../navbar/Navbar";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import IconButton from "@mui/material/IconButton";
import StarIcon from "@mui/icons-material/Star";
import DeleteIcon from "@mui/icons-material/Delete";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);

  // ===================== FETCH DATA =====================
  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchRepositories = async () => {
      try {
        const res = await fetch(`http://localhost:3000/repo/user/${userId}`);
        const data = await res.json();

        setRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error fetching repositories:", err);
      }
    };

    const fetchSuggested = async () => {
      try {
        const res = await fetch("http://localhost:3000/repo/all");
        const data = await res.json();
        setSuggestedRepositories(data.repositories || []);
      } catch (err) {
        console.error("Error fetching suggested repos:", err);
      }
    };

    const fetchStarred = async () => {
      try {
        const res = await fetch(`http://localhost:3000/userProfile/${userId}`);
        const data = await res.json();
        setStarredRepos(data?.data?.starRepos || []);
      } catch (err) {
        console.error("Error fetching starred repos:", err);
      }
    };

    fetchRepositories();
    fetchSuggested();
    fetchStarred();
  }, []);

  // ===================== FILTERED REPOS =====================
  const filteredRepos = useMemo(() => {
    const result = !searchQuery.trim()
      ? repositories
      : repositories.filter((repo) =>
          repo.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return result;
  }, [repositories, searchQuery]);

  // ===================== STAR =====================
  const toggleStar = async (repoId) => {
    const userId = localStorage.getItem("userId");

    const updatedStars = starredRepos.includes(repoId)
      ? starredRepos.filter((id) => String(id) !== String(repoId))
      : [...starredRepos, repoId];

    setStarredRepos(updatedStars);

    await fetch(`http://localhost:3000/userProfile/${userId}/starred`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starredRepositories: updatedStars }),
    });
  };

  // ===================== DELETE =====================
  const deleteRepository = async (repoId) => {
    console.log("Delete clicked for:", repoId);

    if (!window.confirm("Are you sure you want to delete this repository?"))
      return;

    try {
      const res = await fetch(`http://localhost:3000/repo/delete/${repoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data?.message || "Failed to delete repository");
        return;
      }

      setRepositories((prev) => {
        const updated = prev.filter((r) => String(r._id) !== String(repoId));
        return [...updated];
      });

      setStarredRepos((prev) =>
        prev.filter((id) => String(id) !== String(repoId))
      );
    } catch (error) {
      console.error("Error deleting repository:", error);
    }
  };

  // ===================== RENDER =====================
  return (
    <>
      <Navbar />

      <section id="dashboard">
        {/* LEFT PANEL */}
        <aside>
          <h3>Suggested Repositories</h3>

          <div className="card-list">
            {suggestedRepositories.map((repo) => (
              <div key={String(repo._id)}>
                <div className="star-btn-container">
                  <h4>{repo.name}</h4>

                  <IconButton
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleStar(repo._id);
                    }}
                  >
                    {starredRepos.includes(repo._id) ? (
                      <StarIcon style={{ color: "gold", fontSize: 20 }} />
                    ) : (
                      <StarBorderIcon
                        style={{ color: "white", fontSize: 20 }}
                      />
                    )}
                  </IconButton>
                </div>

                <h4>{repo.description}</h4>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main>
          <h2>Your Repositories</h2>

          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <p className="repo-count">
            Showing {filteredRepos.length} repositories
          </p>

          <div className="card-list">
            {filteredRepos.map((repo) => (
              <div key={String(repo._id)}>
                <div className="star-btn-container">
                  <h4>{repo.name}</h4>

                  <div className="star-del-btn-container">
                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleStar(repo._id);
                      }}
                    >
                      {starredRepos.includes(repo._id) ? (
                        <StarIcon style={{ color: "gold", fontSize: 20 }} />
                      ) : (
                        <StarBorderIcon
                          style={{ color: "white", fontSize: 20 }}
                        />
                      )}
                    </IconButton>

                    <IconButton
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteRepository(repo._id);
                      }}
                    >
                      <DeleteIcon
                        className="delete-icon"
                        style={{ fontSize: 20 }}
                      />
                    </IconButton>
                  </div>
                </div>

                <h4>{repo.description}</h4>
              </div>
            ))}
          </div>
        </main>

        {/* RIGHT PANEL */}
        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>Tech Conference — Jan 20</li>
            <li>Developer Meetup — Feb 28</li>
            <li>Tech Conference — March 24</li>
            <li>Tech Conclave — April 5</li>
            <li>Hackathon — May 30</li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;
