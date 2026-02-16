import { Context, PreContext } from 'elysia'

type AuthContext = Context & {
    jwt: {
        verify: (token: string) => Promise<any>
    }
}

export const validateUser = async (context: PreContext) => {
    const { jwt, cookie: { "cmu-entraid-example-token": cmuToken }, set } = context as AuthContext;

    console.log("Validator is running")

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
    
}