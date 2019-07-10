const BLOCKSIZE = 0x200;
const DEFAULT_INSTRUMENT = [0xa8,0x0,0x0,0xff,0x0,0x0,0x3,0x0,0x0,0xd0,0x0,0x0,0x0,0xf3,0x0,0x0];
const DEFAULT_WAV = [0x8e,0xcd,0xcc,0xbb,0xaa,0xa9,0x99,0x88,0x87,0x76,0x66,0x55,0x54,0x43,0x32,0x31];
const NOTES = ['---', 'C 3', 'C#3', 'D 3', 'D#3', 'E 3', 'F 3', 'F#3', 'G 3', 'G#3', 'A 3', 'A#3', 'B 3', 'C 4', 'C#4', 'D 4', 'D#4', 'E 4', 'F 4', 'F#4', 'G 4', 'G#4', 'A 4', 'A#4', 'B 4', 'C 5', 'C#5', 'D 5', 'D#5', 'E 5', 'F 5', 'F#5', 'G 5', 'G#5', 'A 5', 'A#5', 'B 5', 'C 6', 'C#6', 'D 6', 'D#6', 'E 6', 'F 6', 'F#6', 'G 6', 'G#6', 'A 6', 'A#6', 'B 6', 'C 7', 'C#7', 'D 7', 'D#7', 'E 7', 'F 7', 'F#7', 'G 7', 'G#7', 'A 7', 'A#7', 'B 7', 'C 8', 'C#8', 'D 8', 'D#8', 'E 8', 'F 8', 'F#8', 'G 8', 'G#8', 'A 8', 'A#8', 'B 8', 'C 9', 'C#9', 'D 9', 'D#9', 'E 9', 'F 9', 'F#9', 'G 9', 'G#9', 'A 9', 'A#9', 'B 9', 'C A', 'C#A', 'D A', 'D#A', 'E A', 'F A', 'F#A', 'G A', 'G#A', 'A A', 'A#A', 'B A', 'C B', 'C#B', 'D B', 'D#B', 'E B', 'F B', 'F#B', 'G B', 'G#B', 'A B', 'A#B', 'B B'];
const EFFECTS = ['-','A','C','D','E','F','G','H','K','L','M','O','P','R','S','T','V','Z'];
const TRANSPOSE = ['B 3', 'C 3', 'C#3', 'D 3', 'D#3', 'E 3', 'F 3', 'F#3', 'G 3', 'G#3', 'A 3', 'A#3'];
const CHANS = ['pu1', 'pu2', 'wav', 'noi'];

