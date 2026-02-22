import Elysia from "elysia";
import { UserManagerModel } from "./model";
import { UserManager } from "./service";
export const UserManagerRoute = new Elysia({ prefix: '/admin' })
    .get('/users', ({ query,set }) => {
        if (!query) {
            const adminUsers = UserManager.getAdminUser();
            const regularUsers = UserManager.getRegularUser();
            return {
                user: regularUsers,
                admin: adminUsers
            }
        }

        else if (query.role == 'admin') {
            const adminUsers = UserManager.getAdminUser();
            return{
                admin:adminUsers
            }
        }

        else if(query.role == 'user'){
            const regularUsers = UserManager.getRegularUser();
            return{
                user:regularUsers
            }
        }
        else{
            set.status = 400
            return "role unknown"
        }
    },
        {
            query: UserManagerModel.getUserQuery
        }
    )
    .post('/addUser', ({ body }) => {


    }, {
        body: UserManagerModel.AddUserBody
    })
    .delete('/deleteUser', ({ body }) => {


    }, {
        body: UserManagerModel.DeleteUserBody
    })