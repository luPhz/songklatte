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

/* Song data */
class SubDivisionData {
    static SEPARATOR = '; ';
    value: string = '';

    putValue(value: string) {
        if (this.value === '') {
            this.value = value;
        }
        else {
            this.value += SubDivisionData.SEPARATOR + value;
        }
    }

    merge(other: SubDivisionData) {
        const merged = new SubDivisionData();
        merged.value = this.value + SubDivisionData.SEPARATOR + other.value;

        return merged;
    }
    split() {
        const first = new SubDivisionData();
        const second = new SubDivisionData();

        this.value.split(SubDivisionData.SEPARATOR).forEach((value, idx, values) => {
            if (idx < Math.floor(values.length / 2)) {
                first.putValue(value);
            }
            else {
                second.putValue(value);
            }
        });

        return [first, second];
    }
}
class BeatData {
    subDivisions: SubDivisionData[] = [];

    merge(other: BeatData) {
        const merged = new BeatData();
        merged.subDivisions = this.subDivisions.concat(other.subDivisions);
        
        return merged;
    }
    split() {
        const first = new BeatData();
        const second = new BeatData();

        first.subDivisions = this.subDivisions.slice(0, this.subDivisions.length / 2);
        second.subDivisions = this.subDivisions.slice(this.subDivisions.length / 2);

        return [first, second];
    }
}
class MeasureData {
    beats: BeatData[] = [];
    lyrics: string = '';
    topText: string = '';

    prepareWithText(text: string) {
        const beat = new BeatData();
        const subDivision = new SubDivisionData();

        subDivision.putValue(text);
        beat.subDivisions.push(subDivision);
        this.beats.push(beat);
    }
    
    merge(other: MeasureData) {
        const merged = new MeasureData();
        merged.beats = this.beats.concat(other.beats);
        merged.topText = this.topText + other.topText;

        return merged;
    }
    split() {
        const first = new MeasureData();
        const second = new MeasureData();

        first.beats = this.beats.slice(0, (this.beats.length / 2) - 1);
        second.beats = this.beats.slice(this.beats.length / 2);

        return [first, second];
    }
}
class PartData {
    name: string = "";
    measures: MeasureData[] = [];
    
    merge(other: PartData) {
        const merged = new PartData();
        merged.measures = this.measures.concat(other.measures);
        
        return merged;
    }
    split() {
        const first = new PartData();
        const second = new PartData();

        first.measures = this.measures.slice(0, (this.measures.length / 2) - 1);
        second.measures = this.measures.slice(this.measures.length / 2);

        return [first, second];
    }
}
class SequenceData {
    name: string = 'Ablauf';
    parts: PartData[] = [];
    
    merge(other: SequenceData) {
        const merged = new SequenceData();
        merged.parts = this.parts.concat(other.parts);
        
        return merged;
    }
    split() {
        const first = new SequenceData();
        const second = new SequenceData();

        first.parts = this.parts.slice(0, (this.parts.length / 2) - 1);
        second.parts = this.parts.slice(this.parts.length / 2);

        return [first, second];
    }
}
class SongData {
    infos: string[] = [];
    sequence: SequenceData = new SequenceData();
}
class Song {
    title: string = "Unnamed Song";
    script: string = '';
    data?: SongData;
}