const lsdsng = {
  "version": 0,
  "initflags": [],
  "tempo": 0,
  "tunesetting": 0,
  "filechanged": 0,
  "clock": {
    "hours": 0,
    "minutes": 0,
    "total": {
      "days": 0,
      "hours": 0,
      "minutes": 0,
      "checksum": 0
    },
  },
  "options": {
    "keydelay": 0,
    "keyrepeat": 0,
    "font": 0,
    "syncsetting": 0,
    "colorset": 0,
    "clone": 0,
    "powersave": 0,
    "prelisten": 0,
    "wavesynthoverwrite": []
    
  },
  "songchains": {
    "pu1": [],
    "pu2": [],
    "wav": [],
    "noi": []
  },
  "chains": {
    "phrases": [],
    "transpose": []
  },
  "phrases": {
    "allocation": [],
    "notes": [],
    "fx": [],
    "fxval": [],
    "instruments": []
  },
  "tables": {
    "allocation": [],
    "envelope": [],
    "transpose": [],
    "fx": [],
    "fxval": [],
    "fx2": [],
    "fx2val": []
  },
  "instruments": {
    "allocation": [],
    "names": [],
    "params": [],
    "speech": {
      "words": [],
      "wordnames": []
    },
    "softsynthparams": [],
    "waveframes": []
  },
  "bookmarks": [],
  "grooves": []
};
exports.unpack = function (data) {
  let lsdsngObj = JSON.parse(JSON.stringify(lsdsng));
  let decompressedData = [];
  let bank = 0;
  let name = data.slice(0,8);
  let ver = data.slice(8,1);
  data = data.slice(9);
  let i = 0;
  while (i < data.length) {
    if (data[i] == 0xc0) {
      if (data[i+1] == 0xc0) {
        // console.log('double 0xc0');
        decompressedData.push(0xc0);
        i+=2;
      }
      else {
        for (let j = 0; j < data[i+2]; j++) {
          decompressedData.push(data[i+1]);
        }
        i+=3;
      }
    }
    else if (data[i] == 0xe0) {
      if (data[i+1] == 0xe0) {
        decompressedData.push(0xe0);
        i+=2;
      }
      else if (data[i+1] == 0xf1) {
        // console.log('default instrument');
        for (let j = 0; j < data[i+2]; j++) {
          decompressedData.push(...DEFAULT_INSTRUMENT);
        }
        i+=3;
      }
      else if (data[i+1] == 0xf0) {
        // console.log('default wave');
        for (let j = 0; j < data[i+2]; j++) {
          decompressedData.push(...DEFAULT_WAV);
        }
        i+=3
      }
      else if (data[i+1] == 0xff) {
        break;
      }
      else {
        bank++;
        i = bank*BLOCKSIZE;
      }
    }
    else {
      decompressedData.push(data[i]);
      i++;
    }
  }
  i = 0
  for (i; i < 0x0ff0; i+=16) {
    lsdsngObj.phrases.notes.push(decompressedData.slice(i,i+16))
  }
  for (i; i < 0x1030; i+=64) {
    lsdsngObj.bookmarks = decompressedData.slice(i, i+64)
  }
  i+=96;
  for (i; i < 0x1290; i+=2) {
    lsdsngObj.grooves.push(decompressedData.slice(i, i+2));
  }
  for (i; i < 0x1690; i+=4) {
    lsdsngObj.songchains.pu1.push(decompressedData[i]);
    lsdsngObj.songchains.pu2.push(decompressedData[i+1]);
    lsdsngObj.songchains.wav.push(decompressedData[i+2]);
    lsdsngObj.songchains.noi.push(decompressedData[i+3]);
  }
  for (i; i < 0x1890; i+=16) {
    lsdsngObj.tables.envelope.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x1dd0; i+=32) {
    lsdsngObj.instruments.speech.words.push(decompressedData.slice(i, i+32));
  }
  for (i; i < 0x1e78; i+=4) {
    lsdsngObj.instruments.speech.wordnames.push(decompressedData.slice(i, i+4));
  }
  i+=2;
  for (i; i < 0x1fba; i+=5) {
    lsdsngObj.instruments.names.push(decompressedData.slice(i, i+5));
  }
  i+=102;
  lsdsngObj.tables.allocation = decompressedData.slice(i, i+=32);
  lsdsngObj.instruments.allocation = decompressedData.slice(i, i+=64);
  for (i; i < 0x2880; i+=16) {
    lsdsngObj.chains.phrases.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x3080; i+=16) {
    lsdsngObj.chains.transpose.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x3480; i+=16) {
    lsdsngObj.instruments.params.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x3680; i+=16) {
    lsdsngObj.tables.transpose.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x3880; i+=16) {
    lsdsngObj.tables.fx.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x3a80; i+=16) {
    lsdsngObj.tables.fxval.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x3c80; i+=16) {
    lsdsngObj.tables.fx2.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x3e80; i+=16) {
    lsdsngObj.tables.fx2val.push(decompressedData.slice(i, i+16));
  }
  lsdsngObj.initflags.push(decompressedData.slice(i, i+=2));
//   todo make array of length 256 and 128 for phrase and chain allocation respectively
  lsdsngObj.phrases.allocation = decompressedData.slice(i, i+=32);
  lsdsngObj.chains.allocation = decompressedData.slice(i, i+=16);
  for (i; i < 0x3fb2; i+=16) {
    lsdsngObj.instruments.softsynthparams.push(decompressedData.slice(i, i+16));
  }
  lsdsngObj.clock.hours = decompressedData[i++];
  lsdsngObj.clock.minutes = decompressedData[i++];
  lsdsngObj.tempo = decompressedData[i++];
  lsdsngObj.tunesetting = decompressedData[i++];
  lsdsngObj.clock.total.days = decompressedData[i++];
  lsdsngObj.clock.total.hours = decompressedData[i++];
  lsdsngObj.clock.total.minutes = decompressedData[i++];
  lsdsngObj.clock.total.checksum = decompressedData[i++];
  lsdsngObj.options.keydelay = decompressedData[i++];
  lsdsngObj.options.keyrepeat = decompressedData[i++];
  lsdsngObj.options.font = decompressedData[i++];
  lsdsngObj.options.syncsetting = decompressedData[i++];
  lsdsngObj.options.colorset = decompressedData[i++];
  
  i++;
  
  lsdsngObj.options.clone = decompressedData[i++];
  lsdsngObj.filechanged = decompressedData[i++];
  lsdsngObj.options.powersave = decompressedData[i++];
  lsdsngObj.options.prelisten = decompressedData[i++];
  lsdsngObj.options.wavesynthoverwrite = decompressedData.slice(i, i+=2);
  
  i+=58;
  for (i; i < 0x4ff0; i+=16) {
    lsdsngObj.phrases.fx.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x5fe0; i+=16) {
    lsdsngObj.phrases.fxval.push(decompressedData.slice(i, i+16));
  }
  i+=32;
  
  for (i; i < 0x7000; i+=16) {
    lsdsngObj.instruments.waveframes.push(decompressedData.slice(i, i+16));
  }
  for (i; i < 0x7ff0; i+=16) {
    lsdsngObj.phrases.instruments.push(decompressedData.slice(i, i+16));
  }
  lsdsngObj.initflags.push(decompressedData.slice(i, i+=2));
  i+=13;
  lsdsngObj.version = decompressedData[i++];
  return lsdsngObj;
}
exports.makeHTML = function (data) {
  let outputHTML = "";
  outputHTML += `<html><head><link rel="stylesheet" href="styles.css" type="text/css"</head><body>`;
  outputHTML += `<div class="divTableBody">`;
  outputHTML += `<div class="dt">`;
  // for (let i = 0; i < CHANS.length; i++) {
  //   outputHTML += `<div class="dc">chain</div>`;
  //   outputHTML += `<div class="dc">phrase ${CHANS[i]}</div>`;
  // }
  let chain;
  outputHTML += `<div class="dr"><div class="dc">row</div><div class="dc">pu1</div><div class="dc">pu2</div><div class="dc">wav</div><div class="dc">noi</div></div>\n`;
  for (let i = 0; i < 256; i++) {
    outputHTML += `<div class="dr" onclick="expand('r${i}')"><div class="dc">${String('0'+(i.toString(16))).toUpperCase().slice(-2)}</div>\n`;
    for (let j = 0; j < CHANS.length; j++) {
      chain = data.songchains[CHANS[j]][i];
      if (chain == 255) {
        chain = '--';
      }
      outputHTML += `<div class="dc1">${String('0'+(chain.toString(16))).toUpperCase().slice(-2)}</div>\n`;
    }
    outputHTML += `</div>\n`;
    outputHTML += `<div class="dr2" id="r${i}" style = "visibility: collapse">\n`;
    outputHTML += `<div class="dc"></div>\n`;    
    for (let j = 0; j < CHANS.length; j++) {      
      outputHTML += `<div class="dc3">\n`;    
      chain = data.songchains[CHANS[j]][i];
      if (chain == 255) {
        chain = '--';
      }
      for (let k = 0; k < 16; k++) {
        if (chain == '--') {
          // outputHTML += `<div class="divTableCell">${t}</div>`;
        }
        else {
          let phrase = data.chains.phrases[chain][k];
          let transpose = data.chains.transpose[chain][k];
          // to do: implement transpose into the note display
          if (transpose > 127) {
            transpose = transpose-256;
          }
          if (phrase == '255') {
            phrase = '--';
          }
          outputHTML += `<div class="dr2">\n`;    
          outputHTML += `<div class="dc">${String('0'+(phrase.toString(16))).toUpperCase().slice(-2)}</div>\n`;
          outputHTML += `<div class="dc3"></div><div class="dc3">\n`;    
          for (let l = 0; l < 16; l++) {
            outputHTML += `<div class="dr">\n`;
            if (phrase != '--') {
              outputHTML += `<div class="dc">${String('0'+l.toString(16)).toUpperCase().slice(-2)}</div>`;
              let note = data.phrases.notes[phrase][l];
              if (note != 0) {
                if (note + transpose < 0) {
                  note = TRANSPOSE[(note+transpose)%12];
                }
                else {
                  note = NOTES[note+transpose];
                }
              }
              else {
                note = NOTES[0];
              }
              outputHTML += `<div class="dc">${note}</div>`;
              let instrument = data.phrases.instruments[phrase][l];
              if (instrument == 255) {
                instrument = "--";
              }
              outputHTML += `<div class="dc">${'I'+String('0'+instrument.toString(16)).toUpperCase().slice(-2)}</div>`;
              outputHTML += `<div class="dc2">${EFFECTS[data.phrases.fx[phrase][l]]+String('0'+data.phrases.fxval[phrase][l].toString(16)).toUpperCase().slice(-2)}</div>`;
              // outputHTML += `<div class="dc">${String('0'+data.phrases.fxval[phrase][l].toString(16)).toUpperCase().slice(-2)}</div>`;
            }
          outputHTML += `</div>`;            
          }
        outputHTML += `</div></div>`;                      
        }
      }
      outputHTML += `</div>\n`;
    }
    outputHTML += `</div>\n`;

  }
  outputHTML += `</tbody></table>`;
  outputHTML += `<script type="text/javascript" src="expander.js"></script>`;
  outputHTML += `</body></html>`;
  return outputHTML;
}