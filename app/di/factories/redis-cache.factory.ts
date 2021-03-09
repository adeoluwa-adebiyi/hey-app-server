import { Cache } from "../../data/datasources/datasource.interface";
import { SocketUserIdSessionMap } from "../../server/core/websocket/sessions/socket-userid-session.map";

export const providesSocketUserIdSessionMapSpec = (cache: Cache, keyName: string) => {
    return new SocketUserIdSessionMap(keyName, cache);
}