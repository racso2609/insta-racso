import express = require('express');
import { protect } from '../authenticate';
import {
    getLikes,
    getLikePost,
    likePost,
    unlikePost,
} from '../controllers/likesController';
const router = express.Router();

router.route('/').get(protect, getLikes);

router
    .route('/:postId')
    .get(protect, getLikePost)
    .post(protect, likePost)
    .delete(protect, unlikePost);

const likeRouter = router;
export default likeRouter;
