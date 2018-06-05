const controller = require('../../controllers/game_controller')
var SpacemanGame = require('../../models/spaceman_game').SpacemanGame

var chai = require('chai')
var should = chai.should()
var expect = chai.expect

var sinon = require('sinon')

describe('Spaceman Game Controller', () => {
    var mockRequest;
    var mockResponse;
    var mockError = { error: "an error" }

    beforeEach( () => {
        mockResponse = {}
        mockResponse.send = sinon.spy()
        mockResponse.status = sinon.stub()
        mockResponse.status.returns( mockResponse )
        mockResponse.sendStatus = sinon.spy()
        mockResponse.json = sinon.spy() 

        mockRequest = {
            body: { },
            params: { }
        }

        sinon.stub( SpacemanGame, 'create' )
        sinon.stub( SpacemanGame, 'findById' )
    });

    afterEach( () => {
        SpacemanGame.create.restore()
        SpacemanGame.findById.restore()
    })

    describe('Create a Game', () => {
        it( 'should respond with a new game', () => {
            var mockGame = { word: "test" }
            SpacemanGame.create.yields( null, mockGame )

            controller.create_game( mockRequest, mockResponse )
            mockResponse.send.calledWith( mockGame ).should.be.true
        });

        it('should choose a random word if no word is requested', () => {
            controller.create_game( mockRequest, mockResponse )

            SpacemanGame.create.getCall(0).args[0].word.should.not.be.empty
        });

        it('should respond with 400 if there is an error', () => {
            SpacemanGame.create.yields( mockError, null )

            controller.create_game( mockRequest, mockResponse )
            mockResponse.status.calledWith(400).should.be.true
            mockResponse.send.calledWith( mockError ).should.be.true
        });
    });


    describe('Taking a guess', () => {
        it('should respond with 404 when a game is not found', () => {
            SpacemanGame.findById.yields( mockError, null )

            controller.take_guess( mockRequest, mockResponse )
            mockResponse.sendStatus.calledWith( 404 ).should.be.true
        });

        it('should respond with 400 when letters_guessed is missing from request', () => {
            SpacemanGame.findById.yields( null, {} )

            controller.take_guess( mockRequest, mockResponse )
            mockResponse.status.calledWith( 400 ).should.be.true
            mockResponse.send.getCall(0).args[0].should.not.be.empty
        });

        describe( 'With a letter in the request body', () => {
            beforeEach( () => {
                mockRequest.body = { letters_guessed: ['A'] }
            })

            it('should respond with 400 if the guess causes an error', () => {
                // Stubbing the handleGuess method so that we can call the callback
                var mockGame = {
                    handleGuess: sinon.stub()
                }
                // Callback is the second arguments to handleGuess, call it with an error
                mockGame.handleGuess.callsArgWith( 1, mockError, null )
    
                // When it attemps to find the game, it should get the game for which
                // we've stubbed handleGuess to produce an error object
                SpacemanGame.findById.yields( null, mockGame )
    
                controller.take_guess( mockRequest, mockResponse )
    
                mockResponse.status.calledWith( 400 ).should.be.true
                mockResponse.send.getCall(0).args[0].should.not.be.empty
            });
    
            it('should respond with game if it is successfully updated', () => {
                var updatedGame = { id: 10 }
                // Stubbing the handleGuess method so that we can call the callback
                var mockGame = {
                    handleGuess: sinon.stub()
                }
                // Callback is the second arguments to handleGuess, call it with an updated game object
                mockGame.handleGuess.callsArgWith( 1, null, updatedGame )
    
                // When it attemps to find the game, it should get the game for which
                // we've stubbed handleGuess to produce the updated game
                SpacemanGame.findById.yields( null, mockGame )
    
                controller.take_guess( mockRequest, mockResponse )
    
                mockResponse.send.calledWith( updatedGame ).should.be.true
            });
        });
    });

    describe('Getting a game instance', () => {
        beforeEach( () => {
            mockResponse.params = {id: 5}
        });

        it('should respond with a game when it is found by id', () => {
            var mockGame = { id: 5 }
            SpacemanGame.findById.yields( null, mockGame )

            controller.get_game( mockRequest, mockResponse )
            mockResponse.send.calledWith( mockGame ).should.be.true
        });

        it('should respond with a 404 when a game is not found', () => {
            SpacemanGame.findById.yields( mockError, null )

            controller.get_game( mockRequest, mockResponse)
            mockResponse.sendStatus.calledWith( 404 ).should.be.true
        });
    });
});