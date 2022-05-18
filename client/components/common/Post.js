import pt from 'prop-types'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import Image from 'next/image'
import Link from 'next/link'
import { postsActions } from '../../redux/reducers/postsReducer'
import { uiActions } from '../../redux/reducers/uiReducer'
import { useRef, useState } from 'react'
import Avatar from './Avatar'
import IconButton from './IconButton'
import CreateCommentForm from './CreateCommentForm'
import * as api from '../../utils/api'
import Spinner from './Spinner'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import Popup from './Popup'

const Post = ({ post }) => {
  const [isLikeBtnDisabled, setIsLikeBtnDisabled] = useState(false)
  const [isRemoveLikeBtnDisabled, setIsRemoveLikeBtnDisabled] = useState(false)
  const [usersLikedCurrentPost, setUsersLikedCurrentPost] = useState([])
  const [isUsersLikedCurrentPostFetching, setIsUsersLikedCurrentPostFetching] = useState(false)
  const [isUsersLikedCurrentPostPanelHidden, setIsUsersLikedCurrentPostPanelHidden] = useState(true)
  const [isPopupHidden, setIsPopupHidden] = useState(true)

  const dispatch = useDispatch()

  const commentTextInputRef = useRef(null)
  const usersPanelLikedCurrentPostRef = useRef(null)
  const downloadLinkRef = useRef(null)
  
  useOnClickOutside(usersPanelLikedCurrentPostRef, () => {
    if (!isUsersLikedCurrentPostPanelHidden) {
      setIsUsersLikedCurrentPostPanelHidden(true)
      setUsersLikedCurrentPost([])
      setIsUsersLikedCurrentPostFetching(false)
    }
  })

  const handlers = {
    async likeBtnClick() {
      setIsLikeBtnDisabled(true)
      await dispatch(postsActions.postLiked({ postId: post._id }))
      setIsLikeBtnDisabled(false)
    },
    async removeLikeBtnClick() {
      setIsRemoveLikeBtnDisabled(true)
      await dispatch(postsActions.postLikeRemoved({ postId: post._id }))
      setIsRemoveLikeBtnDisabled(false)
    },
    async fetchCommentsBtnClick() {
      dispatch(uiActions.changedIdOfPostViewingComments(post._id))
      dispatch(uiActions.changedActiveModal('comments'))
    },
    async deletePostBtnClick() {
      dispatch(postsActions.postDeleted({ postId: post._id }))
    },
    downloadImageBtnClick() {
      downloadLinkRef.current.href = post.imageUrl
      downloadLinkRef.current.click()
    },
    commentsBtnClick() {
      commentTextInputRef.current?.focus()
    },
    numLikedMouseEnter() {
      if (isUsersLikedCurrentPostPanelHidden) {
        setIsUsersLikedCurrentPostPanelHidden(false)
        loadComments()
      }
    },
    openPopupBtnClick() {
      if (isPopupHidden) {
        setIsPopupHidden(false)
      }
    },
    loadMoreBtnClick() {
      loadComments()
    }
  }

  const loadComments = async () => {
    try {
      setIsUsersLikedCurrentPostFetching(true)

      const { data } = await api.getUsers({ postLikedId: post._id, offset: usersLikedCurrentPost.length, excludeCurrent: false })

      setUsersLikedCurrentPost([...usersLikedCurrentPost, ...data.users])
    } catch (e) {
      console.log(e)
    } finally {
      setIsUsersLikedCurrentPostFetching(false)
    }
  }

  const popupBtns = [
    { text: 'Download', onClick: handlers.downloadImageBtnClick }
  ]
  
  if (post.isCreatedByCurrentUser) {
    popupBtns.push({ text: 'Delete', onClick: handlers.deletePostBtnClick })
  }

  return <>
    <StyledWrapper>

      <StyledHeader>

        <StyledHeaderLeft>
          <StyledAvatar src={post.creator.avatarUrl} />
          <Link passHref href={`/profile/${post.creator._id}`}>
            <StyledHeaderUsername>{post.creator.username}</StyledHeaderUsername>
          </Link>
        </StyledHeaderLeft>

        <StyledPopupWrapper>
          <IconButton onClick={handlers.openPopupBtnClick}>
            more_vert
          </IconButton>
          <StyledPopup
            isHidden={isPopupHidden} 
            onClose={() => setIsPopupHidden(true)}
            btns={popupBtns}
          >
            Hello
          </StyledPopup>
        </StyledPopupWrapper>

      </StyledHeader>

      <StyledImageWrapper>
        <Image src={post.imageUrl} layout='fill' />
      </StyledImageWrapper>


      <StyledBody>

        <StyledText>
          {post.text}
        </StyledText>

        <StyledActions>

          {
            post.likedByCurrentUser ? (
              <IconButton size='md' color='light' onClick={handlers.removeLikeBtnClick} disabled={isRemoveLikeBtnDisabled}>
                favorite
              </IconButton>
            ) : (
              <IconButton size='md' color='light' onClick={handlers.likeBtnClick} disabled={isLikeBtnDisabled}>
                favorite_border
              </IconButton>
            )
          }
          <IconButton size='md' color='light' onClick={handlers.commentsBtnClick}>
            comment
          </IconButton>

        </StyledActions>

        <StyledNumLikes onMouseEnter={handlers.numLikedMouseEnter}>
          Liked by {post.numLikes} people

          {
            !isUsersLikedCurrentPostPanelHidden && (
              <StyledUsersPanelLikedCurrentPost ref={usersPanelLikedCurrentPostRef}>
                {
                  isUsersLikedCurrentPostFetching ? (
                    <StyledSpinner size='sm' color='white' />
                  ) : (
                    <StyledUsersLikedCurrentPost>
                      {
                        usersLikedCurrentPost.length >= 1 ? <>
                          {
                            usersLikedCurrentPost.map((user) => (
                              <StyledUserLikedCurrentPost key={user._id}>
                                {user.username}
                              </StyledUserLikedCurrentPost>
                            ))
                          }
                          <StyledLoadMoreCommentsBtn onClick={handlers.loadMoreBtnClick}>
                            more
                          </StyledLoadMoreCommentsBtn>
                        </> : (
                          <StyledNoCommentsInfo>
                            no comments
                          </StyledNoCommentsInfo>
                        )
                      }
                    </StyledUsersLikedCurrentPost>
                  )
                }
              </StyledUsersPanelLikedCurrentPost>
            )
          }
        </StyledNumLikes>

        <StyledOpenCommentsBtn onClick={handlers.fetchCommentsBtnClick}>
          see comments({post.numComments})
        </StyledOpenCommentsBtn>

      </StyledBody>

      <CreateCommentForm postId={post._id} />

    </StyledWrapper>

    <a ref={downloadLinkRef} download hidden />
  </>
}

