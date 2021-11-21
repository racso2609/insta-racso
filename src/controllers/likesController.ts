import { Response, Request, NextFunction } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import Like from '../models/likes';
import Post from '../models/postsModels';

export const getLikes = asyncHandler(async (req: Request, res: Response) => {
    const { _id } = req.user;

    const likes = await Like.find({ user: _id });
    res.status(200).json({
        success: true,
        state: 'success',
        likes,
    });
});
export const getLikePost = asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const likes = await Like.find({ post: postId });
    const liked =
        likes.filter((like) => like.user._id === req.user._id).length > 0;

    res.status(200).json({
        success: true,
        status: 'success',
        likes,
        liked,
    });
});

export const likePost = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = req.user;
        const { postId } = req.params;
        const existPost = await Post.findById(postId);
        if (!existPost) return next(new AppError('Post do not exist', 404));

        const existLike = await Like.findOne({ user: _id, post: postId });
        if (existLike)
            return next(new AppError('You already like this post', 400));

        const newLike = await Like.create({ user: _id, post: postId });

        res.status(200).json({
            success: true,
            status: 'success',
            like: newLike,
        });
    }
);

export const unlikePost = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { _id } = req.user;
        const { postId } = req.params;
        const existPost = await Post.findById(postId);
        if (!existPost) return next(new AppError('Post do not exist', 404));

        const existLike = await Like.findOne({ user: _id, post: postId });
        if (!existLike)
            return next(new AppError('You dont like this post', 400));

        const deletedLike = await Like.findByIdAndDelete(existLike._id);

        res.status(200).json({
            success: true,
            status: 'success',
            like: deletedLike,
        });
    }
);
