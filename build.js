// Build mdi.iconjar  = v2
// zip >
// - icons            = Folder
//  - account.svg     = Optimized SVG
// - zip > meta       = Zip of meta~
//  - meta~           = JSON
const fs = require('fs');
const archiver = require('archiver');

const buildFolder = "build";
const outputFile = "mdi.iconjar";
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip');
const outputMeta = fs.createWriteStream(`${buildFolder}/META`);
const archiveMeta = archiver('zip');
const packageId = "38EF63D0-4744-11E4-B3CF-842B2B6CFE1B";
const svgPackageFolder = "./node_modules/@mdi/svg";
const encoding = "utf8";
const name = "Material Design Icons";
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
  sets: {},
  items: {}
};
template.sets[packageId] = {
  date: "2016-01-30 13:35:44",
  name: name,
  sort: 1,
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

function removeDirectory(path) {
  if (!path) { throw "omg, don't do that!"; }
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index){
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function makeDirectory(folder) {
  fs.mkdirSync(folder);
}

function getSvgFiles() {
  return fs.readdirSync(`${svgPackageFolder}/svg`).map(file => {
    return `${svgPackageFolder}/svg/${file}`;
  })
}

function getNameWithPaths(files) {
  // { name: "icon-name", path: "M..." }
  return files.map(file => {
    const name = file.match(/([^\/]+)\.svg$/)[1];
    const path = fs.readFileSync(file, { encoding }).match(/d="([^"]+)"/)[1];
    return { name, path };
  })
}

function writeFile(name, data) {
  fs.writeFileSync(`./${name}`, data, { encoding });
}

function build() {
  const version = getVersion();
  const files = getSvgFiles();
  const icons = getMetaJson();
  removeDirectory('build')
  makeDirectory('build');
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
      tags: [...icon.tags, ...icon.aliases].join(','),
      unicode: icon.codepoint
    }
  });
  writeFile('build/META~', JSON.stringify(template));
  archiveMeta.pipe(outputMeta);
  archiveMeta.bulk([
      { expand: true, cwd: 'source', src: ["build/META~"], dest: 'source'}
  ]);
  archiveMeta.finalize();
  outputMeta.on('close', function () {
      console.log(archiveMeta.pointer() + ' total bytes');
      console.log('The "META~" json file has been zipped into "META".');
  });
  console.log(`Successfully built v${version}!`);
}

// meta~ => meta
archiveMeta.on('error', function(err){
  throw err;
});

// build -> outputFile
archive.on('error', function(err){
  throw err;
});

build();