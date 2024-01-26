const eventModel = require("../models/eventSchema");
const orderModel = require("../models/orderSchema");
const mongoose = require('mongoose');
const sharp = require('sharp');
const fs = require('fs');
const Fuse = require('fuse.js');
const compression = require('compression');
const { json } = require("express");


exports.addEvents = async (req, res) => {
    let eventCardImage;
    let eventBannerImage;
    let eventVenueImage;
    let eventArtistImages;
    if (req.files['eventCardImage']) {
        eventCardImage = req.files['eventCardImage'][0].path
        fs.readFile(eventCardImage, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            sharp(data)
                .resize({ width: 300, height: 300, fit: 'fill' }) // Replace with your desired dimensions
                .toFile(eventCardImage, (resizeErr, info) => {
                    if (resizeErr) {
                        console.error(resizeErr);
                    }
                    // The event card image has been resized and saved as resizedEventCardImage
                    else {
                        // eventCardImage is the path to the resized image
                        // sharp(eventCardImage)
                        //     .toFormat('avif') // Convert to AVIF
                        //     .toFile(eventCardImage.replace(/\.\w+$/, '.avif'), (avifErr, avifInfo) => {
                        //         if (avifErr) {
                        //             console.error(avifErr);
                        //         } else {
                        //             // The image has been successfully converted to AVIF format
                        //             // ... your existing code ...
                        //         }
                        //     });
                    }

                });
        });
    }
    if (req.files['eventBannerImage']) {
        eventBannerImage = req.files['eventBannerImage'][0].path
        fs.readFile(eventBannerImage, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            sharp(data)
                .resize({ width: 900, height: 430, fit: 'fill' }) // Replace with your desired dimensions
                .toFile(eventBannerImage, (resizeErr, info) => {
                    if (resizeErr) {
                        console.error(resizeErr);
                    } else {
                        // The event card image has been resized and saved as resizedEventCardImage
                        // ... your existing code ...
                    }
                });
        });
    }
    if (req.files['eventVenueImage']) {
        eventVenueImage = req.files['eventVenueImage'][0].path
        fs.readFile(eventVenueImage, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            sharp(data)
                .resize({ width: 840, height: 270, fit: 'fill' }) // Replace with your desired dimensions
                .toFile(eventVenueImage, (resizeErr, info) => {
                    if (resizeErr) {
                        console.error(resizeErr);
                    } else {
                        // The event card image has been resized and saved as resizedEventCardImage
                        // ... your existing code ...
                    }
                });
        });
    }
    if (req.files['eventArtistImages']) {
        eventArtistImages = req.files['eventArtistImages'].map(file => file.path)
        eventArtistImages.forEach(artistImage => {
            fs.readFile(artistImage, (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }

                sharp(data)
                    .resize({ width: 800, height: 800, fit: 'fill' }) // Replace with your desired dimensions
                    .toFile(artistImage, (resizeErr, info) => {
                        if (resizeErr) {
                            console.error(resizeErr);
                        } else {
                            // The event card image has been resized and saved as resizedEventCardImage
                            // ... your existing code ...
                        }
                    });
            });

        });

    }
    //setting up artist data
    const artists = eventArtistImages?.map((eventArtistImage, index) => {
        let eventArtistNames = JSON.parse(req.body.eventArtistNames);
        if (!Array.isArray(eventArtistNames)) {
            eventArtistNames = [eventArtistNames]; // Convert to an array if it's not already
        }

        const eventArtistName = eventArtistNames[index];
        return { eventArtistImage, eventArtistName };
    });

    let eventDates = [];
    if (req.body?.eventDates != []) {
        const dates = JSON.parse(req.body.eventDates)
        for (let i = 0; i < dates.length; i++) {
            eventDates.push({
                eventDate: new Date(dates[i]),
                eventStartTime: '', // You can set default values if needed
                eventEndTime: '',
                eventTickets: []
            });
        }
    }
    const newEvent = new eventModel({

        eventImages: {
            eventCardImage: eventCardImage,
            eventBannerImage: eventBannerImage,
            eventVenueImage: eventVenueImage
        },
        eventLocation: {
            eventAddress: req.body.eventAddress,
            eventVenue: req.body.eventVenue,
            eventArea: req.body.eventArea,
            eventPincode: req.body.eventPincode,
            eventEmbeddedMapString: req.body.eventEmbeddedMapString
        },
        eventTermsAndConditions: JSON.parse(req.body.eventTermsAndConditions),
        eventTitle: req.body.eventTitle,
        eventDescription: req.body.eventDescription,
        eventCatagory: req.body.eventCatagory,
        eventAgeGroup: req.body.eventAgeGroup,
        eventOrganizerName: req.body.eventOrganizerName,
        eventCreatedBy: req.body.eventCreatedBy,
        eventYtLink: req.body.eventYtLink,
        eventSocialMediaLinks: JSON.parse(req.body.eventSocialMediaLinks),
        eventLanguages: JSON.parse(req.body.eventLanguages),
        eventOfflineSellers: JSON.parse(req.body.eventOfflineSellers),
        eventArtists: artists,
        eventDates: eventDates,
        isMultiDateEvent: req.body.isMultiDateEvent,
        isMultiDateContinous: req.body.isMultiDateContinous,
        eventLikedBy: [],
        eventLikeCount: 0,
        isFeaturedEvent: req.body.isFeaturedEvent,
        featuredEventPriority: req.body.featuredEventPriority
    })

    try {
        let result = await newEvent.save();
        res.json({ statusCode: 200, message: "Event added successfully,it will be soon listed!", data: result });

    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error, data: null });
    }

}

