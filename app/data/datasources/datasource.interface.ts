export interface Datasource{
    getConnector(): any;
}

export interface DatabaseSpec extends Datasource{
    connect():any;
    getConnector():any;
}

export interface UrlDatabase<T> extends DatabaseSpec{
    setConnection(url:string):void;
    getConnector():T;
}

export interface CredentialDatabase<T> extends DatabaseSpec{
    setConnection(host: string, port: number, user: string, database: string, password: string):void;
    getConnector():T;
}

export interface Cache extends Datasource{

    get(resourceURI: string): any;

    set(resourceURI: string, value: any): any;
}