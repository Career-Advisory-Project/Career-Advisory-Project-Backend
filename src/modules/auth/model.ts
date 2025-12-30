import { t } from 'elysia'

export namespace AuthModel {
    export const basicUserInfo = t.Object({

        cmuitaccount_name: t.String(),
        cmuitaccount: t.String(),
        student_id: t.String().Nullable(), //somehow nullable
        prename_id: t.String(),
        prename_TH: t.String().Nullable(), //nullable
        prename_EN: t.String().Nullable(), // nullable
        firstname_TH: t.String(),
        firstname_EN: t.String(),
        lastname_TH: t.String(),
        lastname_EN: t.String(),
        organization_code: t.String(),
        organization_name_TH: t.String(),
        organization_name_EN: t.String(),
        itaccounttype_id: t.String(),
        itaccounttype_TH: t.String(),
        itaccounttype_EN: t.String()
    });
    export type basicUserInfoType = typeof basicUserInfo.static;
    export const oAuthRequest = t.Object({
        code: t.String(),
        redirect_url: t.String(),
        client_id: t.String(),
        client_secret: t.String(),
        scope: t.String(),
        grant_type: t.String(),
    });
    export type oAuthRequestType = typeof oAuthRequest.static;
}