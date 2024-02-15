import mongoose from "mongoose";
import Jobs from "../models/jobsModel.js";
import Companies from "../models/companiesModel.js";
import AppliedUser from "../models/appliedUser.js";
import Users from "../models/userModel.js";
import nodemailer from "nodemailer";

export const createJob = async (req, res, next) => {
  try {
    const {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      deadline,
      language,
      desc,
      requirements,
    } = req.body;

    if (
      !jobTitle ||
      !jobType ||
      !location ||
      !salary ||
      !requirements ||
      !desc
    ) {
      next("Please Provide All Required Fields");
      return;
    }

    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    // Convert deadline string to Date object
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      // Invalid date format provided
      return res.status(400).json({
        message: "Invalid deadline format. Please provide a valid date.",
      });
    }

    // Format the deadline date as dd mm yyyy
    const formattedDeadline = `${deadlineDate.getDate()} ${deadlineDate.toLocaleString(
      "default",
      { month: "short" }
    )} ${deadlineDate.getFullYear()}`;

    const jobPost = {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      deadline: deadlineDate,
      language,
      experience,
      detail: { desc, requirements },
      company: id,
    };

    const job = new Jobs(jobPost);
    await job.save();

    //update the company information with job id
    const company = await Companies.findById(id);

    company.jobPosts.push(job._id);

    const updateCompany = await Companies.findByIdAndUpdate(id, company, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Job Posted SUccessfully",
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      experience,
      deadline,
      language,
      desc,
      requirements,
    } = req.body;
    const { jobId } = req.params;

    // if (
    //   !jobTitle ||
    //   !jobType ||
    //   !location ||
    //   !salary ||
    //   !desc ||
    //   !requirements
    // ) {
    //   next("Please Provide All Required Fields");
    //   return;
    // }
    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const jobPost = {
      jobTitle,
      jobType,
      location,
      salary,
      vacancies,
      deadline,
      language,
      experience,
      detail: { desc, requirements },
      _id: jobId,
    };

    await Jobs.findByIdAndUpdate(jobId, jobPost, { new: true });

    res.status(200).json({
      success: true,
      message: "Job Post Updated SUccessfully",
      jobPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getJobPosts = async (req, res, next) => {
  try {
    const { search, sort, location, jtype, exp } = req.query;
    const types = jtype?.split(","); //full-time,part-time
    const experience = exp?.split("-"); //2-6

    let queryObject = {};

    if (location) {
      queryObject.location = { $regex: location, $options: "i" };
    }

    if (jtype) {
      queryObject.jobType = { $in: types };
    }

    //    [2. 6]

    if (exp) {
      queryObject.experience = {
        $gte: Number(experience[0]) - 1,
        $lte: Number(experience[1]) + 1,
      };
    }

    if (search) {
      const searchQuery = {
        $or: [
          { jobTitle: { $regex: search, $options: "i" } },
          { jobType: { $regex: search, $options: "i" } },
        ],
      };
      queryObject = { ...queryObject, ...searchQuery };
    }

    let queryResult = Jobs.find(queryObject).populate({
      path: "company",
      select: "-password",
    });

    // SORTING
    if (sort === "Newest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "A-Z") {
      queryResult = queryResult.sort("jobTitle");
    }
    if (sort === "Z-A") {
      queryResult = queryResult.sort("-jobTitle");
    }

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    //records count
    const totalJobs = await Jobs.countDocuments(queryResult);
    const numOfPage = Math.ceil(totalJobs / limit);

    queryResult = queryResult.limit(limit * page);

    const jobs = await queryResult;

    res.status(200).json({
      success: true,
      totalJobs,
      data: jobs,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the job by ID
    const job = await Jobs.findById(id).populate({
      path: 'company',
      select: '-password',
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job Post Not Found',
      });
    }

    // Count the number of applicants for the job
    const applicantsCount = await AppliedUser.countDocuments({ jobId: id });

    // Include the number of applicants inside the data object
    const responseData = {
      ...job.toObject(), // Convert the Mongoose document to a plain JavaScript object
      applicantsCount: applicantsCount,
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};




export const deleteJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Jobs.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      messsage: "Job Post Delted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

// Apply for a job
export const applyForJob = async (req, res) => {
  const { jobId } = req.params;
  const { userId } = req.body;

  try {
    // Fetch job details including company name
    const job = await Jobs.findById(jobId).populate("company", "name");

    // Fetch user details
    const user = await Users.findById(userId, "firstName lastName email");

    // Save applied user
    const appliedUser = new AppliedUser({
      jobId,
      userId,
      user: {
        // Pass user details
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      job: {
        // Pass job details
        _id: job._id,
        company: { _id: job.company._id, name: job.company.name },
        jobTitle: job.jobTitle,
      },
    });
    await appliedUser.save();

    // Increment the number of applicants for the job
    await Jobs.findByIdAndUpdate(jobId, { $inc: { applicantsCount: 1 } });

    // Send email notification to admin
    // Configure nodemailer transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nandwana.utkarsh2003@gmail.com", // Replace with your Gmail address
        pass: "kojc hlhu bhig mcxg", // Replace with your Gmail password or app-specific password
      },
    });

    // Configure email options
    const mailOptions = {
      from: "nandwana.utkarsh2003@gmail.com", // Replace with your Gmail address
      to: "utkarshnandwana@gmail.com", // Replace with recipient's email address
      subject: `New Job Application for ${job.jobTitle}`,
      html: `<p>A new user (${user.firstName} ${user.lastName}, ${user.email}) has applied for the job "${job.jobTitle}" at ${job.company.name} (Job ID: ${jobId}).</p>`,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res
          .status(500)
          .json({ success: false, message: "Error sending email" });
      } else {
        console.log("Email sent:", info.response);
        // Send response with applied user, company, and job details
        res
          .status(200)
          .json({
            success: true,
            message: "Job application submitted successfully",
            user,
            job,
          });
      }
    });


  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


export const getJobsAppliedByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find applied jobs for the user
    const appliedJobIds = await AppliedUser.find({ userId }).distinct('jobId');

    // Fetch job details for the applied job IDs
    const appliedJobs = await Jobs.find({ _id: { $in: appliedJobIds } });

    res.status(200).json({
      success: true,
      message: "Successfully fetched applied jobs",
      jobs: appliedJobs
    });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



export const markJobAsFavorite = async (req, res) => {
  try {
    const { userId, jobId } = req.params;
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const job = await Jobs.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    if (user.favoriteJobs.includes(jobId)) {
      user.favoriteJobs.pull(jobId);
    } else {
      user.favoriteJobs.push(jobId);
    }
    await user.save();
    res.status(200).json({ success: true, message: 'Job saved as favorite' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const removeJobFromFavorites = async (req, res) => {
  const userId = req.params.userId;
  const jobId = req.params.jobId;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const jobIndex = user.favoriteJobs.indexOf(jobId);
    if (jobIndex === -1) {
      // Job is not in favorites
      return res.status(404).json({ success: false, message: 'Job not found in favorites' });
    }

    // Remove the job from favorites
    user.favoriteJobs.splice(jobIndex, 1);
    await user.save();
    
    res.json({ success: true, message: 'Job removed from favorites' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



export const getFavoriteJobs = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Users.findById(userId).populate('favoriteJobs');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if favoriteJobs is defined and not empty
    const favoriteJobs = user.favoriteJobs || [];
    
    res.status(200).json({ success: true, favoriteJobs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};



  export const checkUserApplication = async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
  
      // Check if the user has applied for the job
      const userApplied = await AppliedUser.exists({ jobId: id, userId });
  
      // Return the result
      res.status(200).json({ success: true, data: { hasApplied: userApplied } });
    } catch (error) {
      console.error("Error checking user application:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
