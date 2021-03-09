import { BaseException } from "../../common/exceptions/base.exception";
import { ExceptionHandler } from "./exception-handler.interface";

export class RequestExceptionHandler implements ExceptionHandler{
    
    register(e: BaseException, handler: Function): void {
        throw new Error("Method not implemented.");
    }

    resolveMessage(e: BaseException) {
        throw new Error("Method not implemented.");
    }

}