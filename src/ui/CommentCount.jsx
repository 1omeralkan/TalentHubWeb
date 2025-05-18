import React, { useEffect, useState } from "react";
import { FaCommentDots } from "react-icons/fa";

const API_BASE = "http://localhost:5000/api";

const CommentCount = ({ uploadId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!uploadId) return;
    fetch(`${API_BASE}/comments/${uploadId}`)
      .then(res => res.json())
      .then(data => {
        // Yorumlar ve alt yanıtları recursive say
        function countAllComments(comments) {
          if (!Array.isArray(comments)) return 0;
          let total = 0;
          for (const comment of comments) {
            total += 1;
            if (comment.replies && comment.replies.length > 0) {
              total += countAllComments(comment.replies);
            }
          }
          return total;
        }
        setCount(countAllComments(data));
      });
  }, [uploadId]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
      <FaCommentDots style={{ color: "#6366f1", fontSize: "1.15rem" }} />
      <span style={{ fontWeight: 600, color: "#222", fontSize: "1.05rem" }}>{count}</span>
    </div>
  );
};

export default CommentCount; 