import { describe, it, expect } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../src'

const api = treaty(app)

describe('Elysia routes', () => {
    it('GET /dashboard get dashboard course for teacher', async () => {
        const { data, error } = await api.dashboard({ 
            cmuitaccount: "yutthakarn_sajui@cmu.ac.th" 
        }).get();

        expect(error).toBeUndefined();
        expect(data).toBe('👋');
    });

})