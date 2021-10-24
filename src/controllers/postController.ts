import { Request, Response, NextFunction, Express } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import Post from "../models/postsModels";
import { postType } from "../interfaces/interfaces";
require("dotenv").config();

const uploadFile = (file: Express.Multer.File, next: NextFunction) => {
  const fileType = file.mimetype.split("/")[0];
  const url = file.path;

  const typePost = !file
    ? postType.TEXT
    : fileType === "image"
    ? postType.IMAGE
    : postType.VIDEO;

  return { type: typePost, url: url };
};

export const getMyPost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { _id } = req.user;
    const myPosts = await Post.find({ user: _id });

    res.status(200).json({
      success: true,
      status: "succes",
      posts: myPosts,
    });
  }
);
export const createPost = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { _id } = req.user;
    const { description } = req.body;
    const file = req.file;

    let fileInfo: { type: string; url: string };

    if (!description && !file)
      return next(new AppError("Blank post are not allowed!", 400));

    if (file) fileInfo = uploadFile(file, next);
    const newPost = await Post.create({
      user: _id,
      description,
      file: fileInfo.url,
      postType: fileInfo.type,
    });

    res.status(201).json({
      success: true,
      status: "succes",
      post: newPost,
    });
  }
);

export const deleteAllMyPosts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const deletedPost = await Post.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      status: "success",
      deletedPost,
    });
  }
);
