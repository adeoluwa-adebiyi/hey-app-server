export interface UseCaseSpec<T>{
    execute(params: any):T
}