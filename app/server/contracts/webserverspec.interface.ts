import { AuthenticationSpec } from "./authenticationspec.interface";

export interface WebServerSpec{
    close():boolean;
    listen(port: number, address:string): void;
    configure(options: any): RoutableWebServerSpec;
}

export interface RoutableWebServerSpec extends WebServerSpec{
    addRoute(path:string, routeHandler: any):RoutableWebServerSpec;
}


export interface MiddlewareConfigurable extends RoutableWebServerSpec{
    addMiddleware(middleware: any): void;
}


export interface AuthenticatedWebServerSpec<Auth> extends RoutableWebServerSpec{
    configureAuthentication(authentication: AuthenticationSpec<Auth>): AuthenticatedWebServerSpec<Auth>;
}