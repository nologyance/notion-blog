import { Block, Paragraph, Heading1, Heading2, Heading3, Image, BulletedListItem, NumberedListItem, ToDo, Video, Code, Quote, Equation, Callout, SyncedFrom, SyncedBlock, Toggle, Embed, Bookmark, LinkPreview, Table, ColumnList } from "./interfaces"
import { buildRichText } from "./rich-text-builder"

export function buildBlock(item) {
    const block: Block = {
      Id: item.id,
      Type: item.type,
      HasChildren: item.has_children,
    }
  
    switch (item.type) {
      case 'paragraph':
        const paragraph: Paragraph = {
          RichTexts: item.paragraph.rich_text.map(buildRichText),
          Color: item.paragraph.color,
        }
  
        block.Paragraph = paragraph
        break
      case 'heading_1':
        const heading1: Heading1 = {
          RichTexts: item.heading_1.rich_text.map(buildRichText),
          Color: item.heading_1.color,
        }
  
        block.Heading1 = heading1
        break
      case 'heading_2':
        const heading2: Heading2 = {
          RichTexts: item.heading_2.rich_text.map(buildRichText),
          Color: item.heading_2.color,
        }
  
        block.Heading2 = heading2
        break
      case 'heading_3':
        const heading3: Heading3 = {
          RichTexts: item.heading_3.rich_text.map(buildRichText),
          Color: item.heading_3.color,
        }
  
        block.Heading3 = heading3
        break
      case 'bulleted_list_item':
        const bulletedListItem: BulletedListItem = {
          RichTexts: item.bulleted_list_item.rich_text.map(buildRichText),
          Color: item.bulleted_list_item.color,
        }
  
        block.BulletedListItem = bulletedListItem
        break
      case 'numbered_list_item':
        const numberedListItem: NumberedListItem = {
          RichTexts: item.numbered_list_item.rich_text.map(buildRichText),
          Color: item.numbered_list_item.color,
        }
  
        block.NumberedListItem = numberedListItem
        break
      case 'to_do':
        const toDo: ToDo = {
          RichTexts: item.to_do.rich_text.map(buildRichText),
          Checked: item.to_do.checked,
          Color: item.to_do.color,
        }
  
        block.ToDo = toDo
        break
      case 'video':
        const video: Video = {
          Type: item.video.type,
        }
  
        if (item.video.type === 'external') {
          video.External = { Url: item.video.external.url }
        }
  
        block.Video = video
        break
      case 'image':
        const image: Image = {
          Caption: item.image.caption.map(buildRichText),
          Type: item.image.type,
        }
  
        if (item.image.type === 'external') {
          image.External = { Url: item.image.external.url }
        } else {
          image.File = { Url: item.image.file.url, ExpiryTime: item.image.file.expiry_time }
        }
  
        block.Image = image
        break
      case 'code':
        const code: Code = {
          Caption: item[item.type].caption.map(buildRichText),
          Text: item[item.type].rich_text.map(buildRichText),
          Language: item.code.language,
        }
  
        block.Code = code
        break
      case 'quote':
        const quote: Quote = {
          Text: item[item.type].rich_text.map(buildRichText),
          Color: item[item.type].color,
        }
  
        block.Quote = quote
        break
      case 'equation':
        const equation: Equation = {
          Expression: item[item.type].expression,
        }
  
        block.Equation = equation
        break
      case 'callout':
        const callout: Callout = {
          RichTexts: item[item.type].rich_text.map(buildRichText),
          Icon: {
            Emoji: item[item.type].icon.emoji,
          },
          Color: item[item.type].color,
        }
  
        block.Callout = callout
        break
      case 'synced_block':
        let syncedFrom: SyncedFrom = null
        if (item[item.type].synced_from && item[item.type].synced_from.block_id) {
          syncedFrom = {
            BlockId: item[item.type].synced_from.block_id,
          }
        }
  
        const syncedBlock: SyncedBlock = {
          SyncedFrom: syncedFrom,
        }
  
        block.SyncedBlock = syncedBlock
        break
      case 'toggle':
        const toggle: Toggle = {
          RichTexts: item[item.type].rich_text.map(buildRichText),
          Color: item[item.type].color,
          Children: [],
        }
  
        block.Toggle = toggle
        break
      case 'embed':
        const embed: Embed = {
          Url: item.embed.url,
        }
  
        block.Embed = embed
        break
      case 'bookmark':
        const bookmark: Bookmark = {
          Url: item.bookmark.url,
        }
  
        block.Bookmark = bookmark
        break
      case 'link_preview':
        const linkPreview: LinkPreview = {
          Url: item.link_preview.url,
        }
  
        block.LinkPreview = linkPreview
        break
      case 'table':
        const table: Table = {
          TableWidth: item.table.table_width,
          HasColumnHeader: item.table.has_column_header,
          HasRowHeader: item.table.has_row_header,
          Rows: [],
        }
  
        block.Table = table
        break
      case 'column_list':
        const columnList: ColumnList = {
          Columns: [],
        }
  
        block.ColumnList = columnList
        break
    }
  
    return block
}
