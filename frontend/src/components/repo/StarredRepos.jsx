import { useEffect, useState } from "react";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import StarIcon from "@mui/icons-material/Star";
import styles from "./starredRepos.module.css";

const StarredRepositories = () => {
  const userId = localStorage.getItem("userId");

  const [searchQuery, setSearchQuery] = useState("");
  const [starredRepos, setStarredRepos] = useState([]); // repo objects
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarred = async () => {
      try {
        // 1. get starred repo IDs
        const res = await axios.get(
          `http://localhost:3000/userProfile/${userId}`
        );

        const ids = res.data?.data?.starRepos || [];

        if (ids.length === 0) {
          setStarredRepos([]);
          setSearchResults([]);
          return;
        }

        // 2. fetch full repo objects for each id
        const repoRequests = ids.map((id) =>
          axios.get(`http://localhost:3000/repo/${id}`)
        );

        const repoResponses = await Promise.all(repoRequests);

        const repos = repoResponses.map((r) => r.data?.repository);

        setStarredRepos(repos);
        setSearchResults(repos);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchStarred();
  }, [userId]);

  // SEARCH
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(starredRepos);
    } else {
      setSearchResults(
        starredRepos.filter((repo) =>
          repo.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, starredRepos]);

  // UNSTAR
  const toggleStar = async (repoId) => {
    const updated = starredRepos.filter((r) => r._id !== repoId);

    setStarredRepos(updated);
    setSearchResults(updated);

    await axios.put(`http://localhost:3000/userProfile/${userId}/starred`, {
      starredRepositories: updated.map((r) => r._id),
    });
  };

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <div className={styles.container}>
      <h3>⭐ Starred Repositories</h3>

      <div className={styles.searchArea}>
        <input
          type="text"
          value={searchQuery}
          placeholder="Search..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchResults.length === 0 ? (
        <p className={styles.emptyText}>No starred repositories yet.</p>
      ) : (
        <div className={styles.cardList}>
          {searchResults.map((repo) => (
            <div className={styles.repoCard} key={repo._id}>
              <div className={styles.starHeader}>
                <h4>{repo.name}</h4>

                <IconButton onClick={() => toggleStar(repo._id)}>
                  <StarIcon style={{ color: "gold", fontSize: 20 }} />
                </IconButton>
              </div>

              <p>{repo.description || "No description available."}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StarredRepositories;
