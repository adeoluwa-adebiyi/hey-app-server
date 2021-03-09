import { UserAuthId } from "../../../../../domain/entities/user.model";
import { Socket } from "socket.io";

export interface SessionMapSpec<K, V>{

    get(key:K):Promise<V>;

    set(key: K, value: V):Promise<void>;

    reset(): Promise<any>;
}




export interface UserIdSocketSessionMapSpec extends SessionMapSpec<UserAuthId, Array<string>>{}

export interface SocketUserIdSessionMapSpec extends SessionMapSpec<string, UserAuthId>{}