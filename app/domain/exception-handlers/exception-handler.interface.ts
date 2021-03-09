import { BaseException } from "../../common/exceptions/base.exception";

export interface ExceptionHandler{
    register(e: BaseException, handler: Function):void;
    resolveMessage(e:BaseException): any;
}