var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

const synth = window.speechSynthesis;

let commit = false
let checkingH1 = false;
let checkingH3 = false;
let checkingtext = false;

let noteFileArray = [];
let noteFile = "";
let input = "";

// Construct utterance regular expressions
// File Search
let fileU1 = /(please )?(do (a )?)?(search|look) for (([\w|\s])+)/
let fileU2 = /(please )?find (\w+)( in (\w+))?/

// Google Search
let searchU1 = /research (.*)/

// Git init
let initU1 = /init(ialise)? (Repo|repository)( in (.*))?/

// // Git commit
// let commitU1 = /(make (me )?a (new )?)?commit (for (\w*))?/

let h1Regex = /(?<!##)#[\w\s]*/

let h3Regex = /###[\w\s]*/

window.onload = function() {
    document.getElementById('trigger').addEventListener('click', () => {
        if (((noteFile == "") && (noteFileArray.length > 0)) || ((noteFile.length > 0) && (noteFileArray = []))) {
            recognition.start();
        } else {
            voiceResponse("File(s) not set");
            alert("File(s) not set");
        }
    });
}

let enumeratedMatches = [];
// let testText = ["please do a search for fruit", "0", "0", "0"];

const recognition = new SpeechRecognition()

recognition.continuous = false;
recognition.lang = 'en-UK';
recognition.interimResults = false;

recognition.addEventListener('result', (e) => {
    let last = e.results.length - 1;
    let text = e.results[last][0].transcript;
    // let text = testText[inputtext];

    document.getElementById("response").innerHTML = "API heard " + text;

    console.log("input received " + checkingH1 + checkingH3 + checkingtext);

    if ((text.match(fileU1) != null) || (text.match(fileU2) != null)) {
        if (text.match(fileU1) != null) {
            console.log("Triggering file search 1" + checkingH1 + checkingH3 + checkingtext);
            let matchArray = text.match(fileU1)
            input = matchArray[5];
            if (noteFile.length > 0) {
                // file selected
                checkingH3 = true;
                searchHeadingReply(matchArray[5], h3Regex, noteFile);
            } else if (noteFileArray.length > 0) {
                checkingH1 = true;
                searchHeadingReply(matchArray[5], h1Regex, noteFileArray);

            } else {
                //searchHeadingReply(matchArray[5], h3Regex, testFile)
                voiceResponse("Invalid command");
            }

        } else if (text.match(fileU2) != null) {
            console.log("Triggering file search 2" + checkingH1 + checkingH3 + checkingtext);
            let matchArray = text.match(fileU2)
            input = matchArray[2];
            if ((matchArray[4] != undefined) && (noteFile.length > 0)) {
                checkingH3 = true;
                searchHeadingReply(matchArray[2], h3Regex, noteFile);


            } else if ((matchArray[4] == undefined) && (noteFileArray.length > 0)) {
                checkingH1 = true;
                searchHeadingReply(matchArray[2], h1Regex, noteFileArray);

            } else {
                //searchHeadingReply(matchArray[5], h3Regex, testFile)
                voiceResponse("Invalid command");
            }
        }

    } else if (text.match(searchU1) != null) {
        console.log("Triggering Google search")
        let searchTerm = text.split(" ")[1];
        console.log(searchTerm)
        voiceResponse("Search results for: " + searchTerm)
            // window.open('http://google.com/search?q=' + searchTerm);
            // Google rules on automated use of Google is a little shakey so I'm disabling this line
            // It does work, but I don't want to get in trouble
            // I know how to get results out of the page though

    } else if (text.match(initU1) != null) {
        console.log("Triggering Git init")
        let matchArray = text.match(initU1)
            //let folderName = matchArray[4]

        //Temporary pointless voice response
        voiceResponse("Repo initialised");

        // For the Git init and Git commit options I can import a node module to do it for me - see shell.echo() in index.js but I cannot
        // import it or use it in the browser JavaScript.

        // } else if (text.match(commitU1) != null) {
        //     console.log("Triggering Git commit");
        //     let matchArray = text.match(commitU1);

        // } else if (commit == true) {
        //     let commitMessage = text
        //         // perform commit
        //     voiceResponse("Created commit " + commitMessage)
        //     commit = false

        //     // I don't know how to explain how these are meant to work, sorry
    } else if ((checkingH1 == true) && (text < enumeratedMatches.length)) {

        console.log("Chopping up notefile after user H1 selection" + checkingH1 + checkingH3 + checkingtext);

        noteFile = noteFileArray[text].content;

        checkingH1 = false;
        checkingH3 = true;

        searchHeadingReply(input, h3Regex, noteFile);

    } else if ((checkingH3 == true) && (text < enumeratedMatches.length)) {

        console.log("Chopping up notefile after user H3 selection" + checkingH1 + checkingH3 + checkingtext);

        if (text + 1 == enumeratedMatches.length) {
            noteFile = noteFile.substring((enumeratedMatches[text].start));
        } else {
            noteFile = noteFile.substring(enumeratedMatches[text].start, enumeratedMatches[text].end);
        }

        checkingH3 = false
        checkingtext = true;

        searchTextReply(input);

    } else if ((checkingtext == true) && (text < enumeratedMatches.length)) {

        console.log("Chopping up notefile after user text selection" + checkingH1 + checkingH3 + checkingtext);

        if (text + 1 == enumeratedMatches.length) {
            noteFile = noteFile.substring((enumeratedMatches[text].start));
        } else {
            noteFile = noteFile.substring(enumeratedMatches[text].start, enumeratedMatches[text].end);
        }

        checkingtext = false;
        checkingH1 = false;
        checkingH3 = false;
        voiceResponse(noteFile)

    } else {
        console.log("No command found")
        checkingtext = false;
        checkingH1 = false;
        checkingH3 = false;
        voiceResponse(text);
    }

});

function voiceResponse(inputTxt) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (inputTxt.value !== '') {
        var utterThis = new SpeechSynthesisUtterance(inputTxt);
        utterThis.onend = function(event) {
            console.log('SpeechSynthesisUtterance ended');
            // based on booleans, restart recognition here
            if (checkingH1 == true || checkingH3 == true || checkingtext == true) {
                recognition.start();
            } else {
                console.log("No more loops needed")
            }
        }
    }
    utterThis.onerror = function(event) {
        console.error('SpeechSynthesisUtterance Error: ' + event.error);
    }

    synth.speak(utterThis);
}

