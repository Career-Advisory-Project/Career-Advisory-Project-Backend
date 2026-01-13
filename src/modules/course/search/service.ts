import prisma from "../../../db"

export async function searchCourses(q: string) {
  const keyword = q.trim()
  if (!keyword) return []

  const max_result = 10  // fix max shown result as 10
  const isNumeric = /^[0-9]+$/.test(keyword)
  const allowContains = keyword.length >= 3 // สำหรับหากลางคำว่ามีสิ่งที่พิมพ์ไปไหม เช่น ead 
  const lowercase = keyword.toLowerCase()

  const or: any[] = []

  if (isNumeric) {
    or.push({ courseNo: { startsWith: keyword } })
    if (allowContains) {
      or.push({ courseNo: { contains: keyword } })
    }
  }

  or.push({
    name: {
      startsWith: keyword,
      mode: "insensitive"
    }
  })

  if (allowContains) {
    or.push({
      name: {
        contains: keyword,
        mode: "insensitive"
      }
    })
  }

  const courses = await prisma.course.findMany({
    where: { OR: or },
    select: {
      courseNo: true,
      name: true,
      descTH: true,
      descENG: true
    },
    take: max_result
  })

  // ranking logic (for prioritizing results)
  // if the first three digits of courseNo or first part of name match, got highest rank
  const score = (c: any) => {
    const nameLower = c.name.toLowerCase()

    if (isNumeric && c.courseNo.startsWith(keyword)) return 0
    if (nameLower.startsWith(lowercase)) return 1
    if (allowContains && isNumeric && c.courseNo.includes(keyword)) return 2
    if (allowContains && nameLower.includes(lowercase)) return 3
    return 9
  }

  // sort from ranking first then sort from courseNo
  return courses.sort((a, b) => {
    const scoreDiff = score(a) - score(b)
    if (scoreDiff !== 0) return scoreDiff

    // same rank, sort from courseNo
    return a.courseNo.localeCompare(b.courseNo)
  })
}
