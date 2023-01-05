<script setup>
import websites_list from "/data/websites_list.json";
import jsonIcon from "/json.png";
</script>

<script>
import fx from "./functions";
import Wkt from "wicket/wicket.js";

export default {
  data() {
    return {
      website_name: "",
      import_query_date: "offset",
      import_query_date_offset: 1,
      import_query_date_range_from: "",
      import_query_date_range_to: "",
      loading_file_status: null,
      number_imported_form: null,
      number_imported_sightings: null,
    };
  },
  computed: {
    website() {
      return websites_list.filter((w) => w.name == this.website_name)[0];
    },
  },
  methods: {
    sightingsTransformation(sightings, form_id) {
      return sightings.map((s) => {
        var datetime = s.observers[0].timing["@ISO8601"].split("+")[0];
        return {
          form_id: form_id,
          date: datetime.split("T")[0],
          time: datetime.split("T")[1],
          lat: parseFloat(s.observers[0].coord_lat),
          lon: parseFloat(s.observers[0].coord_lon),
          location_name: s.place.name,
          common_name: s.species.name,
          scientific_name: s.species.latin_name,
          species_count: s.observers.count,
          species_count_precision: s.observers.estimation_code,
          species_comment: s.observers.comment || "",
        };
      });
    },
    processFile(event) {
      this.loading_file_status = 0;
      const file = event.target.files[0];

      const reader = new FileReader();
      if (file.type == "xlsx") {
        reader.readAsBinaryString(file);
      } else {
        reader.readAsText(file);
      }
      reader.onerror = (error) => {
        throw new Error(error);
        this.loading_file_status = -1;
      };
      reader.onload = (e) => {
        let export_data = {};
        if (this.website.system == "biolovision") {
          const data = JSON.parse(reader.result).data;

          // Create empty forms and sightings if not presents
          data.forms = data.forms || [];
          data.sightings = data.sightings || [];

          // Convert individual sightings
          export_data.sightings = this.sightingsTransformation(data.sightings, 0);

          // convert form data
          export_data.forms = data.forms.map((f, id) => {
            const date = f.sightings[0].observers[0].timing["@ISO8601"].split("T")[0];
            const timeStart = date + "T" + f.time_start;
            const timeStop = date + "T" + f.time_stop;

            var path = null;
            if (f.protocol && f.protocol.wkt) {
              var wkt = new Wkt.Wkt();
              wkt.read(f.protocol.wkt);
              path = wkt.toJson().coordinates;
            }
            return fx.createForm(
              {
                imported: true,
                location_name: fx.mode(f.sightings.map((s) => s.place.name)),
                lat: f.lat,
                lon: f.lon,
                date: date,
                time: f.time_start,
                duration: (new Date(timeStop) - new Date(timeStart)) / 1000 / 60,
                distance: null,
                number_observer: null,
                full_form: f.full_form == "1",
                primary_purpose: true,
                checklist_comment: f.comment || "",
                species_comment: "",
                static_map: {
                  path: path,
                  display: true,
                  zoom: null,
                  lon: null,
                  lat: null,
                },
              },
              id + 1
            );
          });

          // Convert sightings from the forms, keep them seperate
          export_data.forms_sightings = data.forms.map((f, fid) => {
            return this.sightingsTransformation(f.sightings, export_data.forms[fid].id);
          });
        } else {
          this.loading_file_status = -1;
          throw new Error("No correct system");
        }

        this.number_imported_form = export_data.forms.length;
        this.number_imported_sightings = export_data.sightings.length;

        export_data.website = this.website;
        this.$emit("exportData", export_data);
        this.loading_file_status = 1;
      };
    },
  },
  mounted() {
    this.website_name = this.$cookie.get("website_name");
  },
  watch: {
    website_name() {
      this.$cookie.set("website_name", this.website_name, 365);
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
      <p>Select the website from which to import the data</p>
      <b-select v-model="website_name">
        <b-select-option-group
          v-for="cat in new Set(websites_list.map((w) => w.category))"
          :label="cat"
          :key="cat"
        >
          <b-select-option
            v-for="w in websites_list.filter((wl) => wl.category == cat)"
            :key="w.name"
            :value="w.name"
          >
            {{ w.name }}
          </b-select-option>
        </b-select-option-group>
      </b-select>
      <b-row class="m-3 p-3 text-white rounded shadow-sm bg-blue" v-if="website">
        <template v-if="website.system == 'biolovision'">
          <p>
            For biolovision website, export your data file as json
            <b-img :src="jsonIcon" />. You can use the form below as a starting point to generate
            the file.
          </p>
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
              :href="
                website.website +
                '/index.php?m_id=31&sp_DChoice=' +
                import_query_date +
                '&sp_DFrom=' +
                new Date(import_query_date_range_from).toLocaleDateString('fr-CH') +
                '&sp_DTo=' +
                new Date(import_query_date_range_to).toLocaleDateString('fr-CH') +
                '&sp_DOffset=' +
                import_query_date_offset +
                '&sp_SChoice=all&sp_PChoice=all&sp_OnlyMyData=1'
              "
              target="_blank"
              class="btn btn-secondary"
              >Export data from <strong>{{ website.name }}</strong>
            </a>
          </b-col>
        </template>
        <template v-else-if="website.system == 'observation'">
          <p>
            Data from observation.org can be exported from the Observations menu. Login and click on
            your name top right of the page: https://observation.org/
          </p>
        </template>
        <template v-else-if="website.system == 'birdtrack'">
          <p>https://app.bto.org/birdtrack/explore/emr.jsp</p>
        </template>
        <template v-else-if="website.system == 'birdlasser'">
          <p>
            Data from birdlasser can only be downloaded from the app (to my knowledge). Selec the
            trip card and use "Export (CSV) trip card". Upload the CSV file below.
          </p>
        </template>
      </b-row>
    </b-col>
    <b-col lg="6" v-if="website">
      <p>
        Load the data file into the webapp (the data remains in your browser and are never send on
        internet).
      </p>
      <b-form-file
        size="lg"
        @change="processFile"
        :accept="website.extension"
        :placeholder="'Click to load your ' + website.extension + ' file'"
        class="mb-2"
      />
      <b-alert v-if="loading_file_status == 0" variant="warning" show>
        <b-spinner small variant="warning" class="mr-2"> </b-spinner>
        <strong class="me-1">Loading data...</strong>
      </b-alert>
      <b-alert v-else-if="loading_file_status == 1" variant="success" show>
        <b-icon icon="check-circle-fill" class="mr-2"> </b-icon>
        <strong>Data loaded successfuly! </strong>
        {{ number_imported_form }} forms and {{ number_imported_sightings }} individual sightings.
      </b-alert>
      <b-alert v-else-if="loading_file_status == -1" variant="danger" show>
        <b-icon icon="exclamation-triangle" class="mr-2"> </b-icon>
        <strong>There is an error! </strong>
      </b-alert>
    </b-col>
  </b-row>
</template>
