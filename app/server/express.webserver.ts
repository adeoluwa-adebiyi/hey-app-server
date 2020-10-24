import { AuthenticatedWebServerSpec, MiddlewareConfigurable, RoutableWebServerSpec } from "./contracts/webserverspec.interface";
import express, {Express, RequestHandler, RequestParamHandler} from "express";
import { AuthenticationSpec } from "./contracts/authenticationspec.interface";
import { Server } from "http";
import { inject, injectable } from "tsyringe";


@injectable()
export class ExpressWebServer implements AuthenticatedWebServerSpec<RequestHandler>, MiddlewareConfigurable{

    private app: Express;
    private _options:any;
    private auth: RequestHandler = null;
    private server: Server = null;
    private exemptedRoutes: Array<string>;

    get options(): any{
        return this._options;
    }

    constructor(@inject("AuthenticationSpec<<express.RequestHandler>>") authentication: AuthenticationSpec<express.RequestHandler>, exemptedAuthRoutes: Array<string>=[]){
        this.app = express();
        this.exemptedRoutes = exemptedAuthRoutes;
        this.auth = authentication?.provideAuthentication(exemptedAuthRoutes);
    }
    addMiddleware(middleware: any): void {
        this.app.use(middleware);
    }

    configureAuthentication(authentication: AuthenticationSpec<express.RequestHandler>): AuthenticatedWebServerSpec<RequestHandler> {
        this.auth = authentication.provideAuthentication(this.exemptedRoutes);
        return this;
    }

    close(): boolean {
       this.server = this.server.close((err)=>{
           if(err){
               return false;
           }
           return true;
       });
       return true;
    }

    listen(port: number, address: string): void {
        this.server = this.app.listen(port, address);
    }

    configure(options: any): RoutableWebServerSpec {
        this._options = options;
        return this;
    }

    addRoute(path: string, routeHandler: any): RoutableWebServerSpec {
        this.app.use(path ,this.auth, routeHandler);
        return this;
    }

}