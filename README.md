LSDSNG to HTML/JSON/MIDI
=================
By AdamGetsAwesome
------------------

An app to export your .lsdsng data:
- in HTML with all 4 channels side by side
- As JSON
- As a MIDI file



## Usage
1. Click "choose file" and select a .lsdsng file
2. Select output (html, json, or midi)
3. Click submit

## Outputs
* HTML
  - Shows a song view similar to LSDJ
  - Click on a row to expand into the Phrases to see notes
* JSON
  - Returns JSON representation of all song data.
  - Useful if you want the data for your own project
* MIDI
  - Returns a multitrack midi file with only note data for each track
  - Useful if you want to import your notes into a DAW
  
Get LSDManager to extract individual lsdsng song files from .sav: [https://github.com/jkotlinski/lsdmanager/releases/](https://github.com/jkotlinski/lsdmanager/releases/)

If you end up using this, say hi on [Twitter](https://twitter.com/adamgetsawesome)