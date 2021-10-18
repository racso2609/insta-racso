import express = require("express");
import { protect } from "../authenticate";
import {
  getMyFollowers,
  getMyFollowings,
  requestFollow,
  approveRequest,
  denyRequest,
  getMyFollowingRequest,
  getMyFollowRequest,
} from "../controllers/followerController";
const router = express.Router();

router.get("/myFollowers", protect, getMyFollowers);
router.get("/myFollowings", protect, getMyFollowings);

router.get("/request-follow/:following", protect, requestFollow);

router.get("/approve-request/:requestId", protect, approveRequest);
router.get("/deny-request/:requestId", protect, denyRequest);

//TODO make unfollow and remove follower function 
router.get("/remove-follower/:userId", protect, denyRequest);
router.get("/unfollow/:userId", protect, denyRequest);

router.get("/following-request", protect, getMyFollowingRequest);
router.get("/follow-request", protect, getMyFollowRequest);

const followerRouter = router;
export default followerRouter;
