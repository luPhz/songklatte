var songs = (function() {
    var c = {},
        f_create_song,
        f_create_rhythm,
        f_create_preview;

    f_create_rhythm = function(rhytmNotation) {
        const BEAT_SEPARATOR = ' ',
              SYMBOL_PAUSE   = '-';

        var f_parseSubdivisions, f_parseNotation, f_createBeatElement;
        
        f_parseSubdivisions = function(beatNotation) {
            if (beatNotation === SYMBOL_PAUSE) {
                return [];
            }
            return beatNotation.split('');
        };

        f_parseNotation = function(notation) {
            var rhythmData = {
                beats: []
            };

            if (typeof rhytmNotation === 'string') {
                var beatNotations, subdivisions, beatIdx;

                beatNotations = notation.split(BEAT_SEPARATOR);
                for (beatIdx = 0; beatIdx < beatNotations.length; ++beatIdx) {
                    subdivisions = f_parseSubdivisions(beatNotations[beatIdx]);
                    rhythmData.beats.push(subdivisions);
                }
            }
            
            return rhythmData;
        };

        f_createBeatElement = function(beatData) {
            var beatElem;

            beatElem = document.createElement('div');
            beatElem.classList.add('beat');

            if (beatData.length === 0) {
                beatElem.classList.add('pause');
            }
            else {
                var subIdx, subElement;
                for (subIdx = 0; subIdx < beatData.length; ++subIdx) {
                    subElement = document.createElement('div');
                    subElement.classList.add('subdivision');

                    if (beatData[subIdx] === SYMBOL_PAUSE) {
                        subElement.classList.add('pause');
                    }
                    else {
                        subElement.appendChild(document.createTextNode(beatData[subIdx]));
                    }

                    beatElem.appendChild(subElement);
                }
            }

            return beatElem;
        };

        var rhythmContainer, rhythmElement, rhythmData, beatIdx;

        rhythmContainer = document.createElement('div');
        rhythmContainer.classList.add('rhythm-container');
        rhythmElement = document.createElement('div');
        rhythmElement.classList.add('rhythm');

        rhythmData = f_parseNotation(rhytmNotation);

        for (beatIdx = 0; beatIdx < rhythmData.beats.length; ++beatIdx) {
            rhythmElement.appendChild(f_createBeatElement(rhythmData.beats[beatIdx]));
        }
        rhythmContainer.appendChild(rhythmElement);

        return rhythmContainer;
    };

    f_create_song = function(songData) {

        var f_createBarContent, f_createBarElement, f_createSequence;

        f_createBarContent = function(barData) {
            var barContentElement, barsLineContentElement;
            
            barContentElement = document.createElement('div');
            barContentElement.classList.add('bar-content');

            barsLineContentElement = document.createElement('div');
            barsLineContentElement.classList.add('barsline');
            barContentElement.appendChild(barsLineContentElement);

            if (typeof barData === 'string') {
                if (barData === 'Ref') {
                    barsLineContentElement.classList.add('refrain');
                }
                barsLineContentElement.appendChild(document.createTextNode(barData));
            }
            else {
                chords = document.createElement('div');
                chords.classList.add('chords');
                if (barData.chords) {

                    if (typeof barData.chords === 'string') {
                        chords.appendChild(document.createTextNode(barData.chords));
                    }
                    else {
                        var chord, chordIdx, chordElem;
                        for (chordIdx = 0; chordIdx < barData.chords.length; ++chordIdx) {
                            chordElem = document.createElement('div');
                            chordElem.classList.add('chord');
                            chordElem.innerHTML = barData.chords[chordIdx];

                            chords.appendChild(chordElem);
                        }
                    }
                }
                barsLineContentElement.appendChild(chords);

                lyrics = document.createElement('span');
                lyrics.classList.add('lyrics');
                if (barData.lyrics) {
                    lyrics.appendChild(document.createTextNode(barData.lyrics));
                }
                barContentElement.appendChild(lyrics);
            }

            return barContentElement;
        };
        f_createBarElement = function(barData) {
            var barElement, barContent;

            barElement = document.createElement('div');
            barElement.classList.add('bar');
            
            if (!barData) {
                barElement.classList.add('empty')
            }
            else {      
                if (barData.type === 'empty') {
                    barElement.classList.add('empty');
                }
                barContent = f_createBarContent(barData);
                
                barElement.appendChild(barContent);
            }
            
            return barElement;
        };
        f_createSequence = function(sequence) {
            var sequenceContainer, sequenceElement,
            bar, barIdx, currentBar;
            
            sequenceContainer = document.createElement('div');
            sequenceContainer.classList.add('sequence-container');
            
            if (sequence.name) {
                var nameElement = document.createElement('h2');
                nameElement.classList.add('sequence-name');
                nameElement.innerHTML = sequence.name;
                sequenceContainer.appendChild(nameElement);
            }

            
            sequenceElement = document.createElement('div');
            sequenceElement.classList.add('sequence');
            if (sequence.barsPerLine === 5) {
                sequenceElement.classList.add('len5');
            }

            for (barIdx = 0; barIdx < sequence.bars.length; ++barIdx) {
                currentBar = sequence.bars[barIdx];
                bar = f_createBarElement(currentBar);
                if ((barIdx === 0 && sequence.repeat) || currentBar.startRepeat) {
                    bar.classList.add('start-repeat');
                }
                if ((barIdx === sequence.bars.length - 1 && sequence.repeat) || currentBar.stopRepeat) {
                    bar.classList.add('stop-repeat');
                }
                sequenceElement.appendChild(bar);
            }

            sequenceContainer.appendChild(sequenceElement);

            return sequenceContainer;
        };
        


        if (!songData.parentId) {
            return;
        }
        var parentElement = document.getElementById(songData.parentId);

        var songElement = document.createElement('div');
        songElement.classList.add('song');

        var songTitle = document.createElement('h1');
        songTitle.classList.add('song-title');
        if (songData.title) {
            songTitle.appendChild(document.createTextNode(songData.title));
        }

        var songInfos = document.createElement('p');
        songInfos.classList.add('song-infos');
        if (songData.infos) {
            songData.infos.forEach(infos => {
                songInfos.appendChild(document.createTextNode(infos));
                songInfos.appendChild(document.createElement('br'));
            });
        }

        songElement.appendChild(songTitle);
        songElement.appendChild(songInfos);
        var partIdx, currentPart;
        var partsElement = document.createElement('section');
        partsElement.classList.add('parts');
        for (partIdx = 0; partIdx < songData.parts.length; ++partIdx) {
            currentPart = songData.parts[partIdx];
            
            partsElement.appendChild(f_createSequence(currentPart));
        }
        songElement.appendChild(partsElement);

        var strucIdx, currentStructure;
        var structureElement = document.createElement('section');
        structureElement.classList.add('structure');
        if (songData.structure['break']) {
            structureElement.classList.add('break');
        }
        var structureHeadline = document.createElement('h2');
        structureHeadline.appendChild(document.createTextNode('Ablauf'));
        structureHeadline.classList.add('structure-headline');
        structureElement.appendChild(structureHeadline);

        for (strucIdx = 0; strucIdx < songData.structure.parts.length; ++strucIdx) {
            currentStructure = songData.structure.parts[strucIdx];

            structureElement.appendChild(f_createSequence(currentStructure));
        }
        songElement.appendChild(structureElement);

        parentElement.appendChild(songElement);
    };

    f_create_preview = function(songScript) {
        const expressions = {
            no_linebreak: /^\n/,
            simple_sequence: /\w\s/
        };

        const parseSong = function(songScript) {
            /*
             * High-level-Song-Structructure:
             *  - one line
             *    -> Simple Sequence
             *  - multiple lines
             *    -> Simple Sequence
             *    -> Detailed Sequence
             *  - JSON
             *    -> TBC
             */
            const structure = [];
            if (songScript.includes("\n")) {
                structure.push(songScript.split("\n"))
            }
            else {
                // Simple sequence.
                structure.push(songScript.split(/\s/));
            }

            return structure;
        };

        var songElement = document.createElement('div');
        songElement.classList.add('song');

        songElement.innerHTML = songScript;

        console.log(parseSong(songScript));
        return songElement;
    };

    return {
        createRhythm: f_create_rhythm,
        createSong: f_create_song,
        createPreview: f_create_preview
    };

})();

