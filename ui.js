document.addEventListener('DOMContentLoaded', setup);

const cursor = {
    i: 0,
    j: 0
};

let boxes;

var sorting_schema = 'alphabetical';

function setup() {
    boxes = [...document.getElementsByTagName('box')];
    updateAnswers();
    setupBoxes();
    setupInput();
    setupAnswers();
    setupSortingSchema();
}

function setupBoxes() {
    boxes.forEach((box, index) => {
        box.onclick = () => {
            if (index/5 >= cursor.i)
                return;
            if (box.className == 'incorrect') {
                box.className = 'correct';
            } else if (box.className == 'correct') {
                box.className = 'incorrect-position';
            } else if (box.className == 'incorrect-position') {
                box.className = 'incorrect';
            }
            updateAnswers();
        }
    });
}

function setupInput() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey)
            return;
        if (/[a-zA-Z]/.test(e.key) && e.key.length == 1) {
            if (cursor.j < 5) {
                writeNextBox(e.key);
            }
        }
        else if (e.key == 'Enter') {
            e.preventDefault();
            if (cursor.j < 5 || cursor.i == 4) {
                return;
            } else {
                incorrectRow();
                cursor.i ++;
                cursor.j = 0;
                updateAnswers();
            }
        } 
        else if (e.key == 'Backspace') {
            if (cursor.j == 0) {
                if (cursor.i != 0) {
                    cursor.j = 5;
                    cursor.i --;
                }
                clearRow();
                updateAnswers();
            } else {
                deleteCurrentBox();
            }
        } else {
            return;
        }
    });
}

function setupSortingSchema() {
    const sortingTypeBtn = document.getElementById('sorting-type');
    sortingTypeBtn.onclick = () => {
        if (sortingTypeBtn.className == 'alphabetical') {
            sorting_schema = 'alphabetical';

            sortingTypeBtn.className = 'ranking';
            sortingTypeBtn.innerText = '123';
            sortingTypeBtn.title = 'Sort By Ranking';
        } else if (sortingTypeBtn.className = 'ranking') {
            sorting_schema = 'ranking';

            sortingTypeBtn.className = 'alphabetical';
            sortingTypeBtn.innerText = 'ABC';
            sortingTypeBtn.title = 'Sort Alphabetically';
        }
        updateAnswers();
    }
}

function setupAnswers() {
    window.addEventListener('resize', positionAnswers);
    positionAnswers();
    // unhide answers
    document.getElementsByTagName('answers')[0].classList.remove('hidden');
}

function positionAnswers() {
    const answers = document.getElementsByTagName('answers')[0];
    const last_box_in_row_1 = getBox(0, 4);
    const bounding_rect = last_box_in_row_1.getBoundingClientRect();
    answers.style.top = (bounding_rect.top-10)+'px';
    answers.style.left = (bounding_rect.right+10)+'px';
    answers.style.maxHeight = (window.innerHeight - bounding_rect.top - 40) + 'px';
}


function writeNextBox(char) {
    char = char.toUpperCase();
    getBox(cursor.i, cursor.j).innerText = char;
    cursor.j ++;
}

function deleteCurrentBox() {
    getBox(cursor.i, cursor.j-1).innerText = '';
    cursor.j --;
}

function clearRow() {
    for (let j = 0; j < 5; j++) {
        getBox(cursor.i, j).className = '';
    }
}

function incorrectRow() {
    for (let j = 0; j < 5; j++) {
        getBox(cursor.i, j).className = 'incorrect';
    }
}

function getBox(i, j) {
    return boxes[i*5+j];
}

function updateAnswers() {
    const answers_display = document.getElementById('answers-list');
    answers_display.innerHTML = '';

    const exact_matches = [];
    const unknown_positions = [];
    const misses = [];
    for (let i = 0; i < cursor.i; i++) {
        for (let j = 0; j < 5; j++) {
            const box = getBox(i, j);
            const char = box.innerText.toLowerCase();
            switch (box.className) {
                case 'correct':
                    exact_matches.push({
                        char: char,
                        i: j
                    });
                    break;
                case 'incorrect-position':
                    let found = false;
                    unknown_positions.forEach(unknown => {
                        if (unknown.char == char) {
                            found = true;
                            unknown.incorrect_positions.push(j);
                            unknown.instances = instancesInRow(i, char);
                        }
                    });
                    if (!found) {
                        unknown_positions.push({
                            char: char,
                            incorrect_positions: [j],
                            instances: 1
                        })
                    }
                    break;
                case 'incorrect':
                    misses.push(char);
                    break;
            }
        }
    }
    
    const possible = findPossibleTerms(terms, exact_matches, unknown_positions, misses);

    let display_answers = possible;
    if (sorting_schema == 'ranking') {
        // save time on initial ranking
        if (possible.length == terms.length && terms.length == ranked_terms.length) {
            display_answers = ranked_terms;
        } else {
            display_answers = sortTermsByRank(possible);
        }
    }

    display_answers.forEach(term => {
        const li = document.createElement('li');
        li.innerText = term.toUpperCase();
        answers_display.append(li);
    })
}

function numInstances(str, substr) {
    let count = 0;
    let i = str.indexOf(substr);
    while (i != -1) {
        i = str.indexOf(substr, i+1);
        count ++;
    }
    return count;
}

function getRowText(i) {
    let row = '';
    for (let j = 0; j < 5; j++) {
        row += getBox(i, j).innerText.toLowerCase();
    }
    return row;
}

// number of yellow or green instances of a character in a given row
function instancesInRow(i, char) {
    let count = 0;
    for (let j = 0; j < 5; j++) {
        const box = getBox(i, j);
        if (box.innerText.toLowerCase() == char)
            if (box.className == 'correct' || box.className == 'incorrect-position')
                count ++;
    }
    return count;
}