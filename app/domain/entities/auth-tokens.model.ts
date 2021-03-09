import { Serializable } from "../../common/core/contracts/serializable.interface";

export interface AuthUserTokenJSON {
    accessToken: string;
    refreshToken: string;
}


export class AuthTokenModel implements Serializable<AuthUserTokenJSON>{

    accessToken: string;

    refreshToken: string;

    constructor(accessToken:string =null, refreshToken:string=null){
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    toJSON(): AuthUserTokenJSON {
        return {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken
        }
    }

    fromJSON(json: any): AuthUserTokenJSON {
        return new AuthTokenModel(json.accessToken, json.refreshToken);
    }
}