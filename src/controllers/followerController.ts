import { Response, Request, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Follower from "../models/followersModel";
import { followerStatus, userInterface } from "../interfaces/interfaces";
import User from "../models/userModel";
import { AppError } from "../utils/AppError";

export const getMyFollowers = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    let followers = await Follower.find({
      status: followerStatus.APPROVE,
      user: req.user._id,
    })
      .select("follower")
      .populate({
        path: "follower",
        select: "email firstName lastName role phone",
      });

    res.status(200).json({
      success: true,
      status: "success",
      followers,
    });
  }
);

export const getMyFollowings = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const followings = await Follower.find({
      follower: req.user._id,
      status: followerStatus.APPROVE,
    })
      .select("user")
      .populate({
        path: "user",
        select: "email firstName lastName role phone",
      });

    res.status(200).json({
      status: "success",
      success: true,
      followings,
    });
  }
);

export const requestFollow = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { following } = req.params;
    const followingUser: userInterface = await User.findById(following);

    if (following === req.user._id)
      return next(new AppError("You can not follow yourself!", 400));
    if (!followingUser)
      return next(new AppError("User to follow not exist!", 404));

    const existFollowRequest = await Follower.findOne({
      user: followingUser._id,
      follower: req.user._id,
    });
    if (existFollowRequest)
      return next(new AppError("Following request already exist!", 400));

    const followRequest = await Follower.create({
      user: followingUser._id,
      follower: req.user._id,
    });

    res.status(200).json({
      success: true,
      status: "success",
      followRequest,
    });
  }
);

export const approveRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const followingRequest = await Follower.findOne({
      _id: requestId,
      status: followerStatus.PENDING,
    });
    if (!followingRequest)
      return next(
        new AppError("Request not exist or user already follow you!", 404)
      );
    if (followingRequest.user.toString() !== req.user._id.toString())
      return next(new AppError("Request is not yours!", 404));

    const followRequest = await Follower.findByIdAndUpdate(
      requestId,
      {
        status: followerStatus.APPROVE,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      status: "success",
      followRequest,
    });
  }
);

export const denyRequest = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { requestId } = req.params;
    const followingRequest = await Follower.findOne({
      _id: requestId,
      status: followerStatus.PENDING,
    });
    if (!followingRequest) return next(new AppError("Request not exist!", 404));
    if (followingRequest.user.toString() !== req.user._id.toString())
      return next(new AppError("Request is not yours!", 404));

    await Follower.findByIdAndRemove(requestId);

    res.status(200).json({
      success: true,
      status: "success",
      message: "Follow request delete!",
    });
  }
);

export const getMyFollowingRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    let followingRequest = await Follower.find({
      status: followerStatus.PENDING,
      user: req.user._id,
    })
      .select("follower")
      .populate({
        path: "follower",
        select: "email firstName lastName role phone",
      });

    res.status(200).json({
      success: true,
      status: "success",
      followingRequest,
    });
  }
);

export const getMyFollowRequest = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    let followRequest = await Follower.find({
      status: followerStatus.PENDING,
      follower: req.user._id,
    })
      .select("user")
      .populate({
        path: "user",
        select: "email firstName lastName role phone",
      });

    res.status(200).json({
      success: true,
      status: "success",
      followRequest,
    });
  }
);
