const SpacemanGame = require('../../models/spaceman_game').SpacemanGame

var chai = require('chai')
var should = chai.should()
var expect = chai.expect

var sinon = require('sinon')

describe( 'SpacemanGame Schema', () => {
    describe( 'Creating a SpacemanGame', () => {
        it( 'should create a game with a given word to guess', () => {
            var testword = "TESTWORD"
            var game = SpacemanGame( {word: testword})

            game.word.should.equal( testword )
        });

        it( 'should require a word', () => {
            var game = SpacemanGame()
            game.validate( function( err ) {
                err.should.exist;
                err.errors.word.should.exist;
            });
        });

        it( 'should require the word to guess to be 3 characters or longer', () => {
            var testword = "is"
            var game = SpacemanGame( {word: testword } )
            game.validate( function( err ) {
                err.should.exist;
                err.errors.word.should.exist;
            });
        });

        it( 'should ensure word to guess only contains letters', () => {
            var testword = "A1BE"
            var game = SpacemanGame( {word: testword } )
            game.validate( function( err ) {
                err.should.exist;
                err.errors.word.should.exist;
            });
        });

        it( 'should uppercase a word value', () => {
            var testword = "apple"
            var game = SpacemanGame( {word: testword })

            game.word.should.equal( testword.toUpperCase() )
        });

        describe('should initialize the guessed word state', () => {
           
        });
    });

    describe( 'isGuessValid', () => {
        var gameOptions;
        
        beforeEach( () => {
            gameOptions = {
                word: 'balloon',
                guessed_word_state: ['','','L','L','','','N'],
                guesses_allowed: 5,
                guesses_taken: 2,
                letters_available: ['A', 'B', 'M', 'O', 'P'],
                letters_guessed: ['C', 'L', 'N'],
                is_game_over: false
            }; 
        });

        it('should return isValid if the guessed letter is available', () => {
            var game = SpacemanGame( gameOptions )
            game.isGuessValid( 'A' ).isValid.should.exist
        });

        describe( 'should return error', () => {
            it('if the game is over', () => {
                gameOptions.is_game_over = true;
                var game = SpacemanGame( gameOptions )

                game.isGuessValid( 'A' ).error.should.exist
            });

            it('if the guessed letter is not available', () => {
                var game = SpacemanGame( gameOptions )
                game.isGuessValid( 'Q' ).error.should.exist
            });

            it('if the guessed letter has already been guessed', () => {
                var game = SpacemanGame( gameOptions )
                game.isGuessValid( 'C' ).error.should.exist 
            })

            it('if the guess is not a letter', () => {
                var game = SpacemanGame( gameOptions )
                game.isGuessValid( 'NOTALETTER' ).error.should.exist
            });
        });
    })

    describe( 'handleGuess', () => {
        var gameOptions;
        var mock_guess_callback;

        beforeEach( () => {
            mock_guess_callback = sinon.spy();

            gameOptions = {
                word: 'BALLOON',
                guessed_word_state: ['','','L','L','','','N'],
                guesses_allowed: 5,
                guesses_taken: 2,
                letters_available: ['A', 'B', 'M', 'O', 'P'],
                letters_guessed: ['C', 'L', 'N'],
                is_game_over: false
            }; 
        });

        it('should check the validity of a guess', () => {
            var game = SpacemanGame( gameOptions )
            game.handleGuess( 'A', mock_guess_callback )
            mock_guess_callback.called
        });
 
        describe('If not the last guess', () => {
            var game;

            beforeEach( () => {
                game = SpacemanGame( gameOptions )
            });

            describe('and the guess is in the word', () =>{
                var guess
                beforeEach( () => {
                    guess = 'A'
                    game.handleGuess( guess, mock_guess_callback )
                });

                it('should not increment the number of guesses taken', () => {
                    game.guesses_taken.should.equal( gameOptions.guesses_taken )
                })

                it('should remove guess from letters available', () => {
                    game.letters_available.should.not.include( guess )
                })

                it('should add guess to letters guessed', () => {
                    game.letters_guessed.should.include( guess )
                })

                it('should add letter to the guessed word state', () => {
                    game.guessed_word_state.should.deep.equal( ['','A','L','L','','','N'])
                })
            });

            describe('and the guess is not in the word', () =>{
                var guess
                beforeEach( () => {
                    guess = 'P'
                    game.handleGuess( guess, mock_guess_callback )
                });

                it('should increment the number of guesses taken', () => {
                    game.guesses_taken.should.equal( gameOptions.guesses_taken + 1)
                })

                it('should remove guess from letters available', () => {
                    game.letters_available.should.not.include( guess )
                })

                it('should add guess to letters guessed', () => {
                    game.letters_guessed.should.include( guess )
                })

                it('should not change guessed word state', () => {
                    game.guessed_word_state.should.deep.equal( gameOptions.guessed_word_state )
                })
            });
        });

        
    });

    describe( 'Converting to JSON', () => {
        it('should remove the word key so solution is not shown', () => {
            var game = SpacemanGame( {word: "balloon"})
            expect(game.toJSON().solution).to.not.exist
        });
    });
}); 