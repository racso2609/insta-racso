import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction, Response, Request } from "express";
import User  from "../models/userModel";
import { userInterface } from "../interfaces/interfaces";

export const getProfile = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user: userInterface = await User.findById(req.user._id).select(
      "firstName lastName role phone email"
    );
    res.status(200).json({
      status: "success",
      success: true,
      user,
    });
  }
);
