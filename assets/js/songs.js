var songs = (function() {
    var c = {},
        f_create_song,
        f_create_rhythm;

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

    return {
        createRhythm: f_create_rhythm,
        createSong: f_create_song
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

var my_number = {
    "id": "my-number",
    "parentId": "my-number-container",
    "title": "54-46 Was My Number",
    "infos": ["Toots & The Maytals - 54-46 Was My Number", "https://www.youtube.com/watch?v=wNxNwvjzGM0"],
    "parts": [
        {
            "id": "basic-form",
            "name": "Grundform",
            "repeat": true,
            "barsPerLine": 8,
            "bars": ["G", "C", "G", "C","G", "C", "G", "C"]
        },
        {
            "id": "hits",
            "name": "Hits",
            "barsPerLine": 5,
            "bars": [
                {"chords": "(Auftakt)", "lyrics": "Give it to me", "type": "empty"},
                {"chords": "G", "lyrics": "One time!"},
                {"chords": ['C'], "lyrics": "Give it to me"},
                {"lyrics": "Two times!"},
                {"chords": ['C', 'C', '', ''], "lyrics": "Give it to me"},
                "",
                {"lyrics": "Three times!"},
                {"chords": ['C', 'C', 'C', ''], "lyrics": "Give it to me"},
                {"lyrics": "Four times!"},
                {"chords": ['C', 'C', 'C', 'C']}
            ]
        }
    ],
    "structure": {
        "parts": [
            {
                "id": "intro",
                "bars": ["Intro", "Yeah"]
            },
            {
                "id": "round1",
                "bars": ["Str (kurz)", "Str", "Str", "Hits", "54-46", "54-46"]
            },
            {
                "id": "round2",
                "bars": ["Yeah", "Skat", "Skat", "Hits* (D)", "Skat", "Skat (lang)"]
            },
            {
                "id": "outro",
                "bars": ["54-46", "Outro"]
            }
        ],
        "break": true
    } 
};

var rat_race = {
    "id": "rat-race",
    "parentId": "rat-race-container",
    "title": "Rat Race",
    "infos": ["Bob Marley & The Wailers - Rat Race", "https://www.youtube.com/watch?v=5Qe23LVs2O4"],
    "parts": [
        {
            "id": "basic-form",
            "name": "Grundform",
            "repeat": true,
            "barsPerLine": 8,
            "bars": ["Bb", "Bb", "Bb", "Bb","Cm", "Cm", "Cm", "Cm"]
        },
        {
            "id": "basic-form",
            "name": "Intro",
            // "barsPerLine": 5,
            "bars": [
                "",
                {"chords": ["x", "x", "x", "x"], "type": "empty"},
                {"chords": ["c", "b", "g", "#d"], "startRepeat": true},
                { "chords": ["-", "", "Uh!", "", "-", "", "g", "b"]},
                { "chords": ["c", "c", "c", "", "-", "", "b", ""]},
                { "chords": ["c", "to", "rude!", "-"], "stopRepeat": true},
                { "chords": ["Oh what a rat"]},
                { "chords": ["Race"]}
            ]
        }
    ],
    "structure": {
        "parts" : [
            {
                "id": "intro",
                "bars": ["Intro (+1)"]
            },
            {
                "id": "round1",
                "bars": ["Ref", "Ref", "Str A", "Str A"]
            },
            {
                "id": "round2",
                "bars": ["Str B", "Str B", "Ref"]
            },
            {
                "id": "round3",
                "bars": ["Str B", "Str B", "Ref"]
            },
            {
                "id": "outro",
                "bars": ["Str C", "Outro"]
            }
        ]
    }
};

var devil = {
    "id": "devil",
    "parentId": "devil-container",
    "title": "Chase the Devil",
    "infos": ["I Chase The Devil - Max Romeo, The Upsetters, Lee Scratch Perry", "https://www.youtube.com/watch?v=PqyDn9dXj5k"],
    "parts": [
        {
            "id": "basic-form",
            "name": "Grundform",
            "repeat": true,
            "barsPerLine": 8,
            "bars": ["Am", "Em", "Dm", "Am"]
        },
        {
            "id": "b-part",
            "name": "B-Teil",
            "repeat": true,
            "barsPerLine": 8,
            "bars": ["Dm", "Em", "Dm", "Em"]
        }
    ],
    "structure": {
        "parts" : [
            {
                "id": "intro",
                "bars": ["Intro"]
            },
            {
                "id": "melody1",
                "bars": ["Melodie (8)"]
            },
            {
                "id": "round1",
                "bars": ["Ref (Shirt)", "Ref (Shirt)", "Ref (Space)", "Ref (Space)"]
            },
            {
                "id": "B-Teil",
                "info": "kein offbeat",
                "bars": ["B-Teil", "B-Teil"]
            },
            {
                "id": "round2",
                "bars": ["Ref (Shirt)", "Ref (Shirt)", "Ref (Space)", "Ref (Space)"]
            },
            {
                "id": "melody2",
                "bars": ["Melodie (8)"]
            },
            {
                "id": "B-Teil 2",
                "bars": ["B-Teil", "B-Teil"]
            },
            {
                "id": "round3",
                "bars": ["Ref (Shirt)", "Ref (Shirt)", "Ref (Space)", "Ref (Space)"]
            },
            {
                "id": "B-Teil 3",
                "bars": ["B-Teil", "B-Teil"]
            },
            {
                "id": "round4",
                "bars": ["Ref (Shirt)", "Ref (Shirt)", "Ref (Space)", "Ref (Space)"]
            },
            {
                "id": "dubgroove",
                "bars": ["Dub Groove (2)", "Dub Low (2)", "Dub Rap"]
            },
            {
                "id": "B-Teil 4",
                "bars": ["B-Teil", "B-Teil"]
            },
            {
                "id": "round5",
                "bars": ["Ref (Shirt)", "Ref (Shirt)"]
            },
            {
                "id": "dubgroove2",
                "bars": ["Melodie Rap (8)", "Dub Rap (8)"]
            },
            {
                "id": "round6",
                "bars": ["Ref (Space)", "Ref (Space)"]
            },
            {
                "id": "B-Teil 5",
                "bars": ["B-Teil", "B-Teil"]
            },
            {
                "id": "round7",
                "bars": ["Ref (Shirt)", "Ref (Shirt)"]
            },
            {
                "id": "dubgroove3",
                "bars": ["Melodie Rap (4)"]
            },
            {
                "id": "round8",
                "bars": ["Ref (Space)", "Ref (Space)"]
            },
            {
                "id": "dubgroove4",
                "bars": ["Melodie Rap (8)"]
            }
        ]
    }
};

var initPage = function() {

    // Handler when the DOM is fully loaded
    console.log('initPage.');

    // document.querySelector("#btn-contact-send").addEventListener('click', happypac.send);

    
    document.getElementById("rhythm-container").appendChild(songs.createRhythm("x - x x-xx"));

    songs.createSong(night_nurse);

    
    songs.createSong(my_number);

    songs.createSong(rat_race);
    songs.createSong(devil);
};

if (document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll))
{
    initPage();
}
else {
    document.addEventListener("DOMContentLoaded", initPage);
}