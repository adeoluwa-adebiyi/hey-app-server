import { expect } from "chai";
import { TestUseCase } from "../app/domain/usecases/test.usecase";

describe("Tests TestUseCase", ()=>{

    const { number } = {
        number: 3
    }

    it("Should return false value for non-even numbers",()=>{
        expect(new TestUseCase().execute({number: 3})).to.equal(false);
    });
    
})