Post.propTypes = {
  post: pt.object.isRequired
}

const StyledWrapper = styled.li`
  position: relative;
  border: 1px solid rgb(219,219,219);
  border-radius: 3px;
`

const StyledHeader = styled.div`
  height: 50px;
  padding: 4px;
  display: flex;
  justify-content: space-between;
  column-gap: 4px;
`

const StyledHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  column-gap: 4px;
`

const StyledAvatar = styled(Avatar)`
  width: auto;
  height: 100%;
  flex-shrink: 0;
`

const StyledHeaderUsername = styled.span`
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

const StyledPopupWrapper = styled.div`
  position: relative;
  z-index: 100;
`

const StyledPopup = styled(Popup)`
  position: absolute;
  top: 100%;
  right: 0;
`

const StyledImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
`

const StyledBody = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
`

const StyledText = styled.p`
  font-size: 18px;
`

const StyledActions = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
`

const StyledNumLikes = styled.div`
  margin-top: 5px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  align-self: start;

  &:hover {
    text-decoration: underline;
  }
`

const StyledUsersPanelLikedCurrentPost = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  font-size: 13px;
  min-width: 150px;
  padding: 5px;
`

const StyledSpinner = styled(Spinner)`

`

const StyledUsersLikedCurrentPost = styled.ul`
  dispaly: flex;
  flex-direction: column;
  align-items: center;
`

const StyledUserLikedCurrentPost = styled.li`
  color: white;
`

const StyledLoadMoreCommentsBtn = styled.button`
  margin-top: 10px;
  background-color: transparent;

  &:hover {
    text-decoration: underline;
  }
`

const StyledNoCommentsInfo = styled.div`
  
`

const StyledOpenCommentsBtn = styled.button`
  margin-top: 10px;
  color: grey;
  background-color: transparent;
  align-self: start;

  &:hover {
    text-decoration: underline;
  }
`

export default Post
