import { buildBlock } from './block-builder'
import * as blogIndexCache from './blog-index-cache'
import {
  Block, Column, Post, TableCell, TableRow} from './interfaces'
import { buildRichText } from './rich-text-builder'
import { DATABASE_ID, NOTION_API_SECRET } from './server-constants'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('@notionhq/client')

const client = new Client({
  auth: NOTION_API_SECRET,
})

export async function getPosts(pageSize = 10) {
  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    return allPosts.slice(0, pageSize)
  }

  const params = {
    database_id: DATABASE_ID,
    filter: _buildFilter(),
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: pageSize,
  }

  const data = await client.databases.query(params)

  return data.results
    .filter(item => _validPost(item))
    .map(item => _buildPost(item))
}

async function getPostsFromCache() {
  return blogIndexCache.get().filter(item => _validPost(item)).map(item => _buildPost(item))
}

export async function getAllPosts() {
  const params = {
    database_id: DATABASE_ID,
    filter: _buildFilter(),
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: 100,
  }
  
  let results = []
  while (true) {
    const data = await client.databases.query(params)

    results = results.concat(data.results)

    if (!data.has_more) {
      break
    }

    params['start_cursor'] = data.next_cursor
  }
  return results.filter(item => _validPost(item)).map(item => _buildPost(item))
}

export async function getRankedPosts(pageSize = 10) {
  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    return allPosts
      .filter(post => !!post.Rank)
      .sort((a, b) => {
        if (a.Rank > b.Rank) {
          return -1
        } else if (a.Rank === b.Rank) {
          return 0
        }
        return 1
      })
      .slice(0, pageSize)
  }

  const params = {
    database_id: DATABASE_ID,
    filter: _buildFilter([
      {
        property: 'Rank',
        number: {
          is_not_empty: true,
        },
      },
    ]),
    sorts: [
      {
        property: 'Rank',
        direction: 'descending',
      },
    ],
    page_size: pageSize,
  }

  const data = await client.databases.query(params)

  return data.results
    .filter(item => _validPost(item))
    .map(item => _buildPost(item))
}

export async function getPostsBefore(date: string, pageSize = 10) {
  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    return allPosts.filter(post => post.Date < date).slice(0, pageSize)
  }

  const params = {
    database_id: DATABASE_ID,
    filter: _buildFilter([
      {
        property: 'Date',
        date: {
          before: date,
        },
      },
    ]),
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: pageSize,
  }

  const data = await client.databases.query(params)

  return data.results
    .filter(item => _validPost(item))
    .map(item => _buildPost(item))
}

export async function getFirstPost() {
  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    return allPosts[allPosts.length - 1]
  }

  const params = {
    database_id: DATABASE_ID,
    filter: _buildFilter(),
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'ascending',
      },
    ],
    page_size: 1,
  }

  const data = await client.databases.query(params)

  if (!data.results.length) {
    return null
  }

  if (!_validPost(data.results[0])) {
    return null
  }

  return _buildPost(data.results[0])
}

export async function getPostBySlug(slug: string) {
  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    return allPosts.find(post => post.Slug === slug)
  }

  const data = await client.databases.query({
    database_id: DATABASE_ID,
    filter: _buildFilter([
      {
        property: 'Slug',
        rich_text: {
          equals: slug,
        },
      },
    ]),
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'ascending',
      },
    ],
  })

  if (!data.results.length) {
    return null
  }

  if (!_validPost(data.results[0])) {
    return null
  }

  return _buildPost(data.results[0])
}

export async function getPostsByTag(tag: string | undefined, pageSize = 100) {
  if (!tag) return []

  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    return allPosts.filter(post => post.Tags.includes(tag)).slice(0, pageSize)
  }

  const params = {
    database_id: DATABASE_ID,
    filter: _buildFilter([
      {
        property: 'Tags',
        multi_select: {
          contains: tag,
        },
      },
    ]),
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: pageSize,
  }

  const data = await client.databases.query(params)

  return data.results
    .filter(item => _validPost(item))
    .map(item => _buildPost(item))
}

export async function getPostsByTagBefore(
  tag: string,
  date: string,
  pageSize = 100
) {
  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    return allPosts
      .filter(post => {
        return post.Tags.includes(tag) && new Date(post.Date) < new Date(date)
      })
      .slice(0, pageSize)
  }

  const params = {
    database_id: DATABASE_ID,
    filter: _buildFilter([
      {
        property: 'Tags',
        multi_select: {
          contains: tag,
        },
      },
      {
        property: 'Date',
        date: {
          before: date,
        },
      },
    ]),
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: pageSize,
  }

  const data = await client.databases.query(params)

  return data.results
    .filter(item => _validPost(item))
    .map(item => _buildPost(item))
}

export async function getFirstPostByTag(tag: string) {
  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    const sameTagPosts = allPosts.filter(post => post.Tags.includes(tag))
    return sameTagPosts[sameTagPosts.length - 1]
  }

  const params = {
    database_id: DATABASE_ID,
    filter: _buildFilter([
      {
        property: 'Tags',
        multi_select: {
          contains: tag,
        },
      },
    ]),
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'ascending',
      },
    ],
    page_size: 1,
  }

  const data = await client.databases.query(params)

  if (!data.results.length) {
    return null
  }

  if (!_validPost(data.results[0])) {
    return null
  }

  return _buildPost(data.results[0])
}

