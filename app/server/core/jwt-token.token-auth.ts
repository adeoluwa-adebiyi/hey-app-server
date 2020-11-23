import { TokenAuthSpec } from "../contracts/tokenauthspec.interface";
import njwt, { Jwt } from "njwt";
import { injectable } from "tsyringe";
import { claims } from "../../../test/test.data";
import jwtLib from "njwt";

@injectable()
export class JWTTokenAuthAlgorithm implements TokenAuthSpec{

    private secret: Buffer = null;

    private algorithm: string = null;

    constructor(secret?: string, algorithm:string ="HS256"){
        this.secret = Buffer.from(secret);
        this.algorithm = algorithm;
    }

    generateRefreshToken(claims: any): string {
        throw new Error("Method not implemented.");
    }

    verify(tokenObject: string, handler:any = (err:any, verifiedJWT:any)=>{}): boolean {
        try{
            const jwt = njwt.verify(tokenObject,this.secret, (err:any, verifiedJWT:any)=>{
                handler(err, verifiedJWT);
            });
        }catch(e){
            return false;
        }
    }

    generateToken(claims: any) {
        return njwt.create(claims, this.secret, this.algorithm).compact();
    }

    async decodeToken(token:any): Promise<any>{
        return jwtLib.verify(token, this.secret, this.algorithm);
    }

}