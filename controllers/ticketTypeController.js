const ticketTypeModel = require('../models/ticketTypeSchema');
const eventModel = require('../models/eventSchema');

// Add a new ticket type related to an event
exports.addTicketType = async (req, res) => {
  try {
    
    const { eventId,ticketTypes } = req.body;
   
    let event = await eventModel.findById(eventId);
    if (!event) {
      return res.json({statusCode:-1,message:'Event not found'});
    }
    let addedTickets=[];
    for(const ticketData of ticketTypes){
      const { ticketTitle, ticketStatus,ticketDescription,isSeasonPass,ticketPriorityNumber,totalAvailableTickets, ticketPrice, allowedPerson, ticketCurrency } = ticketData;

      // Create a new ticket type object using the data from the frontend form
      const newTicketType = new ticketTypeModel({
        ticketTitle,
        ticketDescription,
        ticketPrice,
        ticketStatus,
        isSeasonPass,
        allowedPerson,
        ticketCurrency,
        totalAvailableTickets,
        ticketPriorityNumber,
        eventForTicket: eventId // Set the eventId for each ticket type
      });

      // Save the new ticket type to the database
      let result = await newTicketType.save();
      addedTickets=[...addedTickets,result];
      // Update the event with the newly added ticket type
      event.eventAvailableTicketTypes.push(result._id);
      await event.save();
    }

    return res.json({statusCode:200,message:"ticket created for successfully!",data:addedTickets});
  } catch (error) {
    console.log(error);
    return res.json({statusCode:-1,message: 'Something went wrong,failed to add ticket type' });
  }
}

exports.getTicketsById = async(req,res)=>{
  try{
    const {ticketTypeId}=req.params;
    let result = await ticketTypeModel.findById({_id:ticketTypeId});
    res.json({statusCode:200,message:"tickets retrived successfully!",data:result});
  }catch(error){
    res.json({statusCode:-1,message:"error retriving tickets"});
  }
}

exports.getAvailableTicketsByEventId = async(req,res)=>{
  try{
    const {eventId}=req.params;

    let result = await ticketTypeModel.find({eventForTicket:eventId});
    res.json({statusCode:200,message:"tickets retrived successfully!",data:result});
  }catch(error){
    res.json({statusCode:-1,message:"error retriving tickets"});
  }
}

exports.changeTicketStatus = async(req,res)=>{

  try{
    const {id,ticketStatus}=req.body;


    let ticketType = await ticketTypeModel.updateOne({_id:id},{ticketStatus:ticketStatus});

    if (!ticketType) {
      return res.json({statusCode:-1,message: 'Ticket type not found,error updating ticket' });
    }
    return res.json({statusCode:200,message:"tiket updated",data:ticketType});
  }catch(error){
    return res.json({statusCode:-1,message:"error updating ticket"});
  }
}



// Update a ticket type related to an event
exports.updateTicketType = async (req, res) => {
  try {
    const { ticketTypeId } = req.params;
   
    const {
      ticketTitle,
        ticketDescription,
        ticketPrice,
        ticketStatus,
        isSeasonPass,
        allowedPerson,
        promoCodes,
        totalAvailableTickets,
        ticketPriorityNumber
    } = req.body;

    const ticket = await ticketTypeModel.findByIdAndUpdate(
      ticketTypeId,
      { ticketTitle,
        ticketDescription,
        ticketPrice,
        ticketStatus,
        isSeasonPass,
        allowedPerson,
        promoCodes,
        ticketPriorityNumber,
        totalAvailableTickets},
      { new: true }
    );

    if (!ticket) {
      return res.json({statusCode:-1,message: 'Ticket type not found' });
    }

    res.json({statusCode:200,message:"ticket details updated successfully",data:ticket });
  } catch (error) {
    console.log(error);
    res.json({statusCode:-1,message:"Something went wrong,failed to update ticket details"});
  }
}

// Delete a ticket type related to an event
exports.deleteTicketTypeByTicketId = async (req, res) => {
  try {
    const { ticketTypeId } = req.params;

    // Find the ticket type by its ID and delete it
    const ticket = await ticketTypeModel.findByIdAndDelete({_id:ticketTypeId});
    
    // If the ticket type is not found, return an error response
    if (!ticket) {
      return res.json({ statusCode: -1, message: 'Ticket type not found' });
    }

    // Remove the ticket type reference from the event
    let event = await eventModel.findById(ticket.eventForTicket);
    if (event) {
      //deleting from available ticket types
      event.eventAvailableTicketTypes.pull(ticket._id);
      //deleting from eventDates-->eventTicketTypes
      for (const dateObj of event.eventDates) {
        dateObj.eventTicketTypes = dateObj.eventTicketTypes.pull(ticket._id)
      }
      await event.save();
    }
    return res.json({ statusCode: 200, message: 'Ticket  deleted successfully', data: ticket });
 
  } catch (error) {
    console.log(error);
    return res.json({ statusCode: -1, message: 'Something went wrong,failed to delete ticket type' });
  }
}

