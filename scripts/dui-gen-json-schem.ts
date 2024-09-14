import * as TJS from 'typescript-json-schema';
import * as path from 'path';
import * as fs from 'fs';

const TypeSufixReg = /(\w+)TypeForJsonSchema/g;

const findAllTsFilesInCurrentDir = (dir: string, foundFiles: string[] = []): string[] => {
  if (!fs.existsSync(dir)) {
    console.log('provided path is not a directory', dir);
    return [];
  }

  const files = fs.readdirSync(dir);
  for (const file of files) {
    var filename = path.join(dir, file);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      findAllTsFilesInCurrentDir(filename, foundFiles); //recurse
    } else if (filename.endsWith('ts')) {
      foundFiles.push(filename);
    }
  }

  return foundFiles;
};

type FileNameToTypesMap = { [fileName: string]: string[] };
const findTypeNameForGeneratorInTsFiles = (tsFiles: string[]): FileNameToTypesMap => {
  let typeNames: FileNameToTypesMap = {};
  for (const fileName of tsFiles) {
    const fileContent = fs.readFileSync(fileName, { encoding: 'utf8', flag: 'r' });
    const regMatch = fileContent.match(TypeSufixReg);
    if (regMatch) {
      typeNames[fileName] = regMatch;
    }
  }

  return typeNames;
};

const generateSchmema = (basedDir: string, pathToTsConfig: string): void => {
  const tsFiles = findAllTsFilesInCurrentDir(basedDir);
  const typesToGenerateFromMap = findTypeNameForGeneratorInTsFiles(tsFiles);
  const fileNames = Object.keys(typesToGenerateFromMap);

  if (fileNames.length < 1) {
    console.warn(
      'Cannot found any type to convert to json schema. The name of the type has to end with "TypeForJsonSchema", for example: "CarbonTableTypeForJsonSchema"'
    );
    process.exit(0);
  }

  // optionally pass argument to schema generator
  const settings: TJS.PartialArgs = {
    include: fileNames,
    noExtraProps: true,
    propOrder: true,
    required: true,
  };

  const program = TJS.programFromConfig(pathToTsConfig);
  const generator = TJS.buildGenerator(program, settings);

  if (!generator) {
    console.error('Something went wrong creating the generator');
    process.exit(1);
  }

  for (const fileName of fileNames) {
    const types = typesToGenerateFromMap[fileName];
    for (const type of types) {
      const schema = TJS.generateSchema(program, type, settings, [], generator);
      const outFolder = `${basedDir}/generated-json-schemas`;
      const outFile = `${outFolder}/${type.replace('TypeForJsonSchema', 'Schema')}.json`;
      if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder);
      }
      fs.writeFileSync(outFile, JSON.stringify(schema, null, 2));
    }
  }
};

const main = () => {
  const args = process.argv;
  if (args.length < 4) {
    console.error(
      'Invalid arg, please provide the path to the base dir as the first arg and the path to the tsconfig file as the second arg.'
    );
    process.exit(1);
  }

  const baseDir = args[2];
  const pathToTsConfig = args[3];
  generateSchmema(baseDir, pathToTsConfig);
};

main();
