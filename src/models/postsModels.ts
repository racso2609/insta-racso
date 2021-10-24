import mongoose = require("mongoose");
import { postType } from "../interfaces/interfaces";
import { NextFunction } from "express";
import cloudy from "../utils/Cloudinary";
const Schema = mongoose.Schema;

const PostModel = new Schema({
  user: {
    type: Schema.Types.ObjectId,
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
});
PostModel.pre("delete", function (next: NextFunction) {
  console.log('toRemove')
  let imageId = this.file.split("/");
  imageId = imageId[imageId.length - 1].split(".")[0];
  cloudy.v2.uploader.destroy(imageId, (error:Error) => {
    if (error) throw error;
  });
  next();
});
const Post = mongoose.model("Post", PostModel);
export default Post;
