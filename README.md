----------

# Dark Grimoire

Dark Grimoire is a Git-like version control system implemented as a Node.js application that exposes both:

-   A **CLI-based repository engine** (similar to Git)
    
-   A **GitHub-style backend server** for users, repositories, and collaboration
    

Unlike a typical CRUD backend, Dark Grimoire implements its own repository storage engine using a `.grimoire` directory that manages staging, commits, and repository history.

The system is designed to support:

-   Local version control through a CLI
    
-   Remote synchronization through AWS S3
    
-   User and repository management through a web API
    
-   Real-time collaboration via WebSockets
    

----------

## High-Level Architecture

Dark Grimoire runs in two distinct modes from the same entry point (`app.js`):

### CLI Mode

The CLI mode provides Git-style commands:

`node app.js init
node app.js add <file>
node app.js commit "<message>" node app.js push
node app.js pull
node app.js revert <commitId>` 

----------

## API Gateway Layer

All HTTP traffic in Dark Grimoire flows through a central API gateway defined in `routes/main.router.js`.

This router acts as the entry point for all frontend and external requests and delegates them to domain-specific routers:

Router

Responsibility

`userRouter`

Authentication, profiles, and user management

`repoRouter`

Repository creation, ownership, and metadata

`issueRouter`

Issues and discussions

The gateway is mounted at `/` inside the Express server:

`app.use("/", mainRouter);` 

----------

## Repository Domain

Dark Grimoire distinguishes between two concepts of a repository:

1.  **Repository Metadata (MongoDB)**
    
2.  **Repository Data (Git Engine)**
    

The HTTP API defined in `routes/repo.router.js` manages only the metadata layer. These endpoints create and manage records such as:

-   Repository name
    
-   Owner
    
-   Visibility (public / private)
    

Example endpoints:

`POST /repo/create
GET /repo/:id
PATCH /repo/toggle/:id` 

These APIs do **not** manipulate files, commits, or version history.

All file versioning, commits, and history live in the `.grimoire` engine and are currently accessible only through the CLI.

----------

## User Domain

Dark Grimoire includes a full user and identity layer implemented through `routes/user.router.js`.

This layer is responsible for:

-   Account creation and authentication
    
-   User profiles
    
-   Repository ownership
    
-   Starred repositories
    

Key endpoints:

`POST /signup
POST /login
GET /userProfile/:id
PUT /updateProfile/:id
PUT /userProfile/:id/starred
DELETE /deleteProfile/:id` 

----------

## Issue Tracking

Dark Grimoire includes a built-in issue tracking system similar to GitHub Issues.

Implemented in `routes/issue.router.js`:

`POST /issue/create
GET /issue/all
POST /issue/:id
PUT /issue/update/:id
DELETE /issue/delete/:id` 

----------

## Repository Storage Engine (`.grimoire`)

When a user runs:

`node app.js init` 

The system creates:

`.grimoire/
├── commits/
└── config.json` 

This functions like Git’s `.git` directory.

### `config.json`

Stores metadata such as the S3 bucket.

### `commits/`

Each commit is stored as a full snapshot under a unique commit ID.

----------

## Staging Area

`node app.js add <file>` 

Copies files into:

`.grimoire/staging/` 

----------

## Commits

`node app.js commit "My message"` 

Creates:

`.grimoire/commits/<commit-id>/` 

With:

-   All staged files
    
-   `commit.json` containing message and timestamp
    

----------

## Remote Storage (AWS S3)

`node app.js push` 

Uploads:

`.grimoire/commits/<commit-id>/<file>` 

to S3 under:

`commits/<commit-id>/<file>` 

----------

## Pulling

`node app.js pull` 

Recreates:

-   `.grimoire/commits`
    
-   All files
    
-   Full commit history
    

----------

## Reverting

`node app.js revert <commit-id>` 

Restores project files from:

`.grimoire/commits/<commit-id>/` 

----------

## Repository Metadata Layer

MongoDB stores:

-   Ownership
    
-   Visibility
    
-   Issues
    
-   Descriptions
    

Git engine stores:

-   Files
    
-   Commits
    
-   History
    

----------

## Repository API

Endpoint

Purpose

`POST /repo/create`

Create repository

`GET /repo/all`

Browse repositories

`GET /repo/:id`

View repository

`GET /repo/user/:userId`

User repositories

`PUT /repo/update/:id`

Edit metadata

`PATCH /repo/toggle/:id`

Public / Private

`DELETE /repo/delete/:id`

Delete repo

----------

## Authentication

`POST /signup
POST /login` 

Uses:

-   `bcrypt` for hashing
    
