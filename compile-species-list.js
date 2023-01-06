import fs from "fs";

import full_species_list from './data/biolovision_species_list_full.json' assert { type: 'json' };

console.log(full_species_list)

let species_list = {};

full_species_list.forEach(s => {
    species_list[s.id] = s.PRIMARY_COM_NAME;
})

fs.writeFileSync("./data/biolovision_species_list_short.json", JSON.stringify(species_list));
