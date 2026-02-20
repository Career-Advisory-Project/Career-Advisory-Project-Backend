import prisma from "../../db";
import { UserManagerModel } from "./model";
export class UserManager {
    private static isValidEmail(cmuitaccount: string) {
        const regex = /^[a-zA-Z0-9._%+-]+@cmu\.ac\.th$/i;
        return regex.test(cmuitaccount.trim());
    }
    public static getBySubstring = async (substr: string, role: string) => {
        try {
            const search = substr.trim();
            const users = await prisma.userList.findMany({
                where: {
                    role: role,

                    ...(search !== "" && {
                        OR: [
                            { fname: { contains: search, mode: 'insensitive' } },
                            { lname: { contains: search, mode: 'insensitive' } },
                            { cmuitaccount: { contains: search, mode: 'insensitive' } }
                        ]
                    })
                },

                orderBy: {
                    fname: 'asc'
                }
                , select: { cmuitaccount: true, fname: true, lname: true }
            });

            return users;

        } catch (error) {
            console.error("Error searching users:", error);
            throw new Error("Failed to search users.");
        }
    }

    public static getUser = async (role: string) => {
        try {
            const users = await prisma.userList.findMany({
                where: {
                    role: role,
                },
                orderBy: {
                    fname: 'asc'
                }
                , select: { cmuitaccount: true, fname: true, lname: true }
            });
            return users;

        } catch (error) {
            console.error("Error searching users:", error);
            throw new Error("Failed to search users.");
        }
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
            throw new UserManagerModel.EmailNotValidError("There are invalid email in the list", invalidEmails)
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
                console.log("Error adding user: ", error)
                throw error
            }
        }
    }
    public static removeUserFromList = async (cmuitaccount: string[]) => {
        try {
            const result = await prisma.userList.deleteMany({
                where: {
                    cmuitaccount: {
                        in: cmuitaccount
                    }
                }
            });
            return result
        }
        catch (error) {
            console.error("Database error during user deletion:", error);
            throw new Error("Failed to delete users from the database.");
        }
    }

}