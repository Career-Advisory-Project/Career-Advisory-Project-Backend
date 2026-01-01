import axios from 'axios';

export const getCourseSections = async (params: {
  courseNo: string;
  year: number;
  semester: number;
}) => {
  const { data } = await axios.get(
    `${process.env.CPE_API_BASE_URL}/course/sections`,
    {
      headers: {
        'X-API-Key': process.env.CPE_API_KEY,
      },
      params,
    }
  );

  return data;
};
