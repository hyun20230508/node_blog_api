const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comment.js");
const additional = require("../other/additional.js");

// all comment GET
router.get("/posts/comments", async (req, res) => {
  const comments = await Comments.find({});
  comments.reverse();
  res.status(200).json({ comments: comments });
});

// comment GET
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const comments = await Comments.find({ postId: postId });
  comments.reverse();
  res.status(200).json({ comments: comments });
});

// comment POST
router.post("/posts/:postId/comments", async (req, res) => {
  const { user, password, content } = req.body;
  const { postId } = req.params;
  const commentId = additional.makeId();
  const createdAt = additional.makeTime();

  if (user === "" || password == "") {
    return res
      .status(400)
      .json({ errorMessage: "이름과 비밀번호를 모두 채워주세요." });
  }

  if (content === "") {
    return res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요." });
  }

  const comments = await Comments.find({ commentId });
  if (comments.length) {
    return res.status(400).json({
      success: false,
      errorMessage: "commentId가 중복되었습니다. 재시도 해주세요.",
    });
  }
  const createdPosts = await Comments.create({
    postId,
    commentId,
    user,
    password,
    content,
    createdAt,
  });
  res.json({ posts: createdPosts });
});

// comment PUT
router.put("/posts/:postId/comments/:commentId", async (req, res) => {
  const { postId } = req.params;
  const { commentId } = req.params;
  const { password } = req.body;
  const { content } = req.body;
  if (password == "") {
    return res.status(400).json({ errorMessage: "비밀번호를 입력해주세요." });
  }

  if (content === "") {
    return res.status(400).json({ errorMessage: "댓글 내용을 입력해주세요." });
  }
  const existsCommentUpdate = await Comments.find({
    postId: postId,
    commentId: commentId,
  });
  if (existsCommentUpdate.length > 0) {
    if (existsCommentUpdate[0].password !== password) {
      return res.status(400).json({
        success: false,
        errorMessage: "패스워드가 일치하지 않습니다.",
      });
    }
    await Comments.updateOne(
      { postId: postId, commentId: commentId },
      { $set: { content } }
    );
  } else {
    return res.status(400).json({ errorMessage: "잘못된 접근입니다." });
  }
  res.json({ message: "댓글을 수정하였습니다." });
});

// comment DELETE
router.delete("/posts/:postId/comments/:commentId", async (req, res) => {
  const { postId } = req.params;
  const { commentId } = req.params;
  const { password } = req.body;
  if (password == "") {
    return res.status(400).json({ errorMessage: "비밀번호를 입력해주세요." });
  }
  const existsCommentUpdate = await Comments.find({
    postId: postId,
    commentId: commentId,
  });
  if (existsCommentUpdate.length > 0) {
    if (existsCommentUpdate[0].password !== password) {
      return res.status(400).json({
        success: false,
        errorMessage: "패스워드가 일치하지 않습니다.",
      });
    }
    await Comments.deleteOne({ postId: postId, commentId: commentId });
  } else {
    return res.status(400).json({ errorMessage: "잘못된 접근입니다." });
  }
  res.json({ message: "댓글이 삭제되었습니다." });
});

module.exports = router;
