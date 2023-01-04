<script setup>
import logo from "/logo_w.svg";
import gif from "/b2e.gif";
import jsonIcon from "/json.png";
//import pinSXFFF from "/pin-s-xfff.png";
//import markerSoft from "/markers-soft.png";

import marker_color from "/data/marker_color.json";
import tile_providers from "/data/tile_providers.json";
import websites_list from "/data/websites_list.json";
</script>
<template class="bg-light">
  <b-container>
    <b-row class="d-flex justify-content-between p-3 my-3 text-white rounded shadow-sm bg-blue">
      <div>
        <h1 class="mb-0">Biolovision2eBird</h1>
        <h6>Convert biolovision data to eBird</h6>
      </div>
      <b-link class="py-3 px-0 px-lg-3 rounded text-white text-decoration-none bg-primary" href="/">
        <span class="mr-1">Powered by</span>

        <b-img class="me-3" :src="logo" alt="" height="38" />
      </b-link>
    </b-row>

    <b-row class="my-3 p-3 bg-white rounded shadow-sm" v-show="!skip_intro">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">Introduction</h2>
      </b-col>
      <b-col lg="6">
        <p>
          <strong>Biolovision2eBird</strong> helps you to import your bird sightings from any
          Biolovision website (e.g.
          <b-link href="https://www.ornitho.ch/" target="_blank">ornitho.ch</b-link>,
          <b-link href="http://faune-alsace.org/" target="_blank">faune-alsace</b-link>,...) to
          eBird!
        </p>
        <p>
          It is now also possible to convert data from the Observation websites (e.g.,
          <b-link href="https://observation.org/" target="_blank">observation.org</b-link>,
          <b-link href="https://waarneming.nl/" target="_blank">waarneming.nl</b-link>,...),
          <b-link href="https://www.bto.org/our-science/projects/birdtrack" target="_blank"
            >Birdtrack</b-link
          >
          and <b-link href="https://www.birdlasser.com/" target="_blank">Birdlasser</b-link>.
        </p>
        <p>The process is quite simple:</p>
        <ol>
          <li>Generate your data from the original website and load them on this webapp.</li>
          <li>Create checklists and assign individual sightings to checklist.</li>
          <li>Provide missing information on checklists to fulfill the eBird standards.</li>
          <li>
            Download an
            <b-link
              href="https://support.ebird.org/en/support/solutions/articles/48000907878-upload-spreadsheet-data-to-ebird#anchorRecordFormat"
              target="_blank"
              >eBird Record Format</b-link
            >
            file and upload it to
            <b-link href="https://ebird.org/import/upload.form" target="_blank"
              >eBird import tool</b-link
            >.
          </li>
        </ol>
      </b-col>
      <b-col lg="6">
        <b-img :src="gif" fluid />
      </b-col>
      <b-col lg="12">
        <p>
          Any comments or suggestions? Please submit an issue on
          <b-link
            class="btn btn-sm btn-outline-primary"
            href="https://github.com/Zoziologie/Biolovision2eBird/issues"
            target="_blank"
          >
            <b-icon icon="github" aria-hidden="true"> </b-icon> Github</b-link
          >
          or
          <b-link class="btn btn-sm btn-outline-primary" href="mailto:rafnuss@gmail.com">
            <b-icon icon="envelope" aria-hidden="true"> </b-icon> Contact me</b-link
          >.
        </p>
      </b-col>
      <b-col>
        <b-alert variant="danger" show class="mt-3">
          <h4 class="alert-heading">
            <b-icon icon="exclamation-octagon" class="mr-1"> </b-icon>Prerequisites
          </h4>
          <b-form-group>
            <b-form-checkbox-group stacked v-model="important_information">
              <b-form-checkbox value="1">
                Be familiar with
                <b-link
                  href="https://ebird.freshdesk.com/en/support/solutions/articles/48000795623#eBird-Checklist-Basics"
                  target="_blank"
                  class="alert-link"
                >
                  eBird Core Rules & Requirements.
                </b-link>
              </b-form-checkbox>
              <b-form-checkbox value="2">
                Understand the differences between
                <b-link
                  href="https://support.ebird.org/en/support/solutions/articles/48000950859-guide-to-ebird-protocols"
                  class="alert-link"
                  target="_blank"
                >
                  eBird Core Protocols </b-link
                >.
              </b-form-checkbox>
              <b-form-checkbox value="3">
                Understand the meaning of
                <b-link
                  href="https://support.ebird.org/en/support/solutions/articles/48000967748-birding-as-your-primary-purpose-and-complete-checklists"
                  target="_blank"
                  class="alert-link"
                  >'Primary Purpose' and Complete Checklists</b-link
                >.
              </b-form-checkbox>
            </b-form-checkbox-group>
          </b-form-group>
        </b-alert>
        <b-alert variant="warning" show class="mt-3">
          <h4 class="alert-heading">
            <b-icon icon="exclamation-triangle" class="mr-1" />Important Information
          </h4>
          <ol>
            <li>
              Mapping the protocol of the original system used (biolovision, Birdlasser, Birdtrack)
              to eBird is not always simple. In accordance with
              <b-link
                href="https://support.ebird.org/en/support/solutions/articles/48000967748-birding-as-your-primary-purpose-and-complete-checklists"
                target="_blank"
                class="alert-link"
                >eBird best practice</b-link
              >, we encourage the use of complete checklist with the stationary and traveling
              protocol. In general, lists should be converted to traveling or stationary by adding
              information on (1) number of observers and (2) distance traveled. If these two
              information cannot be provided, lists will use the historical protocol. Individual
              direct observations (i.e., sightings) should be converted to incidental checklists if
              birding was not your primary purpose or to incomplete traveling, stationary or
              historical protocols.
            </li>
            <li>
              We encourage you to keep the link to your sightings on the original website in the
              species comment so that the eBird reviewing team can validate your record more easily.
            </li>
            <li>
              For importing a life list without complying to eBird core requirement (e.g., over
              multiple days or locations), read
              <b-link
                href="hhttps://support.ebird.org/en/support/solutions/articles/48000804866-enter-your-pre-ebird-life-list"
                target="_blank"
                class="alert-link"
                >Enter your pre-eBird life list</b-link
              >. On the webapp, import all your sightings and create a single checklist at the step
              2. Assign individual sightings. Then, modify location and dates in eBird as
              recommended on the link above.
            </li>
            <li>Skip the intro by adding <code>?skip_intro=true</code> to the url</li>
          </ol>
        </b-alert>
      </b-col>
      <b-col lg="12" class="text-center">
        <b-button
          variant="secondary"
          :disabled="important_information.length < 3"
          @click="skip_intro = true"
        >
          Continue
        </b-button>
      </b-col>
    </b-row>

    <b-row class="my-3 p-3 bg-white rounded shadow-sm" v-show="skip_intro">
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
              Data from observation.org can be exported from the Observations menu. Login and click
              on your name top right of the page: https://observation.org/
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
          <strong class="me-1">Loading data.</strong>
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

    <b-row class="my-3 p-3 bg-white rounded shadow-sm" v-if="loading_file_status == 1">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">2. Assign sightings to checklist</h2>
      </b-col>
      <template v-if="number_imported_sightings == 0">
        <b-col
          ><p>
            The data uploaded does not contain individual sightings. You can go to step 3.
          </p></b-col
        >
      </template>
      <template v-else>
        <b-col lg="12">
          <p>
            First, create checklist(s) by adding marker(s) on the map. Then, select in the dropdown
            the checklists on which you want to assign the individual sightings. Finally, draw a
            rectangle on the map around the sightings to attribute them to the checklist.
          </p>
          <small>
            The number of the marker on the map corresponds to the order in the dropdown and the
            color of the sightings match those of the marker. The sightings left on "Non-assign"
            will not be exported.
          </small>
        </b-col>
        <b-col lg="3">
          <b-card no-body header="Assign checklist">
            <b-list-group flush>
              <b-list-group-item
                v-for="f in forms"
                :key="f.id"
                :style="{ 'background-color': f.bgColor }"
                class="d-flex justify-content-between align-items-center"
              >
                {{ f.location_name }}
                <b-button pill size="sm"
                  ><b-icon
                    icon="square"
                    @click="
                      assign_form_id = f.id;
                      map_draw.enable();
                    "
                  />
                </b-button>
                <b-icon icon="x" @click="removeForm(f)"></b-icon>
              </b-list-group-item>
              <b-list-group-item @click="addForm({})" href="#" class="text-center"
                >+</b-list-group-item
              >
            </b-list-group>
          </b-card>
        </b-col>
        <!--<b-col lg="3">
          <b-button
            variant="secondary"
            @click="map_draw.enable()"
            :disabled="assign_form_id == null"
            block
          >
            <b-icon icon="square" class="mr-1"></b-icon>Attribute Sightings
          </b-button>
        </b-col>-->
        <b-col lg="9">
          <l-map
            class="w-100"
            style="height: 400px"
            ref="map"
            @ready="onLeafletReady"
            :bounds="map_bounds"
          >
            <l-control-layers position="topright" />
            <l-tile-layer
              v-for="tileProvider in tile_providers"
              :key="tileProvider.name"
              :name="tileProvider.name"
              :visible="tileProvider.visible"
              :url="tileProvider.url"
              :attribution="tileProvider.attribution"
              layer-type="base"
            />
            <l-circle-marker
              v-for="s in sightings"
              :key="s.datetime + s.common_name"
              :lat-lng="[s.lat, s.lon]"
              :radius="10"
              :fillColor="marker_color[s.form_id][0]"
              :color="marker_color[s.form_id][0]"
            >
              <l-popup>
                <b-table bordered small striped hover responsive :items="object2Table(s)" />
              </l-popup>
            </l-circle-marker>
          </l-map>
        </b-col>
        <b-col lg="12">
          <p>
            Instead of doing this process manually, there is (new) an "Automatic Attribution". This
            "magic" function will create checklists and attribute the corresponding incidental
            sightings automotically. The function is based on a distance and duration threashold to
            aggregate sightings together. You can still edit automotic attribution later.
          </p>
        </b-col>
        <b-col lg="4">
          <b-form-group label="Duration threashold:">
            <b-form-input v-model="assign_duration" type="number" step="0.1" min="0.1" max="24" />
          </b-form-group>
        </b-col>
        <b-col lg="4">
          <b-form-group label="Distance threashold:">
            <b-form-input v-model="assign_distance" type="number" step="0.1" min="0.1" max="5" />
          </b-form-group>
        </b-col>
        <b-col lg="4">
          <b-form-group label="L:">
            <b-button variant="primary" block>
              <b-icon icon="heart" class="mr-1" click="assignMagic()"></b-icon>Automatic Attribution
            </b-button>
          </b-form-group>
        </b-col>
      </template>
    </b-row>

    <b-row class="my-3 p-3 bg-white rounded shadow-sm" v-if="forms.length > 0">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">3. Provide checklists details</h2>
        <p>
          You can navigate into each checklist by clicking on the tab and modify each of them as
          desire. In addition, we automatically added a few improvement such as exact timing and
          location of each observation in comment or a static map with location of your sightings.
          Feel free to remove them of modify them
        </p>
      </b-col>
      <b-col lg="12">
        <b-card class="mt-2" no-body>
          <b-tabs pills card sm>
            <b-tab v-for="f in forms" :key="f.id" @click="form_card = f">
              <template #title class="d-inline">
                {{
                  (f.location_name.length > 15) & (forms.length > 5)
                    ? f.location_name.slice(0, 15 - 1) + "..."
                    : f.location_name
                }}<b-form-checkbox>E </b-form-checkbox>
              </template>
            </b-tab>
          </b-tabs>
          <b-card-body class="pt-0" v-if="form_card">
            <b-alert show variant="danger" class="mt-2" v-if="getFormCardDuration > 1440">
              <b-icon-exclamation-triangle-fill class="mr-2" />The checklist
              {{ f.location_name }} contains sightings from different days. It is strongly
              recommended to split them into multiple checklists.
            </b-alert>
            <b-row>
              <b-col lg="6">
                <b-form-group label="Location Name:">
                  <b-input-group>
                    <b-form-input v-model="form_card.location_name" type="text" />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        class="btn-sm"
                        @click="form_card.location_name = getFormName()"
                        v-b-tooltip.hover
                        title="Use the most common location name of all sightings"
                        >auto</b-button
                      >
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="6">
                <b-form-group label="Date and time:">
                  <b-input-group>
                    <b-form-input v-model="form_card.datetime" type="datetime-local" />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        class="btn-sm"
                        @click="form_card.datetime = sightings_form_card[0].datetime"
                        v-b-tooltip.hover
                        title="Compute earliest datetime of all sightings."
                        >auto-compute</b-button
                      >
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="6">
                <b-form-group label="Duration (minutes):">
                  <b-input-group>
                    <b-form-input
                      v-model="form_card.duration"
                      type="number"
                      step="1"
                      min="1"
                      max="1440"
                    />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        class="btn-sm"
                        @click="form_card.duration = getFormCardDuration()"
                        v-b-tooltip.hover
                        title="Compute duration between the first and last sightings."
                        >auto-compute</b-button
                      >
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="6">
                <b-form-group label="Distance (km):">
                  <b-input-group>
                    <b-form-input
                      v-model="form_card.distance"
                      step="0.1"
                      min="0"
                      max="100"
                      type="number"
                    />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        class="btn-sm"
                        @click="form_card.duration = form_card.distance = getFormCardDistance()"
                        >auto-compute</b-button
                      >
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="6">
                <b-form-group label="Party size:">
                  <b-form-input
                    v-model="form_card.number_observer"
                    step="1"
                    min="0"
                    max="100"
                    type="number"
                  />
                </b-form-group>
              </b-col>
              <b-col lg="6">
                <b-form-checkbox switch v-model="form_card.primary_purpose"
                  >Primary Purpose</b-form-checkbox
                >
                <b-form-group label="Protocol:">
                  {{ protocol(form_card) }}
                </b-form-group>
                <b-form-checkbox switch v-model="form_card.full_form"
                  >Complete Checklist</b-form-checkbox
                >
              </b-col>
              <b-col lg="6">
                <b-form-checkbox switch v-model="form_card.include_map"
                  >Include static map</b-form-checkbox
                >
              </b-col>
            </b-row>
          </b-card-body>
          <l-map class="w-100" style="height: 400px" ref="mapCard" :bounds="map_card_bounds">
            <l-control-layers position="topright" />
            <l-tile-layer
              v-for="tileProvider in tile_providers"
              :key="tileProvider.name"
              :name="tileProvider.name"
              :visible="tileProvider.visible"
              :url="tileProvider.url"
              :attribution="tileProvider.attribution"
              layer-type="base"
            />
            <l-circle-marker
              v-for="s in sightings_form_card"
              :key="s.datetime + s.common_name"
              :lat-lng="[s.lat, s.lon]"
              :radius="10"
              :fillColor="marker_color[s.form_id][0]"
              :color="marker_color[s.form_id][0]"
            >
              <!--<l-popup>
              <b-table bordered small striped hover responsive :items="object2Table(s)"></b-table>
            </l-popup>-->
            </l-circle-marker>
            <!--<l-marker :lat-lng="[fmapid.lat, fmapid.lon]" />-->
          </l-map>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import "./app.scss";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet";
