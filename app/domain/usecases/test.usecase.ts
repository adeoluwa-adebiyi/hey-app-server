import { UseCaseSpec } from "./contracts/usecasespec.interface";
import { InvalidArgumentsException } from "../../common/exceptions/invalid-arguments.exception";

export class TestUseCase implements UseCaseSpec<boolean>{
    execute({number=null}): boolean {
        if(!number)
            throw new InvalidArgumentsException("number cannot be null");
        return number===0?false:number%2===0?true:false;
    }
}