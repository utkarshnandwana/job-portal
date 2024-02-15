import express from "express";
import userAuth from "../middlewares/authMiddleware.js";
import {
  createJob,
  deleteJobPost,
  getJobById,
  getJobPosts,
  updateJob,
  applyForJob,
  getJobsAppliedByUser,
  markJobAsFavorite,
  getFavoriteJobs,
  checkUserApplication,
  removeJobFromFavorites
} from "../controllers/jobController.js";

const router = express.Router();

// POST JOB
router.post("/upload-job", userAuth, createJob);

// IPDATE JOB
router.put("/update-job/:jobId", userAuth, updateJob);

// GET JOB POST
router.get("/find-jobs", getJobPosts);
router.get("/get-job-detail/:id", getJobById);

// DELETE JOB POST
router.delete("/delete-job/:id", userAuth, deleteJobPost);

// APPLY FOR JOB 
router.post('/apply/:jobId',  applyForJob);

router.get('/users/:userId/jobs', getJobsAppliedByUser);


//  MARK JOB AS FAVOURATE
router.post('/users/:userId/favoriteJob/:jobId', markJobAsFavorite);

router.delete('/users/:userId/favoriteJob/:jobId', removeJobFromFavorites);

router.get('/users/:userId/favoriteJobs', getFavoriteJobs);

router.post('/check-user-application/:id', checkUserApplication);



export default router;
