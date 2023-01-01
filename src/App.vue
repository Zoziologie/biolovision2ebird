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
          <strong>Biolovision2eBird</strong> helps you to import your data from any biolovision
          website (e.g. <b-link href="http://ornitho.ch/" target="_blank">ornitho.ch</b-link>,
          <b-link href="http://faune-alsace.org" target="_blank">faune-alsace</b-link>, ...) to
          eBird!
        </p>
        <p>
          We've recently extended the app to also convert data from the Observation family (e.g.,
          <b-link href="https://waarneming.nl/" target="_blank">waarneming.nl</b-link>), Birdtrack
          (<b-link href="https://www.bto.org/our-science/projects/birdtrack" target="_blank"
            >birdtrack</b-link
          >) and <b-link href="https://www.birdlasser.com/" target="_blank">Birdlasser</b-link>
        </p>
        <p>
          The process is quite simple: (1) upload the file with your data, (2) match the data to
          eBird checklist format, (3) download an
          <b-link
            href="http://help.ebird.org/customer/portal/articles/973915-uploading-data-to-ebird#ebird-record-format-specifications"
            target="_blank"
            >eBird Record Format</b-link
          >
          and (4) upload the file on eBird.
        </p>
        <p>
          Any comments or suggestions? Please submit an issue on
          <b-link
            class="btn btn-sm btn-outline-primary"
            href="https://github.com/Zoziologie/Biolovision2eBird/issues"
            target="_blank"
            ><b-icon icon="github" aria-hidden="true"></b-icon> Github</b-link
          >
          or
          <b-link class="btn btn-sm btn-outline-primary" href="mailto:rafnuss@gmail.com"
            ><b-icon icon="envelope" aria-hidden="true"></b-icon> contact me</b-link
          >.
        </p>
      </b-col>
      <b-col lg="6">
        <b-img :src="gif" fluid />
      </b-col>
      <b-col>
        <b-alert variant="warning" show class="mt-3" dismissible>
          <h4 class="alert-heading">
            <b-icon icon="exclamation-octagon" class="mr-1"></b-icon>Important Information
          </h4>
          <p>
            Before moving on, make sure you understand the differences in protocol between the
            systems used (Ornitho, Birdlasser, Birdtrack) and eBird. Please visit
            <b-link
              href="https://support.ebird.org/en/support/solutions/articles/48000950859-guide-to-ebird-protocols"
              class="alert-link"
              >Guide to eBird Protocols
            </b-link>
            to familiarize with the traveling, stationary, incidental and historical protocols. In
            general, lists should be converted to traveling or stationary, while direct observations
            should be converted to incidental. Under certain conditions, multiple direct
            observations can be grouped and converted to incomplete traveling or stationary
            protocols.
          </p>
          <p>
            In addition, we encourage you to keep the link to the biolovision website in the species
            comment so that the eBird reviewing team can check your record more easily.
          </p>
        </b-alert>
      </b-col>
      <b-col lg="12">
        <b-button variant="primary">Continue</b-button>
      </b-col>
    </b-row>

    <b-row id="c1" class="my-3 p-3 bg-white rounded shadow-sm">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">1. Import Biolovision data</h2>
      </b-col>
      <b-col lg="6">
        <p>Select the website:</p>
        <b-select v-model="website">
          <b-select-option-group
            v-for="cat in new Set(websites_list.map((w) => w.category))"
            :label="cat"
            :key="cat"
          >
            <b-select-option
              v-for="w in websites_list.filter((w) => w.category == cat)"
              :key="w.name"
              :value="w"
            >
              {{ w.name }}
            </b-select-option>
          </b-select-option-group>
        </b-select>
        <b-row class="m-3 p-3 text-white rounded shadow-sm bg-blue" v-if="website">
          <template v-if="(website.name = 'biolovision')">
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
          <template v-else-if="(website.name = 'observation')">
            <p>
              Data from observation.org can be exported from the Observations menu. Login and click
              on your name top right of the page: https://observation.org/
            </p>
          </template>
          <template v-else-if="(website.name = 'birdtrack')">
            <p>https://app.bto.org/birdtrack/explore/emr.jsp</p>
          </template>
          <template v-else-if="(website.name = 'birdlasser')">
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
        <b-button variant="secondary">
          <b-icon icon="list-check" class="mr-1"></b-icon>Create Checklist
        </b-button>
      </b-col>
      <b-col lg="5">
        <small>Select the checklist to which attribute sightings</small>
        <select id="selHotspot" class="form-control"></select>
      </b-col>
      <b-col lg="4">
        <small>Draw a rectangle over the sightings</small>
        <b-button variant="secondary">
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
          >
            <l-popup>
              <b-table bordered small striped hover responsive :items="object2Table(s)"></b-table>
            </l-popup>
          </l-circle-marker>
          <l-marker v-for="f in forms_sightings" :key="f.id" :lat-lng="[f.lat, f.lon]" />
          <l-feature-group ref="featureGroup" @ready="onFeatureGroupReady($event)">
          </l-feature-group>
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

