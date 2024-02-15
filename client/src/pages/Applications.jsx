import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { apiRequest } from "../utils/index";
import { Loading, JobCard } from "../components";

const Applications = () => {
  const { user } = useSelector((state) => state.user);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        // console.log("User:", user);
        if (!user?._id) {
          setIsLoading(false);
          return;
        }
        
        const res = await apiRequest({
          url: `/jobs/users/${user._id}/jobs`,
          method: "GET",
        });
        // console.log("API Response:", res);
        if (res.success) {
          setApplications(res.jobs); // Assuming the jobs are under the 'jobs' key in the response
          setIsLoading(false);
        } else {
        //   console.error("Error fetching applications:", res.message);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  console.log("Applications:", applications);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold my-6">Your Applications</h1>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="w-full flex flex-wrap gap-4">
          {applications && applications.length > 0 ? (
            applications.map((application, index) => (
              <JobCard key={index} job={application} />
            ))
          ) : (
            <p className="text-gray-500">You haven't applied to any jobs yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Applications;
