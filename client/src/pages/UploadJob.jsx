import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CustomButton,
  JobCard,
  JobTypes,
  Loading,
  TextInput,
} from "../components";
import { useSelector } from "react-redux";
import { apiRequest } from "../utils";

const UploadJob = () => {
  const { user } = useSelector((state) => state.user);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  const [errMsg, setErrMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recentPost, setRecentPost] = useState([]);
  const [languages] = useState([
    "Assamese",
    "Bengali",
    "Bodo",
    "Dogri",
    "English",
    "Gujarati",
    "Hindi",
    "Kannada",
    "Kashmiri",
  ]);

  const [jobType, setJobType] = useState("Full-Time"); // Initialize jobType state

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrMsg(null);

    const newData = { ...data, jobType: jobType }; // Adjust property name to match backend
    console.log(newData);

 try {
      const res = await apiRequest({
        url: "/jobs/upload-job", // Adjust the URL to match your backend route
        token: user?.token,
        data: newData,
        method: "POST",
      });

      if (res.status === "failed" || !res.success) {
        // Adjust the condition to match backend response structure
        setErrMsg({ status: "failed", message: res.message });
      } else {
        setErrMsg({ status: "success", message: res.message });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setErrMsg({
        status: "failed",
        message: "An error occurred while processing your request.",
      });
      setIsLoading(false);
    }
  };

  const getRecentPost = async () => {
    try {
      const res = await apiRequest({
        url: `/companies/get-company/${user._id}`,
        method: "GET",
      });
      setRecentPost(res?.data?.jobPosts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getRecentPost();
  }, []);

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-8 2xl:gap-14 bg-[#f7fdfd] px-5">
      <div className="w-full h-fit md:w-2/3 2xl:2/4 bg-white px-5 py-10 md:px-10 shadow-md">
        <div>
          <p className="text-gray-500 font-semibold text-2xl">Job Post</p>

          <form
            className="w-full mt-2 flex flex-col gap-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextInput
              name="jobTitle"
              label="Job Title"
              placeholder="eg. Software Engineer"
              type="text"
              required={true}
              register={register("jobTitle", {
                required: "Job Title is required",
              })}
              error={errors.jobTitle ? errors.jobTitle?.message : ""}
            />
            <div className="flex gap-4">
              <div className="w-1/2">
                <TextInput
                  name="deadline"
                  label="Deadline"
                  placeholder="YYYY-MM-DD"
                  type="date"
                  register={register("deadline", {
                    required: "Deadline is required",
                  })}
                  error={errors.deadline ? errors.deadline?.message : ""}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  {...register("language", {
                    required: "Language is required",
                  })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Language</option>
                  {languages.map((lang, index) => (
                    <option key={index} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
                {errors.language && (
                  <span className="text-red-600 text-sm mt-1">
                    {errors.language.message}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full flex gap-4">
              <div className={`w-1/2 mt-2`}>
                <label className="text-gray-600 text-sm mb-1">Job Type</label>
                <JobTypes jobTitle={jobType} setJobTitle={setJobType} />
              </div>

              <div className="w-1/2">
                <TextInput
                  name="salary"
                  label="Salary (USD)"
                  placeholder="eg. 1500"
                  type="number"
                  register={register("salary", {
                    required: "Salary is required",
                  })}
                  error={errors.salary ? errors.salary?.message : ""}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <TextInput
                  name="vacancies"
                  label="No. of Vacancies"
                  placeholder="vacancies"
                  type="number"
                  register={register("vacancies", {
                    required: "Vacancies is required!",
                  })}
                  error={errors.vacancies ? errors.vacancies?.message : ""}
                />
              </div>

              <div className="w-1/2">
                <TextInput
                  name="experience"
                  label="Years of Experience"
                  placeholder="experience"
                  type="number"
                  register={register("experience", {
                    required: "Experience is required",
                  })}
                  error={errors.experience ? errors.experience?.message : ""}
                />
              </div>
            </div>

            <TextInput
              name="location"
              label="Job Location"
              placeholder="eg. New York"
              type="text"
              register={register("location", {
                required: "Job Location is required",
              })}
              error={errors.location ? errors.location?.message : ""}
            />
            <div className="flex flex-col">
              <label className="text-gray-600 text-sm mb-1">
                Job Description
              </label>
              <textarea
                className="rounded border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base px-4 py-2 resize-none"
                rows={4}
                cols={6}
                {...register("desc", {
                  required: "Job Description is required!",
                })}
              ></textarea>
              {errors.desc && (
                <span role="alert" className="text-xs text-red-500 mt-0.5">
                  {errors.desc?.message}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-gray-600 text-sm mb-1">Requirements</label>
              <textarea
                className="rounded border border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-base px-4 py-2 resize-none"
                rows={4}
                cols={6}
                {...register("requirements")}
              ></textarea>
            </div>
            {errMsg && (
              <span role="alert" className="text-sm text-red-500 mt-0.5">
                {errMsg.message} {/* Render the 'message' property */}
              </span>
            )}
            <div className="mt-2">
              {isLoading ? (
                <Loading />
              ) : (
                <CustomButton
                  type="submit"
                  title="Submit"
                  containerStyles="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-8 py-2 text-sm font-medium text-white hover:bg-[#1d4fd846] hover:text-[#1d4fd8] focus:outline-none"
                />
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="w-full md:w-1/3 2xl:2/4 p-5 mt-20 md:mt-0">
        <p className="text-gray-500 font-semibold">Recent Job Posts</p>
        <div className="w-full flex flex-wrap gap-6">
          {recentPost?.slice(0, 4).map((job, index) => {
            const data = {
              name: user?.name,
              email: user?.email,
              logo: user?.profileUrl,
              ...job,
            };
            return <JobCard job={data} key={index} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default UploadJob;
