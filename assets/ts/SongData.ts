/*
 * Song data structures and parsers.
 *
 * SongScript Parser Levels
 *  - High level: Parts (\n)
 *  - Part level: Measures (|)
 *  - Measure level: Beats (,)
 *  - Beat level: Subdivisions (-)
 * 
 * LyricScript Parer Levels
 *  - Line: Measures ()
 *  - Measure Level: Beats (,)
 *  - Subdivisions (-)
 */
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

    prepareWithText(text: string) {
        const subDivision = new SubDivisionData();

        subDivision.putValue(text);
        this.subDivisions.push(subDivision);
    }
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

    addBeat(beat: BeatData) {
        this.beats.push(beat);
    }
    prepareWithText(text: string) {
        const beat = new BeatData();
        beat.prepareWithText(text);
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
    name?: string;
    measures: MeasureData[] = [];
    
    addMeasures(measures: MeasureData[]) {
        this.measures.push(...measures);
    }
    prepareWithText(text: string) {
        const measureData = new MeasureData();
        measureData.prepareWithText(text);
        this.measures.push(measureData);
        this.name = text;
    }

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
class SongComponentData {
    infos: string[] = [];
    sequence: SequenceData = new SequenceData();

    addPart(songPart: PartData) {
        this.sequence.parts.push(songPart);
    }
}
class SongData {
    title: string = "Unnamed Song";
    script: string = '';
    lyrics?: string;
    data?: SongComponentData;

    addLyrics(lyrics: string[]) {
        let i = 0;
        
        this.data?.sequence.parts.forEach((part) => {
            part.measures.forEach((measure) => {
                if (i < lyrics.length) {
                    measure.lyrics = lyrics[i];
                    ++i;
                }
            })
        });
    }
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

    /*
     * Lyrics:
     *  lines (:3 skip 3 measures)
     */
    static parseLyricScript = function(lyricsScript: string) {
        const lyrics = [];
    
        if (lyricsScript.includes("\n")) {
            let lines = lyricsScript.split("\n");

            lines.forEach(line => {
                if (line.startsWith(':')) {
                    // Skip measures... new Part
                }
                else {
                    /* | Da Da Da | or | Da Da Da - | */
                    lyrics.push(...line.split("|"));
                }
            });
        }
        else {
            lyrics.push(...lyricsScript.split("|"));
        }
        
        return lyrics;
    };

    static create(songInputs: {title: string, script: string, lyrics?: string}) {
        const song = new SongData();
        song.title = songInputs.title;
        song.script = songInputs.script;

        if (songInputs.lyrics) {
            song.lyrics = songInputs.lyrics;
        }
        return song;
    }
}