-   `JWT` for sessions
    

----------

## Models

### Repository

-   name
    
-   description
    
-   visibility
    
-   owner
    
-   issues
    
-   timestamps
    

### User

-   username
    
-   email
    
-   password
    
-   repositories
    
-   starred repos
    
-   followers
    

### Issue

-   title
    
-   description
    
-   status
    
-   repository
# Dark Grimoire Frontend

## Frontend Architecture

The React application is bootstrapped in `main.jsx`.

The entire app is wrapped inside:

-   `AuthProvider` – provides global authentication state (user, token)
    
-   `BrowserRouter` – enables client-side routing
    

This ensures every page has access to:

-   Login state
    
-   JWT token
    
-   User identity
    

This mirrors how platforms like GitHub maintain session-aware routing.

----------

## Routing & Authentication Guard

Dark Grimoire uses `react-router-dom` with a global authentication guard implemented in `Routes.jsx`.

The routing layer:

-   Restores user sessions from `localStorage`
    
-   Redirects unauthenticated users to `/auth`
    
-   Prevents logged-in users from visiting login pages
    

This ensures all protected pages (dashboard, profile, repositories) are only accessible to authenticated users, mirroring GitHub-style session handling.

----------

## Authentication State Management

Dark Grimoire uses React Context (`authContext.jsx`) to manage user sessions.

The `AuthProvider`:

-   Stores the logged-in user ID
    
-   Restores sessions from `localStorage`
    
-   Exposes login state across the app
    

All components can access authentication state via `useAuth()`, enabling protected routes, user dashboards, and repository ownership checks.

----------

## Login Flow

Dark Grimoire implements a secure, GitHub-style login flow in  
`frontend/src/components/auth/Login.jsx`.

This component is responsible for authenticating users, initializing sessions, and synchronizing frontend state with the backend authentication system.

### Login Process

1.  The user enters their **email** and **password** in the login form.
    
2.  On submission, the frontend sends a request to the backend:
    

`POST /login` 

3.  The backend validates credentials and returns:
    
    -   A **JWT access token**
        
    -   The authenticated **user ID**
        
4.  The frontend stores these values in `localStorage`:
    
    -   `token`
        
    -   `userId`
        
5.  The global authentication state is updated via `AuthContext`.
    
6.  The user is redirected to the dashboard (`/`).
    

### Session Initialization

When the login page loads, it explicitly clears any existing session data:

`localStorage.removeItem("token"); localStorage.removeItem("userId");` 

This ensures a clean login flow.

----------

## Signup Flow

Dark Grimoire provides a full GitHub-style account creation flow implemented in  
`frontend/src/components/auth/Signup.jsx`.

This component allows new users to create an account and immediately enter the platform.

### Signup Process

1.  The user enters:
    
    -   Username
        
    -   Email
        
    -   Password
        
2.  On submission, the frontend sends:
    

`POST /signup` 

3.  The backend:
    
    -   Validates the input
        
    -   Hashes the password using `bcrypt`
        
    -   Creates a new user record
        
    -   Returns:
        
        -   A JWT token
            
        -   The new user ID
            
4.  The frontend stores:
    
    -   `token`
        
    -   `userId`  
        in `localStorage`.
        
5.  The global authentication context is updated using:
    

`setCurrentUser(userId);` 

----------

## Dashboard

The Dashboard (`frontend/src/components/dashboard/Dashboard.jsx`) is the main landing page of Dark Grimoire.

It functions as a GitHub-style repository hub where users can:

-   View their own repositories
    
-   Discover public repositories
    
-   Star repositories
    
-   Delete repositories
    
-   Search through their projects
    

----------

### Data Sources

On load, the Dashboard fetches three datasets from the backend:

1.  **User repositories**
    

`GET /repo/user/:userId` 

2.  **All public repositories**
    

`GET /repo/all` 

3.  **Starred repositories**
    

`GET /userProfile/:userId` 

These are used to populate:

-   “Your Repositories”
    
-   “Suggested Repositories”
    
-   Star indicators
    

----------

### Search and Filtering

The dashboard implements client-side search using `useMemo`.

Typing in the search box dynamically filters the user’s repositories by name without reloading or re-fetching data.

----------

### Star System

Users can star and unstar repositories directly from the dashboard.

When a star is toggled:

`PUT /userProfile/:userId/starred` 

This mirrors GitHub’s star system and updates:

-   The user’s star list
    
-   Star icons across the UI
    

----------

### Deleting Repositories

Users can delete repositories they own using:

`DELETE /repo/delete/:repoId` 

After deletion:

