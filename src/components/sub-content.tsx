
import {
  BlogPostLink,
  BlogTagLink
} from './blog-parts'
import styles from '../styles/blog.module.css'

const Render = ({
  sameTagPosts,
  rankedPosts,
  recentPosts,
  tags,
}) => {
  return (
    <div className={styles.subContent}>
      <BlogPostLink
        heading="Posts in the same category"
        posts={sameTagPosts}
      />
      <BlogPostLink heading="Recommended" posts={rankedPosts} />
      <BlogPostLink heading="Latest posts" posts={recentPosts} />
      <BlogTagLink heading="Categories" tags={tags} />
    </div>
  )
}

export default Render
