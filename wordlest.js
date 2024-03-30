let terms = [];
let ranked_terms = [];
Promise.all([
        fetch("terms.json").then(response => response.json()),
        fetch("terms_options.json").then(response => response.json())
    ]).then(([termsData, options]) => {
        if (options.ranked) {
            ranked_terms = termsData;
            terms = [...termsData].sort();
        } else {
            terms = termsData;
            if (!options.alphabetical) {
                terms.sort();
            }
            // asynchronously start sorting terms
            setTimeout(() => {
                ranked_terms = sortTermsByRank(terms);
            }, 50 /* give other startup processes a chance so this can run more in background*/)
        }
        updateAnswers();
    })

function findPossibleTerms(terms, exact_matches, unknown_positions, misses) {
    // exact_matches [{char: 's', i: 0}]
    // unknown_positions [{char: 'o', incorrect_positions: [2], instances: 1}]
    // misses: ['p', 'o', 'n']
    let possible = [];
    terms.forEach(term => {
        let accounted_for = [];
        let unaccounted_for = [0, 1, 2, 3, 4];

        for (const match of exact_matches) {
            accounted_for.push(match.i)
            if (term[match.i] != match.char)
                return;
        }

        unaccounted_for = unaccounted_for.filter(i => !accounted_for.includes(i));
        
        for (const unknown_position of unknown_positions) {
            // char is in wrong position
            for (const i of unknown_position.incorrect_positions) {
                if (term[i] == unknown_position.char)
                    return;
            }

            // char is in word (and right number of times)
            let num_instances_found = 0;
            for (let i = 0; i < 5 && num_instances_found < unknown_position.instances; i++) {
                if (term[i] == unknown_position.char) {
                    num_instances_found ++;
                    unaccounted_for = unaccounted_for.filter(j => i != j);
                }
            }
            if (num_instances_found < unknown_position.instances)
                return;
        }

        for (const miss of misses) {
            for (const i of unaccounted_for)
                if (term[i] == miss)
                    return;
        }
        possible.push(term);
    })
    return possible;
}

function sortTermsByRank(possible) {
    const scores = scorePossibleTerms(possible);

    const rankings = Array(possible.length);
    for (let i = 0; i < rankings.length; i++) {
        rankings[i] = {
            score: scores[i],
            term: possible[i]
        }
    }
    rankings.sort((a, b) => b.score - a.score);

    const sorted = Array(rankings.length);
    rankings.forEach((ranking, i) => {
        sorted[i] = ranking.term;
    })

    return sorted;
}

function scorePossibleTerms(possible) {
    const scores = Array(possible.length).fill(0.0);
    possible.forEach((term, i) => {
        scoreTerm(term, possible, scores);
    })
    return scores;
}

function scoreTerm(term, possible, scores) {
    possible.forEach((potential_answer, index) => {
        scores[index] += scoreMatch(term, potential_answer);
    })
}

function scoreMatch(guess, answer) {
    return matchingScore(matchTerms(guess, answer));
}

function matchingScore(matching) {
    const exact_match = 'g';
    const unknown_position = 'y';
    const miss = 'b';

    let score = 0;
    for (const rank of matching) {
        switch (rank) {
            case exact_match:
                score += 1.0;
                break;
            case unknown_position:
                score += 0.5;
                break;
            case miss:
                score += 0.0;
                break;
        }
    }
    return score;
}

function matchTerms(guess, answer) {
    const exact_match = 'g';
    const unknown_position = 'y';
    const miss = 'b';
    const matching = Array(5);

    for (let i = 0; i < 5; i++) {
        const char = guess[i];

        if (answer[i] == char) {
            matching[i] = exact_match;
        } else {
            matching[i] = miss;
        }
    }
    // unknown position matchings
    for (let i = 0; i < 5; i++) {
        const char = guess[i];

        if (matching[i] == miss) {
            const guess_instances = numInstances(guess, char);
            const answer_instances = numInstances(answer, char);
            const num_matches = Math.min(guess_instances, answer_instances);
            let num_remaining_unknown_instances = num_matches;
            for (let j = 0; j < 5 && num_remaining_unknown_instances > 0; j++) {
                if (guess[j] == char) {
                    if (matching[j] == miss) {
                        matching[j] = unknown_position;
                    } else {
                        num_remaining_unknown_instances --;
                    }
                }
            }
        }
    }
    return matching;
}