-   The repository is removed from the dashboard
    
-   It is also removed from the user’s starred list if present
    

This ensures frontend state stays consistent with the backend.

----------

### Architectural Role

The Dashboard is the primary interface between users and the platform.

It connects the authentication system, repository API, and social features (stars) into a single GitHub-style experience.

----------

## Create Repository

The repository creation page (`frontend/src/components/repo/CreateRepository.jsx`) allows users to create GitHub-style repositories from the web interface.

This page interacts with the platform backend but does not touch the Git engine directly.

### Repository Creation Flow

1.  The user enters:
    
    -   Repository name
        
    -   Description
        
    -   Visibility (public or private)
        
2.  On submit, the frontend sends:
    

`POST /repo/create` 

with:

-   Owner (current user ID)
    
-   Repository name
    
-   Description
    
-   Visibility
    
-   Empty issue and content arrays
    

3.  The backend creates a MongoDB repository record.
    
4.  The user is redirected back to the dashboard where the new repository appears.
    

### Architectural Role

This page creates the **platform-level repository entry**.

It does not create files, commits, or version history.  
Those are handled by the `.grimoire` Git engine and AWS S3.

----------

## Starred Repositories Module

The Starred Repositories component implements GitHub-style repository starring and discovery.

It allows users to:

-   View all repositories they have starred
    
-   Search through starred repositories
    
-   Remove stars in real time
    

### How it Works

1.  The user's starred repository IDs are stored in MongoDB in the `starRepos` field of the User document.
    
2.  When the page loads, the frontend fetches:
    
    -   The list of starred repository IDs
        
    -   The full repository objects for each ID
        
3.  The UI displays the full repository cards using this resolved data.
    

### Search

Searching is handled client-side by filtering the loaded repository list, allowing instant results without additional API calls.

### Star / Unstar Logic

The UI uses optimistic updates:

-   The star is removed immediately from the UI
    
-   The backend is updated asynchronously via:
    

`PUT /userProfile/:id/starred` 

This ensures both:

-   Instant responsiveness
    
-   Database consistency
    

### Architectural Role

This module represents the social discovery layer of Dark Grimoire, allowing users to curate, track, and explore repositories through stars, just like GitHub.

----------

## Navigation Bar

The Navbar component provides the primary navigation layer for Dark Grimoire.

It appears on all authenticated pages and offers direct access to:

-   The dashboard (home)
    
-   Repository creation
    
-   User profile
    

### Structure

Area

Purpose

Left

Brand identity and home navigation

Right

User actions (Create Repository, Profile)

### Routing

Navigation is handled using React Router’s `Link` component, enabling client-side navigation without full page reloads. This ensures fast transitions and preserves application state.

### Design Role

The navbar mirrors GitHub’s top bar, providing a consistent control center for repository and user workflows across the entire application.

----------

## User Profile Module

The Profile page is the identity and activity hub of Dark Grimoire.

It allows users to:

-   View their account information
    
-   See their activity history
    
-   Browse starred repositories
    
-   Log out of the platform
    

### Tabs

Tab

Purpose

Overview

Displays user identity and activity

Starred

Shows all repositories the user has starred

Tabs are switched client-side for fast UX without page reloads.

### Data Flow

On load, the profile fetches user data from:

`GET /userProfile/:id` 

This provides:

-   Username
    
-   Stars
    
-   Social data
    

The same endpoint is used by the dashboard and starred modules, ensuring a single source of truth.

### Logout

Logging out clears:

-   JWT token
    
-   User ID
    
-   Global auth state
    

and redirects the user back to the login screen.

### Architectural Role

The profile module acts as the social and identity center of Dark Grimoire, similar to GitHub’s profile page, connecting user data, repository stars, and activity in a unified interface.

----------

## Contribution Heatmap

Dark Grimoire includes a GitHub-style contribution heatmap to visualize user activity over time.

This module renders:

-   A daily activity grid
    
-   Color-coded intensity based on activity volume
    
-   A GitHub-like contribution calendar
    

### How it Works

The heatmap uses date-based activity objects in the format:

`{  "date":  "YYYY-MM-DD",  "count": number }` 

These are passed into a heatmap renderer which automatically converts them into a contribution grid.

### Color Scaling

The system dynamically generates a green color scale based on the maximum activity value, allowing darker squares to represent higher activity — exactly like GitHub.

### Architectural Role

The heatmap is a visualization layer only.  
It does not manage authentication, repositories, or commits.

In the future, it can be connected to:

-   Commit activity
    
-   Issues
    
-   Pull requests
    
-   Stars
    

to create a fully real activity graph.
