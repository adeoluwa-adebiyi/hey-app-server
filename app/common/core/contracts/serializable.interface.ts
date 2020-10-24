export interface Serializable<T>{
    toJSON(): any;
    fromJSON(json: any): T;
}