import { Document,Schema } from "mongoose";

export interface Payload {
  _id: string;
  email: string;
  role: string;
  phone: string;
  Name: string;
}

export interface FollowerInterface extends Document{
  user: Schema.Types.ObjectId;
  follower: Schema.Types.ObjectId;
  status: string;
}
export const followerStatus = {
  APPROVE: "APPROVE",
  PENDING: "PENDING",
};

export interface userInterface extends Document {
  email: string;
  password: string;
  role: string;
  emailVerified: Boolean;
  emailVerificationCode?: string;
  passwordResetToken?: string ;
  passwordResetExpires?: string;
  phone?: string;
  firstName: string;
  lastName: string;
}
