import { t } from "elysia"
const roles = ['admin', 'user'];
export namespace UserManagerModel {
    export class EmailNotValidError extends Error {
        public NotValidList: string[]

        constructor(message: string, NotValidList: string[]) {
            super(message)
            this.NotValidList = NotValidList
        }
    }
    export enum Role {
        admin,
        user
    }
    export const getUserQuery = t.Object({
        role: t.String(Role),
        filter: t.Nullable(t.String())
    })

    export const AddUserBody = t.Object(
        {
            cmuitaccount: t.Array(t.String()),
            role: t.String(Role)
        }
    )

    export const DeleteUserBody = t.Object(
        {
            cmu_emails: t.String(),
        }
    )
}