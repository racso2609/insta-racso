import { Router } from "express";
import { protect } from "../authenticate";
import {
  getMyPost,
  createPost,
  deleteAllMyPosts,
} from "../controllers/postController";
import multer = require("multer");
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/Cloudinary";
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "Posts",
  },
});

const upload = multer({ storage: storage });

const router = Router();

router
  .route("/")
  .get(protect, getMyPost)
  .post(protect, upload.single("publication"), createPost)
  .delete(protect, deleteAllMyPosts);

const postRouter = router;
export default postRouter;
