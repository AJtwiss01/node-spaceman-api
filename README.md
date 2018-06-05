# Spaceman Game API

This API is useful for storing and upating the state of a Spaceman Game. The service starts a Spaceman Game by choosing a word at random, or one given by a request, then allowing requests to guess letters in that word. A game ends when either all the letters in the word have been guessed, or a total number of guesses are exhausted without guessing all the letters in the word (e.g., there are 5 guesses allowed, 5 guesses have been made that were not letters in the word, therefore there are no guesses left).

For each guess the service updates the state of the game:
- what letters have been guessed
- which letters in the word to guess have been guessed
- which letters are still available to guess
- how many guesses have been taken
- whether the game is over or not

## Creating a new Spaceman Game
```
POST /spaceman/api/game/
```
This should respond with a new Spaceman Game instance and a randomly chosen word to guess, for example:
```
{
    "id": 55,
    "guesses_allowed": 10,
    "guesses_taken": 0,
    "letters_available": ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
    "letters_guessed": [],
    "guessed_word_state": ["","","",""],
    "is_game_over": false
}
```
This example indicates a new Spaceman Game with identifier 55. The service has randomly chosen a four-letter word (indicated by the `guessed_word_state`) and there are 10 guesses available to take.

The body of the post can include a JSON payload including text to use as the word to guess:
```
POST /spaceman/api/game/
{
    "word": "BUTTERFLY"
}
```
This will respond with a new Spaceman Game instance and where the word to guess is `BUTTERFLY`. The response would effectively be the same as the previous example, except the game would have a different `id` value and the `guessed_word_state` would have nine empty strings in the array because `BUTTERFLY` has nine characters.


## Making a Guess
```
PUT /spaceman/api/game/{game_id}/
{
    "letters_guessed":["A"]
}
```
This will request a guess of the letter `"A"` for game instance with id `{game_id}`. Only one letter can be guessed at a time and that letter must be available (i.e., in the array of `letters_available`). The reponse to this request will be the updated game state, for example:
##### Request
```
PUT /spaceman/api/game/55/
{
    "letters_guessed":["A"]
}
```
##### Response
```
{
    "id": 55,
    "guesses_allowed": 10,
    "guesses_taken": 1,
    "letters_available": ["B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
    "letters_guessed": ["A"],
    "guessed_word_state": ["","","",""],
    "is_game_over": false
}
```
Note that the number of `guesses_taken` is incremented by 1 because the letter "A" is not in the word to guess. If another guess is made and the letter is in the word, then the `guesses_taken` is not incremented, for example:
##### Request
```
PUT /spaceman/api/game/55/
{
    "letters_guessed":["P"]
}
```
##### Response
```
{
    "id": 55,
    "guesses_allowed": 10,
    "guesses_taken": 1,
    "letters_available": ["B","C","D","E","F","G","H","I","J","K","L","M","N","O","Q","R","S","T","U","V","W","X","Y","Z"],
    "letters_guessed": ["A", "P"],
    "guessed_word_state": ["","","","P"],
    "is_game_over": false
}
```

## Requesting the solution
```
GET /spaceman/api/game/{game_id}/solution/
```
This will request the solution, or word to guess, for the game instance with id `{game_id}`. It will respond with a JSON payload where the `solution` property indicates the word to guess, for example:
##### Request
```
GET /spaceman/api/game/55/solution/
```
##### Response
```
{
    "solution":"LOOP"
}
```

