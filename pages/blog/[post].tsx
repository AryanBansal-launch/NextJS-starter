// import React, { useEffect, useState } from 'react';
// import moment from 'moment';
// import parse from 'html-react-parser';
// import { getPageRes, getBlogPostRes } from '../../helper';
// import { onEntryChange } from '../../contentstack-sdk';
// import Skeleton from 'react-loading-skeleton';
// import RenderComponents from '../../components/render-components';
// import ArchiveRelative from '../../components/archive-relative';
// import { Page, BlogPosts, PageUrl } from "../../typescript/pages";

// export const revalidate = 0;
// export default function BlogPost({ blogPost, page, pageUrl }: {blogPost: BlogPosts, page: Page, pageUrl: PageUrl}) {
  
//   const [getPost, setPost] = useState({ banner: page, post: blogPost });
//   // async function fetchData() {
//   //   try {
//   //     const entryRes = await getBlogPostRes(pageUrl);
//   //     const bannerRes = await getPageRes('/blog');
//   //     if (!entryRes || !bannerRes) throw new Error('Status: ' + 404);
//   //     setPost({ banner: bannerRes, post: entryRes });
//   //   } catch (error) {
//   //     console.error(error);
//   //   }
//   // }
  

//   useEffect(() => {
//     onEntryChange(() => fetchData());
//   }, [blogPost]);

//   const { post, banner } = getPost;
//   return (
//     <>
//       {banner ? (
//         <RenderComponents
//           pageComponents={banner.page_components}
//           blogPost
//           contentTypeUid='blog_post'
//           entryUid={banner?.uid}
//           locale={banner?.locale}
//         />
//       ) : (
//         <Skeleton height={400} />
//       )}
//       <div className='blog-container'>
//         <article className='blog-detail'>
//           {post && post.title ? (
//             <h2 {...post.$?.title as {}}>{post.title}</h2>
//           ) : (
//             <h2>
//               <Skeleton />
//             </h2>
//           )}
//           {post && post.date ? (
//             <p {...post.$?.date as {}}>
//               {moment(post.date).format('ddd, MMM D YYYY')},{' '}
//               <strong {...post.author[0].$?.title as {}}>
//                 {post.author[0].title}
//               </strong>
//             </p>
//           ) : (
//             <p>
//               <Skeleton width={300} />
//             </p>
//           )}
//           {post && post.body ? (
//             <div {...post.$?.body as {}}>{parse(post.body)}</div>
//           ) : (
//             <Skeleton height={800} width={600} />
//           )}
//         </article>
//         <div className='blog-column-right'>
//           <div className='related-post'>
//             {banner && banner?.page_components[2].widget ? (
//               <h2 {...banner?.page_components[2].widget.$?.title_h2 as {}}>
//                 {banner?.page_components[2].widget.title_h2}
//               </h2>
//             ) : (
//               <h2>
//                 <Skeleton />
//               </h2>
//             )}
//             {post && post.related_post ? (
//               <ArchiveRelative
//                 {...post.$?.related_post}
//                 blogs={post.related_post}
//               />
//             ) : (
//               <Skeleton width={300} height={500} />
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
// // export async function getServerSideProps({ params }: any) {
// //   try {
// //     const page = await getPageRes('/blog');
// //     const posts = await getBlogPostRes(`/blog/${params.post}`);
// //     if (!page || !posts) throw new Error('404');

// //     return {
// //       props: {
// //         pageUrl: `/blog/${params.post}`,
// //         blogPost: posts,
// //         page,
// //       },
// //     };
// //   } catch (error) {
// //     console.error(error);
// //     return { notFound: true };
// //   }
// // }

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import parse from 'html-react-parser';
import { onEntryChange } from '../../contentstack-sdk';
import Skeleton from 'react-loading-skeleton';
import RenderComponents from '../../components/render-components';
import ArchiveRelative from '../../components/archive-relative';
import { Page, BlogPosts } from "../../typescript/pages";

// export const revalidate = 0;

export default function BlogPost({ blogPost, page, pageUrl }: {blogPost: BlogPosts, page: Page, pageUrl: string}) {
  
  const [getPost, setPost] = useState({ banner: page, post: blogPost });

  async function fetchData() {
    try {
      const res = await fetch(`/api/blogPost/${pageUrl.split('/blog/')[1]}`);
      if (!res.ok) throw new Error('Failed to fetch blog post');

      const { page, post } = await res.json();
      setPost({ banner: page, post: post });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onEntryChange(() => fetchData());
  }, [blogPost]);

  const { post, banner } = getPost;
  return (
    <>
      {banner ? (
        <RenderComponents
          pageComponents={banner.page_components}
          blogPost
          contentTypeUid='blog_post'
          entryUid={banner?.uid}
          locale={banner?.locale}
        />
      ) : (
        <Skeleton height={400} />
      )}
      <div className='blog-container'>
        <article className='blog-detail'>
          {post?.title ? <h2>{post.title}</h2> : <h2><Skeleton /></h2>}
          {post?.date ? (
            <p>{moment(post.date).format('ddd, MMM D YYYY')}, <strong>{post.author[0].title}</strong></p>
          ) : (
            <p><Skeleton width={300} /></p>
          )}
          {post?.body ? <div>{parse(post.body)}</div> : <Skeleton height={800} width={600} />}
        </article>
        <div className='blog-column-right'>
          <div className='related-post'>
            {banner?.page_components[2].widget ? (
              <h2>{banner.page_components[2].widget.title_h2}</h2>
            ) : <h2><Skeleton /></h2>}
            {post?.related_post ? <ArchiveRelative blogs={post.related_post} /> : <Skeleton width={300} height={500} />}
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }: { params: { post: string } }) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOSTED_URL}/api/blogPost/${params.post}`);
    if (!res.ok) throw new Error('Failed to fetch blog post');

    const { page, post } = await res.json();

    return {
      props: {
        pageUrl: `/blog/${params.post}`,
        blogPost: post,
        page,
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}
