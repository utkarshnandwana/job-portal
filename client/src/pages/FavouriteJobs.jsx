import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiRequest } from '../utils/index';
import { Loading, JobCard } from '../components'; // Import loading indicator and job card components

const FavoriteJobs = () => {
  const { user } = useSelector((state) => state.user);
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const fetchFavoriteJobs = async () => {
      setIsFetching(true);
      try {
        const res = await apiRequest({
          url: `/jobs/users/${user._id}/favoriteJobs`,
          method: 'GET',
        });
        if (res.success) {
          setFavoriteJobs(res.favoriteJobs);
        }
        setIsFetching(false);
      } catch (error) {
        console.log(error);
        setIsFetching(false);
      }
    };

    if (user?._id) {
      fetchFavoriteJobs();
    }
  }, [user?._id]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-semibold my-5">Favorite Jobs</h1>
      {isFetching ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteJobs.map((job) => (
            <JobCard job={job} key={job._id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteJobs;
