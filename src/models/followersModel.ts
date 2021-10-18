import mongoose = require("mongoose");
import {followerStatus} from "../interfaces/interfaces";
const Schema = mongoose.Schema;


const followersSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  follower: {
    type: Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  status: {
    type: String,
    enum: Object.keys(followerStatus),
    default: followerStatus.PENDING,
    require: true,
  },
});

const Follower = mongoose.model("Follower", followersSchema);
export default Follower;