var night_nurse = {
    "id": "night-nurse",
    "parentId": "night-nurse-container",
    "title": "Night Nurse",
    "infos": ["Gregory Isaacs - Night Nurse", "https://www.youtube.com/watch?v=k7A6Ugs0NFw"],
    "parts": [
        {
            "id": "basic-form",
            "name": "Grundform",
            "repeat": true,
            "bars": ["a", "G", "a", "G"]
        }
    ],
    "structure": {
        "parts" : [
            {
                "id": "intro",
                "bars": ["Intro"]
            },
            {
                "id": "verse1",
                "bars": ["Str", "Str", "Str"]
            },
            {
                "id": "chorus1",
                "bars": ["Ref", "Ref"]
            },
            {
                "id": "verse2",
                "bars": ["Str", "Str"]
            },
            {
                "id": "chorus2",
                "bars": ["Ref", "Ref"]
            },
            {
                "id": "instr1",
                "bars": ["Instr"]
            },
            {
                "id": "verse3",
                "bars": ["Str", "Str"]
            },
            {
                "id": "chorus3",
                "bars": ["Ref", "Ref"]
            },
            {
                "id": "outro",
                "bars": ["Outro", "Outro", "Ref/Fadeout"]
            }
        ]
    }
};

var test_songs = [
    {
        "title": "one_line_simple",
        "script": "Intro Ref Str1 Ref Str2 Ref Solo Ref Ref Ende",
    },
    {
        "title": "multi_line_simple",
        "script": "Intro Ref\nStr1 Ref Str2 Ref\nSolo Ref Ref Ende",
    }
];

// Handler when the DOM is fully loaded.
var initPage = function() {
    const songInputElement = document.getElementById("song-script");

    var removeElements = function(parentElement) {
        while (parentElement.firstChild) {
            parentElement.removeChild(parentElement.lastChild);
        }
    };
    var reloadSongPreview = function() {
        var inputText = songInputElement.value;

        var preview = songs.createPreview(inputText);

        var previewParent = document.getElementById("song-preview-output");
        removeElements(previewParent);
        previewParent.appendChild(preview);
    };

    /* Page Header */
    const pageHeader = document.getElementById("cnt-page-header");
    const navLoadSong = function(songScript) {
        songInputElement.value = songScript;
    };
    const createNavItem = function(item) {
        var navButton = document.createElement("button");
        navButton.textContent = item.title;
        navButton.addEventListener("click", () => navLoadSong(item.script));

        pageHeader.appendChild(navButton);
    };
    test_songs.forEach(createNavItem);

    document.getElementById("btn-reload-song-preview").addEventListener('click', reloadSongPreview);

    // document.getElementById("rhythm-container").appendChild(songs.createRhythm("x - x x-xx"));
    // songs.createSong(night_nurse);
};

if (document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll))
{
    initPage();
}
else {
    document.addEventListener("DOMContentLoaded", initPage);
}