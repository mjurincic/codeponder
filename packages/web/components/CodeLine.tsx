import { useCallback, useContext, useEffect, useState } from "react";
import { AddComment } from "./CommentSection";
import { CommentProps, CommentBox } from "./commentUI";
import { getScrollY } from "../utils/domScrollUtils";
import { CodeFileContext } from "./CodeFileContext";

interface RenderLineProps {
  comments: CommentProps[];
  line: string;
  lineNum: number;
}

export const RenderLine: React.FC<RenderLineProps> = ({
  comments,
  line,
  lineNum,
}) => {
  const { owner } = useContext(CodeFileContext);
  const [showEditor, setShowEditor] = useState(false);
  const [commentsForRow, setCommentsForRow] = useState(comments || []);

  let preventScroll = false;
  let scrollPosition = getScrollY();
  const onEditorSubmit = ({ submitted, response, data }: any) => {
    if (submitted) {
      const { id, creator, __typename } =
        data.type == "question"
          ? response.data.createCodeReviewQuestion.codeReviewQuestion
          : response.data.createQuestionReply.questionReply;

      data.id = id;
      data.username = creator.username;
      data.isOwner = creator.username == owner;
      data.__typename = __typename;
      preventScroll = true;
      scrollPosition = getScrollY();
      setCommentsForRow([...commentsForRow, data]);
    }
    setShowEditor(false);
  };

  useEffect(
    () => {
      preventScroll = false;
    },
    [commentsForRow]
  );

  useEffect(() => {
    // prevent page scroll after submitting comment form
    const stopScroll = (event: UIEvent): void => {
      if (preventScroll) {
        event.preventDefault();
        window.scrollTo(0, scrollPosition);
      }
    };
    window.addEventListener("scroll", stopScroll);
    return () => {
      window.removeEventListener("scroll", stopScroll);
    };
  }, []);

  const onOpenEditor = useCallback(({ target: elm }: any) => {
    if (
      elm.classList.contains("btn-open-edit") ||
      elm.classList.contains("btn-reply")
    ) {
      setShowEditor(true);
    }
  }, []);

  return (
    <>
      <div
        key={lineNum}
        className="token-line"
        dangerouslySetInnerHTML={{ __html: line }}
        onClick={onOpenEditor}
      />
      {commentsForRow.map((comment, key) => {
        return <CommentBox {...{ ...comment, key, onOpenEditor }} />;
      }) || null}
      {showEditor && (
        <AddComment
          comments={commentsForRow}
          line={lineNum}
          onEditorSubmit={onEditorSubmit}
        />
      )}
    </>
  );
};