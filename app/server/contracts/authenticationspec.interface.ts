export interface AuthenticationSpec<T>{
    provideAuthentication(exemptedRoutes: Array<string>): T
}