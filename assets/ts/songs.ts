/*
 * Utilities.
 */
const removeChildElements = (parentElement: HTMLElement) => {
    while (parentElement.lastChild) {
        parentElement.removeChild(parentElement.lastChild);
    }
};

/*
 * App-Navigation
 */
type NavCallback = () => void;
class NavItem {
    title: string;
    action: () => void;
    
    constructor(title: string, action: NavCallback) {
        this.title = title;
        this.action = action;
    }
}
class NavigationHandler {
    navContainer!: HTMLElement;
    navItems: NavItem[];

    constructor() {
        this.navItems = [];
    }

    createNavItemElements = function(navItem: NavItem) {
        let navButton = document.createElement("button");
        navButton.textContent = navItem.title;
        navButton.addEventListener("click", navItem.action);
        
        return navButton;
    };

    addNavItem(title: string, action: () => void) {
        var navItem = new NavItem(title, action);
        this.navItems.push(navItem);
        if (this.navContainer) {
            this.navContainer.appendChild(this.createNavItemElements(navItem));
        }
    }

    init() {
        this.navContainer = document.createElement("nav");

        this.navItems.forEach(item => {
            this.navContainer.appendChild(this.createNavItemElements(item));
        });
        
        return this.navContainer;
    }
}

/*
 * The App.
 * 
 * A self-initializing collection of general utilities and features.
 * 
 * - Feature: Initializer-Callbacks
 */
type ReadyCallback = () => void;
const createAppContext = function(title: string) {
    
    const readyActions: ReadyCallback[] = [];
    
    var isInitialized = false;
    var navigation: NavigationHandler = new NavigationHandler();

    return {
        init: function() {
            /* Page Header */
            const pageHeader = document.getElementById("cnt-page-header");
            if (pageHeader) {
                pageHeader.appendChild(navigation.init());
            }
            else {
                console.error("App: Could not initialize app header.");
            }

            isInitialized = true;
            readyActions.forEach(action => action());
        },
        addNavItem: function(title: string, action: NavCallback) {
            navigation.addNavItem(title, action);
        },
        addInitializer: function(action: ReadyCallback) {
            readyActions.push(action);
            if (isInitialized) {
                action();
            }
        }
    };
};

/* Song input data */
class SongData {
    title: string = "Unnamed Song";
    script: string = '';
}

/* Song data structure */
class MeasureData {
    chords: string | string[] = '';
    lyrics: string = '';
}
class SongPart {
    name: string = "";
    measures: MeasureData[] = [];    
}
class Song {
    title: string = "";
    infos: string[] = [];
    parts: SongPart[] = [];
}

/*
* Parser Levels
*  - High level: Parts
*  - Part level: Measures
*  - Measure level: Beats
*/
class SongScriptParser {
    constructor() {
    }
    
    parseBeatScript(beatScript: string, parserContext: any) {
        return [];
    }
    parseMeasuresScript(measureScript: string, parserContext: any) {
        const measures = [];

        measureScript = measureScript.trim();
        if (measureScript.length <= 2) {
            let justANumber = parseInt(measureScript);
            if (justANumber) {
                for (let i = 0; i < justANumber; ++i) {
                    measures.push(new MeasureData());
                }
            }
            else {
                let measure = new MeasureData();
                measure.chords = measureScript;
                measures.push(measure);
            }
        }
        else {
            let measureParts;
            
            if (measureScript.includes(',')) {
                measureParts = measureScript.split(',');
            }
            else if (measureScript.includes('|')) {
                measureParts = measureScript.split('|');
            }
            else if (measureScript.includes(' ')) {
                measureParts = measureScript.split(/\s/);
            }
            else {
                measureParts = [measureScript];
            }
            
            measureParts.forEach(measurePart => {
                let measure = new MeasureData();
                measure.chords = measurePart;
                measures.push(measure);
            });
        }

        return measures;
    }
    
    parsePartScript(partScript: string, parserContext: any) {
        let part = new SongPart();

        /* Refrain: Measures */
        if (partScript.includes(":")) {
            let partInfo = partScript.split(":");
            if (partInfo.length === 2) {
                part.name = partInfo[0].trim();
                part.measures = this.parseMeasuresScript(partInfo[1], parserContext);
            }
            else {
                part.name = partInfo[0].trim();
                part.measures.push(new MeasureData());
            }
        }
        else {
            part.name = partScript;
            part.measures.push(new MeasureData());
        }
        
        return part;
    }
    
