// material-design-icons.iconjar.zip v2 
// - icons          = Folder
//  - account.svg   = Optimized SVG
// - META           = gzip of meta JSON
const fs = require('fs');
const zlib = require('zlib');
const archiver = require('archiver');
const uuid = require('uuid');

const name = "Material Design Icons";
const encoding = "utf8";
const svgPackageFolder = "./node_modules/@mdi/svg";
const version = (() => {
  const file = fs.readFileSync(`${svgPackageFolder}/package.json`, { encoding });
  return JSON.parse(file).version;
})();
const date = (new Date().toISOString()).replace(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}).*/, "$1 $2");
const outputFile = `${name.toLowerCase().replace(/ /g, "-")}.iconjar.zip`;
const output = fs.createWriteStream(outputFile);
const archive = archiver('zip');
const packageId = "38EF63D0-4744-11E4-B3CF-842B2B6CFE1B";
const template = {
  meta: {
    version: 2,
    build: {
      version: version.replace(/\./g, ""),
      build: version
    },
    date: date
  },
  licences: {
    "69A6D789-4E3C-4379-86CC-4D83B1C3F8D8": {
      url: "https://github.com/Templarian/MaterialDesign/blob/master/LICENSE",
      text: "Please read the license url for more details.",
      identifier: "69A6D789-4E3C-4379-86CC-4D83B1C3F8D8",
      name: "MIT"
    }
  },
  groups: {},
  sets: {},
  items: {}
};
template.groups[name] = {
  date: date,
  name: name,
  url: "https://materialdesignicons.com",
  description: "https://materialdesignicons.com Maintained by Austin Andrews (@Templarian)",
  sort: 1,
  licence: "69A6D789-4E3C-4379-86CC-4D83B1C3F8D8",
  identifier: packageId
};
template.sets["_ALL"] = {
  date: date,
  name: "_ALL",
  url: "https://materialdesignicons.com",
  description: "https://materialdesignicons.com Maintained by Austin Andrews (@Templarian)",
  sort: 1,
  licence: "69A6D789-4E3C-4379-86CC-4D83B1C3F8D8",
  identifier: uuid.v4(),
  parent: template.groups[name].identifier
};

function getMetaJson() {
  const contents = fs.readFileSync(`${svgPackageFolder}/meta.json`, { encoding });
  return JSON.parse(contents);
}

function build() {
  const icons = getMetaJson();
  icons.forEach((icon) => {
    icon.tags.forEach((tag) => {
      if (!template.sets[tag]) {
        template.sets[tag] = {
          date: date,
          name: tag,
          url: "https://materialdesignicons.com",
          description: "https://materialdesignicons.com Maintained by Austin Andrews (@Templarian)",
          sort: 1,
          licence: "69A6D789-4E3C-4379-86CC-4D83B1C3F8D8",
          identifier: uuid.v4(),
          parent: template.groups[name].identifier
        };
      }
      var iconuuid = uuid.v4();
      template.items[iconuuid] = {
        width: 24,
        height: 24,
        parent: template.sets[tag].identifier,
        date: date,
        identifier: iconuuid,
        file: `${icon.name}.svg`,
        type: 0, // SVG
        name: icon.name,
        tags: [...icon.tags, ...icon.aliases].join(',').replace(/ \/ /g, "-").replace(/ /g, "-")
      }
    })
    template.items[icon.id] = {
      width: 24,
      height: 24,
      parent: template.sets["_ALL"].identifier,
      date: date,
      identifier: icon.id,
      file: `${icon.name}.svg`,
      type: 0, // SVG
      name: icon.name,
      tags: [...icon.tags, ...icon.aliases].join(',').replace(/ \/ /g, "-").replace(/ /g, "-")
    }
  });
  output.on('finish', function () {
    console.log(`> [${archive.pointer()}] "${outputFile}" zip created.`);
    console.log(`Successfully built v${version}!`);
  });
  console.log(`> "META" gzip created.`);
  archive.pipe(output);
  // Meta
  zlib.gzip(JSON.stringify(template), (err, data) => {
    archive.append(data, { name: `${name.toLowerCase().replace(/ /g, "-")}.iconjar/META` });
    archive.directory(`${svgPackageFolder}/svg`, `${name.toLowerCase().replace(/ /g, "-")}.iconjar/icons`);
    archive.finalize();
  });
}

// build -> outputFile
archive.on('error', (err) => {
  throw err;
});

build();
