<script setup>
import websites_list from "/data/websites_list.json";
import jsonIcon from "/json.png";
import biolovision_species_list from "/data/biolovision_species_list_short.json";
</script>

<script>
import Wkt from "wicket/wicket.js";
import "leaflet";
import Papa from "papaparse/papaparse.js";

const precision_match_biolovision = {
  MINIMUM: ">",
  EXACT_VALUE: "=",
  ESTIMATION: "~",
  NO_VALUE: "",
};

const precision_match_observation = {
  unknown: ">",
  "seen not counted": "",
  "real count": "=",
  estimated: "~",
  extrapolated: "~",
  abundance: "~",
};

export default {
  props: ["language"],
  data() {
    return {
      file: null,
      website_name: "",
      import_query_date: "offset",
      import_query_date_offset: 1,
      import_query_date_range_from: "",
      import_query_date_range_to: "",
      loading_file_status: null,
      number_imported_form: 0,
      number_imported_sightings: null,
      taxonomic_issues: [],
      clipboard_icon: "clipboard",
      error_message: "",
    };
  },
  computed: {
    website() {
      return websites_list.filter((w) => w.name == this.website_name)[0];
    },
    taxonomic_issues_stringify() {
      return JSON.stringify(
        this.taxonomic_issues.filter((t) => t.ebird_species_code.length > 0),
        null,
        2
      );
    },
  },
  methods: {
    createSighting(s) {
      return {
        id: s.id, // required
        form_id: s.form_id, // required
        location_name: s.location_name.normalize("NFD").replace(/[\u0300-\u036f]/g, ""), // required
        lat: this.mathRound(s.lat, 6), // required
        lon: this.mathRound(s.lon, 6), // required
        date: s.date, // required
        time: s.time ? s.time.substring(0, 5) : "",
        common_name: s.common_name || "",
        scientific_name: s.scientific_name || "",
        count: s.count || null,
        count_precision: s.count_precision || "",
        comment: s.comment || "",
      };
    },
    sightingsBiolovisionTransformation(sightings, form_id) {
      return sightings.map((s) => {
        const datetime = s.observers[0].timing["@ISO8601"].split("+")[0];

        let comment = s.observers[0].comment || "";
        if (s.observers[0].details) {
          comment += s.observers[0].details
            .map((d) => {
              return (
                d.count +
                "x " +
                (d.sex["@id"] != "U" ? d.sex["#text"] + " " : "") +
                (d.age["@id"] != "U" ? d.age["#text"] + " " : "")
              );
            })
            .join(", ");
        }

        let common_name = "";
        if (
          biolovision_species_list.hasOwnProperty(s.species["@id"]) &&
          biolovision_species_list[s.species["@id"]].length > 0
        ) {
          common_name = biolovision_species_list[s.species["@id"]];
        } else {
          // Return in console species with tax issue
          console.log(s.species);
          common_name = s.species.name;
          if (this.taxonomic_issues.indexOf(s.species)) {
            this.taxonomic_issues.push({
              id: s.species["@id"],
              biolovision_common: s.species.name,
              biolovision_latin: s.species.latin_name,
              ebird_species_code: "",
            });
          }
        }
        return this.createSighting({
          id: s.observers[0].id_sighting,
          form_id: form_id,
          date: datetime.split("T")[0],
          time: s.observers[0].timing["@notime"] == "1" ? "" : datetime.split("T")[1],
          lat: parseFloat(s.observers[0].coord_lat),
          lon: parseFloat(s.observers[0].coord_lon),
          location_name: s.place.name,
          common_name: common_name,
          scientific_name: "",
          count: s.observers[0].estimation_code == "NO_VALUE" ? "x" : s.observers[0].count,
          count_precision: precision_match_biolovision[s.observers[0].estimation_code],
          comment: comment,
        });
      });
    },
    async checkWebsite(export_data) {
      // Check if website should be checked
      if (this.website.osm_level == "world") {
        return;
      }

      // Check that the website can be validated.
      if (!this.website.osm_level) {
        alert(
          "We could not verify that the file uploaded comes from the website selected. Please check manually before continuing."
        );
        return;
      }

      // Check the first sightings available
      const d = export_data.sightings.length > 0 ? export_data.sightings[0] : export_data.forms_sightings[0][0];

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse.php?lat=${d.lat}&lon=${d.lon}&zoom=8&format=jsonv2`
      );
      const reverse = await response.json();
      if (reverse.address[this.website.osm_level] != this.website.osm_region) {
        console.log(reverse);
        alert(
          "The file uploaded doesn't seem to match the website selected (" +
            this.website.name +
            ").The first sightings seems to be located in " +
            reverse.display_name +
            ". Please check before continuing."
        );
      }
    },
  },
  mounted() {
    this.website_name = this.$cookie.get("website_name");
    fetch(`https://api.ebird.org/v2/ref/taxonomy/ebird?key=vcs68p4j67pt&fmt=json&locale=${this.language}`)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        for (var sp in biolovision_species_list) {
          let sp_found = json.find((e) => e.speciesCode == biolovision_species_list[sp]);
          if (sp_found) {
            biolovision_species_list[sp] = sp_found.comName;
          } else {
            biolovision_species_list[sp] = "";
          }
        }
      });
  },
  watch: {
    website_name() {
      this.$cookie.set("website_name", this.website_name, 365);
    },
    file() {
      this.loading_file_status = 0;
      const reader = new FileReader();
      reader.readAsText(this.file);
      reader.onerror = (error) => {
        this.loading_file_status = -1;
        this.error_message = error;
        throw new Error(error);
      };
      reader.onload = (e) => {
        let export_data = {};
        if (this.website.system == "biolovision") {
          let data;
          try {
            data = JSON.parse(reader.result).data;
          } catch (error) {
            this.loading_file_status = -1;
            this.error_message =
              "Your json file seems invalid, try downloading the file again and check the validity of your file online (e.g. jsonlint.com). " +
              error;
            throw new Error(error);
          }

          // Create empty forms and sightings if not presents
          data.forms = data.forms || [];
          data.sightings = data.sightings || [];

          // Convert individual sightings
          export_data.sightings = this.sightingsBiolovisionTransformation(data.sightings, 0);

          // convert form data

          this.website.species_comment_template = {
            short:
              '${ s.count_precision }${ s.count } ind. ${ s.time ? " - " + s.time : "" } - <a href="http://maps.google.com?q=${s.lat},${s.lon}&t=k">${ s.lat }, ${ s.lon }</a> - <a href="' +
              this.website.website +
              'index.php?m_id=54&id=${ s.id }">' +
              this.website_name +
              '</a>${ s.comment ? " - " + s.comment : "" }',
            long:
              '${ s.count_precision }${ s.count } - <a href="' +
              this.website.website +
              'index.php?m_id=54&id=${ s.id }">${ s.time }</a>${ s.comment ? " - " + s.comment : "" }',
          };

          data.forms.forEach((f, id) => {
            const date = f.sightings[0].observers[0].timing["@ISO8601"].split("T")[0];
            const timeStart = date + "T" + f.time_start;
            const timeStop = date + "T" + f.time_stop;

            var path = null;
            var distance = null;
            if (f.protocol && f.protocol.wkt) {
              var wkt = new Wkt.Wkt();
              wkt.read(f.protocol.wkt);
              path = wkt.toJson().coordinates.map((c) => [c[1], c[0]]);
              distance = this.distanceFromLatLngs(path);
            } else if (f.trace) {
              var wkt = new Wkt.Wkt();
              wkt.read(f.trace);
              path = wkt.toJson().coordinates.map((c) => [c[1], c[0]]);
              distance = this.distanceFromLatLngs(path);
            }
            const f_out = {
              imported: true,
              location_name: this.mathMode(f.sightings.map((s) => s.place.name)),
              lat: f.lat,
              lon: f.lon,
              date: date,
              time: f.time_start,
              duration: (new Date(timeStop) - new Date(timeStart)) / 1000 / 60,
              distance: distance,
              number_observer: null,
              full_form: f.full_form == "1",
              primary_purpose: true,
              checklist_comment: f.comment || "",
              species_comment_template: this.website.species_comment_template,
              path: path,
            };
            this.$emit("exportForm", f_out, id + 1);
          });

          this.number_imported_form = data.forms.length;

          // Convert sightings from the forms, keep them seperate
          export_data.forms_sightings = data.forms.map((f, id) => {
            return this.sightingsBiolovisionTransformation(f.sightings, id + 1);
          });
        } else if (this.website.system == "birdlasser") {
          export_data.forms_sightings = [];
          export_data.sightings = Papa.parse(reader.result, {
            skipEmptyLines: true,
            header: true,
          }).data.map((s, id) => {
            return this.createSighting({
              id: "s" + id,
              form_id: 0,
              date: s.Date.replaceAll("/", "-"),
              time: s.Time,
              lat: parseFloat(s.Latitude),
              lon: parseFloat(s.Longitude),
              location_name: s.Pentad
                ? s.Pentad
                : s.Fieldsheet
                ? s.Fieldsheet
                : "New location " + s.Latitude + "-" + s.Longitude,
              common_name: s["Species primary name"] ? s["Species primary name"] : s["Primary language"],
              scientific_name: "",
              count: s.Count,
              count_precision: s["Count Type"] == "Not specified" ? "" : s["Count Type"],
              comment: s.Notes,
            });
          });
          this.website.species_comment_template = {
            short:
              '${ s.count_precision }${ s.count } ind. - ${ s.time } - <a href="http://maps.google.com?q=${s.lat},${s.lon}&t=k">${ s.lat }, ${ s.lon }</a>${ s.comment ? " - " + s.comment : "" }',
            long: '${ s.count_precision }${ s.count } ind. - ${ s.time } - ${ s.lat }, ${ s.lon }${ s.comment ? " - " + s.comment : "" }',
            limit: 20,
          };
        } else if (this.website.system == "observation") {
          export_data.forms_sightings = [];
          export_data.sightings = Papa.parse(reader.result, {
            skipEmptyLines: true,
            header: true,
          }).data.map((s) => {
            return this.createSighting({
              id: s.id,
              form_id: 0,
              date: s.date,
              time: s.time,
              lat: parseFloat(s.lat),
              lon: parseFloat(s.lng),
              location_name: s.location,
              common_name: s["species name"],
              scientific_name: "",
              count: s["counting method"] == "seen not counted" ? "x" : s.number,
              count_precision: precision_match_observation[s["counting method"]],
              comment: s.notes,
            });
          });
          this.website.species_comment_template = {
            short:
              '${ s.count_precision }${ s.count } ind. ${ s.time ? " - " + s.time : "" } - <a href="https://maps.google.com?q=${s.lat},${s.lon}&t=k">${ s.lat }, ${ s.lon }</a> - <a href="' +
              this.website.website +
              'observation/${ s.id }">' +
              this.website_name +
              '</a>${ s.comment ? " - " + s.comment : "" }',
            long: '${ s.count_precision }${ s.count } ind. - ${ s.time ? " - " + s.time : "" } - ${ s.lat }, ${ s.lon }${ s.comment ? " - " + s.comment : "" }',
            limit: 20,
          };
        } else {
          this.loading_file_status = -1;
          this.error_message = "No correct system";
          throw new Error("No correct system");
        }

        this.number_imported_sightings = export_data.sightings.length;

        this.checkWebsite(export_data);

        export_data.website = this.website;
        this.$emit("exportData", export_data);
        this.loading_file_status = 1;
      };
    },
  },
};
</script>

