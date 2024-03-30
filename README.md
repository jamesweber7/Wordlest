# Wordlest
A [Wordle](https://www.nytimes.com/games/wordle/index.html) assisstance tool that lists all words that are still available as potential answers given previous guesses. Also features the option to rank and sort the available words by which how much information a guess is expected to yield.

[Try it Out](https://main.d2v659lifdp0in.amplifyapp.com/)
[Demonstration on YouTube](https://youtu.be/zMLS2GLCLH4)

I like playing a Wordle variant called [Shardle](https://shardle.17thshard.com/) on hard mode, which means that each guess needs to be a potentially correct answer given previous clues. Unfortunately, I'm not nearly smart enough to be good at playing on hard mode, and I often become stuck because I can't think of any words that fit with my restrictions. I started playing around and made this tool which shows what words are still possible correct answers. I was honestly surprised at how quickly I was able to throw this together and have it work well - the basic functionality was put together in 1 1/2 hours, the ui was put together another 1 1/2 hours, and the ranking algorithm plus some touch ups were done in 3 hours.

The ranking algorithm finds "STARE" to be the best first guess (if each guess is a potentially correct answer), and I was pleasantly surprised to find that other algorithms reached the same conclusion.

I was already aware that other Wordle assisstance tools exist, and I'm sure many of them are better than mine. I just started playing around making my own, and I am happy with what I was able to throw together.

## Changing The Available Terms Bank
If you want to change the terms for a Wordle variant, note that [terms.json](terms.json) is sorted by ranking by default for efficiency purposes. When adding another set of terms, you can modify [terms_options.json](terms_options.json). The `ranked` parameter specifies whether the terms are sorted by ranking, and the `alphabetical` parameter specifies whether the terms are sorted alphabetically. If there are a large number of terms (>1000), you may want to sort them by ranking by default. You can produce a sorted list by calling `sortTermsByRank(<array of your terms>)`.