//to use this method make its route active from event routes
//updated fields related to featured event so this method was for making past events with updated schema.
exports.forMakingPastEventsFeatured = async () => {
    try {
        // Find all existing events
        const existingEvents = await eventModel.find().exec();

        // Loop through existing events and update them
        for (const event of existingEvents) {
            event.isFeatured = false; // Set to false by default
            event.featuredEventPriority = 0; // Set a default priority
            await event.save();
        }

        return res.json({ statusCode: 200, message: "events updated with fields successfully!" });

    } catch (error) {
        return res.json({ statusCode: -1, message: error });
    }
};

exports.fetchingDataForCustomOrder = async(req,res)=>{

    try{

        const events = await eventModel.find({
            $or: [
                { eventStatus: "approved" },
                { eventStatus: "live" }
            ]
        },{eventTitle:1,_id:1,eventDates:1}).populate('eventDates.eventTicketTypes');

        return res.json({statusCode:200,message:"success",data:events});
    }catch(error){
        console.log(error);
        return res.json({statusCode:-1,message:error});
    }
}

exports.getLowToHighEvents = async (req, res) => {

    try {

        const flag = req.params.flag;
        const events = await eventModel.find({
            $or: [
                { eventStatus: "approved" },
                { eventStatus: "live" }
            ]
        })
            .populate('eventDates.eventTicketTypes')
            .exec();
        // Calculate the smallest ticket price for each event
        let eventsWithSmallestTicketPrice = events.map(event => {
            let smallestTicketPrice = Infinity;


            event.eventDates.forEach(date => {
                date.eventTicketTypes.forEach(ticketType => {
                    if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                        smallestTicketPrice = ticketType.ticketPrice;
                    }
                });
            });
            return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
        })
        let eventsWithSortedTicketPrice;
        if (flag === 'lth') {
            // Sort the events by the lowest ticket price in descending order
            events.sort((a, b) => {
                const lowestPriceA = getLowestTicketPrice(a) == Infinity ? 0 : getLowestTicketPrice(a);
                const lowestPriceB = getLowestTicketPrice(b) == Infinity ? 0 : getLowestTicketPrice(b);
                return lowestPriceA - lowestPriceB; // Compare the lowest prices
            });
            eventsWithSortedTicketPrice = eventsWithSmallestTicketPrice.slice().sort((a, b) => a - b);
        }
        if (flag === 'htl') {
            // Sort the events by the lowest ticket price in descending order
            events.sort((a, b) => {
                const lowestPriceA = getLowestTicketPrice(a) == Infinity ? 0 : getLowestTicketPrice(a);
                const lowestPriceB = getLowestTicketPrice(b) == Infinity ? 0 : getLowestTicketPrice(b);
                return lowestPriceB - lowestPriceA; // Compare the lowest prices
            });
            eventsWithSortedTicketPrice = eventsWithSmallestTicketPrice.slice().sort((a, b) => b - a);
        }

        res.json({ statusCode: 200, message: "Events fetched by sorting!", data: events, eventsWithSortedTicketPrice: eventsWithSortedTicketPrice });
    } catch (error) {
        res.json({ statusCode: -1, message: "Error fetching sorted events data!", data: null });
    }

    // Define a function to calculate the lowest ticket price for an event
    function getLowestTicketPrice(event) {
        if (!event.eventDates || !event.eventDates.length) {
            return Infinity; // Return Infinity for events with no dates
        }

        let lowestPrice = Infinity;
        for (const date of event.eventDates) {
            for (const type of date.eventTicketTypes) {
                if (type.ticketPrice < lowestPrice) {
                    lowestPrice = type.ticketPrice;
                }
            }
        }
        return lowestPrice;
    }
}

