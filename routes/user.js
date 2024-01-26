const router=require("express").Router();
const userController=require("../controllers/userController");
const authMiddleware=require("../middleware/auth");

router.post("/addorganizer",authMiddleware.auth(["admin"]),userController.addOrganizer);
//router.route("/getuserbyemailandpassword").get(userController.getUserByEmailAndPassword);
router.get("/getuserbyid",authMiddleware.auth(["admin","customer","organizer"]),userController.getUserById);
router.get("/getuserbyemail",authMiddleware.auth(["admin","customer"]),userController.getUserByEmail);
router.get("/getuserbyphone",authMiddleware.auth(["admin","customer"]),userController.getUserByPhone);
router.get("/getusers",authMiddleware.auth(["admin"]),userController.getUsers);
router.delete("/deleteuserbyid/:id",authMiddleware.auth(["admin"]),userController.deleteUserById);
router.put("/updateuser/:id",authMiddleware.auth(["admin","customer","organizer"]),userController.updateUser);
router.get("/getallorganizers",authMiddleware.auth(["admin"]),userController.getAllOragnizers);
router.get("/getallusers",authMiddleware.auth(["admin"]),userController.getAllUsers);

router.patch("/deactivateuser/:id",authMiddleware.auth(["admin"]),userController.deactivateUserAccount);

router.post("/addwhatsappnumber/:whatsappnumber",userController.addWhatsappNumber);
router.get("/getallwhatsappnumber",authMiddleware.auth(["admin"]),userController.getWhatsappNumber);

module.exports=router;	 