import "leaflet-draw/dist/leaflet.draw-src.js";
window.type = true;

import {
  LMap,
  LTileLayer,
  LControlLayers,
  LPopup,
  LCircleMarker,
  LMarker,
  LFeatureGroup,
  LIcon,
} from "vue2-leaflet";

export default {
  components: {
    LMap,
    LFeatureGroup,
    LTileLayer,
    LControlLayers,
    LPopup,
    LMarker,
    LIcon,
    LCircleMarker,
  },
  data() {
    return {
      sightings: [],
      forms: [],
      forms_sightings: [],
      website_name: null,
      important_information: [],
      skip_intro: false, // Change on the final version
      import_query_date: "offset",
      import_query_date_offset: 1,
      import_query_date_range_from: "",
      import_query_date_range_to: "",
      loading_file_status: null,
      number_imported_form: 0,
      number_imported_sightings: 0,
      assign_form_id: 0,
      map_bounds: null,
      assign_distance: 0.5,
      assign_duration: 1,
      map_draw: null,
      map_marker_hotspot_size: 24,
      form_card: null,
      map_card_bounds: null,
    };
  },
  methods: {
    formatNb(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    mode(arr) {
      return arr
        .sort((a, b) => arr.filter((v) => v === a).length - arr.filter((v) => v === b).length)
        .pop();
    },
    object2Table(s) {
      return Object.entries(s).map(([k, v]) => {
        return { Properties: k, Value: v };
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
        if (this.website.system == "biolovision") {
          const data = JSON.parse(reader.result).data;
          // Create empty forms and sightings if not presents
          data.forms = data.forms || [];
          data.sightings = data.sightings || [];

          // Define the standard mapping of biolovision sightings to the webapp sightings
          const sightingsTransformation = function (sightings, form_id) {
            return sightings.map((s) => {
              return {
                form_id: form_id,
                datetime: s.observers[0].timing["@ISO8601"].split("+")[0],
                lat: s.observers[0].coord_lat,
                lon: s.observers[0].coord_lon,
                location_name: s.place.name,
                common_name: s.species.name,
                scientific_name: s.species.latin_name,
                species_count: s.observers.count,
                species_count_precision: s.observers.estimation_code,
                species_comment: s.observers.comment || "",
              };
            });
          };

          // Convert individual sightings
          this.sightings = sightingsTransformation(data.sightings, 0);

          // Convert sightings from the forms, keep them seperate
          this.forms_sightings = data.forms.map((f, fid) => {
            return sightingsTransformation(f.sightings, fid + 1);
          });

          // convert form data
          this.forms = data.forms.map((f, fid) => {
            const date = f.sightings[0].observers[0].timing["@ISO8601"].split("T")[0];
            const timeStart = date + "T" + f.time_start;
            const timeStop = date + "T" + f.time_stop;
            return createForm({
              id: fid + 1,
              imported: true,
              location_name: this.mode(f.sightings.map((s) => s.place.name)),
              lat: f.lat,
              lon: f.lon,
              datetime: timeStart,
              duration: (new Date(timeStop) - new Date(timeStart)) / 1000 / 60,
              distance: null,
              number_observer: null,
              full_form: f.full_form == "1",
              primary_purpose: true,
              checklist_comment: "",
              species_comment: "",
              static_map: {
                path: f.protocol.wkt,
                display: true,
                zoom: null,
                lon: null,
                lat: null,
              },
            });
          });

          // Define the default form_card with the latest forms of the list
          this.form_card = this.forms.length > 0 ? this.forms[this.forms.length - 1] : null;
        } else {
          this.loading_file_status = -1;
          throw new Error("No correct system");
        }

        this.number_imported_form = this.forms.length;
        this.number_imported_sightings = this.sightings.length;

        this.loading_file_status = 1;

        this.map_bounds = L.latLngBounds(
          [...this.sightings, ...this.forms].map((s) => L.latLng(s.lat, s.lon))
        ).pad(0.05);
      };
    },
    createForm(f) {
      // generate a random id
      f.id = f.if || (Math.random() + 1).toString(36).substring(7);
      if (this.forms.map((f) => f.id).includes(f.id) | (f.id == 0)) {
        throw new Error("Invalid form id " + string(f.id));
      }
      f = {
        id: f.id,
        imported: f.imported || false,
        location_name: f.location_name || "New List " + id.toString(),
        lat: f.lat || null,
        lon: f.lon || null,
        datetime: f.datetime || null,
        duration: f.duration || null,
        distance: f.distance || null,
        number_observer: f.number_observer || null,
        full_form: f.full_form || false,
        primary_purpose: f.primary_purpose || false,
        checklist_comment: f.checklist_comment || "",
        species_comment: f.species_comment || "",
        static_map: f.static_map || {},
      };
      f.static_map = {
        path: f.static_map.lat || null,
        display: f.static_map.lat || true,
        zoom: f.static_map.lat || null,
        lon: f.static_map.lat || null,
        lat: f.static_map.lat || null,
      };
      return f;
    },
    async onLeafletReady() {
      await this.$nextTick();
      this.map_draw = new L.Draw.Rectangle(this.$refs.map.mapObject);
      this.$refs.map.mapObject.on(L.Draw.Event.CREATED, (e) => {
        if (e.layerType === "rectangle") {
          // Assign sightings to new checklist
          this.sightings.forEach((s) => {
            if (e.layer.getBounds().contains(L.latLng(s.lat, s.lon))) {
              s.form_id = this.assign_form_id;
            }
          });
          // remove empty checklist
        }
      });
    },
    addForm(f) {
      const fnew = createForm(f);
      this.forms.push(fnew);
      this.form_card = fnew;
    },
    removeForm(f) {
      if (f.imported) {
        throw Error("Not possible to delete an imported form");
      } else {
        // change all sightings from this id
        this.sightings.forEach((s) => (s.form_id = s.form_id == f.id ? 0 : form_id));
        // remove the form
        this.forms = this.forms.filter((i) => i.id !== f.id);
      }
    },
    assignMagic() {
      const datetime = this.sightings.map((s) => new Date(s.datetime));
      const form_id = this.sightings.map((s) => s.form_id);
      for (var i = 0; i < this.sightings.length; i++) {
        for (var j = 0; j < i; j++) {
          if (abs(datetime[i] - datetime[j]) < this.assign_duration * 60 * 60 * 1000) {
            var km = distance(
              this.sightings[j].observers[0].coord_lat,
              this.sightings[j].observers[0].coord_lon,
              this.sightings[i].observers[0].coord_lat,
              this.sightings[i].observers[0].coord_lon
            );
            if (km < this.assign_distance) {
              form_id[i] = form_id[j];
              break;
            }
          }
        }
        // New checklist
        if (form_id[i] == 0) {
          var marker = L.marker([
            this.sightings[i].observers[0].coord_lat,
            this.sightings[i].observers[0].coord_lon,
          ]);
          var id = addHotspot(marker);
          this.sightings[i].form = id;
        }
      }
    },
    protocol(f) {
      if (f.primary_purpose) {
        if (
          (f.distance != null) &
          (f.duration != null) &
          (f.datetime != null) &
          (f.number_observer != null)
        ) {
          if (f.distance > 0) {
            return "traveling";
          } else {
            return "stationary";
          }
        } else {
          return "historical";
        }
      } else {
        return "incidental";
      }
    },
    static_map_link(f) {
      return (
        "https://api.mapbox.com/v4/mapbox.satellite/" +
        f.static_map.lat +
        "," +
        f.static_map.lon +
        "," +
        f.static_map.zoom +
        "/800x450@2x.png?access_token=pk.eyJ1IjoicmFmbnVzcyIsImEiOiIzMVE1dnc0In0.3FNMKIlQ_afYktqki-6m0g"
      );
    },
    checklist_comment(f) {
      return f.checklist_comment + f.static_map.display
        ? "<img src=" + static_map_link(f) + " style='max-width:600px;width:100%'>"
        : "" +
            `Imported with <a href="https://zoziologie.raphaelnussbaumer.com/biolovision2ebird/">biolovision2eBird<a>.
      `;
    },
    getFormName() {
      return this.mode(this.sightings_form_card.map((s) => s.location_name));
    },
    getFormCardDuration() {
      const datetime = this.sightings_form_card.map((s) => new Date(s.datetime)).sort();
      return Math.round((datetime[datetime.length - 1] - datetime[0]) / 1000 / 60);
    },
    getFormCardDistance() {
      return null;
    },
  },
  computed: {
    website() {
      return websites_list.filter((w) => w.name == this.website_name)[0];
    },
    sightings_form_card() {
      if (!this.form_card) {
        console.log("Error with form_card");
        return [];
      }
      console.log("get sightings for form " + String(this.form_card.id));

      const sightings = this.form_card.imported
        ? this.forms_sightings[this.form_card.id - 1]
        : this.sightings.filter((s) => s.form_id == this.form_card.id);

      this.map_card_bounds =
        sightings.length > 0
          ? L.latLngBounds(sightings.map((s) => L.latLng(s.lat, s.lon))).pad(0.05)
          : this.map_card_bounds;

      return sightings;
    },
  },
  mounted() {
    this.website_name = this.$cookie.get("website_name");
    this.important_information = JSON.parse(this.$cookie.get("important_information"));

    const urlParams = new URLSearchParams(window.location.search);
    this.skip_intro = urlParams.get("skip_intro") ? true : false;
  },
  watch: {
    website_name() {
      this.$cookie.set("website_name", this.website_name, 365);
    },
    important_information() {
      this.$cookie.set("important_information", JSON.stringify(this.important_information), 365);
    },
  },
};
</script>
