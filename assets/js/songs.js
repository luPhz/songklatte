/*
 * The App.
 * 
 * A self-initializing collection of general utilities and features.
 * 
 * - Feature: Initializer-Callbacks
 */
var app = (function() {
    const appContext = {};
    appContext.readyActions = [];
    appContext.isInitialized = false;
    
    appContext.navigation = (function() {
        var navContainer = null;
        
        const navItems = [];
        const createNavItemElements = function(title, action) {
            let navButton = document.createElement("button");
            navButton.textContent = title;
            navButton.addEventListener("click", action);
            
            return navButton;
        };
        
        return {
            init: () => {
                navContainer = document.createElement("nav");

                navItems.forEach(item => {
                    navContainer.appendChild(createNavItemElements(item.title, item.action));
                });
                
                return navContainer;
            },
            addItem: (title, action) => {
                navItems.push({title: title, action: action});
                if (navContainer) {
                    navContainer.appendChild(createNavItemElements(title, action));
                }
            }
        };
    })();
    
    const initApp = function() {
        
        /* Page Header */
        const pageHeader = document.getElementById("cnt-page-header");
        pageHeader.appendChild(appContext.navigation.init());

        appContext.isInitialized = true;
        appContext.readyActions.forEach(action => action());
    };

    if (document.readyState === "complete" ||
        (document.readyState !== "loading" && !document.documentElement.doScroll))
    {
        initApp();
    }
    else {
        document.addEventListener("DOMContentLoaded", initApp);
    }

    return {
        title: "Song-Klatte",
        addNavItem: appContext.navigation.addItem,
        addInitializer: (action) => {
            appContext.readyActions.push(action);
            if (appContext.isInitialized) {
                action();
            }
        },
        utils: {
            removeChildElements: (parentElement) => {
                while (parentElement.firstChild) {
                    parentElement.removeChild(parentElement.lastChild);
                }
            }
        }
    };
})();


var songs = (function() {
    var f_create_song,
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
        const f_createBarContent = function(barData) {
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
        const f_createBarElement = function(barData) {
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
        const f_createSequence = function() {
            const sequenceContainer = document.createElement('div');
            sequenceContainer.classList.add('sequence-container');
            
            const sequenceElement = document.createElement('div');
            sequenceElement.classList.add('sequence');

            sequenceContainer.appendChild(sequenceElement);

            sequenceContainer.addMeasure = function(measure) {
                sequenceElement.appendChild(measure);
            };

            return sequenceContainer;
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
            var structure;
            if (songScript.includes("\n")) {
                structure = songScript.split("\n");
            }
            else {
                // Simple sequence.
                structure = songScript.split(/\s/);
            }

            return structure;
        };
        const createSongElements = function(songData) {
            const songElement = document.createElement('div');
            songElement.classList.add('song');
            
            const sequence = f_createSequence();

            for (let i = 0; i<songData.length; ++i) {
                sequence.addMeasure(f_createBarElement(songData[i]));
            }
            
            songElement.appendChild(sequence);
            // songElement.innerHTML = songScript;

            return songElement;
        };

        const songStructure = parseSong(songScript);
        console.log("SongData", songStructure);
        
        const songElement = createSongElements(songStructure);
        
        return songElement;
    };

    return {
        createRhythm: f_create_rhythm,
        createSong: f_create_song,
        createPreview: f_create_preview
    };

})();

var test_songs = [
    {
        "title": "one_line_simple",
        "script": "Intro Ref Str1 Ref Str2 Ref Solo Ref Ref Ende",
    },
    {
        "title": "multi_line_simple",
        "script": "Intro Ref\nStr1 Ref\nStr2 Ref\nSolo Ref Ref\nEnde",
    },
    {
        "title": "whats commin next",
        "script":  `Intro
                    Instr.
                    Str. 1
                    Pre-Chorus
                    Refrain
                    Instr.
                    Str. 2
                    Pre-Chorus
                    Refrain
                    Solo
                    Solo
                    Pre-Chorus
                    Hits 2 3 1 5
                    Refrain
                    Refrain
                    Ende`
    },
];

/*
 * Custom app functionality.
 * 
 * Parse and render a songscript text input.
 * 
 */
app.addInitializer(function() {
    // The song input.
    const songInputElement = document.getElementById("song-script");
    const previewParent = document.getElementById("song-preview-output");

    // (Re)load the preview when button is clicked.
    document.getElementById("btn-reload-song-preview").addEventListener('click', () => {
        app.utils.removeChildElements(previewParent);
        
        var preview = songs.createPreview(songInputElement.value);
        previewParent.appendChild(preview);
    });

    // Navigation action to load a songscript to the input.
    const navLoadSong = function(songScript) {
        songInputElement.value = songScript;
    };

    // Create a navigation entry for every test song.
    test_songs.forEach(song => {
        app.addNavItem(song.title, () => navLoadSong(song.script));
    });
});