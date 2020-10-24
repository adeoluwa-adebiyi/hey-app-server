export interface Controller<RouteType> {
    generateRoutes(): RouteType;
}