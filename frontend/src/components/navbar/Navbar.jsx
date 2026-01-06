import { Link } from "react-router-dom";
import "./navbar.css";
import githubLogo from "../../assets/github-mark-white.svg";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-left">
        <img src={githubLogo} alt="githubLogo" />
        <h2>DarkGrimoire</h2>
      </Link>

      <div className="nav-right">
        <Link to="/create" className="nav-btn">
          <AddCircleOutlineIcon />
          <span>Create Repository</span>
        </Link>

        <Link to="/profile" className="nav-btn">
          <AccountCircleIcon />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
