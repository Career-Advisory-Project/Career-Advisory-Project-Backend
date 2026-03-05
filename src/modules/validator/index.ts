import { Context, PreContext } from 'elysia'
import { AuthModel } from '../auth/model'

type AuthContext = Context & {
    jwt: {
        verify: (token: string) => Promise<any>
    },
    // Tell TypeScript about the state you defined in your main app
    store: {
        auth: {
            profile: AuthModel.basicUserInfoWithRoleType // Replace 'any' with your actual Profile type if you have one!
        }
    }
}

export const validateUser = async (context: Context) => {
    const { jwt, cookie: { "cmu-entraid-example-token": cmuToken }, set,store } = context as AuthContext;


    if (!cmuToken?.value) {
        set.status = 401
        return {
            ok: false,
            message: "Unauthorized: Cookie not found"
        }
    }

    const profile = await jwt.verify(cmuToken.value as string)

    if (!profile) {
        set.status = 401
        return {
            ok: false,
            message: "Unauthorized: Token signature invalid"
        }        
    }

    if(!profile.role){
        set.status = 401
        return{
            ok:false,
            message:"Unauthorized: User cmu account is not allowed"
        }
    }
    store.auth.profile = profile
}

export const validateAdmin = async (context: Context) =>{
const { jwt, cookie: { "cmu-entraid-example-token": cmuToken }, set } = context as AuthContext;


    if (!cmuToken?.value) {
        set.status = 401
        return {
            ok: false,
            message: "Unauthorized: Cookie not found"
        }
    }

    const profile = await jwt.verify(cmuToken.value as string)

    if (!profile) {
        set.status = 401
        return {
            ok: false,
            message: "Unauthorized: Token signature invalid"
        }        
    }

    if(!profile.role || profile.role != "admin"){
        set.status = 401
        return{
            ok:false,
            message:"Unauthorized: Admin access required"
        }
    }
}