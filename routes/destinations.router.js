const express = require('express')
const router = express.Router()

const {Destination} = require('../models/destination.model')
const {User} = require('../models/users.model')

// 1. Create a New Travel Destination - API

const createTravelDestination = async (destinationDetails) => {
  try {
    const newDestination = await Destination(destinationDetails)
    
    await newDestination.save()

    return newDestination
  } catch (error) {
    console.log(error)
  }
}

router.post('/', async (req,res) => {
  try {
    const newDestination = await createTravelDestination(req.body)

    if(newDestination) {
      res.json({message: 'Destination added',newDestination})
    } else {
      res.status(404).json({error:'Failed to add destionation'})
    }
  } catch (error) {
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// 3. Read All Travel Destinations

const readAllTravelDestinations = async () => {
  try {
    const foundDestination = await Destination.find()

    return foundDestination
  } catch (error) {
    throw error
  }
}

router.get('/', async (req, res) => {
  try {
    const foundDestinations = await readAllTravelDestinations()

    if(foundDestinations.length > 0) {
      res.json({foundDestinations})
    } else {
      res.status(404).json({error:'Database is empty!'})
    }
    
  } catch {
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// 4. Read All Travel Destinations by Location

const readTravelDestinationsByLocation = async (givenLocation) => {
  try {
    const foundDestination = await Destination.find({location: {'$regex': givenLocation, $options:'i'}})

    return foundDestination
  } catch (error) {
    throw error
  }
}

router.get('/location/:location', async (req,res) => {
  try {
    const foundDestination = await readTravelDestinationsByLocation(req.params.location)

    if (foundDestination.length > 0) {
      res.json({foundDestination})
    } else {
      res.status(404).json({error:'No destinations found for this location'})
    }
  } catch (error) {
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// 5. Read All Travel Destinations by Rating - and sorts in descending order

const readTravelDestinationsByRating = async () => {
  try {
    const foundDestinations = await Destination.find().sort({rating:'desc'})
    
    return foundDestinations
  } catch (error) {
    throw error
  }
}

router.get('/rating', async (req,res) => {
  try {
    const foundDestinations = await readTravelDestinationsByRating()

    if (foundDestinations.length > 0) {
      res.json({foundDestinations})
    } else {
      res.status(404).json({error:'Database is empty!'})
    }
  } catch (error) {
    res.status(500).json({error:"Failed to fetch data"})
  }
})

// 6. Update a Travel Destination by ID

const updateTravelDestination = async (destinationId, updateData) => {
  try {
    const updatedDestination = await Destination.findByIdAndUpdate(destinationId, updateData)

    if(updatedDestination) {
      const returnDestination = await Destination.findById(destinationId)

      return returnDestination
    }

  } catch (error) {
    throw error
  }
}

router.post('/:destinationId', async (req,res) => {
  try {
    const updatedDestination = await updateTravelDestination(req.params.destinationId, req.body)

    if (updatedDestination) {
      res.json({updatedDestination})
    } 
  } catch (error) {
    res.status(404).json({error:'Unable to find destination to be updated'})
  }
})

// 7. Delete a Travel Destination by ID

const deleteTravelDestination = async (givenDestinationId) => {
  try {
    const deletedDestination = await Destination.findByIdAndDelete(givenDestinationId)

    return deletedDestination
  } catch (error) {
    throw error
  }
}

router.delete('/:destinationId', async (req, res) => {
  try {
    const deletedDestination = await deleteTravelDestination(req.params.destinationId)

    if (deletedDestination) {
      res.json({message:'Deleted destination:',deletedDestination})
    } else {
      res.status(404).json({error:'Unable to find the destination'})
    }
  } catch {
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// 8. Filter Destinations by Minimum Rating

const filterDestinationsByRating = async (givenRating) => {
  try {
    const filteredDestinations = await Destination.find({rating: {$gte: Number(givenRating)}})

    return filteredDestinations
  } catch (error) {
    throw error
  }
}

router.get('/filter/:minRating', async (req,res) => {
  try {
    const filteredDestinations = await filterDestinationsByRating(req.params.minRating)

    if (filteredDestinations) {
      res.json({message:'Filtered destinations are:',filteredDestinations})
    }
  } catch (error) {
    res.status(404).json({error:'Unable to filter by rating'})
  }
})

// 9. Update Travel Destination Model with User Ratings and Reviews

const updateDestinationWithUserRatingAndReviews = async (destinationId, userReview) => {
  try {
    const foundDestination = await Destination.findById(destinationId)

    if (foundDestination) {
      foundDestination.reviews.push(userReview)

      const avgRating = foundDestination.reviews.reduce((acc, review) => acc+ review.userRating , 0)/foundDestination.reviews.length

      foundDestination.userAverageRating = parseFloat(avgRating).toFixed(2)

      await foundDestination.save()


      return foundDestination
    }
    
  } catch (error) {
    throw error
  }
}

router.post('/:destinationId/reviews', async (req,res) => {
  try {
    const userReview = req.body
    
    const updatedDestination = await updateDestinationWithUserRatingAndReviews(req.params.destinationId, userReview)

    if (updatedDestination) {
      res.json({message:'Review successfully added',updatedDestination })
    }
  } catch (error) {
    res.status(404).json({error:'Failed to add review'})
  }
})

// 10. Retrieve Reviews of a Travel Destination

const getDestinationReviewsWithUserDetails = async (destinationId) => {
  try {
    const foundDestination = await Destination.findById(destinationId).populate('reviews.user','username profilePicture')

    return foundDestination
  } catch (error) {
    throw error
  }
}

router.get('/:destinationId/reviews', async (req, res) => {
  try {
    const foundDestination = await getDestinationReviewsWithUserDetails(req.params.destinationId)

    if (foundDestination) {

      const {reviews} = foundDestination

      if (reviews.length > 3) {
        res.json({message:'Reviews for destination:', reviews:foundDestination.reviews.slice(0,3)})
      } else {
        res.json({message:'Reviews for destination:', reviews:foundDestination.reviews})
      }  
    }
  } catch (error) {
    res.status(404).json({error:'Unable to fetch reviews'})
  }
})

// 2. Read a Travel Destination - Defining it below cause it's a dynamic request

const readTravelDestination = async (givenDestinationName) => {
  try {
    const foundDestination = await Destination.findOne({destinationName: {'$regex':givenDestinationName, $options:'i'}})

    return foundDestination
  } catch (error) {
    throw error
  }
}

router.get('/:name', async (req,res) => {
  try {
    const foundDestination = await readTravelDestination(req.params.name)

    if (foundDestination) {
      res.json({foundDestination})
    } else {
      res.status(404).json({error:'Destination not found'})
    }
  } catch {
    res.status(500).json({error:'Failed to fetch data'})
  }
})

// Export router

module.exports = router