exports.updateEvent = async (req, res) => {
 
    let eventCardImage;
    let eventBannerImage;
    let eventVenueImage;
    let eventArtistImages = [];
    if (req.files['eventCardImage']) {
        eventCardImage = req.files['eventCardImage'][0].path
        fs.readFile(eventCardImage, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            sharp(data)
                .resize({ width: 300, height: 300, fit: 'fill' }) // Replace with your desired dimensions
                .toFile(eventCardImage, (resizeErr, info) => {
                    if (resizeErr) {
                        console.error(resizeErr);
                    } else {
                        // The event card image has been resized and saved as resizedEventCardImage
                        // ... your existing code ...
                    }
                });
        });
    } else {
        eventCardImage = req.body.eventCardImage
    }
    if (req.files['eventBannerImage']) {
        eventBannerImage = req.files['eventBannerImage'][0].path
        fs.readFile(eventBannerImage, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            sharp(data)
                .resize({ width: 900, height: 430, fit: 'fill' }) // Replace with your desired dimensions
                .toFile(eventBannerImage, (resizeErr, info) => {
                    if (resizeErr) {
                        console.error(resizeErr);
                    } else {
                        // The event card image has been resized and saved as resizedEventCardImage
                        // ... your existing code ...
                    }
                });
        });
    } else {
        eventBannerImage = req.body.eventBannerImage
    }
    if (req.files['eventVenueImage']) {
        eventVenueImage = req.files['eventVenueImage'][0].path
        fs.readFile(eventVenueImage, (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            sharp(data)
                .resize({ width: 840, height: 270, fit: 'fill' }) // Replace with your desired dimensions
                .toFile(eventVenueImage, (resizeErr, info) => {
                    if (resizeErr) {
                        console.error(resizeErr);
                    } else {
                        // The event card image has been resized and saved as resizedEventCardImage
                        // ... your existing code ...
                    }
                });
        });
    } else {
        eventVenueImage = req.body.eventVenueImage || ""
    }

    if (req.files['eventArtistImages']) {
        eventArtistImages = req.files['eventArtistImages'].map(file => file.path)
        eventArtistImages.forEach(artistImage => {
            fs.readFile(artistImage, (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }

                sharp(data)
                    .resize({ width: 800, height: 800, fit: 'fill' }) // Replace with your desired dimensions
                    .toFile(artistImage, (resizeErr, info) => {
                        if (resizeErr) {
                            console.error(resizeErr);
                        } else {
                            // The event card image has been resized and saved as resizedEventCardImage
                            // ... your existing code ...
                        }
                    });
            });

        });
    }
    let finalEventArtistImages = [];
    if (req.body.olderEventArtistImages) {

        const olderImages = JSON.parse(req.body.olderEventArtistImages).filter(image => image.includes('uploads'));
        finalEventArtistImages = [...olderImages, ...eventArtistImages];
    }

    try {

        //setting up artist data
        const artistsData = finalEventArtistImages?.map((eventArtistImage, index) => {
            let eventArtistNames = JSON.parse(req.body.eventArtistNames);
            const eventArtistName = eventArtistNames[index];
            return { eventArtistImage, eventArtistName };
        });

        let eventDates = [];
        let isMultiDateEvent;
        let isMultiDateContinous;
        if (JSON.parse(req.body.isEditDates) == true) {
            if (req.body?.eventDates != []) {
                const dates = JSON.parse(req.body.eventDates)
                for (let i = 0; i < dates.length; i++) {
                    eventDates.push({
                        eventDate: new Date(dates[i]),
                        eventStartTime: '', // You can set default values if needed
                        eventEndTime: '',
                        eventTickets: []
                    });
                }
            }
        }

        if (JSON.parse(req.body.isEditDates) == true) {
            let isMultiDateEvent = req.body.isMultiDateEvent;
            let isMultiDateContinous = req.body.isMultiDateContinous;
            let result = await eventModel.updateOne(
                { _id: req.params.id },
                {
                    eventImages: {
                        eventCardImage: eventCardImage,
                        eventBannerImage: eventBannerImage,
                        eventVenueImage: eventVenueImage || "",
                    },
                    eventLocation: {
                        eventAddress: req.body.eventAddress,
                        eventVenue: req.body.eventVenue,
                        eventArea: req.body.eventArea,
                        eventPincode: req.body.eventPincode,
                        eventEmbeddedMapString: req.body.eventEmbeddedMapString || ""
                    },
                    eventOfflineSellers: JSON.parse(req.body.eventOfflineSellers),
                    eventArtists: artistsData,
                    eventTermsAndConditions: req.body.eventTermsAndConditions,
                    eventTitle: req.body.eventTitle,
                    eventDescription: req.body.eventDescription,
                    eventCatagory: req.body.eventCatagory,
                    eventSocialMediaLinks: req.body.eventSocialMediaLinks,
                    eventYtLink: req.body.eventYtLink,
                    eventAgeGroup: req.body.eventAgeGroup,
                    eventOrganizerName: req.body.eventOrganizerName,
                    eventLanguages: req.body.eventLanguages,
                    eventStatus: req.body.eventStatus,
                    eventDates: eventDates,
                    isMultiDateEvent: isMultiDateEvent,
                    isMultiDateContinous: isMultiDateContinous,
                    isFeaturedEvent: req.body.isFeaturedEvent,
                    featuredEventPriority: req.body.featuredEventPriority

                });

            return res.json({ statusCode: 200, message: "Event updated successfully!", data: result });
        } else {
            let result = await eventModel.updateOne(
                { _id: req.params.id },
                {
                    eventImages: {
                        eventCardImage: eventCardImage,
                        eventBannerImage: eventBannerImage,
                        eventVenueImage: eventVenueImage || "",
                    },
                    eventLocation: {
                        eventAddress: req.body.eventAddress,
                        eventVenue: req.body.eventVenue,
                        eventArea: req.body.eventArea,
                        eventPincode: req.body.eventPincode,
                        eventEmbeddedMapString: req.body.eventEmbeddedMapString || ""
                    },
                    eventOfflineSellers: JSON.parse(req.body.eventOfflineSellers),
                    eventArtists: artistsData,
                    eventTermsAndConditions: JSON.parse(req.body.eventTermsAndConditions),
                    eventTitle: req.body.eventTitle,
                    eventDescription: req.body.eventDescription,
                    eventCatagory: req.body.eventCatagory,
                    eventSocialMediaLinks: JSON.parse(req.body.eventSocialMediaLinks),
                    eventYtLink: req.body.eventYtLink,
                    eventAgeGroup: req.body.eventAgeGroup,
                    eventOrganizerName: req.body.eventOrganizerName,
                    eventLanguages: JSON.parse(req.body.eventLanguages),
                    eventStatus: req.body.eventStatus,
                    isFeaturedEvent: req.body.isFeaturedEvent,
                    featuredEventPriority: req.body.featuredEventPriority


                });
            return res.json({ statusCode: 200, message: "Event updated successfully!", data: result });
        }


    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: "something went wrong,please try again later", data: null });
    }

}

