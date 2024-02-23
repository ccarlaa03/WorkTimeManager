import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Bar } from 'react-chartjs-2';
import Modal from 'react-modal';
// Import other necessary components and styles

const localizer = momentLocalizer(moment);

const OwnerDashboard = () => {
  // States for profile, events, stats, etc.
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [companyStats, setCompanyStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch profile data
  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/api/owner-profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile data', error);
    }
  };

  // Function to fetch company stats
  const fetchCompanyStats = async () => {
    try {
      const response = await axios.get('/api/company-stats');
      setCompanyStats(response.data);
    } catch (error) {
      console.error('Error fetching company stats', error);
    }
  };

  // Function to fetch events data
  const fetchEventsData = async () => {
    try {
      const response = await axios.get('/api/company-events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events data', error);
    }
  };

  // useEffect to call fetch functions on component mount
  useEffect(() => {
    fetchProfileData();
    fetchCompanyStats();
    fetchEventsData();
    setIsLoading(false);
  }, []);

  // If data is still loading, display a loader
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render the dashboard
  return (
    <div className="container-dashboard">
      <h1>Owner Dashboard</h1>
      {/* Profile section, calendar, company stats, etc. */}
      {/* More JSX here for profile, stats, and other dashboard components */}
    </div>
  );
};

export default OwnerDashboard;
