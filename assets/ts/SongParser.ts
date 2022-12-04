const SongParser = (function(){
    const craeteBeat = function(beatScript: string) {
        const beat = new BeatData();

        if (beatScript.includes(' ')) {
            beatScript.split(/\s/).forEach(sub => {
                const subDiv = new SubDivisionData();
                subDiv.putValue(sub);
                beat.subDivisions.push(subDiv);
            });
        }
        else {
            beat.prepareWithText(beatScript);
        }

        return beat;
    };

    const createMeasure = function(measuresScript: string) {
        const measure = new MeasureData();

        let beats: string[];
        if (measuresScript.includes(',')) {
            beats = measuresScript.split(',');
        }
        else if (measuresScript.includes(' ')) {
            beats = measuresScript.split(/\s/);
        }
        else {
            beats = [measuresScript];
        }

        beats.forEach(beat => measure.addBeat(craeteBeat(beat)));

        return measure;
    };
    const createMeasures = function(measuresScript: string) {
        const measures = [];

        measuresScript = measuresScript.trim();
        if (measuresScript.length <= 2) {
            let justANumber = parseInt(measuresScript);
            if (justANumber) {
                for (let i = 0; i < justANumber; ++i) {
                    measures.push(new MeasureData());
                }
            }
            else {
                measures.push(createMeasure(measuresScript));
            }
        }
        else {
            let measureParts: string[];
            
            if (measuresScript.includes('|')) {
                measureParts = measuresScript.split('|');
            }
            else if (measuresScript.includes(',')) {
                measureParts = measuresScript.split(',');
            }
            else if (measuresScript.includes(' ')) {
                measureParts = measuresScript.split(/\s/);
            }
            else {
                measureParts = [measuresScript];
            }
            
            measureParts.forEach(part => measures.push(createMeasure(part)));
        }

        return measures;
    };

    const createSongPart = function(partScript: string) {
        const part = new PartData();

        /* Refrain: Measures */
        if (partScript.includes(":")) {
            const partInfo = partScript.split(":");
            if (partInfo.length === 2) {
                part.name = partInfo[0].trim();
                part.addMeasures(createMeasures(partInfo[1]));
            }
            else {
                part.prepareWithText(partInfo[0].trim());
            }
        }
        else {
            part.addMeasures(createMeasures(partScript));
        }
        
        return part;
    };

    const _parseSongScript = function(songScript: string): SongComponentData {
        const song = new SongComponentData();

        if (songScript.includes("\n")) {
            songScript.split("\n").forEach(line => {
                if (line.startsWith('#')) {
                    // Comment.
                    song.infos.push(line);
                }
                else if (line.startsWith(':')) {
                    // Control sequence. (skip measures, song config)
                }
                else {
                    song.addPart(createSongPart(line));
                }
            });
        }
        else {
            // Simple sequence.
            song.addPart(createSongPart(songScript));
        }
        
        return song;
    };

    return {
        parseSongScript: _parseSongScript
    };
})();