    parseSongScript(songScript: string) {
        const song = new Song();
        
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
        if (songScript.includes("\n")) {
            let parts = songScript.split("\n");

            parts.forEach(partScript => {
                if (partScript.startsWith('#')) {
                    // Comment.
                    song.infos.push(partScript);
                }
                else {
                    let part = this.parsePartScript(partScript, {});
                    song.parts.push(part);
                }
            });
        }
        else {
            // Simple sequence.
            // parts = songScript.split(/\s/);
            let part = new SongPart();
            part.measures = this.parseMeasuresScript(songScript, {});
            song.parts.push(part);
        }

        return song;
    }
}

/* UI components. */
class Sequence {
    container: HTMLElement;
    element: HTMLElement;

    constructor(name: string) {
        this.container = document.createElement('div');
        this.container.classList.add('sequence-container');
        
        let title = document.createElement('h3');
        title.textContent = name;
        this.container.appendChild(title);

        this.element = document.createElement('div');
        this.element.classList.add('sequence');

        this.container.appendChild(this.element);
    }
    addMeasure(measure: HTMLElement) {
        this.element.appendChild(measure);
    };
}
class PreviewController {
    constructor() {
    }
    
    f_createMeasureContent(barData: string | MeasureData) {
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
            let chords = document.createElement('div');
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

            let lyrics = document.createElement('span');
            lyrics.classList.add('lyrics');
            if (barData.lyrics) {
                lyrics.appendChild(document.createTextNode(barData.lyrics));
            }
            barContentElement.appendChild(lyrics);
        }

        return barContentElement;
    }
    f_createMeasureElement(measureData: any) {
        var measureContainer, measureContent;

        measureContainer = document.createElement('div');
        measureContainer.classList.add('bar');
        
        if (!measureData) {
            measureContainer.classList.add('empty')
        }
        else {      
            if (measureData.type === 'empty') {
                measureContainer.classList.add('empty');
            }
            measureContent = this.f_createMeasureContent(measureData);
            
            measureContainer.appendChild(measureContent);
        }
        
        return measureContainer;
    }

    createSongElements(song: Song) {
        const songElement = document.createElement('div');
        songElement.classList.add('song');
        
        const songTitle = document.createElement('h1');
        songTitle.classList.add('song-title');
        if (song.title) {
            songTitle.appendChild(document.createTextNode(song.title));
        }
        songElement.appendChild(songTitle);

        var songInfos = document.createElement('p');
        songInfos.classList.add('song-infos');
        songElement.appendChild(songInfos);

        
        if (song.infos.length > 0) {
            songInfos.appendChild(document.createTextNode(song.infos.join()));
        }
        
        for (let i = 0; i < song.parts.length; ++i) {
            let part = song.parts[i];
            let sequence = new Sequence(part.name);

            for (let j = 0; j < part.measures.length; ++j) {
                let measure = part.measures[j];
                if (j === 0 && !measure.chords) {
                    measure.chords = part.name;
                }
                sequence.addMeasure(this.f_createMeasureElement(measure));
            }
            songElement.appendChild(sequence.container);
        }
        
        // songElement.innerHTML = songScript;

        return songElement;
    }

    update(songData: SongData) {
        
        const parser = new SongScriptParser();

        const song = parser.parseSongScript(songData.script);
        if (songData.title) {
            song.title = songData.title;
        }
        console.log("Song", song);
        
        const songElement = this.createSongElements(song);
        
        return songElement;
    }
}



/*
* Application setup.
*/
const songApp = createAppContext("Song-Klatte");
/*
 * Custom app functionality.
 * 
 * Parse and render a songscript text input.
 * 
 */
songApp.addInitializer(() => {
    /* App elements */
    const songTitleInputElement = document.getElementById("song-name") as HTMLInputElement;
    const songScriptInputElement = document.getElementById("song-script") as HTMLInputElement;
    const previewParent = document.getElementById("song-preview-output") as HTMLElement;
    const reloadButton  = document.getElementById("btn-reload-song-preview") as HTMLElement;

    /* Create and update preview */
    const preview = new PreviewController();
    const updatePreview = function() {
        removeChildElements(previewParent);
        var previewElements = preview.update({
            title: songTitleInputElement.value,
            script: songScriptInputElement.value
        });
        previewParent.appendChild(previewElements);
    }
    /* (Re)load the preview when button is clicked */
    reloadButton.addEventListener('click', updatePreview);

    // Navigation action to load a songscript to the input.
    const navLoadSong = function(song: SongData) {
        songTitleInputElement.value = song.title;
        songScriptInputElement.value = song.script;
        updatePreview();
    };

    /* Create a navigation entry for every test song. */
    demo_songdata.forEach(song => {
        songApp.addNavItem(song.title, () => navLoadSong(song));
    });

    /* Preview test song */
    navLoadSong(demo_songdata[1]);
});

/*
 * App startup.
 */
if (document.readyState === "complete")
{
    songApp.init();
}
else {
    document.addEventListener("DOMContentLoaded", songApp.init);
}
