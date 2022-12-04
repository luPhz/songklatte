/*
 * Custom app functionality.
 * 
 * Parse and render a songscript text input.
 * 
 */
app.addInitializer(() => {
    /* App elements */
    const songTitleInputElement = document.getElementById("song-name") as HTMLInputElement;
    const songScriptInputElement = document.getElementById("song-script") as HTMLInputElement;
    const previewParent = document.getElementById("song-preview-output") as HTMLElement;
    const reloadButton  = document.getElementById("btn-reload-song-preview") as HTMLElement;

    let lyrics: string;

    const updateSongElements = function(song: SongData) {
        if (!song.data) {
            song.data = SongParser.parseSongScript(song.script);
        }
        if (song.lyrics) {
            song.addLyrics(SongData.parseLyricScript(song.lyrics));
        }
        console.log("Song", song);
        
        const songElement = SongComponent.create(song);
        
        return songElement;
    };

    /* Create and update preview */
    const update = function() {
        removeChildElements(previewParent);
        var previewElements = updateSongElements(SongData.create({
            title: songTitleInputElement.value,
            script: songScriptInputElement.value,
            lyrics: lyrics
        }));
        previewParent.appendChild(previewElements);
    }
    /* (Re)load the preview when button is clicked */
    reloadButton.addEventListener('click', update);

    // Navigation action to load a songscript to the input.
    const navLoadSong = function(song: SongData) {
        songTitleInputElement.value = song.title;
        songScriptInputElement.value = song.script;
        lyrics = song.lyrics || '';
        update();
    };

    /* Create a navigation entry for every test song. */
    demo_songdata.forEach(song => {
        app.addNavItem(song.title, () => navLoadSong(SongData.create(song)));
    });

    /* Preview test song */
    // navLoadSong(demo_songdata[1]);
});

/*
 * App startup.
 */
if (document.readyState === "complete") {
    app.init();
}
else {
    document.addEventListener("DOMContentLoaded", app.init);
}
