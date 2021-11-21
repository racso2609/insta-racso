import mongoose = require('mongoose');
const Schema = mongoose.Schema;

const likesSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            require: true,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            require: true,
        },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt',
        },
    }
);

const Like = mongoose.model('Like', likesSchema);
export default Like;
