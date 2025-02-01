import fs from "fs";

const full_species_list = JSON.parse(
  fs.readFileSync("./data/biolovision_species_list_full.json", "utf8")
);

let species_list = {};

full_species_list.forEach((s) => {
  species_list[s.id] = s.ebird_species_code;
});

fs.writeFileSync(
  "./data/biolovision_species_list_short.json",
  JSON.stringify(species_list, null, 2)
);

console.log("Species list saved successfully.");
