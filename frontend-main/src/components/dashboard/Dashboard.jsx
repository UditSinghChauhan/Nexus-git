import React, { useState, useEffect } from "react";
import "./dashboard.css";
import apiClient from "../../api/client";
import Navbar from "../Navbar";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
  const userId = localStorage.getItem("userId");

  if (!userId) return;

  const fetchRepositories = async () => {
    try {
      const { data } = await apiClient.get(`/repo/user/${userId}`);
      setRepositories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error while fetching repositories:", err);
      setRepositories([]);
    }
  };

  const fetchSuggestedRepositories = async () => {
    try {
      const { data } = await apiClient.get("/repo/all");
      setSuggestedRepositories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error while fetching suggested repos:", err);
      setSuggestedRepositories([]);
    }
  };

  fetchRepositories();
  fetchSuggestedRepositories();
}, []);

  useEffect(() => {
    if (searchQuery == "") {
      setSearchResults(repositories);
    } else {
      const filteredRepo = repositories.filter((repo) =>
        repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <section id="dashboard">
        <aside>
          <h3>Suggested Repositories</h3>
          {suggestedRepositories.map((repo) => {
            return (
              <div key={repo._id}>
                <h4>{repo.name}</h4>
                <h4>{repo.description}</h4>
              </div>
            );
          })}
        </aside>
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
          {searchResults.map((repo) => {
            return (
              <div key={repo._id}>
                <h4>{repo.name}</h4>
                <h4>{repo.description}</h4>
              </div>
            );
          })}
        </main>
        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li>
              <p>Developer Meetup - Dec 25</p>
            </li>
            <li>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;
