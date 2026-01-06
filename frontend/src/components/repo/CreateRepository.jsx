import { useState } from "react";
import axios from "axios";
import styles from "./createRepo.module.css";
import { useNavigate } from "react-router-dom";

const CreateRepository = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    name: "",
    description: "",
    visibility: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "visibility" ? value === "true" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Repository name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:3000/repo/create", {
        owner: userId,
        name: form.name,
        description: form.description,
        visibility: form.visibility,
        issues: [],
        content: [],
      });

      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to create repository");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Create Repository</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.error}>{error}</p>}

        <label>Repository Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. my-first-repo"
        />

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your project…"
        />

        <label>Visibility</label>
        <select
          name="visibility"
          value={form.visibility}
          onChange={handleChange}
        >
          <option value={true}>Public</option>
          <option value={false}>Private</option>
        </select>

        <button disabled={loading}>
          {loading ? "Creating…" : "Create Repository"}
        </button>
      </form>
    </div>
  );
};

export default CreateRepository;
