import { Request } from "express";
import { UserModel } from "../../../domain/entities/user.model";

export interface AppRequest extends Request{
    user: UserModel;
}