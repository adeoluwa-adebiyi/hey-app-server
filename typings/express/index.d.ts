/** Declaration file generated by dts-gen */

import { UserModel } from  "../../app/domain/entities/user.model"

declare module "express"{

    interface Request{
        user: UserModel;
    }

}

// export function config(...args: any[]): any;

// export function dotenvConfig(...args: any[]): any;

// export function env(...args: any[]): any;

