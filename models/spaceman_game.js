let mongoose = require('mongoose')
let Schema = mongoose.Schema

const unguessedLetterChar = '';

function createEmptyGuessedWordState( word ) {
    return Array( word.length ).join('.').split('.');
}

let gameSchema = new Schema( {
    word: {
        type: String,
        required: true,
        minLength: 3,
        set: function( value ) {
            /**
              Input is the value as submitted to the constructor.  
            
              Method for sanitizing the data before is it saved to the database. Specifically,
              we need to capitialize the word, and initialize the guessed word state to a list 
              of empty strings. We must do that here because the default value cannot depend
              on other fields.
            **/ 
            if( this instanceof mongoose.Document && value != null ) {
                this.guessed_word_state = createEmptyGuessedWordState( value );
            }

            return value.toUpperCase();
        },
        validate: {
            validator: function( value ) {
                return /^[A-Za-z]{3,}$/.test( value )
            }
        }
    },
    guesses_allowed: {
        type: Number,
        default: 10
    },
    guesses_taken: {
        type: Number,
        default: 0
    },
    letters_available: {
        type: [String],
        default: function() {
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
        }
    },
    letters_guessed: {
        type: [String],
        default: []
    },
    guessed_word_state: {
        type: [String],
        default: []
    },
    is_game_over: {
        type: Boolean,
        default: false
    }
}, { toJSON: {
    transform: function( doc, ret ) {
        // Removes the solution from the default JSON representation
        delete ret.word;
        ret['id'] = ret._id;
        delete ret._id;
    }
}});

gameSchema.statics.createEmptyGuessedWordState = createEmptyGuessedWordState

gameSchema.methods.isGameOver = function() {
    return this.is_game_over || this.guesses_taken == this.guesses_allowed || this.guessed_word_state.indexOf( unguessedLetterChar ) < 0;
}

gameSchema.methods.isRepeatedGuess = function( guessed_letter ) {
    return this.letters_guessed.filter( letter => letter == guessed_letter ).length > 0;
}

gameSchema.methods.isValidLetterToGuess = function( guessed_letter ) {
    return this.letters_available.includes( guessed_letter ) 
}

gameSchema.methods.getUpdatedLettersAvailable = function( guessed_letter ) {
    return this.letters_available.filter( letter => letter != guessed_letter );
}

gameSchema.methods.updateWordState = function() {
    var newWordState = [];
    for( var index = 0; index < this.word.length; index++ ) {
        if( this.letters_guessed.includes( this.word.charAt( index ) )) {
            newWordState.push( this.word.charAt( index ) );
        } else {
            newWordState.push( unguessedLetterChar );
        }
    }

    this.guessed_word_state = newWordState
}

gameSchema.methods.updateIsGameOver = function() {
    this.is_game_over = this.isGameOver();
}

gameSchema.methods.updateForGuess = function( guessed_letter ) {
    if( this.isGuessValid( guessed_letter ).isValid ) {
        this.letters_available = this.letters_available.filter( letter => letter != guessed_letter );
        this.letters_guessed.push( guessed_letter );
    
        if( this.isGuessInWord( guessed_letter )) {
            this.updateWordState();
        } else {
            this.guesses_taken += 1;
        }

        this.updateIsGameOver();
    }
}

gameSchema.methods.isGuessInWord = function( guessed_letter ) {
    return this.word.indexOf( guessed_letter ) >= 0
}

function getGuessedLetterFromUpdate( letters_available, updated_guessed_letters ) {
    for (var letter of updated_guessed_letters ) {
        if( letters_available.indexOf( letter ) >= 0 ) {
            return letter
        }
    }

    return null
}

// PUBLIC Methods

gameSchema.methods.isGuessValid = function( guess ) {
    if( this.isGameOver() ) {
        return { error: "Game is over!" }
    } else if ( !guess ) {
        return { error: "Guess is not valid."}
    } else if ( this.isRepeatedGuess( guess )) {
        return { error: "You already guessed '" + guess + "'."}
    } else if( !this.isValidLetterToGuess( guess ) ) {
        return { error: "Guess is not valid."}
    }

    return {isValid: true};
}

gameSchema.methods.handleGuess = function( letters_guessed, callback ) {
    guessed_letter = getGuessedLetterFromUpdate( this.letters_available, letters_guessed)
    var validState = this.isGuessValid( guessed_letter )

    if( !validState.isValid ) {
        return callback( validState, null );
    } 
    this.updateForGuess( guessed_letter )
    return this.save( callback );
}

exports.SpacemanGame = mongoose.model( 'SpacemanGame', gameSchema )