const router=require('express').Router();
const ticketTypeController=require('../controllers/ticketTypeController');

const authMiddleware=require("../middleware/auth");
                             
router.post("/addtickettype",authMiddleware.auth(['admin','organizer']),ticketTypeController.addTicketType);
router.put("/updateticketdata/:ticketTypeId",authMiddleware.auth(['admin','organizer']),ticketTypeController.updateTicketType);
router.get("/getticketbyid/:ticketTypeId",ticketTypeController.getTicketsById);
router.get("/getticketsbyevent/:eventId",ticketTypeController.getAvailableTicketsByEventId);
router.patch("/changeticketstatus",authMiddleware.auth(['admin','organizer']),ticketTypeController.changeTicketStatus);
router.delete("/deletetickettype/:ticketTypeId",authMiddleware.auth(['admin','organizer']),ticketTypeController.deleteTicketTypeByTicketId);
//router.put("/updateticketforpromocode",ticketTypeController.updateTicketTypeForPromocodes)

module.exports=router;