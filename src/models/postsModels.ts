import mongoose = require("mongoose");
import { postType } from "../interfaces/interfaces";
import { NextFunction } from "express";
import cloudy from "../utils/Cloudinary";
const Schema = mongoose.Schema;

const PostModel = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    file: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    postType: {
      type: String,
      enum: Object.keys(postType),
      default: postType.TEXT,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
PostModel.pre(
  "deleteMany",
  { query: true, document: false },
  async function (next: NextFunction) {
    const docs = await this.model.find(this.getFilter());
    console.log(docs);
    for (const post of docs) {
      const file = post.file;
      const resource_type = post.postType.toLowerCase();
      let imageId = file.split("/");
      imageId = imageId[imageId.length - 1].split(".")[0];
      imageId = `Post/${post.user}/${imageId}`;
      console.log(imageId, resource_type);
      await cloudy.v2.uploader.destroy(
        imageId,
        { resource_type },
        (error: Error, result) => {
          console.log(result);
          if (error) throw error;
        }
      );
    }
    next();
  }
);
PostModel.pre(
  "deleteOne",
  { query: true, document: false },
  async function (next: NextFunction) {
    console.log(this.getFilter());
    const post = await this.model.findOne(this.getFilter());
    if (!post) {
      const newError = new Error();
      newError.statusCode = 404;
      newError.message = "Object not found";
      return next(newError);
    }
    const file = post.file;
    const resource_type = post.postType.toLowerCase();
    let imageId = file.split("/");
    imageId = imageId[imageId.length - 1].split(".")[0];
    imageId = `Post/${post.user}/${imageId}`;
    console.log(imageId, resource_type);
    await cloudy.v2.uploader.destroy(
      imageId,
      { resource_type },
      (error: Error, result) => {
        console.log(result);
        if (error) throw error;
      }
    );
    next();
  }
);
const Post = mongoose.model("Post", PostModel);
export default Post;
