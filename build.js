// Build mdi.iconjar  = v2
// zip >
// - icons            = Folder
//  - account.svg     = Optimized SVG
// - zip > meta       = Zip of meta~
//  - meta~           = JSON
const fs = require('fs');
const archiver = require('archiver');

const name = "Material Design Icons";
const outputFile = `${name.toLowerCase().replace(/ /g, "-")}.iconjar.zip`;
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip');
const outputMeta = fs.createWriteStream(`meta.zip`);
const archiveMeta = archiver('zip');
const packageId = "38EF63D0-4744-11E4-B3CF-842B2B6CFE1B";
const svgPackageFolder = "./node_modules/@mdi/svg";
const encoding = "utf8";
const template = {
  meta: {
    version: 2,
    build: {
      version: "2243",
      build: "2.2.43"
    },
    date: "2018-04-01 13:35:57"
  },
  licences: {
    "69A6D789-4E3C-4379-86CC-4D83B1C3F8D8": {
      "url": "https://github.com/Templarian/MaterialDesign/blob/master/LICENSE",
      "text": "Please read the license url for more details.",
      "identifier": "69A6D789-4E3C-4379-86CC-4D83B1C3F8D8",
      "name": "MIT"
    }
  },
  groups: {
    "8AAED7CC-46CE-427F-BE00-36E53E94C6AF": {
        "sort": 1,
        "identifier": "8AAED7CC-46CE-427F-BE00-36E53E94C6AF",
        "name": "Regular"
    }
  },
  sets: {},
  items: {}
};
template.sets[packageId] = {
  date: "2018-04-02 13:35:45",
  name: name,
  sort: 1,
  licence: "69A6D789-4E3C-4379-86CC-4D83B1C3F8D8",
  parent: "8AAED7CC-46CE-427F-BE00-36E53E94C6AF",
  identifier: packageId
};

function getVersion() {
  const file = fs.readFileSync(`${svgPackageFolder}/package.json`, { encoding });
  return JSON.parse(file).version;
}

function getMetaJson() {
  const contents = fs.readFileSync(`${svgPackageFolder}/meta.json`, { encoding });
  return JSON.parse(contents);
}

function getSvgFiles() {
  return fs.readdirSync(`${svgPackageFolder}/svg`).map(file => {
    return `${svgPackageFolder}/svg/${file}`;
  })
}

function build() {
  const version = getVersion();
  const files = getSvgFiles();
  const icons = getMetaJson();
  icons.forEach((icon) => {
    template.items[icon.id] = {
      width: 24,
      height: 24,
      parent: packageId,
      date: "2018-04-02 13:35:45",
      identifier: icon.id,
      file: `${icon.name}.svg`,
      type: 0, // SVG
      name: icon.name,
      tags: [...icon.tags, ...icon.aliases].join(',').replace(/ \/ /g, "-").replace(/ /g, "-")
    }
  });
  output.on('finish', function () {
    console.log(`> [${archive.pointer()}] "${outputFile}" zip created.`);
    // remove meta.zip
    fs.unlinkSync(`meta.zip`);
    console.log(`> "meta.zip" zip removed.`);
    console.log(`Successfully built v${version}!`);
  });
  outputMeta.on('finish', function () {
    console.log(`> [${archiveMeta.pointer()}] "meta.zip" zip created.`);
    archive.pipe(output);
    archive.file(`meta.zip`, { name: `${name.toLowerCase().replace(/ /g, "-")}.iconjar/META` });
    archive.directory(`${svgPackageFolder}/svg`, `${name.toLowerCase().replace(/ /g, "-")}.iconjar/icons`);
    archive.finalize();
  });
  archiveMeta.pipe(outputMeta);
  archiveMeta.append(JSON.stringify(template), { name: 'META~' });
  archiveMeta.finalize();
}

// meta~ => meta
archiveMeta.on('error', (err) => {
  throw err;
});

// build -> outputFile
archive.on('error', (err) => {
  throw err;
});

build();
