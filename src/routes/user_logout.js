const router = require('express').Router();

router.get('/', async (req, res) =>
{
    res.clearCookie("authToken").status(200).send({message:"sucessfully logedout"})
})

module.exports = router;