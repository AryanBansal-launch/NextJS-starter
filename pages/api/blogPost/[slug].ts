import type { NextApiRequest, NextApiResponse } from 'next';
import { getPageRes, getBlogPostRes } from '../../../helper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Ensure only GET requests are allowed
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    const { slug } = req.query; 

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Invalid blog post slug' });
    }

    console.log(`[API] Fetching blog post for slug: ${slug}`);
    const [page, post] = await Promise.all([
      getPageRes('/blog'),
      getBlogPostRes(`/blog/${slug}`),
    ]);

    if (!page || !post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Set caching headers for performance optimization
    // res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');

    return res.status(200).json({ page, post });
  } catch (error) {
    console.error(`[API] Error fetching blog post (slug: ${req.query.slug}):`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
