import { useCallback, useEffect, useState } from "react";
import { toast } from 'react-hot-toast';

import ProfileInfo from "../components/ProfileInfo";
import Repos from "../components/Repos";
import Search from "../components/Search";
import SortRepos from "../components/SortRepos";
import Spinner from "../components/Spinner";

function HomePage() {
  const [userProfile, setUserProfile] = useState(null);  // Store user profile data
  const [repos, setRepos] = useState([]);  // Store user's repositories
  const [loading, setLoading] = useState(false);  // Loading state for data fetching
  const [sortType, setSortType] = useState("recent");  // Store current sort type

  // Fetch user profile and repos from GitHub API
  const getUserProfileAndRepos = useCallback(
    async (username = "Guna1301") => {  // Default username if none provided
      setLoading(true);  // Show loading spinner
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const { repos, userProfile } = await res.json();
  
        repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); //descending, recent first
  
        setRepos(repos);
        setUserProfile(userProfile);
  
        return { userProfile, repos };
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }, []
  );

  // Call getUserProfileAndRepos on component mount
  useEffect(() => {
    getUserProfileAndRepos();
  }, [getUserProfileAndRepos]);

  // Handle search event
  const onSearch = async (e, username) => {
    e.preventDefault();  // Prevent page refresh

    setLoading(true);  // Show loading spinner
    setRepos([]);  // Clear repos
    setUserProfile(null);  // Clear user profile

    // Fetch new profile and repos based on search
    const { userProfile, repos } = await getUserProfileAndRepos(username);

    setUserProfile(userProfile);  // Update profile state
    setRepos(repos);  // Update repos state
    setLoading(false);  // Hide loading spinner
    setSortType("recent")
  };

  // Sort repositories
  const onSort = (sortType) => {
    if (sortType === "recent") {
			repos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); //descending, recent first
		} else if (sortType === "stars") {
			repos.sort((a, b) => b.stargazers_count - a.stargazers_count); //descending, most stars first
		} else if (sortType === "forks") {
			repos.sort((a, b) => b.forks_count - a.forks_count); //descending, most forks first
		}
    setSortType(sortType);  // Update sort type
    setRepos([...repos]);  // Trigger re-render by creating a new array copy
  };

  return (
    <div className="m-4">
      <Search onSearch={onSearch} />  {/* Search component */}

      {/* Repos component */}
      {repos.length > 0 && 
        <SortRepos onSort={onSort} sortType={sortType} />
      }
        
      <div className="flex gap-4 flex-col lg:flex-row justify-center items-start">
        
        {/* Profile info */}
        {userProfile && !loading && 
          <ProfileInfo userProfile={userProfile} />
        }  

        {/* Display repos */}
        {!loading && 
          <Repos repos={repos} />
        }  

        {/* Loading spinner */}
        {loading && 
        <Spinner />
        }  

        
      </div>
    </div>
  );
}

export default HomePage;
