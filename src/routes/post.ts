import { Router } from "express";
import { protect } from "../authenticate";
import {
  getMyPost,
  createPost,
  deleteAllMyPosts,
  getPost,
  deletePostById,
  getPaginatedPost
} from "../controllers/postController";
import multer = require("multer");
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/Cloudinary";
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req) => {
    return {
      folder: "Post/"+req.user._id,
    };
  },
});

const upload = multer({ storage: storage });

const router = Router();

router.route('/:page/:limit')
  .get(protect,getPaginatedPost);

router
  .route("/me")
  .get(protect, getMyPost)
  .post(protect, upload.single("publication"), createPost)
  .delete(protect, deleteAllMyPosts);

router.route('/:postId')
.get(protect,getPost)
.delete(protect,deletePostById)

const postRouter = router;
export default postRouter;
