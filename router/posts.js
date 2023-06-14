const express = require("express");
const router = express.Router();
const Posts = require("../schemas/post.js");
const additional = require("../other/additional.js");

// all posts GET
router.get("/posts", async (req, res) => {
  const posts = await Posts.find({});
  posts.reverse();
  res.status(200).json({ posts: posts });
});

// posts POST
router.post("/posts", async (req, res) => {
  const { user, password, title, content } = req.body;
  const createdAt = additional.makeTime();
  const postId = additional.makeId();
  if (
    postId === "" ||
    user === "" ||
    password == "" ||
    title === "" ||
    content === ""
  ) {
    return res
      .status(400)
      .json({ errorMessage: "모든 항목에 내용을 채워주세요." });
  }

  const posts = await Posts.find({ postId });
  if (posts.length) {
    return res.status(400).json({
      success: false,
      errorMessage: "이미 있는 postId입니다. 재시도 해주세요.",
    });
  }
  const createdPosts = await Posts.create({
    postId,
    user,
    password,
    title,
    content,
    createdAt,
  });
  res.json({ posts: createdPosts });
});

// posts PUT
router.put("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { password } = req.body;
  const { content } = req.body;

  if (password == "") {
    return res.status(400).json({ errorMessage: "비밀번호를 입력해주세요." });
  }

  if (content == "") {
    return res
      .status(400)
      .json({ errorMessage: "수정할 내용을 입력해주세요." });
  }

  const existsPostUpdate = await Posts.find({ postId: postId });
  if (existsPostUpdate.length > 0) {
    if (existsPostUpdate[0].password !== password) {
      return res.status(400).json({
        success: false,
        errorMessage: "패스워드가 일치하지 않습니다.",
      });
    }
    await Posts.updateOne({ postId: postId }, { $set: { content } });
  } else {
    return res.status(400).json({ errorMessage: "잘못된 접근입니다." });
  }
  res.json({ message: "게시글을 수정하였습니다." });
});

// posts DELETE
router.delete("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { password } = req.body;

  if (password == "") {
    return res.status(400).json({ errorMessage: "비밀번호를 입력해주세요." });
  }

  const existsPostDelete = await Posts.find({ postId });
  if (existsPostDelete.length > 0) {
    if (existsPostDelete[0].password !== password) {
      return res.status(400).json({
        success: false,
        errorMessage: "패스워드가 일치하지 않습니다.",
      });
    }
    await Posts.deleteOne({ postId: postId });
  } else {
    return res.status(400).json({ message: "잘못된 접근입니다." });
  }
  res.json({ message: "게시글을 삭제하였습니다." });
});

module.exports = router;
