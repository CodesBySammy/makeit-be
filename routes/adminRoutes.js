const express = require('express')
const router = express.Router()

const {createForm} = require('../controllers/createFormController')
const {createUrl} = require('../controllers/formUrlController')
const {excelController} = require('../controllers/excelController')
const {updateAllAttendance,updateAttendanceById} = require('../controllers/attendanceController')
const {userController,getAllUsers} = require('../controllers/userController')


router.post("/create",createForm)
router.post('/download',excelController)
router.post('/show',getAllUsers)


router.put('/attendance/:eventId',updateAllAttendance)
router.put('/attendance/:eventId/:id',updateAttendanceById)
router.put('/edit/:id',userController)


router.get("/getformurl/:eventId",createUrl)


module.exports = router;