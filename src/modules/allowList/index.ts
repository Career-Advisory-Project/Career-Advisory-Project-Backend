import Elysia from "elysia";
import { UserManagerModel } from "./model";
import { UserManager } from "./service";
export const UserManagerRoute = new Elysia({ prefix: '/admin' })
    .get('/users', async ({ query, set }) => {
        const role = query.role.toLowerCase()
        if (role !== "admin" && role !== "user") {
            set.status = 400
            return "unknown role"
        }
        if (query.filter) {
            const filteredUser = await UserManager.getBySubstring(query.filter, role)
            return {
                user: filteredUser
            }
        }
        console.log("filter null")
        const user = await UserManager.getUser(role)
        return {
            user: user
        }
    },
        {
            query: UserManagerModel.getUserQuery
        }
    )
    .post('/addUser', async ({ body, set }) => {
        const role = body.role
        const cmuitaccount = body.cmuitaccount
        try {
            await UserManager.addUserToList(cmuitaccount, role)
            return {
                ok: true,
                message: "user added to allowed list: " + cmuitaccount
            }
        }
        catch (error: unknown) {
            if (error instanceof UserManagerModel.EmailNotValidError) {
                return {
                    ok: true,
                    message: error.message + ": " + error.NotValidList
                }
            }
            set.status = 500
            return {
                ok: false,
                message: "internal server error"
            }
        }
    }, {
        body: UserManagerModel.AddUserBody
    })
    .delete('/deleteUser', async ({ body }) => {
        const cmuitaccount = body.cmuitaccount
        try {
            const result = await UserManager.removeUserFromList(cmuitaccount)
            return {
                ok: true,
                message: "user deleded in total " + result.count + " accounts" 
            }
        }
        catch (error: unknown) {
            return{
                ok:false,
                message:"internal server error"
            }
        }

    }, {
        body: UserManagerModel.DeleteUserBody
    })