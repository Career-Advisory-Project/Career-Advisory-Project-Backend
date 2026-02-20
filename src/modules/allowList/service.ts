import prisma from "../../db";
import { UserManagerModel } from "./model";
export class UserManager {
    private static isValidEmail(cmuitaccount: string) {
        const regex = /^[a-zA-Z0-9._%+-]+@cmu\.ac\.th$/i;
        return regex.test(cmuitaccount.trim());
    }
    public static getBySubstring = async (substr: string, role: string) => {

    }

    public static getUser = async (role: string) => {

    }

    public static addUserToList = async (cmuitaccount: string[], role: string) => {
        const validEmails: string[] = [];
        const invalidEmails: string[] = [];

        for (const mail of cmuitaccount) {
            if (this.isValidEmail(mail)) {
                validEmails.push(mail);
            } else {
                invalidEmails.push(mail);
            }
        }
        if (invalidEmails.length > 0) {
            throw new UserManagerModel.EmailNotValidError("There are invalid email in the list",invalidEmails)
        }
        else {
            try {
                const existingUsers = await prisma.userList.findMany({
                    where: {
                        cmuitaccount: { in: validEmails }
                    },
                    select: { cmuitaccount: true } 
                });

                const existingEmails = existingUsers.map(user => user.cmuitaccount);
                const newEmailsToInsert = validEmails.filter(email => !existingEmails.includes(email));

                if (newEmailsToInsert.length === 0) {
                    return {
                        message: "All provided users already exist in the database.",
                        totalProvided: validEmails.length,
                        actuallyAdded: 0,
                        skipped: validEmails.length
                    };
                }
                const usersToInsert = newEmailsToInsert.map((email) => ({
                    cmuitaccount: email,
                    fname: "pending",
                    lname: "",
                    role: role
                }));

                await prisma.userList.createMany({
                    data: usersToInsert,
                })
            }
            catch (error: unknown) {
                console.log(error)
                throw error
            }
        }
    }

    public static validateUserEmail = async (cmuitaccount: string) => {

    }
}