import { Elysia, t, status } from "elysia"
import { searchCourses } from "./service"

export const courseSearch = new Elysia().get(
  "/search",
  async ({ query }) => {
    const keyword = query.keyword?.trim()

    if (!keyword) {
      return status(400, { ok: false, detail: "Keyword is required for searching" })
    }

    const results = await searchCourses(keyword)

    if (results.length === 0) {
      return status(400, { ok: false, detail: "Course Not Found" })
    }

    return { ok: true, course: results }
  },
  {
    query: t.Object({
      keyword: t.Optional(t.String())
    })
  }
)