import { latLngBounds, latLng } from "leaflet";
import {
  LMap,
  LTileLayer,
  LControlLayers,
  LPopup,
  LCircleMarker,
  LFeatureGroup,
} from "vue2-leaflet";

export default {
  components: {
    LMap,
    LFeatureGroup,
    LTileLayer,
    LControlLayers,
    LPopup,
    LCircleMarker,
  },
  data() {
    return {
      sightings: [],
      forms: [],
      forms_sightings: [],
      website: null,
      import_query_date: "offset",
      import_query_date_offset: 1,
      import_query_date_range_from: "",
      import_query_date_range_to: "",
      loading_file_status: null,
      assign_date_from: "",
      assign_date_to: "",
      mapBounds: latLngBounds([
        [90, 180],
        [-90, -180],
      ]),
    };
  },
  methods: {
    formatNb(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    sortSightings(a, b) {
      a.datetime > b.datetime ? -1 : 1;
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
        if (this.website.name == "biolovision") {
          const data = JSON.parse(reader.result).data;
          // Create empty forms and sightings if not presents
          data.forms = data.forms || [];
          data.sightings = data.sightings || [];

          const sightingsTransformation = function (s) {
            return {
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
          };

          this.sightings = data.sightings.map(sightingsTransformation).sort(this.sortSightings);

          this.forms = data.forms.map((f) => {
            return {
              id: fid + 1,
              datetime_start: f.time_start,
              datetime_stop: f.time_stop,
              lat: f.lat,
              lon: f.lon,
              location_name: "",
              full_form: f.full_form == "1",
              incidental: false,
              protocol: null,
              number_observer: null,
              path: f.protocol.wkt,
              sightings: f.sightings.map(sightingsTransformation).sort(this.sortSightings),
            };
          });
        } else {
          this.loading_file_status = -1;
          throw new Error("No correct sytem");
        }

        this.assign_date_from = this.sightings[0].datetime;
        this.assign_date_to = this.sightings[this.sightings.length - 1].datetime;

        this.loading_file_status = 1;
      };
    },
    async onLeafletReady() {
      await this.$nextTick();
      this.map.mapObject.on(L.Draw.Event.CREATED, (e) => {
        console.log(e);
        if (e.layerType === "marker") {
        } else if (e.layerType === "rectangle") {
          modalsLayer.eachLayer(function (l) {
            if (e.layer.getBounds().contains(l.getLatLng())) {
              data.sightings.forEach(function (s) {
                if (
                  l.feature.properties["id"] ==
                  (s.observers[0].id_sighting || s.observers[0].id_universal)
                ) {
                  data.forms.forEach(function (f) {
                    if (f.id == jQuery("#selHotspot").val()) {
                      s["marker-color"] = f.color[1];
                      s.form = f.id;
                      l.setIcon(Makemarker(s).options.icon);
                    }
                  });
                }
              });
            }
          });
        }
      });
    },
    async onFeatureGroupReady(editableLayers) {
      await this.$nextTick();
      const drawControl = new L.Control.Draw({
        position: "topright",
        draw: {
          polyline: false,
          polygon: false,
          circle: false,
          circlemarker: false,
          rectangle: true,
          marker: true,
        },
        edit: {
          featureGroup: editableLayers,
        },
      });
      this.map.mapObject.addControl(drawControl);
    },
  },
  computed: {
    import_query_link() {
      return "abx";
    },
    checklists() {
      //combine sightings into checklists
      const forms_sightings = []; // this.sigthings
      return [...this.forms, ...forms_sightings];
    },
  },
  mounted() {
    this.map = this.$refs.map;
    this.website = websites_list.filter((w) => w.name == this.$cookie.get("website"))[0];
  },
  watch: {
    website() {
      this.$cookie.set("website", this.website.name, 365);
    },
  },
};
</script>
