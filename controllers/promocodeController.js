
const userModel = require('../models/userSchema');
const promoCodeModel = require("../models/promocodeSchema");

// Controller function to add a promo code by a user
exports.addPromoCodeByUser = async (req, res) => {

  const { userId, promocodes } = req.body;

  try {

    let user = await userModel.findById(userId);
    if (!user)
      return { statusCode: -1, message: "no such user found!" }

    let addedPromocodes=[];
    for (const promocodeData of promocodes) {

      const { promocode, type, value, isActive, maxUses,description } = promocodeData;

      const newPromoCode = new promoCodeModel({
        promocode,
        type,
        value,
        isActive,
        maxUses,
        description,
        associatedUser:userId
      });

      const savedPromoCode = await newPromoCode.save();
      addedPromocodes=[...addedPromocodes,savedPromoCode];
      user.promocodesCreated.push(savedPromoCode);
      await user.save();
    }

    return res.json({ statusCode:200,message: "Promo code added successfully.",data:addedPromocodes});
  } catch (err) {
    console.log(err);
    return res.json({ statusCode:-1,error: "Failed to add promo code." });
  }
};

// Controller function to delete a promo code
exports.deletePromoCode = async (req, res) => {
  const { promocodeId } = req.params;

  try {
    const promoCode = await promoCodeModel.findById(promocodeId);

    if (!promoCode) {
      return res.json({ error: "Promo code not found." });
    }

    
    await promoCodeModel.findByIdAndDelete(promocodeId);

    return res.json({statusCode:200,message: "Promo code deleted successfully." });
  } catch (err) {
    return res.json({statusCode:-1,message: "Failed to delete promo code." });
  }
};

// Controller function to add or update associated tickets for a promo code
// exports.updateAssociatedTickets = async (req, res) => {
//   const { promoCodeId } = req.params;
//   const { associatedTickets } = req.body;

//   try {
//     const promoCode = await promoCodeModel.findById(promoCodeId);

//     if (!promoCode) {
//       return res.status(404).json({ error: "Promo code not found." });
//     }

//     promoCode.associatedTickets = associatedTickets;

//     await promoCode.save();

//     return res.status(200).json({ message: "Associated tickets updated successfully." });
//   } catch (err) {
//     return res.status(500).json({ error: "Failed to update associated tickets." });
//   }
// };


exports.getPromocodeByUser = async (req, res) => {
  const { userId } = req.params
  try {
    const promocodes = await promoCodeModel.find({ associatedUser: userId });

    if (promocodes) {
      return res.json({ statusCode: 200, message: "promocodes retrived", data: promocodes });
    } else {
      return  res.json({ statusCode: -1, message: "error retriving promocodes" });
    }
  } catch (error) {
    console.log(error);
    return  res.json({ statusCode: -1, message: "something went wrong please try again later!"});
  }
} 



exports.changePromocodeStatus = async(req,res)=>{

  try{
    const {id,status}=req.body;

    let promocode = await promoCodeModel.updateOne({_id:id},{isActive:status});

    if (!promocode) {
      return res.json({statusCode:-1,message: 'promocode not found,error updating promocode' });
    }
    return res.json({statusCode:200,message:"promocode updated",data:promocode});
  }catch(error){
    console.log(error);
    return res.json({statusCode:-1,message:"error updating promocode"});
  }
}

exports.getPromocodeById = async (req,res)=>{
  try{
    const {promocodeId}=req.params;
    let promocode = await promoCodeModel.find({_id:promocodeId,isActive:true});

    if (!promocode) {
      return res.json({statusCode:-1,message: 'promocode not found,error getting promocode' });
    }
    return res.json({statusCode:200,message:"promocode retrived",data:promocode});
  }catch(error){
    return res.json({statusCode:-1,message:"error getting promocode"});
  }
}