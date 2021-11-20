import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import Post from "../models/postsModels";
import { postType, postInterface } from "../interfaces/interfaces";
import cloudy from "../utils/Cloudinary";
require("dotenv").config();

//const deleteImageFromCloudinary = (error: Error, doc: postInterface) => {
//if (error) throw error;
//console.log(doc);
//const url = doc.file.split("/");

//let imageId = url[url.length - 1].split(".")[0];
//cloudy.v2.uploader.destroy(imageId, (errorCloud: Error) => {
//if (errorCloud) throw errorCloud;
//});
//};

const uploadFile = (file: Express.Multer.File, _next: NextFunction) => {
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

    let fileInfo: { type: string; url?: string } = { type: postType.TEXT };

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

export const getPost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { postId } = req.params;
    const deletedPost = await Post.deleteOne({ _id: postId });

    res.status(200).json({
      success: true,
      status: "success",
      deletedPost,
    });
  }
);

export const deletePostById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const post = await Post.findById(postId).select("user");

    if (!post) return next(new AppError("Post do not exist!", 404));
    if (post.user !== req.user._id)
      return next(new AppError("It is not your post!", 401));
    const result = await Post.deleteOne({ _id: postId });

    res.status(200).json({
      status: "success",
      success: true,
      result,
    });
  }
);

export const getPaginatedPost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { limit, page } = req.params;
    const intLimit = parseInt(limit);
    const intSkip = (parseInt(page) - 1) * intLimit;

    const posts = await Post.find({})
      .sort("createdAt")
      .skip(intSkip)
      .limit(intLimit)
      .populate({
        path: "user",
        select: "firstName lastName email",
      });

    res.status(200).json({
      status: "success",
      success: true,
      posts,
    });
  }
);
