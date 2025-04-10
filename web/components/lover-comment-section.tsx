import { Col } from 'web/components/layout/col'
import { groupBy, orderBy } from 'lodash'
import { useLiveCommentsOnLover } from 'web/hooks/use-comments-on-lover'
import {
  LoverCommentInput,
  LoverProfileCommentThread,
} from 'web/components/lover-comments'
import { User } from 'common/user'
import { Row } from 'web/components/layout/row'
import ShortToggle from 'web/components/widgets/short-toggle'
import { useState } from 'react'
import { updateLover } from 'web/lib/api'
import { Tooltip } from 'web/components/widgets/tooltip'
import { toast } from 'react-hot-toast'
import { Subtitle } from './widgets/lover-subtitle'
import { Lover } from 'common/love/lover'

export const LoverCommentSection = (props: {
  onUser: User
  lover: Lover
  currentUser: User | null | undefined
  simpleView?: boolean
}) => {
  const { onUser, currentUser, simpleView } = props
  const comments = useLiveCommentsOnLover(onUser.id).filter((c) => !c.hidden)
  const parentComments = comments.filter((c) => !c.replyToCommentId)
  const commentsByParent = groupBy(comments, (c) => c.replyToCommentId ?? '_')
  const [lover, setLover] = useState<Lover>(props.lover)
  const isCurrentUser = currentUser?.id === onUser.id

  if (simpleView && (!lover.comments_enabled || parentComments.length == 0))
    return null

  return (
    <Col className={'mt-4 rounded py-2'}>
      <Row className={'mb-4 justify-between'}>
        <Subtitle>Endorsements</Subtitle>
        {isCurrentUser && !simpleView && (
          <Tooltip
            text={
              (lover.comments_enabled ? 'Disable' : 'Enable') +
              ' endorsements from others'
            }
          >
            <ShortToggle
              on={lover.comments_enabled}
              setOn={(on) => {
                const update = { ...lover, comments_enabled: on }
                setLover(update)
                toast.promise(
                  updateLover({
                    ...update,
                  }),
                  {
                    loading: on
                      ? 'Enabling endorsements from others'
                      : 'Disabling endorsements from others',
                    success: on
                      ? 'Endorsements enabled from others'
                      : 'Endorsements disabled from others',
                    error: 'Failed to update endorsement status',
                  }
                )
              }}
            />
          </Tooltip>
        )}
      </Row>
      {!simpleView && (
        <>
          {lover.comments_enabled && (
            <>
              <div className="mb-4">
                {isCurrentUser ? (
                  <>Other users can write endorsements of you here.</>
                ) : (
                  <>
                    If you know them, write something nice that adds to their
                    profile.
                  </>
                )}
              </div>
              {currentUser && !isCurrentUser && (
                <LoverCommentInput
                  className="mb-4 mr-px mt-px"
                  onUserId={onUser.id}
                  trackingLocation={'contract page'}
                />
              )}
            </>
          )}
          {!lover.comments_enabled &&
            (isCurrentUser ? (
              <span className={'text-ink-500 text-sm'}>
                This feature is disabled
              </span>
            ) : (
              <span className={'text-ink-500 text-sm'}>
                {onUser.name} has disabled endorsements from others.
              </span>
            ))}
        </>
      )}
      {lover.comments_enabled &&
        orderBy(parentComments, 'createdTime', 'desc').map((c) => (
          <LoverProfileCommentThread
            key={c.id + 'thread'}
            trackingLocation={onUser.name + 'comments  section'}
            threadComments={commentsByParent[c.id] ?? []}
            parentComment={c}
            onUser={onUser}
            showReplies={true}
            inTimeline={false}
          />
        ))}
    </Col>
  )
}
