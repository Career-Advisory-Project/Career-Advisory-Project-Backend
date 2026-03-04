import { describe, it, expect } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../src'

const api = treaty(app)

describe('Elysia routes', () => {
    it('GET /dashboard get dashboard course for teacher', async () => {
        const testToken = "YOUR_VALID_JWT_OR_TOKEN_HERE";

        const { data, error, status } = await api.dashboard({
            cmuitaccount: "yutthakarn_sajui@cmu.ac.th"
        }).get();
        expect(error).toBeNull();
        expect(data).toEqual({
            "cmuitaccount": "yutthakarn_sajui@cmu.ac.th",
            "courses": []
        });
    });

})