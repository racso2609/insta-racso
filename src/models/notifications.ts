import { Model, Schema, model } from 'mongoose';
interface IEntity {
    name: string;
    id: Schema.Types.ObjectId;
}

interface INotification {
    read?: boolean;
    from: Schema.Types.ObjectId;
    to: Schema.Types.ObjectId;
    type: string;
    entity: IEntity;
}

interface NotificationModel extends Model<INotification> {
    push(data: INotification): void;
}

const notificationSchema = new Schema<INotification, NotificationModel>({
    read: {
        type: Boolean,
        default: false,
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    type: String,
    entity: {
        name: String,
        id: Schema.Types.ObjectId,
    },
});

notificationSchema.static('push', async function ({ from, to, type, entity }) {
    await this.findOneAndDelete({ from, to, type, entity });
    return this.create({ from, to, type, entity });
});

const Notification = model<INotification, NotificationModel>(
    'Notification',
    notificationSchema
);
export default Notification;