const SongElements = (function() {
    const settings = {
        sequenceDivisor: 4
    };

    const _subDivision = function(subDivision: SubDivisionData) {
        console.log("subDivision:", subDivision.value);

        return subDivision.value;
    };

    const _createBeat = function(beatData: BeatData) {
        // for (const subDivisionData of beatData.subDivisions) {
        //     _subDivision(subDivisionData);
        // }
        

        // if (measureData.length === 8) {
        //     // 1 Beat (1) -> ...
        //     // 2 Beats (1,3) -> ...
        //     // 4 Beats -> ...
        // }
        // else if (measureData.length === 4) {
        //     // 1 Beat (1) ok -> 4 Beats
        //     // 2 Beats (1,3) -> ...
        //     // 4 Beats -> ...
        // }
        // else if (measureData.length === 2) {
        //     // 1 Beat (1) -> 2 Beats
        //     // 2 Beats (1,3) -> 4 Beats
        //     // 4 Beats -> ...
        // }
        // if (measureData.length === 1) {
        //     // just add measure.
        // }
            
        const beatElement = document.createElement('div');
        beatElement.classList.add('beat');
        beatElement.textContent = beatData.subDivisions.reduce((acc: string, sub: SubDivisionData) => acc + sub.value, '');

        return {
            container: beatElement
        };
    };
    const _createMeasure = function(measureData: MeasureData) {
        const container = document.createElement('div');
        const measureElement = document.createElement('div');

        
        const _createLyrics = function() {
            const lyrics = document.createElement('span');
            lyrics.classList.add('lyrics');
            if (measureData.lyrics) {
                lyrics.appendChild(document.createTextNode(measureData.lyrics));
            }
            measureElement.appendChild(lyrics);
        };
        
        const _createBeats = function() {
            const beatsContainer = document.createElement('div');
            const beatsElement = document.createElement('div');
            var beat;

            const _createTopText = function() {
                const topText = document.createElement('div');
                topText.classList.add('top-text');
                if (measureData.topText) {
                    topText.textContent = measureData.topText;
                }
                beatsContainer.appendChild(topText);
            };
            
            for (const beatData of measureData.beats) {
                beat = _createBeat(beatData);
                beatsElement.appendChild(beat.container);
            }
            _createTopText();

            beatsContainer.classList.add('beats-container');
            beatsElement.classList.add('beats');

            beatsContainer.appendChild(beatsElement);
            measureElement.appendChild(beatsContainer);
        };

        container.classList.add('measure-container');
        measureElement.classList.add('measure');
        
        container.appendChild(measureElement);
        
        return {
            container: container,
            createBeats: _createBeats,
            createLyrics: _createLyrics,
            addStyleClass: (sc: string) => container.classList.add(sc),
            removeStyleClass: (sc: string) => container.classList.remove(sc)
        };
    };
    const _part = function(partData: PartData) {
        // for (const measure of partData.measures) {
        //     _measure(measure);
        // }
    };
    const _createSequence = function(sequenceData: SequenceData) {
        const container = document.createElement('div');
        const sequence = document.createElement('div');
        
        const _mergeAndAddMeasure = function(buffer: MeasureData[], styleClass?: string) {
            let measureData, md1, md2;
                        
            while (buffer.length > 1) {
                md1 = buffer.shift();
                md2 = buffer.shift();
                if (md1 && md2) {
                    buffer.push(md1.merge(md2));
                }
            }
            
            measureData = buffer.shift();
            if (!measureData) {
                measureData = new MeasureData();
                measureData.prepareWithText(':(');
            }

            let measure = _createMeasure(measureData);
            measure.addStyleClass(styleClass || '');
            measure.createBeats();
            sequence.appendChild(measure.container);
        };

        const _createMeasures = function() {
            for (let i = 0; i < sequenceData.parts.length; ++i) {
                let partData = sequenceData.parts[i];
                const buffer: MeasureData[] = [];
                
                for (let j = 0; j < partData.measures.length; ++j) {
                    buffer.push(partData.measures[j]);
                    if (j === 0) {
                        buffer[buffer.length - 1].topText = partData.name;
                    }
                    if (buffer.length === settings.sequenceDivisor) {
                        _mergeAndAddMeasure(buffer, i % 2 === 0 ? 'default' : 'alt');
                    }
                }
                // merge parts that have fewer measures than the divisor
                if (buffer.length) {
                    _mergeAndAddMeasure(buffer, i % 2 === 0 ? 'default' : 'alt');
                }
            }
        };
        
        const _update = function() {
            removeChildElements(sequence);
            _createMeasures();
        }
        let name = document.createElement('h3');
        name.textContent = sequenceData.name;
        
        let compressButton = document.createElement('button');
        compressButton.innerHTML = "> comp <";
        compressButton.addEventListener('click', () => {
            if (settings.sequenceDivisor === 1) {
                settings.sequenceDivisor = 2;
            }
            else if (settings.sequenceDivisor === 2) {
                settings.sequenceDivisor = 4;
            }
            else if (settings.sequenceDivisor === 4) {
                settings.sequenceDivisor = 8;
            }
            else {
                settings.sequenceDivisor = 8;
            }
            _update();
        });
        let splitButton = document.createElement('button');
        splitButton.innerHTML = "< split >";

        splitButton.addEventListener('click', () => {
            if (settings.sequenceDivisor === 8) {
                settings.sequenceDivisor = 4;
            }
            else if (settings.sequenceDivisor === 4) {
                settings.sequenceDivisor = 2;
            }
            else if (settings.sequenceDivisor === 2) {
                settings.sequenceDivisor = 1;
            }
            else {
                settings.sequenceDivisor = 1;
            }
            _update();
        });
        container.classList.add('sequence-container');
        sequence.classList.add('sequence');

        container.appendChild(name);
        container.appendChild(compressButton);
        container.appendChild(splitButton);
        container.appendChild(sequence);

        return {
            container: container,
            createMeasures: _createMeasures
        };
    };

    const _createSongElements = function(song: Song) {
        const songElement = document.createElement('div');
        
        const createTitle = function() {
            const songTitle = document.createElement('h1');
            songTitle.classList.add('song-title');
            if (song.title) {
                songTitle.textContent = song.title;
            }
            return songTitle;
        };
        
        const createInfos = function() {
            var songInfos = document.createElement('p');
            if (song.data && song.data.infos.length > 0) {
                songInfos.appendChild(document.createTextNode(song.data.infos.join()));
            }
            songInfos.classList.add('song-infos');
            return songInfos;
        };

        songElement.classList.add('song');

        songElement.appendChild(createTitle());
        songElement.appendChild(createInfos());
        
        return songElement;
    }

    const _createSongSequence = function(song: Song) {
        let songElement = _createSongElements(song);
        
        if (song.data && song.data.sequence) {
            let sequence = _createSequence(song.data.sequence);
            sequence.createMeasures();
            songElement.appendChild(sequence.container);
        }

        return songElement;
    };

    return {
        createSongSequence: _createSongSequence
    };
})();
/*
* Parser Levels
*  - High level: Parts
*  - Part level: Measures
*  - Measure level: Beats
*/
class SongScriptParser {
    constructor() {
    }
    
