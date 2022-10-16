import axios from 'axios'
import useSWR from "swr"

import {
  PostsNotFound} from '../../components/blog-parts'
import DocumentHead from '../../components/document-head'
import MainContent from '../../components/main-content'
import SubContent from '../../components/sub-content'
import { getBlogLink } from '../../lib/blog-helpers'
import {
  getAllBlocksByBlockId, getAllTags, getPostBySlug, getPosts, getPostsByTag, getAllPosts,
  getRankedPosts
} from '../../lib/notion/client'
import { Block, Post } from '../../lib/notion/interfaces'
import styles from '../../styles/blog.module.css'

export async function getStaticProps({ params: { slug } }) {
  const post = await getPostBySlug(slug)

  if (!post) {
    console.log(`Failed to find post for slug: ${slug}`)
    return {
      props: {
        redirect: '/blog',
      },
      revalidate: 30,
    }
  }

  const [
    blocks,
    rankedPosts,
    recentPosts,
    tags,
    sameTagPosts,
  ] = await Promise.all([
    getAllBlocksByBlockId(post.PageId),
    getRankedPosts(),
    getPosts(5),
    getAllTags(),
    getPostsByTag(post.Tags[0], 6),
  ])

  const fallback = {}
  fallback[slug] = blocks

  return {
    props: {
      slug,
      post,
      rankedPosts,
      recentPosts,
      tags,
      sameTagPosts: sameTagPosts.filter((p: Post) => p.Slug !== post.Slug),
      fallback,
    },
    revalidate: 60,
  }
}

export async function getStaticPaths() {
  const posts = await getAllPosts()
  return {
    paths: posts.map(post => getBlogLink(post.Slug)),
    fallback: 'blocking',
  }
}

const fetchBlocks = async (slug: string): Promise<Array<Block>> => {
  try {
    const { data: blocks } = await axios.get(`/api/blocks?slug=${slug}`)
    return blocks as Array<Block>
  } catch (error) {
    console.log(error)
  }
}

const includeExpiredImage = (blocks: Array<Block>): boolean => {
  const now = Date.now()

  return blocks.some(block => {
    if (block.Type === 'image') {
      const image = block.Image
      if (image.File && image.File.ExpiryTime && Date.parse(image.File.ExpiryTime) < now) {
        return true
      }
    }
    // TODO: looking for the image block in Children recursively
    return false
  })
}

const RenderPost = ({
  slug,
  post,
  rankedPosts = [],
  recentPosts = [],
  sameTagPosts = [],
  tags = [],
  fallback,
}) => {
  const { data: blocks, error } = useSWR(includeExpiredImage(fallback[slug]) && slug, fetchBlocks, { fallbackData: fallback[slug] })

  if (error || !blocks) {
    return <PostsNotFound />
  }

  return (
    <div className={styles.container}>
      <DocumentHead
        title={post.Title}
        description={post.Excerpt}
        urlOgImage={post.OGImage}
      />

      <MainContent
        post={post}
        blocks={blocks}
      />
      <SubContent
        sameTagPosts={sameTagPosts}
        rankedPosts={rankedPosts}
        recentPosts={recentPosts}
        tags={tags}
      />
    </div>
  )
}

export default RenderPost