exports.getEventsByApprovalStatusWithOffset = async (req, res) => {
    try {
        const offset = parseInt(req.params.offset) || 0;
        const limit = 30;
        let totalEvents = await eventModel.find({
            $or: [
                { eventStatus: req.params.status1 },
                { eventStatus: req.params.status2 }
            ]
        });

        let result = await eventModel.find({
            $or: [
                { eventStatus: req.params.status1 },
                { eventStatus: req.params.status2 }
            ]
        }).skip(offset).limit(limit).populate('eventDates.eventTicketTypes').exec();

        // Sort by featured event priority (higher priority first)
        result.sort((a, b) => {
            if (a.featuredEventPriority === b.featuredEventPriority) {
                // If priorities are the same, compare event dates for sorting
                const dateA = a.eventDates[0].eventDate;
                const dateB = b.eventDates[0].eventDate;
                return dateA - dateB;
            } else {
                // Sort by featured event priority (higher priority first)
                return b.featuredEventPriority - a.featuredEventPriority;
            }
        });
        // Calculate the smallest ticket price for each event
        const eventsWithSmallestTicketPrice = result.map(event => {
            let smallestTicketPrice = Infinity;


            event.eventDates.forEach(date => {
                date.eventTicketTypes.forEach(ticketType => {
                    if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                        smallestTicketPrice = ticketType.ticketPrice;
                    }
                });
            });
            return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
        })

        res.json({ statusCode: 200, message: "events retrieved successfully!", data: result, totalEventsLength: totalEvents.length, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
    } catch (error) {
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}



exports.getEventsByUserIdWithOffset = async (req, res) => {
    try {
        const offset = parseInt(req.params.offset) || 0;
        const limit = 30;

        let result = await eventModel.find({ eventCreatedBy: req.params.id }).skip(offset).limit(limit);
        if (result)
            return res.json({ statusCode: 200, message: "Events fetched sucessfully!", data: result });
        else
            return res.json({ statusCode: -1, message: "Error fetching  events!", data: null });
    } catch (error) {
        return res.json({ statusCode: -1, message: "Error fetching  events data!", data: null });
    }
}
exports.getAllEventsWithOffset = async (req, res) => {
    try {
        const offset = parseInt(req.params.offset) || 0;
        const limit = 30;

        let result = await eventModel.find().skip(offset).limit(limit);
        res.json({ statusCode: 200, message: "events retrieved successfully!", data: result });
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

exports.getEventsByApprovalStatus = async (req, res) => {
    try {


        let result = await eventModel.find({ eventStatus: req.params.status }).populate('eventDates.eventTicketTypes');

        // Calculate the smallest ticket price for each event
        const eventsWithSmallestTicketPrice = result.map(event => {
            let smallestTicketPrice = Infinity;


            event.eventDates.forEach(date => {
                date.eventTicketTypes.forEach(ticketType => {
                    if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                        smallestTicketPrice = ticketType.ticketPrice;
                    }
                });
            });
            return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
        })

        res.json({ statusCode: 200, message: "events retrieved successfully!", data: result, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
    } catch (error) {
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

exports.getEventsByUserId = async (req, res) => {
    try {


        let result = await eventModel.find({ eventCreatedBy: req.params.id });
        if (result)
            return res.json({ statusCode: 200, message: "Events fetched sucessfully!", data: result });
        else
            return res.json({ statusCode: -1, message: "Error fetching  events!", data: null });
    } catch (error) {
        return res.json({ statusCode: -1, message: "Error fetching  events data!", data: null });
    }
}

exports.getEventsByOrganizerId = async (req, res) => {
    try {
        let eventsByOrganizer = await eventModel.find({ eventCreatedBy: req.params.id });

        //live events data
        let liveEventsData = [];
        //counting events
        let countUpcomingEvents = 0;
        let countPastEvents = 0;
        let countLiveEvents = 0;
        let eventIds = [];
        for (let event of eventsByOrganizer) {
            if (event.eventStatus == 'approved' || event.eventStatus == 'not-approved')
                countUpcomingEvents++;
            else if (event.eventStatus == 'expired')
                countPastEvents++;
            //count live event
            else if (event.eventStatus == 'live') {
                countLiveEvents++;
                const data = {
                    eventId: event._id,
                    eventTitle: event.eventTitle
                }
                liveEventsData.push(data);
            }
            eventIds.push(event._id)
        }
        const data = {
            upcomingEventsCount: countUpcomingEvents,
            pastEventsCount: countPastEvents,
            liveEventsCount: countLiveEvents,
            totalEventsCount: eventsByOrganizer?.length,
            liveEventsData: liveEventsData
        }

        //getting total revenue and total tickets sold
        const orders = await orderModel.find({ eventId: { $in: eventIds } });

        let countTotalTicketsSold = 0;
        let countTotalRevenueGenerated = 0;

        for (let order of orders) {
            if (order.paymentStatus == "success") {
                countTotalRevenueGenerated += order.totalPrice;
                for (let ticket of order.tickets) {
                    countTotalTicketsSold += ticket.quantity;
                }
            }
        }
        //adding this data
        data.countTotalTicketsSold = countTotalTicketsSold;
        data.countTotalRevenueGenerated = countTotalRevenueGenerated;

        if (eventsByOrganizer)
            return res.json({ statusCode: 200, message: "Events fetched sucessfully!", data: data });
        else
            return res.json({ statusCode: -1, message: "Error fetching  events!", data: null });

    } catch (error) {
        console.log(error);
        return res.json({ statusCode: -1, message: "Error fetching  events data!", data: null });
    }
}
exports.getAllEvents = async (req, res) => {
    try {


        let result = await eventModel.find();
        res.json({ statusCode: 200, message: "events retrieved successfully!", data: result });
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}




exports.getEventsLikeByUser = async (req, res) => {
    try {
        let result = await eventModel.find({ eventLikedBy: req.params.id });
        res.json({ statusCode: 200, message: "events retrieved successfully!", data: result });
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

exports.getGarbaHomePageEvents = async (req, res) => {
    try {
        let data = await eventModel.find({
            eventCatagory: 'Festival', $or: [
                { eventStatus: "approved" },
                { eventStatus: "live" }
            ]
        }).populate('eventDates.eventTicketTypes');

        // Sort by featured event priority (higher priority first)
        data.sort((a, b) => {
            if (a.featuredEventPriority === b.featuredEventPriority) {
                // If priorities are the same, compare event dates for sorting
                const dateA = a.eventDates[0].eventDate;
                const dateB = b.eventDates[0].eventDate;
                return dateA - dateB;
            } else {
                // Sort by featured event priority (higher priority first)
                return b.featuredEventPriority - a.featuredEventPriority;
            }
        });
        let result = data.splice(0, 5);
        if (result) {
            // Calculate the smallest ticket price for each event
            const eventsWithSmallestTicketPrice = result.map(event => {
                let smallestTicketPrice = Infinity;


                event.eventDates.forEach(date => {
                    date.eventTicketTypes.forEach(ticketType => {
                        if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                            smallestTicketPrice = ticketType.ticketPrice;
                        }
                    });
                });
                return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
            })

            res.json({ statusCode: 200, message: "garba event fetched", data: result, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
        } else {
            res.json({ statusCode: -1, message: "error fetching garba events", data: null });
        }
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}
exports.getUpcomingEvents = async (req, res) => {
    try {
        let eventCategory = req.params.category === 'any-category' ? undefined : req.params.category;
        let day = req.params.day === 'all' ? undefined : req.params.day;
        let dayOfWeek;

        let query = {
            $or: [
                { eventStatus: "approved" },
                { eventStatus: "live" }
            ]
        };

        if (eventCategory) {
            query.eventCatagory = eventCategory;
        }


        let events = await eventModel

            .find(query)
            .populate('eventDates.eventTicketTypes')
            .exec(); // Sorting by eventStartDate in ascending order


        events.sort((a, b) => {
            if (a.featuredEventPriority === b.featuredEventPriority) {
                // If priorities are the same, compare event dates for sorting
                const dateA = a.eventDates[0].eventDate;
                const dateB = b.eventDates[0].eventDate;
                return dateA - dateB;
            } else {
                // Sort by featured event priority (higher priority first)
                return b.featuredEventPriority - a.featuredEventPriority;
            }
        });


        let result = events.splice(0, 5);

        if (day) {
            if (day === 'today') {

                const today = new Date().toISOString().split('T')[0];

                const data = result.filter((event) => {
                    const eventStartDate = new Date(event?.eventDates[0]?.eventDate).toISOString().split('T')[0];
                    return eventStartDate == today;
                });

                // Calculate the smallest ticket price for each event
                const eventsWithSmallestTicketPrice = data.map(event => {
                    let smallestTicketPrice = Infinity;


                    event.eventDates.forEach(date => {
                        date.eventTicketTypes.forEach(ticketType => {
                            if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                                smallestTicketPrice = ticketType.ticketPrice;
                            }
                        });
                    });
                    return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
                })

                return res.json({ statusCode: 200, message: "events retrieved successfully!", data: data, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
            } else if (day === 'tomorrow') {

                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowIsoFormat = tomorrow.toISOString().split('T')[0];

                let data = result.filter((event) => {
                    const eventStartDate = new Date(event?.eventDates[0]?.eventDate).toISOString().split('T')[0];

                    return eventStartDate == tomorrowIsoFormat;
                });

                // Calculate the smallest ticket price for each event
                const eventsWithSmallestTicketPrice = data.map(event => {
                    let smallestTicketPrice = Infinity;


                    event.eventDates.forEach(date => {
                        date.eventTicketTypes.forEach(ticketType => {
                            if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                                smallestTicketPrice = ticketType.ticketPrice;
                            }
                        });
                    });
                    return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
                })

                return res.json({ statusCode: 200, message: "events retrieved successfully!", data: data, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
            } else if (day === 'this-weekend') {
                const today = new Date();
                const dayOfWeek = today.getDay();
                const friday = new Date(today);
                const sunday = new Date(today);
                friday.setDate(today.getDate() + (5 - dayOfWeek)); // friday is the next closest Saturday
                sunday.setDate(today.getDate() + (7 - dayOfWeek)); // Sunday is the next closest Sunday
                fridayIsoFormat = friday.toISOString().split('T')[0];
                sundayIsoFormat = sunday.toISOString().split('T')[0];

                const data = result.filter((event) => {
                    const eventStartDate = new Date(event?.eventDates[0]?.eventDate).toISOString().split('T')[0];
                    return eventStartDate >= fridayIsoFormat && eventStartDate <= sundayIsoFormat;
                });

                // Calculate the smallest ticket price for each event
                const eventsWithSmallestTicketPrice = data.map(event => {
                    let smallestTicketPrice = Infinity;


                    event.eventDates.forEach(date => {
                        date.eventTicketTypes.forEach(ticketType => {
                            if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                                smallestTicketPrice = ticketType.ticketPrice;
                            }
                        });
                    });
                    return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
                })

                return res.json({ statusCode: 200, message: "events retrieved successfully!", data: data, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
            }
        }
        // Calculate the smallest ticket price for each event
        const eventsWithSmallestTicketPrice = result.map(event => {
            let smallestTicketPrice = Infinity;


            event.eventDates.forEach(date => {
                date.eventTicketTypes.forEach(ticketType => {
                    if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                        smallestTicketPrice = ticketType.ticketPrice;
                    }
                });
            });
            return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
        })

        return res.json({ statusCode: 200, message: "events retrieved successfully!", data: result, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}
exports.getEventsForCustomers = async (req, res) => {
    try {
        let result = await eventModel.find({
            $or: [
                { eventStatus: "approved" },
                { eventStatus: "live" }
            ]
        });
        res.json({ statusCode: 200, message: "events retrieved successfully!", data: result });
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}
exports.getEventByIdForDetailsCustomer = async (req, res) => {
    try {
        let result = await eventModel.findOne({
            _id: req.params.id, $or: [
                { eventStatus: "approved" },
                { eventStatus: "live" }
            ]
        }).populate('eventCreatedBy').populate('eventDates.eventTicketTypes').populate('eventAvailableTicketTypes').exec();

        if (result) {
            let smallestTicketPrice = Infinity;
            let count = [];
            let isOnwardsRequired=false;

            result.eventDates.forEach(date => {
           
                date.eventTicketTypes.forEach(ticketType => {
              
                    if(!count.includes(ticketType._id)){
                        count.push(ticketType._id)
                    }
                    if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                        smallestTicketPrice = ticketType.ticketPrice;
                    }
                });
            });
            const smallestPrice = smallestTicketPrice === Infinity ? 0 : smallestTicketPrice;

            if (result) {
               
                if(count.length>=2)
                    isOnwardsRequired=true;
                res.json({ statusCode: 200, message: "event fetched!", data: result, smallestTicketPrice: smallestPrice,isOnwardsRequired:isOnwardsRequired });
            }
        }
        else {
            res.json({ statusCode: -1, message: "error fetching event", data: null });
        }
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -2, message: "error fetching details,please try again later", data: null });
    }
}
exports.getEventById = async (req, res) => {
    try {
        let result = await eventModel.findById({ _id: req.params.id }).populate('eventCreatedBy').populate('eventDates.eventTicketTypes').populate('eventAvailableTicketTypes').exec();

        let smallestTicketPrice = Infinity;

        result.eventDates.forEach(date => {
            date.eventTicketTypes.forEach(ticketType => {
                if (ticketType.ticketPrice < smallestTicketPrice) {
                    smallestTicketPrice = ticketType.ticketPrice;
                }
            });
        });
        const smallestPrice = smallestTicketPrice === Infinity ? 0 : smallestTicketPrice;
        if (result) {
            res.json({ statusCode: 200, message: "event fetched!", data: result, smallestTicketPrice: smallestPrice });
        } else {
            res.json({ statusCode: -1, message: "error fetching event", data: null });
        }
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -2, message: "error fetching details,please try again later", data: null });
    }
}
exports.getSimilarEvent = async (req, res) => {
    try {
        let result = await eventModel.find({ eventCatagory: req.params.category });

        if (result) {
            res.json({ statusCode: 200, message: "event fetched!", data: result });
        } else {
            res.json({ statusCode: -1, message: "error fetching event", data: null });
        }
    } catch (error) {
        res.json({ statusCode: -2, message: "error fetching details,please try again later", data: null });
    }
}
exports.getEventByEventName = async (req, res) => {
    try {
        let result = await eventModel.find({ eventTitle: req.params.name });

        if (result) {
            res.json({ statusCode: 200, message: "event fetched!", data: result });
        } else {
            res.json({ statusCode: -1, message: "error fetching event", data: null });
        }
    } catch (error) {
        res.json({ statusCode: -2, message: "error fetching details,please try again later", data: null });
    }
}
exports.getEventByGlobalSearch = async (req, res) => {
    try {
        const searchString = req.params.data;

        let events = await eventModel.find({
            $or: [
                { eventStatus: "approved" },
                { eventStatus: "live" }
            ]
        }).populate('eventDates.eventTicketTypes').exec();



        if (events) {
            const options = {
                keys: ['eventLocation.eventArea', 'eventLocation.eventVenue', 'eventTitle', 'eventDescription', 'eventArtists.eventArtistNames'], // Specify the field(s) to search for matches
                threshold: 0.4, // Adjust the threshold as needed for matching accuracy
                includeScore: true, // Include score for each match
            };

            // Create the Fuse instance with events and options
            const fuse = new Fuse(events, options);
            const searchResults = fuse.search(searchString);

            // Get the matched events with scores
            const matchedEvents = searchResults.map(result => result.item);

            // Calculate the smallest ticket price for each event
            const eventsWithSmallestTicketPrice = matchedEvents.map(event => {
                let smallestTicketPrice = Infinity;


                event.eventDates.forEach(date => {
                    date.eventTicketTypes.forEach(ticketType => {
                        if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                            smallestTicketPrice = ticketType.ticketPrice;
                        }
                    });
                });
                return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
            })

            return res.json({ statusCode: 200, message: "Events fetched successfully!", data: matchedEvents, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
        }

        return res.json({ statusCode: 200, message: "NO events available!", data: null });
    } catch (error) {
        res.json({ statusCode: -2, message: "error fetching event,please try again later", data: null });
    }
}
exports.getEventByArea = async (req, res) => {
    try {
        const area = req.params.area;
        let events = await eventModel.find({
            $or: [
                { eventStatus: "approved" },
                { eventStatus: "live" }
            ]
        }).populate('eventDates.eventTicketTypes').exec();;



        if (events) {
            const options = {
                keys: ['eventLocation.eventArea'], // Specify the field(s) to search for matches
                threshold: 0.4, // Adjust the threshold as needed for matching accuracy
                includeScore: true, // Include score for each match
            };

            // Create the Fuse instance with events and options
            const fuse = new Fuse(events, options);
            const searchResults = fuse.search(area);

            // Get the matched events with scores
            const matchedEvents = searchResults.map(result => result.item);
            // Calculate the smallest ticket price for each event
            const eventsWithSmallestTicketPrice = matchedEvents.map(event => {
                let smallestTicketPrice = Infinity;


                event.eventDates.forEach(date => {
                    date.eventTicketTypes.forEach(ticketType => {
                        if (ticketType.ticketPrice < smallestTicketPrice && ticketType.ticketStatus == 'active') {
                            smallestTicketPrice = ticketType.ticketPrice;
                        }
                    });
                });
                return smallestTicketPrice == Infinity ? 0 : smallestTicketPrice;
            })

            return res.json({ statusCode: 200, message: "Events fetched successfully!", data: matchedEvents, eventsWithSmallestTicketPrice: eventsWithSmallestTicketPrice });
        }

        return res.json({ statusCode: 200, message: "NO events available!", data: null });
    } catch (error) {
        console.log(error)
        res.json({ statusCode: -1, message: "error fetching event,please try again later", data: null });
    }
}
exports.deleteEventById = async (req, res) => {
    try {
        let result = await eventModel.findByIdAndDelete({ _id: req.params.id });
        res.json({ statusCode: 200, message: "Event deleted successfully!", data: result });
    } catch (error) {
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

exports.updateEventDatesinEventData = async (req, res) => {

    try {
        let result = await eventModel.updateOne({ _id: req.body._id }, { eventDates: req.body.eventDates });
        res.json({ statusCode: 200, message: "event updated successfully!", data: result });
    } catch (error) {
        console.log(error);
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

exports.updateApprovalStatusForEvent = async (req, res) => {

    try {
        let result = await eventModel.updateOne({ _id: req.params.id }, { eventStatus: req.body.eventStatus })
        res.json({ statusCode: 200, message: "Event updated successfully!", data: result });
    } catch (error) {
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}


exports.updateEventLikedByAndEventLikeCount = async (req, res) => {

    try {
        if (req.body.flag) {
            let result = await eventModel.updateOne({ _id: req.params.id }, { eventLikedBy: req.body.eventLikedBy, eventLikeCount: req.body.eventLikeCount })
            res.json({ statusCode: 200, message: "Event updated successfully!", data: result });
        }
        else {
            let result = await eventModel.findByIdAndUpdate({ _id: req.params.id }, { $pull: { eventLikedBy: req.body.eventLikedBy[0] }, eventLikeCount: req.body.eventLikeCount })
            res.json({ statusCode: 200, message: "Event updated successfully!", data: result });
        }
    } catch (error) {
        res.json({ statusCode: -1, message: error.message, data: null });
    }
}

