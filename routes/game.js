var express = require('express')
var router = express.Router();

var gameController = require('../controllers/game_controller')

router.post( '/game', gameController.create_game )

router.get ( '/game/:id/solution', gameController.get_solution )
router.put ( '/game/:id', gameController.take_guess )

module.exports = router;