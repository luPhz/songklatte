
/*
 * Song UI components, song data structures.
 */
const SongComponent = (function(){
    const context: {
        song?: SongData,
        sequenceDivisor: number
    } = {
        sequenceDivisor: 1
    };

    const _subDivision = function(subDivision: SubDivisionData) {
        console.log("subDivision:", subDivision.value);

        return subDivision.value;
    };

    const _createBeatComp = function(beatData: BeatData) {
        const beatElement = document.createElement('div');
        beatElement.classList.add('beat');
        beatElement.textContent = beatData.subDivisions.reduce((acc: string, sub: SubDivisionData) => acc + sub.value, '');

        return {
            container: beatElement
        };
    };
    const _createMeasureComp = function(measureData: MeasureData) {
        const container = document.createElement('div');
        const measureElement = document.createElement('div');

        const _createLyrics = function() {
            const lyrics = document.createElement('span');
            lyrics.classList.add('lyrics');
            console.log(measureData.lyrics)
            if (measureData.lyrics && measureData.lyrics.length > 0) {
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
                beat = _createBeatComp(beatData);
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

    const _createSequenceComp = function(sequenceData: SequenceData) {
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

            let measure = _createMeasureComp(measureData);
            measure.addStyleClass(styleClass || '');
            measure.createBeats();
            measure.createLyrics();
            sequence.appendChild(measure.container);
        };

        const _createMeasures = function() {
            for (let i = 0; i < sequenceData.parts.length; ++i) {
                let partData = sequenceData.parts[i];
                const buffer: MeasureData[] = [];
                
                for (let j = 0; j < partData.measures.length; ++j) {
                    buffer.push(partData.measures[j]);
                    if (j === 0 && partData.name) {
                        buffer[buffer.length - 1].topText = partData.name;
                    }
                    if (buffer.length === context.sequenceDivisor) {
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
            if (context.sequenceDivisor === 1) {
                context.sequenceDivisor = 2;
            }
            else if (context.sequenceDivisor === 2) {
                context.sequenceDivisor = 4;
            }
            else if (context.sequenceDivisor === 4) {
                context.sequenceDivisor = 8;
            }
            else {
                context.sequenceDivisor = 8;
            }
            _update();
        });
        let splitButton = document.createElement('button');
        splitButton.innerHTML = "< split >";

        splitButton.addEventListener('click', () => {
            if (context.sequenceDivisor === 8) {
                context.sequenceDivisor = 4;
            }
            else if (context.sequenceDivisor === 4) {
                context.sequenceDivisor = 2;
            }
            else if (context.sequenceDivisor === 2) {
                context.sequenceDivisor = 1;
            }
            else {
                context.sequenceDivisor = 1;
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

    const _createSongElements = function(song: SongData) {
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
    };

    const _createSongComponent = function(song: SongData) {
        let songElement = _createSongElements(song);
            
        if (song.data && song.data.sequence) {
            let sequence = _createSequenceComp(song.data.sequence);
            sequence.createMeasures();
            songElement.appendChild(sequence.container);
        }

        return songElement;
    };

    return {
        create: _createSongComponent
    };
})();