export async function getAllBlocksByBlockId(blockId: string) {
  let allBlocks: Block[] = []

  const params = {
    block_id: blockId,
  }

  while (true) {
    const data = await client.blocks.children.list(params)

    const blocks = data.results.map(item => buildBlock(item))

    allBlocks = allBlocks.concat(blocks)

    if (!data.has_more) {
      break
    }

    params['start_cursor'] = data.next_cursor
  }

  for (let i = 0; i < allBlocks.length; i++) {
    const block = allBlocks[i]

    if (block.Type === 'table') {
      block.Table.Rows = await _getTableRows(block.Id)
    } else if (block.Type === 'column_list') {
      block.ColumnList.Columns = await _getColumns(block.Id)
    } else if (block.Type === 'bulleted_list_item' && block.HasChildren) {
      block.BulletedListItem.Children = await getAllBlocksByBlockId(block.Id)
    } else if (block.Type === 'numbered_list_item' && block.HasChildren) {
      block.NumberedListItem.Children = await getAllBlocksByBlockId(block.Id)
    } else if (block.Type === 'to_do' && block.HasChildren) {
      block.ToDo.Children = await getAllBlocksByBlockId(block.Id)
    } else if (block.Type === 'synced_block') {
      block.SyncedBlock.Children = await _getSyncedBlockChildren(block)
    } else if (block.Type === 'toggle') {
      block.Toggle.Children = await getAllBlocksByBlockId(block.Id)
    }
  }

  return allBlocks
}

async function _getTableRows(blockId: string): Promise<TableRow[]> {
  let tableRows: TableRow[] = []

  const params = {
    block_id: blockId,
  }

  while (true) {
    const data = await client.blocks.children.list(params)

    const blocks = data.results.map(item => _mapTableRow(item))

    tableRows = tableRows.concat(blocks)

    if (!data.has_more) {
      break
    }

    params['start_cursor'] = data.next_cursor
  }

  return tableRows
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _mapTableRow(item: any) {
  const tableRow: TableRow = {
    Id: item.id,
    Type: item.type,
    HasChildren: item.has_children,
    Cells: []
  }

  if (item.type === 'table_row') {
    const cells: TableCell[] = item.table_row.cells.map(cell => {
      const tableCell: TableCell = {
        RichTexts: cell.map(buildRichText),
      }

      return tableCell
    })

    tableRow.Cells = cells
  }

  return tableRow
}

async function _getColumns(blockId: string): Promise<Column[]> {
  let columns: Column[] = []

  const params = {
    block_id: blockId,
  }

  while (true) {
    const data = await client.blocks.children.list(params)

    const blocks = await Promise.all(data.results.map(async item => {
      const children = await getAllBlocksByBlockId(item.id)

      const column: Column = {
        Id: item.id,
        Type: item.type,
        HasChildren: item.has_children,
        Children: children,
      }

      return column
    }))

    columns = columns.concat(blocks)

    if (!data.has_more) {
      break
    }

    params['start_cursor'] = data.next_cursor
  }

  return columns
}

async function _getSyncedBlockChildren(block: Block): Promise<Block[]> {
  let originalBlock: Block = block
  if (block.SyncedBlock.SyncedFrom && block.SyncedBlock.SyncedFrom.BlockId) {
    originalBlock = await _getBlock(block.SyncedBlock.SyncedFrom.BlockId)
  }

  const children = await getAllBlocksByBlockId(originalBlock.Id)
  return children
}

async function _getBlock(blockId: string): Promise<Block> {
  const data = await client.blocks.retrieve({
    block_id: blockId,
  })

  return buildBlock(data)
}

export async function getAllTags() {
  if (blogIndexCache.exists()) {
    const allPosts = await getPostsFromCache()
    return [...new Set(allPosts.flatMap(post => post.Tags))].sort()
  }

  const data = await client.databases.retrieve({
    database_id: DATABASE_ID,
  })
  return data.properties.Tags.multi_select.options
    .map(option => option.name)
    .sort()
}

function _buildFilter(conditions = []) {
  if (process.env.NODE_ENV === 'development') {
    return { and: conditions }
  }

  return {
    and: _uniqueConditions(
      conditions.concat([
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: new Date().toISOString(),
          },
        },
      ])
    ),
  }
}

function _uniqueConditions(conditions = []) {
  const properties = []

  return conditions.filter(cond => {
    if (properties.includes(cond.property)) {
      return false
    }
    properties.push(cond.property)
    return true
  })
}

function _validPost(data) {
  const prop = data.properties
  return (
    prop.Page.title.length > 0 &&
    prop.Slug.rich_text.length > 0 &&
    !!prop.Date.date
  )
}

function _buildPost(data) {
  const prop = data.properties

  const post: Post = {
    PageId: data.id,
    Title: prop.Page.title[0].plain_text,
    Slug: prop.Slug.rich_text[0].plain_text,
    Date: prop.Date.date.start,
    Tags: prop.Tags.multi_select.map(opt => opt.name),
    Excerpt:
      prop.Excerpt.rich_text.length > 0
        ? prop.Excerpt.rich_text[0].plain_text
        : '',
    OGImage:
      prop.OGImage.files.length > 0 ? prop.OGImage.files[0].file.url : null,
    Rank: prop.Rank.number,
  }

  return post
}
