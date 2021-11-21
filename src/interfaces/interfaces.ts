import { Document, Schema } from 'mongoose';

export interface Payload {
    _id: string;
    email: string;
    role: string;
    phone: string;
    Name: string;
}

export interface FollowerInterface extends Document {
    user: Schema.Types.ObjectId;
    follower: Schema.Types.ObjectId;
    status: string;
}
export const followerStatus = {
    APPROVE: 'APPROVE',
    PENDING: 'PENDING',
};
export const userTypes = {
    USER: 'USER',
    ADMIN: 'ADMIN',
};
export const postType = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    TEXT: 'TEXT',
};

export interface userInterface extends Document {
    email: string;
    password: string;
    role: string;
    emailVerified: Boolean;
    emailVerificationCode?: string;
    passwordResetToken?: string;
    passwordResetExpires?: string;
    phone?: string;
    firstName: string;
    lastName: string;
}

export interface postInterface extends Document {
    user: Schema.Types.ObjectId;
    file?: string;
    description?: string;
    postType: string;
}

declare global {
    namespace Express {
        // tslint:disable-next-line:no-empty-interface
        interface AuthInfo {}
        // tslint:disable-next-line:no-empty-interface
        interface User extends userInterface {}
    }
}
