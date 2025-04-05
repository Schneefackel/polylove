import { runScript } from './run-script'
import {
  renderSql,
  select,
  from,
  where,
} from '../shared/src/supabase/sql-builder'
import { type JSONContent } from '@tiptap/core'

const removeNodesOfType = (
  content: JSONContent,
  typeToRemove: string
): JSONContent | null => {
  if (content.type === typeToRemove) {
    return null
  }

  if (content.content) {
    const newContent = content.content
      .map((node) => removeNodesOfType(node, typeToRemove))
      .filter((node) => node != null)

    return { ...content, content: newContent }
  }

  // No content to process, return node as is
  return content
}

runScript(async ({ pg }) => {
  const nodeType = 'linkPreview'

  console.log('\nSearching comments for linkPreviews...')
  const commentQuery = renderSql(
    select('id, content'),
    from('lover_comments'),
    where(`jsonb_path_exists(content, '$.**.type ? (@ == "${nodeType}")')`)
  )
  const comments = await pg.manyOrNone(commentQuery)

  console.log(`Found ${comments.length} comments with linkPreviews`)

  for (const comment of comments) {
    const newContent = removeNodesOfType(comment.content, nodeType)
    console.log('before', comment.content)
    console.log('after', newContent)

    await pg.none('update lover_comments set content = $1 where id = $2', [
      newContent,
      comment.id,
    ])
    console.log('Updated comment:', comment.id)
  }

  console.log('\nSearching private messages for linkPreviews...')
  const messageQuery = renderSql(
    select('id, content'),
    from('private_user_messages'),
    where(`jsonb_path_exists(content, '$.**.type ? (@ == "${nodeType}")')`)
  )
  const messages = await pg.manyOrNone(messageQuery)

  console.log(`Found ${messages.length} messages with linkPreviews`)

  for (const msg of messages) {
    const newContent = removeNodesOfType(msg.content, nodeType)
    console.log('before', JSON.stringify(msg.content, null, 2))
    console.log('after', JSON.stringify(newContent, null, 2))

    await pg.none(
      'update private_user_messages set content = $1 where id = $2',
      [newContent, msg.id]
    )
    console.log('Updated message:', msg.id)
  }
})