    parseBeatScript(beatScript: string) {
        return [];
    }
    parseMeasuresScript(measuresScript: string) {
        const measures = [];

        const _addMeasure = function(text: string) {
            const measure = new MeasureData();
            measure.prepareWithText(text);
            measures.push(measure);
        };

        measuresScript = measuresScript.trim();
        if (measuresScript.length <= 2) {
            let justANumber = parseInt(measuresScript);
            if (justANumber) {
                for (let i = 0; i < justANumber; ++i) {
                    measures.push(new MeasureData());
                }
            }
            else {
                _addMeasure(measuresScript);
            }
        }
        else {
            let measureParts: string[];
            
            if (measuresScript.includes(',')) {
                measureParts = measuresScript.split(',');
            }
            else if (measuresScript.includes('|')) {
                measureParts = measuresScript.split('|');
            }
            else if (measuresScript.includes(' ')) {
                measureParts = measuresScript.split(/\s/);
            }
            else {
                measureParts = [measuresScript];
            }
            
            measureParts.forEach(_addMeasure);
        }

        return measures;
    }
    
    parsePartScript(partScript: string): PartData {
        let part = new PartData();

        const _prepareSimplePart = function(text: string) {
            const measureData = new MeasureData();
            measureData.prepareWithText(text);
            part.measures.push(measureData);
            part.name = text;
        };
        /* Refrain: Measures */
        if (partScript.includes(":")) {
            let partInfo = partScript.split(":");
            if (partInfo.length === 2) {
                part.name = partInfo[0].trim();
                part.measures = this.parseMeasuresScript(partInfo[1]);
            }
            else {
                _prepareSimplePart(partInfo[0].trim());
            }
        }
        else {
            _prepareSimplePart(partScript);
        }
        
        return part;
    }
    
    parseSongScript(songScript: string): SongData {
        const song = new SongData();
        
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
                    let part = this.parsePartScript(partScript);
                    song.sequence.parts.push(part);
                }
            });
        }
        else {
            // Simple sequence.
            // parts = songScript.split(/\s/);
            let part = new PartData();
            part.measures = this.parseMeasuresScript(songScript);
            song.sequence.parts.push(part);
        }

        return song;
    }
}

class SongController {
    constructor() {
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

    const updateSongElements = function(song: Song) {  
        const parser = new SongScriptParser();

        if (!song.data) {
            song.data = parser.parseSongScript(song.script);
        }
        console.log("Song", song);
        
        const songElement = SongElements.createSongSequence(song);
        
        return songElement;
    };

    /* Create and update preview */
    const update = function() {
        removeChildElements(previewParent);
        var previewElements = updateSongElements({
            title: songTitleInputElement.value,
            script: songScriptInputElement.value
        });
        previewParent.appendChild(previewElements);
    }
    /* (Re)load the preview when button is clicked */
    reloadButton.addEventListener('click', update);

    // Navigation action to load a songscript to the input.
    const navLoadSong = function(song: Song) {
        songTitleInputElement.value = song.title;
        songScriptInputElement.value = song.script;
        update();
    };

    /* Create a navigation entry for every test song. */
    demo_songdata.forEach(song => {
        songApp.addNavItem(song.title, () => navLoadSong(song));
    });

    /* Preview test song */
    // navLoadSong(demo_songdata[1]);
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
