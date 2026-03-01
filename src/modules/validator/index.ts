import { Context, PreContext } from 'elysia'

type AuthContext = Context & {
    jwt: {
        verify: (token: string) => Promise<any>
    }
}

export const validateUser = async (context: Context) => {
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

    if(!profile.role){
        set.status = 401
        return{
            ok:false,
            message:"User is not unauthorized"
        }
    }
    
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
            message:"User is not unauthorized"
        }
    }
}