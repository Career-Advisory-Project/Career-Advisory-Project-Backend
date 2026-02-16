import { Context } from 'elysia'

type AuthContext = Context & {
    jwt: {
        verify: (token: string) => Promise<any>
    }
}

export const validateUser = async (context: Context) => {
    const { jwt, cookie: { "cmu-entraid-example-token": cmuToken }, set } = context as AuthContext;

    console.log("Validator is running")

    // 1. Check if cookie exists (use ?.value to prevent crashing)
    if (!cmuToken?.value) {
        set.status = 401
        return {
            ok: false,
            message: "Unauthorized: Cookie not found"
        }
    }

    // 2. Verify the token
    const profile = await jwt.verify(cmuToken.value as string)

    if (!profile) {
        set.status = 401
        return {
            ok: false,
            message: "Unauthorized: Token signature invalid"
        }        
    }
    
}