// Takes the search parameter from user input and which regex (h1, h3 or none) to use
function searchHeadingReply(term, regex, data) {
    console.log("Heading Searching for " + term + " and " + regex.source + " in " + data + " " + checkingH1 + checkingH3 + checkingtext);

    // regex of section of user input
    let termregex = new RegExp(term);

    // ending regex of any number of word and whitespace characters with global tag
    let backRegex = /[\w\s]*/

    // combine regexs together
    let pattern = new RegExp(regex.source + termregex.source + backRegex.source);

    // attach global tag
    let patternglobal = new RegExp(pattern, "gi");

    let regexResults = []
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].firstLine.match(patternglobal)) {
                regexResults.push(data[i].firstLine.match(patternglobal))
            }
        }
    } else {
        // returns an array of all matches in the string of the given regex
        regexResults = data.matchAll(patternglobal);
    }

    enumeratedMatches.length = 0;

    for (let result of regexResults) {
        enumeratedMatches.push({
            text: result[0],
            start: result.index,
            end: result.index + result[0].length
        })
    }

    // speak enumeratedMatches to user
    let voiceString = ""
    for (let i = 0; i < enumeratedMatches.length; i++) {
        voiceString += "Option: " + i + " - " + enumeratedMatches[i].text;
    }
    if (voiceString == "") {
        voiceString += "Error - No options found"
    }
    voiceString += "\n Please choose an option by number."


    voiceResponse(voiceString);
};

function searchTextReply(term) {

    console.log("Text Searching for " + term + " in " + noteFile + " " + checkingH1 + checkingH3 + checkingtext);

    // test for user input
    // regex of section of user input
    let regex = new RegExp(term, "gi");

    // returns an array of all matches in the string of the given regex
    let regexResults = noteFile.matchAll(regex);

    enumeratedMatches.length = 0;

    for (let result of regexResults) {
        enumeratedMatches.push({
            text: result[0],
            start: result.index,
            end: result.index + result[0].length
        })
    }

    // speak enumeratedMatches to user
    let voiceString = "";
    for (let i = 0; i < enumeratedMatches.length; i++) {
        voiceString += "Option: " + i + " - " + enumeratedMatches[i].text;
    }
    if (voiceString == "") {
        voiceString += "Error - No options found"
    }
    voiceString += "\n Please choose an option by number."

    voiceResponse(voiceString);
};

async function grabFile() {
    let fileSelector = document.getElementById('file-selector');
    fileSelector.addEventListener('change', async(event) => {
        let fileList = event.target.files;
        if (fileList.length == 1) {
            noteFile = await fileList[0].text();
            noteFileArray.length = 0;
        } else {
            for (let i = 0; i < fileList.length; i++) {
                let text = await fileList[i].text();
                let lines = text.split(/\r?\n/);
                let content = "";
                lines.forEach((line) => {
                    content += line;
                });
                noteFileArray.push({
                    "title": fileList[i].name,
                    "firstLine": lines[0],
                    "content": content
                })

                noteFile = "";
            }
        }
    });
}

recognition.onaudiostart = function(event) {
    console.log("API has started to catch audio")
}

recognition.onaudioend = function(event) {
    console.log("API has finished capturing audio")
}

recognition.onstart = function(event) {
    console.log("API started")
}

recognition.onend = function(event) {
    console.log("API has finished")
}

recognition.onerror = function(event) {
    console.log("Error: " + event.error)
}

recognition.onnomatch = function(event) {
    console.log("No confident match")
}

recognition.onsoundstart = function(event) {
    console.log("Sound detected")
}

recognition.onsoundend = function(event) {
    console.log("Sound ended")
}

recognition.onspeechstart = function(event) {
    console.log("Speech detected")
}

recognition.onspeechend = function(event) {
    console.log("Speech ended")
}

grabFile();