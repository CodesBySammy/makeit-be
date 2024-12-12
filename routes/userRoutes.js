const express = require('express')
const router = express.Router()

const {registerEvent} = require('../controllers/eventRegisterController')

router.post('/register/:event',
    registerEvent
)


module.exports = router;