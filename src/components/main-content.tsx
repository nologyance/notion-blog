
import {
  NoContents,
  PostBody,
  PostDate, PostTags,
  PostTitle
} from './blog-parts'
import SocialButtons from './social-buttons'
import { getBlogLink } from '../lib/blog-helpers'
import { NEXT_PUBLIC_URL } from '../lib/notion/server-constants'
import styles from '../styles/blog.module.css'

const RenderPost = ({
  post,
  blocks,
}) => {
  return (
    <div className={styles.mainContent}>
      <div className={styles.post}>
        <PostDate post={post} />
        <PostTags post={post} />
        <PostTitle post={post} enableLink={false} />

        <NoContents contents={blocks} />
        <PostBody blocks={blocks} />

        <footer>
          {NEXT_PUBLIC_URL && (
            <SocialButtons
              title={post.Title}
              url={new URL(
                getBlogLink(post.Slug),
                NEXT_PUBLIC_URL
              ).toString()}
              id={post.Slug}
            />
          )}
        </footer>
      </div>
    </div>
  )
}

export default RenderPost
