import express from "express";
var router = express.Router();

router.get("/", function (req, res, next) {
  const data = {
    data: {
      msg: "Hello World",
    },
  };

  res.json(data);
});

router.get("/:msg", (req, res) => {
  const data = {
    data: {
      msg: req.params.msg,
    },
  };

  res.json(data);
});

export default router;
