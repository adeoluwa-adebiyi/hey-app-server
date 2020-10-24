import { Controller } from "../../common/core/contracts/controller.interface";
import { UserJSON } from "../entities/user.model";

export interface AuthControllerSpec extends Controller<any>{
    registerUser(userCredentials:any):Promise<UserJSON>;
    generateUserAuthToken(username:string, password: string): string;
    refreshUserToken(refreshToken:string): string;
    generateRoutes():any;
}