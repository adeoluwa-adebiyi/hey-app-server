import "reflect-metadata";
import { container } from "tsyringe";
import "../app/appregistry.registry";
import { Socket } from "socket.io";


const userMessageNotifer: UserMessageNotifierSpec = container.resolve("UserMessageNotifier");


describe("Test UserMessageNotifier for functionality", ()=>{

    it("Should send ChatMessageJSON notification via websocket", ()=>{

    });

})