<template>
  <b-row class="my-3 p-3 bg-white rounded shadow-sm">
    <b-col lg="12">
      <h2 class="border-bottom pb-2 mb-3">1. Generate and load Biolovision data</h2>
    </b-col>
    <b-col lg="6">
      <b-form-group label="Select the website from which to import the data">
        <b-select v-model="website_name" size="lg">
          <b-select-option-group v-for="cat in new Set(websites_list.map((w) => w.category))" :label="cat" :key="cat">
            <b-select-option
              v-for="w in websites_list.filter((wl) => wl.category == cat)"
              :key="w.name"
              :value="w.name"
            >
              {{ w.name }}
            </b-select-option>
          </b-select-option-group>
        </b-select>
      </b-form-group>
      <b-row class="m-3 p-3 text-white rounded shadow-sm bg-secondary" v-if="website">
        <template v-if="website.system == 'biolovision'">
          <p>For Biolovision websites, export your data file as json <b-img :src="jsonIcon" />.</p>
          <p>You can use the button below to directly reach the page to export your data:</p>
          <b-col lg="12">
            <b-form-radio v-model="import_query_date" value="offset">
              <b-input-group append="days ago">
                <b-form-input
                  v-model="import_query_date_offset"
                  min="0"
                  type="number"
                  value="1"
                  :disabled="import_query_date != 'offset'"
                />
              </b-input-group>
            </b-form-radio>
          </b-col>
          <b-col lg="12" class="mt-2">
            <b-form-radio v-model="import_query_date" value="range">
              <b-input-group>
                <b-form-input
                  v-model="import_query_date_range_from"
                  type="date"
                  :disabled="import_query_date != 'range'"
                />
                <b-input-group-text class="rounded-0">to</b-input-group-text>
                <b-form-input
                  v-model="import_query_date_range_to"
                  type="date"
                  :disabled="import_query_date != 'range'"
                />
              </b-input-group>
            </b-form-radio>
          </b-col>
          <b-col lg="12" class="text-center mt-2">
            <a
              :href="`${website.website}index.php?m_id=31&sp_DChoice=${import_query_date}&sp_DFrom=${new Date(
                import_query_date_range_from
              ).toLocaleDateString('fr-CH')}&sp_DTo=${new Date(import_query_date_range_to).toLocaleDateString(
                'fr-CH'
              )}&sp_DOffset=${import_query_date_offset}&sp_SChoice=all&sp_PChoice=all&sp_OnlyMyData=1`"
              target="_blank"
              class="btn btn-primary"
              >Export data from <strong>{{ website.name }}</strong>
            </a>
          </b-col>
        </template>
        <template v-else-if="website.system == 'observation'">
          <p>
            Export your data from the "Observations" page which can be found in the menu under your name on the top
            right of the page after you've logged in. Select the CSV option.
          </p>
          <a :href="website.website" target="_blank" class="btn btn-primary"
            >Export data from <strong>{{ website.name }}</strong>
          </a>
        </template>
        <template v-else-if="website.system == 'birdlasser'">
          <p>
            You can download your Birdlasser data from the app (use "Export (CSV) trip card") or from the website (click
            on the trip card and "Basic Export" button)
          </p>
          <b-col lg="12" class="text-center">
            <a href="https://www.birdlasser.com/user/" target="_blank" class="btn btn-primary"
              >Export data from <strong> Birdlasser</strong>
            </a>
          </b-col>
        </template>
      </b-row>
    </b-col>
    <b-col lg="6" v-if="website">
      <b-form-group label="Upload the exported file">
        <b-form-file
          size="lg"
          v-model="file"
          :accept="website.extension"
          :placeholder="'Click to load your ' + website.extension + ' file'"
          class="mb-2"
        />
      </b-form-group>

      <b-alert v-if="loading_file_status == 0" variant="warning" show>
        <b-spinner small variant="warning" class="mr-2"> </b-spinner>
        <strong class="me-1">Loading data...</strong>
      </b-alert>
      <b-alert v-else-if="loading_file_status == 1" variant="success" show>
        <b-icon icon="check-circle-fill" class="mr-2"> </b-icon>
        <strong>Data loaded successfully! </strong>
        {{ number_imported_form }} forms and {{ number_imported_sightings }} individual sightings.
      </b-alert>
      <b-alert v-else-if="loading_file_status == -1" variant="danger" show>
        <b-icon icon="exclamation-triangle" class="mr-2"> </b-icon>
        <strong>There is an error! </strong> {{ error_message }}
      </b-alert>
    </b-col>
    <b-col lg="12" v-if="taxonomic_issues.length > 0">
      <b-alert variant="warning" show>
        <b-icon icon="exclamation-triangle" class="mr-1" />
        <strong class="me-1">Taxonomic matching issue.</strong>
        <p>
          We are detecting {{ taxonomic_issues.length }} species with unsuccessful taxonomic match. You can proceed with
          the import, but you will need to
          <b-link
            class="alert-link"
            href="https://support.ebird.org/en/support/solutions/articles/48000907878-upload-spreadsheet-data-to-ebird#anchorCleanData"
            target="_blank"
            >fix the species</b-link
          >
          on the eBird import tool.
        </p>
        <p>
          To avoid this issue in the future, we would be grateful if you can search for the corresponding eBird species
          code (e.g., using the <b-link href="https://ebird.org/map/" target="_blank">eBird map</b-link>):
        </p>
        <b-container class="bv-example-row">
          <b-row v-for="t in taxonomic_issues" :key="t.id">
            <b-col>
              <strong class="mr-1">{{ t.biolovision_common }}</strong>
              <small>
                <i>{{ t.biolovision_latin }}</i></small
              >
            </b-col>
            <b-col>
              <b-input v-model="t.ebird_species_code" placeholder="Enter the corresponding eBird species code" />
            </b-col>
          </b-row>
        </b-container>
        <div v-if="taxonomic_issues_stringify.length > 6">
          <b-input-group class="mt-4 mb-2">
            <b-input type="text" v-model="taxonomic_issues_stringify" readonly></b-input>
            <b-input-group-append>
              <b-button
                @click="
                  copyClipboard('\`\`\`\n' + taxonomic_issues_stringify + '\n\`\`\`');
                  clipboard_icon = 'clipboard-check';
                "
              >
                <b-icon :icon="clipboard_icon" />
              </b-button>
            </b-input-group-append>
          </b-input-group>
          <p>
            Please, copy the code above and paste it
            <b-link class="alert-link" href="https://github.com/Zoziologie/biolovision2ebird/issues/11" target="_blank"
              >in a new comment on this Github issue</b-link
            >
            so that I can add or correct the taxonomic match.
          </p>
        </div>
      </b-alert>
    </b-col>
  </b-row>
</template>
