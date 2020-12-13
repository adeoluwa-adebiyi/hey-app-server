import { UserAuthId } from "../entities/user.model";

export interface UserMessageNotifierSpec{
    notifyUser(user:UserAuthId, message: any): Promise<void>;
}