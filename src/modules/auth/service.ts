import { AuthModel } from "./model";
import { status } from "elysia";

export class Auth{
    
    static async auth({}){

    }
    
    static async getBasicInfo({accessToken}:{accessToken:string}){
        return accessToken;
    }


}