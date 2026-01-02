import { Elysia } from 'elysia'

import { Auth } from './service'
import { AuthModel } from './model'

export const auth = new Elysia({prefix:'/auth'})
    .get(
        '/info',
        async ({ body, cookie: { session } }) =>{
            // const respond = await Auth.getBasicInfo({accessToken:"555"});
            return "This is user info"
        }
    );