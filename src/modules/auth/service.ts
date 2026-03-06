import { AuthModel } from "./model";
import prisma from "../../db";

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

            const response = await fetch(tokenUrl, {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Connection': 'close' 
                }
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.log("Entra ID Error Status:", response.status);
                console.log("Entra ID Error Data:", errorData);
                return null;
            }

            const data = await response.json();
            return data.access_token;

        } catch (error: any) {
            console.log("Error getting access token:", error.message);
            return null;
        }
    }

    static async getBasicInfo(accessToken: string): Promise<AuthModel.basicUserInfoType | null> {
        try {
            const basicInfoUrl = process.env.CMU_ENTRAID_GET_BASIC_INFO as string;
            
            const response = await fetch(basicInfoUrl, {
                method: 'GET',
                headers: { 
                    'Authorization': "Bearer " + accessToken,
                    'Connection': 'close' 
                }
            });

            if (!response.ok) return null;
            
            const data = await response.json();
            return data;
        } catch (err) {
            return null;
        }
    }

    static getRole = async (cmuitaccount: string): Promise<string | null | undefined> => {
        const userInfo = await prisma.userList.findFirst({
            where: {
                cmuitaccount: cmuitaccount
            },
            select: {
                role: true
            }
        });
        
        return userInfo?.role || null;
    }

    static updateDashboard = async (user: AuthModel.basicUserInfoType) => {
        try {
            await prisma.userList.update({
                where: {
                    cmuitaccount: user.cmuitaccount
                },
                data: {
                    fname: user.firstname_EN,
                    lname: user.lastname_EN
                }
            });
        } catch (error) {
            throw Error("User is not in the allowed list.");
        }
    }
}