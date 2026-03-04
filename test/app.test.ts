import { describe, it, expect } from 'bun:test'
import { treaty } from '@elysiajs/eden'
import { app } from '../src'

// Create a typed client that talks to the *in‑process* app
const api = treaty(app)   // no URL needed, uses app.handle()

describe('Elysia routes', () => {
  it('GET /dashboard get dashboard for teacher courses', async () => {
    const { data, error } = await api.all_course.get()
    expect(error).toBeUndefined()
    expect(data).toBe(null)
  })

//   it('POST /add adds two numbers', async () => {
//     const { data } = await api.add.post({ a: 2, b: 3 })
//     expect(data).toBe(5)          // type‑checked: `data` is inferred as `number`
//   })
})