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
        app.addNavItem(song.title, () => navLoadSong(song));
    });

    /* Preview test song */
    // navLoadSong(demo_songdata[1]);
});

/*
 * App startup.
 */
if (document.readyState === "complete")
{
    app.init();
}
else {
    document.addEventListener("DOMContentLoaded", app.init);
}
