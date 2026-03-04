import axios, { AxiosError } from "axios";
import { AuthModel } from "./model";
import prisma from "../../db";

const axiosInstance = axios.create({
    baseURL: process.env.CMU_ENTRAID_GET_TOKEN_URL as string
});
export class Auth {

    static async getAccessToken(authCode: string): Promise<string | null> {
        try {
            const tokenUrl = process.env.CMU_ENTRAID_GET_TOKEN_URL as string;
            
            // Prepare data as x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('code', authCode);
            params.append('redirect_uri', process.env.CMU_ENTRAID_REDIRECT_URL as string);
            params.append('client_id', process.env.CMU_ENTRAID_CLIENT_ID as string);
            params.append('client_secret', process.env.CMU_ENTRAID_CLIENT_SECRET as string);
            params.append('scope', process.env.SCOPE as string);
            params.append('grant_type', 'authorization_code');

            // Do NOT use the axiosInstance with baseURL here if tokenUrl is absolute.
            // Just use plain axios.post
            const response = await axios.post(
                tokenUrl,
                params, // Pass the URLSearchParams object directly
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                }
            );

            return response.data.access_token;
        }
        catch (error: any) {
            console.log("Error getting access token:");
            // Log the actual error message from Microsoft/Entra
            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
            } else {
                console.log(error.message);
            }
            return null;
        }
    }

    static async getBasicInfo(accessToken: string): Promise<AuthModel.basicUserInfoType | null> {
        try {
            const besicinfoUrl = process.env.CMU_ENTRAID_GET_BASIC_INFO as string;
            const response = await axios.get(
                besicinfoUrl,
                {
                    headers: { Authorization: "Bearer " + accessToken },
                }
            );
            return response.data ;
        } catch (err) {
            return null;
        }
    }

    static  getRole = async (cmuitaccount:string):Promise<string | null | undefined> =>{
        const userInfo = await prisma.userList.findFirst({
            where : {
                cmuitaccount:cmuitaccount
            },
            select:{
                role:true
            }
        })
        const role = userInfo?.role

        if(!role) return null
        return role;
    }

    static updateDashboard = async (user:AuthModel.basicUserInfoType)=>{
        try{
            await prisma.userList.update({
                where:{
                    cmuitaccount:user.cmuitaccount
                },
                data:{
                    fname:user.firstname_EN,
                    lname:user.lastname_EN
                }
            })
        }
        catch(error){
            throw Error("User is not in the allowed list.")
        }
    }

}