import axios from 'axios'
require('dotenv').config();

export default async (req, res) => {
  const { location, radius, categories, sort_by, offset, limit } = req.query

  try {
    const yelpRes = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: {
        'Authorization': `Bearer ${process.env.YELP_API_KEY}`,
      },
      params: {
        location,
        radius,
        categories,
        sort_by,
        offset,
        limit,
      }
    })
    return res.status(200).json({businesses: yelpRes.data.businesses, total: yelpRes.data.total})
  } catch {
    return res.status(400).json({error: 'Server error, please try again'})
  }
}
