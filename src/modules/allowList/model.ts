import {t} from "elysia"
const roles = ['admin', 'user'];
export namespace UserManagerModel{
    export const getUserQuery = t.Nullable(t.Object({
        role: t.String(roles)
    }))

    export const AddUserBody = t.Object(
        {
            cmu_emails: t.String(),
            role: t.String(roles)
        }
    )

    export const DeleteUserBody = t.Object(
        {
            cmu_emails: t.String(),
        }
    )
}