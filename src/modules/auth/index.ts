import { Elysia } from 'elysia'
import { t } from 'elysia'
import { Auth } from './service'
import jwt from '@elysiajs/jwt'

export const auth = new Elysia({ prefix: '/auth' })
    .use(
        jwt({
            name: 'jwt',
            secret: process.env.JWT_SECRET as string
        })
    )
    .post(
        '/signIn',
        async ({ jwt, body: { authorizationCode }, cookie: { "cmu-entraid-example-token": cmuToken } }) => {
            try {
                const accessToken = await Auth.getAccessToken(authorizationCode);
                if (!accessToken) throw new Error('Failed to get access token');

                const cmuBasicInfo = await Auth.getBasicInfo(accessToken);
                if (!cmuBasicInfo) throw new Error('Failed to get basic info');

                const role = await Auth.getRole(cmuBasicInfo.cmuitaccount)
                await Auth.updateDashboard(cmuBasicInfo)
                const token = await jwt.sign({
                    cmuitaccount_name: cmuBasicInfo.cmuitaccount_name,
                    cmuitaccount: cmuBasicInfo.cmuitaccount,
                    student_id: cmuBasicInfo.student_id,
                    prename_id: cmuBasicInfo.prename_id,
                    prename_TH: cmuBasicInfo.prename_TH,
                    prename_EN: cmuBasicInfo.prename_EN,
                    firstname_TH: cmuBasicInfo.firstname_TH,
                    firstname_EN: cmuBasicInfo.firstname_EN,
                    lastname_TH: cmuBasicInfo.lastname_TH,
                    lastname_EN: cmuBasicInfo.lastname_EN,
                    organization_code: cmuBasicInfo.organization_code,
                    organization_name_TH: cmuBasicInfo.organization_name_TH,
                    organization_name_EN: cmuBasicInfo.organization_name_EN,
                    itaccounttype_id: cmuBasicInfo.itaccounttype_id,
                    itaccounttype_TH: cmuBasicInfo.itaccounttype_TH,
                    itaccounttype_EN: cmuBasicInfo.itaccounttype_EN,
                    role:role
                })
                cmuToken.value = token
                cmuToken.httpOnly = true
                cmuToken.secure = process.env.NODE_ENV === 'production'
                cmuToken.sameSite = 'lax'
                cmuToken.maxAge = 3600
                cmuToken.path = '/'

                return { ok: true }
            }
            catch (error) {
                console.error(error)
                return {
                    ok: false,
                    message: error instanceof Error ? error.message : "Authentication failed"
                }
            }
        }, {
        body: t.Object({
            authorizationCode: t.String()
        })

    })
    .get('/me', async ({ jwt, cookie: { "cmu-entraid-example-token": cmuToken }, status }) => {

        if (!cmuToken.value) {
            return status(401, "Unauthorized")
        }

        const profile = await jwt.verify(cmuToken.value)

        if (!profile) {
            return status(401, "Unauthorized")
        }

        return {
            ok: true,
            user: profile
        }

    }, {
        cookie: t.Cookie({
            "cmu-entraid-example-token": t.String()
        })
    }).post('/signOut', async ({ cookie: { "cmu-entraid-example-token": cmuToken } }) => {
        await cmuToken.remove()
        return {
            ok: true
        }
    }, {
        cookie: t.Cookie({
            "cmu-entraid-example-token": t.String()
        })
    })
    ;