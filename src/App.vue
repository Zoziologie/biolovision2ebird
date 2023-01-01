<script setup>
import logo from "/logo_w.svg";
import gif from "/b2e.gif";
import jsonIcon from "/json.png";
import pinSXFFF from "/pin-s-xfff.png";
import markerSoft from "/markers-soft.png";

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

        <b-img class="me-3" :src="logo" alt="" height="43" />
      </b-link>
    </b-row>

    <b-row id="c0" class="my-3 p-3 bg-white rounded shadow-sm">
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
          <li>Download your data from the original website and load them on this webapp.</li>
          <li>Group incidental sightings into checklists.</li>
          <li>Add missing information for the eBird standard.</li>
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

        <p>
          Any comments or suggestions? Please submit an issue on
          <b-link
            class="btn btn-sm btn-link"
            href="https://github.com/Zoziologie/Biolovision2eBird/issues"
            target="_blank"
            ><b-icon icon="github" aria-hidden="true"></b-icon> Github</b-link
          >
          or
          <b-link class="btn btn-sm btn-link" href="mailto:rafnuss@gmail.com"
            ><b-icon icon="envelope" aria-hidden="true"></b-icon> Contact me</b-link
          >.
        </p>
      </b-col>
      <b-col lg="6">
        <b-img :src="gif" fluid />
      </b-col>
      <b-col>
        <b-alert variant="warning" show class="mt-3">
          <h4 class="alert-heading">
            <b-icon icon="exclamation-octagon" class="mr-1"></b-icon>Required Information
          </h4>
          <b-form-group>
            <b-form-checkbox-group stacked v-model="important_information">
              <b-form-checkbox value="1">
                Be familiar with
                <b-link
                  href="https://ebird.freshdesk.com/en/support/solutions/articles/48000795623#eBird-Checklist-Basics"
                  target="_blank"
                  class="alert-link"
                  >eBird Core Rules & Requirements.</b-link
                >
              </b-form-checkbox>
              <b-form-checkbox value="2">
                Understand the differences between
                <b-link
                  href="https://support.ebird.org/en/support/solutions/articles/48000950859-guide-to-ebird-protocols"
                  class="alert-link"
                  target="_blank"
                  >eBird Core Protocols</b-link
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
          <h4 class="alert-heading">
            <b-icon icon="exclamation-triangle" class="mr-1"></b-icon>Important Information
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
              information cannot be provided, lists will use the Historical protocol. Individual
              direct observations (sightings) should be converted to incidental. Under certain
              conditions, multiple direct observations can be grouped and converted to incomplete
              traveling, stationary or historical protocols.
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
              2. Assign sightings. Then, modify location and dates in eBird as recommended on the
              link above.
            </li>
          </ol>
          <b-col lg="12" class="text-center">
            <b-button variant="secondary" :disabled="important_information.length < 3">
              Continue
            </b-button>
          </b-col>
        </b-alert>
      </b-col>
    </b-row>

    <b-row id="c1" class="my-3 p-3 bg-white rounded shadow-sm">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">1. Import Biolovision data</h2>
      </b-col>
      <b-col lg="6">
        <p>Select the website:</p>
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
            <p>With biolovision website...</p>
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
            <b-col lg="12">
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
            <b-col lg="12">
              <a
                :href="
                  website.website +
                  '/index.php?m_id=31&sp_DChoice=' +
                  import_query_date +
                  '&sp_DFrom=' +
                  import_query_date_range_from +
                  '&sp_DTo=' +
                  import_query_date_range_to +
                  '&sp_DOffset=' +
                  import_query_date_offset +
                  '&sp_SChoice=all&sp_PChoice=all&sp_OnlyMyData=1'
                "
                class="btn btn-secondary"
                >Export data on {{ website.website_name }}</a
              >
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
        <b-form-file size="lg" @change="processFile" :accept="website.extension"></b-form-file>
        <b-alert
          v-if="loading_file_status == 0"
          variant="warning"
          class="d-flex align-items-center"
          show
        >
          <b-spinner label="Spinning" variant="warning" class="mr-2"></b-spinner>
          <strong class="me-1">Loading data.</strong>
        </b-alert>
        <b-alert v-else-if="loading_file_status == 1" variant="success" show>
          <b-icon icon="check-circle-fill" class="mr-2"></b-icon>
          <strong>Data loaded successfuly! </strong>
        </b-alert>
        <b-alert v-else-if="loading_file_status == -1" variant="danger" show>
          <b-icon icon="exclamation-triangle" class="mr-2"></b-icon>
          <strong>There is an error! </strong>
        </b-alert>
        Website: {{ website }}, Data: {{ forms.length }} lists and {{ sightings.length }} sightings.
      </b-col>
    </b-row>

    <b-row id="c2" class="my-3 p-3 bg-white rounded shadow-sm">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">2. Assign sightings to checklist</h2>
      </b-col>
      <b-col lg="12">
        <p>
          The first step is to assign incidental sightings (e.g.
          <b-img :src="pinSXFFF" height="30" />) to a checklist (e.g.
          <b-img :src="markerSoft" alt="" height="30" />). You can either create a new checklist or
          use existing one from imported biolovision list.
        </p>
        <p>
          To assign a sightings to a checklist, select the desired checklist in the list below and
          click on "Attribute Sightings". This will allow you to draw a rectangle over the
          sighting(s) you want to assign to the list selected in the list. The sightings markers
          color will change according to the checklist's color. Remaining non-assigned sightings
          (white marker) will be deleted.
        </p>
        <p>
          Instead of doing this process manually, there is (new) an "Automatic Attribution". This
          "magic" function will create checklists and attribute the corresponding incidental
          sightings automotically. The function is based on a distance and duration threashold to
          aggregate sightings together. You can still edit automotic attribution later.
        </p>
      </b-col>
      <b-col lg="12">
        <b-input-group>
          <b-form-input v-model="assign_date_from" type="datetime-local" />
          <b-input-group-text class="rounded-0">to</b-input-group-text>
          <b-form-input v-model="assign_date_to" type="datetime-local" />
        </b-input-group>
      </b-col>
      <b-col lg="3">
        <small>Add a marker on the map</small>
        <b-button variant="secondary" @click="mapDrawMarker.enable()">
          <b-icon icon="list-check" class="mr-1"></b-icon>Create Checklist
        </b-button>
      </b-col>
      <b-col lg="5">
        <small>Change which form to assign the sightings</small>
        <b-form-select
          v-model="assign_form_id"
          :options="
            forms.map((f) => {
              return { value: f.id, text: f.id + '. ' + f.location_name };
            })
          "
        ></b-form-select>
      </b-col>
      <b-col lg="4">
        <small>Draw a rectangle over the sightings</small>
        <b-button
          variant="secondary"
          @click="mapDrawRectangle.enable()"
          :disabled="assign_form_id == null"
        >
          <b-icon icon="square" class="mr-1"></b-icon>Attribute Sightings
        </b-button>
      </b-col>
      <b-col lg="12">
        <l-map
          :bounds="mapBounds"
          class="w-100 mt-3"
          style="height: 400px"
          ref="map"
          @ready="onLeafletReady"
        >
          <l-control-layers position="topright"></l-control-layers>
          <l-tile-layer
            v-for="tileProvider in tile_providers"
            :key="tileProvider.name"
            :name="tileProvider.name"
            :visible="tileProvider.visible"
            :url="tileProvider.url"
            :attribution="tileProvider.attribution"
            layer-type="base"
          />
          <!--<v-marker-cluster
            :options="{
              showCoverageOnHover: false,
            }"
          >
            <l-marker v-for="s in sightings" :key="s.locId" :lat-lng="[s.place.lat, s.place.lon]">
            </l-marker>
          </v-marker-cluster>-->
          <l-circle-marker
            v-for="s in sightings"
            :key="s.datetime + s.common_name"
            :lat-lng="[s.lat, s.lon]"
            :radius="10"
            :fillColor="marker_color[s.form_id][0]"
            :color="marker_color[s.form_id][0]"
          >
            <l-popup>
              <b-table bordered small striped hover responsive :items="object2Table(s)"></b-table>
            </l-popup>
          </l-circle-marker>
          <l-marker
            v-for="f in forms"
            :key="'form-' + f.id"
            :lat-lng="[f.lat, f.lon]"
            @click="assign_form_id = f.id"
          >
            <l-icon
              :iconAnchor="[
                mapMarkerHotspotSize / 2,
                Math.sqrt((mapMarkerHotspotSize * mapMarkerHotspotSize) / 2) +
                  mapMarkerHotspotSize / 2,
              ]"
              ><!--  :labelAnchor="[-6, 0]" :popupAnchor="[0, -36]"-->
              <div style="display: grid">
                <div
                  :style="{
                    'background-color': marker_color[f.id][0],
                    color: marker_color[f.id][2],
                    width: mapMarkerHotspotSize + 'px',
                    height: mapMarkerHotspotSize + 'px',
                    display: 'block',
                    position: 'relative',
                    'border-radius': '3rem 3rem 0',
                    transform: 'rotate(45deg)',
                    border: '1px solid #ffffff',
                  }"
                ></div>
                <div
                  :style="{
                    color: marker_color[f.id][2],
                    position: 'absolute',
                    width: mapMarkerHotspotSize + 'px',
                    'text-align': 'center',
                    'line-height': mapMarkerHotspotSize + 'px',
                  }"
                >
                  {{ f.id }}
                </div>
              </div>
            </l-icon>
          </l-marker>
        </l-map>
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
      import_query_date: "offset",
      import_query_date_offset: 1,
      import_query_date_range_from: "",
      import_query_date_range_to: "",
      loading_file_status: null,
      assign_date_from: "",
      assign_date_to: "",
      assign_form_id: null,
      mapBounds: L.latLngBounds([
        [90, 180],
        [-90, -180],
      ]),
      mapDrawMarker: null,
      mapDrawRectangle: null,
      mapMarkerHotspotSize: 24,
    };
  },
  methods: {
    formatNb(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    sortSightings(a, b) {
      return a.datetime > b.datetime ? -1 : 1;
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

          const sightingsTransformation = function (sightings, form_id) {
            return sightings.map((s) => {
              return {
                form_id: form_id,
                datetime: s.observers[0].timing["@ISO8601"].split("+")[0],
                lat: s.place.coord_lat,
                lon: s.place.coord_lon,
                location_name: s.place.name,
                common_name: s.species.name,
                scientific_name: s.species.latin_name,
                species_count: s.observers.count,
                species_count_precision: s.observers.estimation_code,
                species_comment: s.observers.comment || "",
              };
            });
          };

          this.sightings = sightingsTransformation(data.sightings, 0);

          this.forms = data.forms.map((f, fid) => {
            return {
              id: fid + 1,
              datetime_start: f.time_start,
              datetime_stop: f.time_stop,
              lat: f.lat,
              lon: f.lon,
              location_name: this.mode(f.sightings.map((s) => s.place.name)),
              full_form: f.full_form == "1",
              incidental: false,
              protocol: null,
              number_observer: null,
              path: f.protocol.wkt,
              sightings: sightingsTransformation(data.sightings, fid + 1),
            };
          });
        } else {
          this.loading_file_status = -1;
          throw new Error("No correct sytem");
        }

        if (this.sightings.length > 0) {
          this.assign_date_from = this.sightings[0].datetime;
          this.assign_date_to = this.sightings[this.sightings.length - 1].datetime;
        }
        this.map.fitBounds(
          L.latLngBounds([...this.sightings, ...this.forms].map((s) => L.latLng(s.lat, s.lon)))
        );

        this.loading_file_status = 1;
      };
    },
    async onLeafletReady() {
      await this.$nextTick();
      this.mapDrawMarker = new L.Draw.Marker(this.map.mapObject);
      this.mapDrawRectangle = new L.Draw.Rectangle(this.map.mapObject);

      this.map.mapObject.on(L.Draw.Event.CREATED, (e) => {
        if (e.layerType === "marker") {
          const latLng = e.layer.getLatLng();
          const id = this.forms.length + 1;
          this.forms.push({
            id: id,
            datetime_start: null,
            datetime_stop: null,
            lat: latLng.lat,
            lon: latLng.lng,
            location_name:
              "New List " + id.toString() + " " + latLng.toString().replace("LatLng", ""),
            full_form: false,
            incidental: false,
            protocol: null,
            number_observer: null,
            path: null,
            sightings: [],
          });
          this.assign_form_id = id;
        } else if (e.layerType === "rectangle") {
          this.sightings.forEach((s) => {
            if (e.layer.getBounds().contains(L.latLng(s.lat, s.lon))) {
              s.form_id = this.assign_form_id;
            }
          });
        }
      });
    },
  },
  computed: {
    website() {
      return websites_list.filter((w) => w.name == this.website_name)[0];
    },
    checklists() {
      //combine sightings into checklists
      const forms_sightings = []; // this.sigthings
      return [...this.forms, ...forms_sightings];
    },
  },
  mounted() {
    this.map = this.$refs.map;
    this.website_name = this.$cookie.get("website_name");
    this.important_information = JSON.parse(this.$cookie.get("important_information"));
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
