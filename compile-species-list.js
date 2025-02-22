import fs from "fs";
import Papa from "papaparse";

const csvData = fs.readFileSync("./data/biolovision_species_list_full.csv", "utf8");

const parsedData = Papa.parse(csvData, {
  header: true,
  skipEmptyLines: true,
});

const species_list = {};

parsedData.data.forEach((row) => {
  species_list[row.id] = row.ebird_species_code;
});

fs.writeFileSync(
  "./data/biolovision_species_list_short.json",
  JSON.stringify(species_list, null, 2)
);

console.log("Species list saved successfully.");
