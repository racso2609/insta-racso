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
  removeFollower,
} from "../controllers/followerController";

const router = express.Router();

router.get("/myFollowers", protect, getMyFollowers);
router.get("/myFollowings", protect, getMyFollowings);

router.get("/request-follow/:following", protect, requestFollow);

router.get("/approve-request/:requestId", protect, approveRequest);
router.get("/deny-request/:requestId", protect, denyRequest);

router.get("/remove-follow/:requestId", protect, removeFollower);

router.get("/following-request", protect, getMyFollowingRequest);
router.get("/follow-request", protect, getMyFollowRequest);

const followerRouter = router;
export default followerRouter;
