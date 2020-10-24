import { Router } from "express";
import { UserJSON } from "../../entities/user.model";
import { AuthControllerSpec } from "../auth-controller.interface";

class AuthController implements AuthControllerSpec{
    
    registerUser(userCredentials: any): Promise<UserJSON> {
        throw new Error("Method not implemented.");
    }

    generateUserAuthToken(username: string, password: string): string {
        throw new Error("Method not implemented.");
    }

    refreshUserToken(refreshToken: string): string {
        throw new Error("Method not implemented.");
    }

    generateRoutes(): Router {
        throw new Error("Method not implemented.");
    }

}