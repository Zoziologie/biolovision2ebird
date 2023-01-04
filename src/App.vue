<script setup>
import logo from "/logo_w.svg";

//import pinSXFFF from "/pin-s-xfff.png";
//import markerSoft from "/markers-soft.png";

import marker_color from "/data/marker_color.json";
import tile_providers from "/data/tile_providers.json";
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

    <Intro v-show="!skip_intro" @skipIntro="skip_intro = true" />

    <Import v-show="skip_intro" @exportData="importData" />

    <b-row class="my-3 p-3 bg-white rounded shadow-sm" v-if="count_forms != null">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">2. Assign individual sightings to checklists</h2>
      </b-col>
      <template v-if="sightings.length == 0">
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
        <b-col lg="12">
          <l-map
            class="w-100"
            style="height: 400px"
            ref="map"
            @ready="onLeafletReady"
            :bounds="map_bounds"
          >
            <l-control position="topright">
              <div class="d-flex flex-column" style="max-width: 480px">
                <b-button
                  class="mb-2"
                  variant="success"
                  @click="
                    create_checklist = true;
                    map_draw_rectangle.enable();
                  "
                >
                  <b-icon icon="plus" /> Create checklist
                </b-button>
                <b-input-group>
                  <b-form-select
                    v-show="forms.length > 0"
                    v-model="assign_form_id"
                    :options="[
                      { value: 0, text: '0. Non-assigned' },
                      ...forms
                        .filter((f) => !f.imported)
                        .map((f) => {
                          return { value: f.id, text: f.id + '. ' + f.location_name };
                        }),
                    ]"
                  />
                  <b-input-group-append>
                    <b-button
                      variant="primary"
                      @click="map_draw_rectangle.enable()"
                      v-show="forms.length > 0"
                    >
                      <b-icon icon="box-arrow-in-down" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
                <b-button-group class="mt-2">
                  <b-button @click="assignClean"
                    ><b-icon icon="trash" /> remove empty checklist</b-button
                  >
                  <b-button @click="assignReset"
                    ><b-icon icon="arrow-counterclockwise" /> Reset</b-button
                  >
                </b-button-group>
              </div>
            </l-control>

            <l-control-layers position="bottomright" />
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
                <b-table bordered small striped hover responsive :items="fx.object2Table(s)" />
              </l-popup>
            </l-circle-marker>
            <l-marker
              v-for="f in forms.filter((f) => !f.imported)"
              :key="f.id"
              :lat-lng="[f.lat, f.lon]"
              @click="assign_form_id = f.id"
              :draggable="true"
              @update:lat-lng="
                (latlng) => {
                  f.lat = latlng.lat;
                  f.lon = latlng.lng;
                }
              "
              :zIndexOffset="1000"
            >
              <IconChecklist :size="24" :fid="f.id" />
            </l-marker>
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
            <b-input-group append="hr">
              <b-form-input v-model="assign_duration" type="number" step="0.1" min="0.1" max="24" />
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col lg="4">
          <b-form-group label="Distance threashold:">
            <b-input-group append="km">
              <b-form-input v-model="assign_distance" type="number" step="0.1" min="0.1" max="5" />
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col lg="4">
          <b-form-group label="L:">
            <b-button variant="primary" block @click="assignMagic">
              <b-icon icon="heart" class="mr-1"></b-icon>Automatic Attribution
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
          <l-map class="w-100" style="height: 400px" :bounds="map_card_bounds">
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
              <b-table bordered small striped hover responsive :items="fx.object2Table(s)"></b-table>
            </l-popup>-->
            </l-circle-marker>
            <!--<l-marker :lat-lng="[fmapid.lat, fmapid.lon]" />-->
            <l-marker
              :lat-lng="[form_card.lat, form_card.lon]"
              :draggable="true"
              @update:lat-lng="
                (latlng) => {
                  form_card.lat = latlng.lat;
                  form_card.lon = latlng.lng;
                }
              "
              :zIndexOffset="1000"
            >
              <IconChecklist :size="24" :fid="form_card.id" />
            </l-marker>
          </l-map>
        </b-card>
      </b-col>
    </b-row>

    <b-row class="d-flex justify-content-between p-3 my-3 text-white rounded shadow-sm bg-blue">
      <b-col lg="12">
        Any comments or suggestions? Please submit an issue on
        <b-link
          class="btn btn-sm btn-outline-secondary"
          href="https://github.com/Zoziologie/Biolovision2eBird/issues"
          target="_blank"
        >
          <b-icon icon="github" aria-hidden="true"> </b-icon> Github</b-link
        >
        or
        <b-link class="btn btn-sm btn-outline-secondary" href="mailto:rafnuss@gmail.com">
          <b-icon icon="envelope" aria-hidden="true"> </b-icon> Contact me</b-link
        >.
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
  LControl,
  LPopup,
  LCircleMarker,
  LMarker,
  LFeatureGroup,
  LIcon,
} from "vue2-leaflet";

import fx from "./functions";

import IconChecklist from "./IconChecklist.vue";
import Intro from "./Intro.vue";
import Import from "./Import.vue";

export default {
  components: {
    LMap,
    LFeatureGroup,
    LTileLayer,
    LControl,
    LControlLayers,
    LPopup,
    LMarker,
    LIcon,
    LCircleMarker,
    IconChecklist,
    Intro,
    Import,
  },
  data() {
    return {
      sightings: [],
      forms: [],
      forms_sightings: [],
      skip_intro: false, // Change on the final version
      count_forms: null,
      assign_form_id: 0,
      create_checklist: false,
      map_bounds: null,
      assign_distance: 0.5,
      assign_duration: 1,
      map_draw_rectangle: null,
      map_draw_marker: null,
      form_card: null,
      map_card_bounds: null,
      a: null,
    };
  },
  methods: {
    importData(d) {
      this.forms = d.forms;
      this.sightings = d.sightings;
      this.forms_sightings = d.forms_sightings;

      this.count_forms = this.forms.length;

      // Define the default form_card with the latest forms of the list
      this.form_card = this.count_forms > 0 ? this.forms[this.count_forms - 1] : null;

      this.map_bounds = L.latLngBounds(
        [...this.sightings, ...this.forms].map((s) => L.latLng(s.lat, s.lon))
      ).pad(0.05);
    },
    async onLeafletReady() {
      await this.$nextTick();
      this.map_draw_rectangle = new L.Draw.Rectangle(this.$refs.map.mapObject);
      // this.map_draw_marker = new L.Draw.Marker(this.map.mapObject);
      this.$refs.map.mapObject.on(L.Draw.Event.CREATED, (e) => {
        if (e.layerType === "rectangle") {
          // find sightings inside rectangle
          let sightings = this.sightings.filter((s) =>
            e.layer.getBounds().contains(L.latLng(s.lat, s.lon))
          );
          if (sightings.length == 0) {
            alert(
              "You tried to create a checklist with no sightings. Please try again by drawing the rectangle over sightings"
            );
          } else {
            // create new checklist if necessaary
            if (this.create_checklist) {
              const fnew = fx.createForm(
                {
                  location_name: fx.mode(sightings.map((s) => s.location_name)),
                  lat: sightings.reduce((a, b) => a + b.lat, 0) / sightings.length,
                  lon: sightings.reduce((a, b) => a + b.lon, 0) / sightings.length,
                },
                this.count_forms + 1
              );
              this.forms.push(fnew);
              this.assign_form_id = fnew.id;
              this.form_card = fnew;
              this.count_forms = this.count_forms + 1;
              this.create_checklist = false;
            }
            // Assign sightings to new checklist
            sightings.forEach((s) => {
              s.form_id = this.assign_form_id;
            });
          }
          // remove empty checklist
        }
      });
    },
    removeForm() {
      // change all sightings from this id
      this.sightings.forEach((s) => (s.form_id = s.form_id == this.assign_form_id ? 0 : s.form_id));
      // remove the form
      this.forms = this.forms.filter((i) => i.id !== this.assign_form_id);
      this.assign_form_id = 0;
    },
    assignClean() {
      const form_id = this.sightings.reduce((prev, s, sid, self) => {
        return prev.includes(s.form_id) ? prev : [...prev, s.form_id];
      }, []);
      this.forms = this.forms.filter((f) => f.imported | form_id.includes(f.id));
    },
    assignReset() {
      this.sightings.forEach((s) => (s.form_id = 0));
      this.forms = this.forms.filter((f) => f.imported);
      this.count_forms = this.forms.length;
    },
    assignMagic() {
      let sightings = this.sightings.filter((s) => s.form_id == 0);
      console.log(sightings);
      const datetime = sightings.map((s) => new Date(s.datetime));
      var form_id = this.count_forms + 1;

      for (var i = 0; i < sightings.length; i++) {
        for (var j = i - 1; j >= 0; j--) {
          if (Math.abs(datetime[i] - datetime[j]) < this.assign_duration * 60 * 60 * 1000) {
            var km = fx.distance(
              sightings[j].lat,
              sightings[j].lon,
              sightings[i].lat,
              sightings[i].lon
            );
            if (km < this.assign_distance) {
              sightings[i].form_id = sightings[j].form_id;
              break; // stop loop if within time and distance
            }
          } else {
            break; // stop loop if outside of time
          }
        }
        if (sightings[i].form_id == 0) {
          sightings[i].form_id = form_id;
          form_id = form_id + 1;
        }
      }

      console.log(sightings.map((s) => s.form_id));

      for (var i = this.count_forms + 1; i < form_id; i++) {
        var sightings2 = sightings.filter((s) => s.form_id == i);
        var fnew = fx.createForm(
          {
            location_name: fx.mode(sightings2.map((s) => s.location_name)),
            lat: sightings2.reduce((a, b) => a + b.lat, 0) / sightings2.length,
            lon: sightings2.reduce((a, b) => a + b.lon, 0) / sightings2.length,
          },
          this.count_forms + 1
        );
        this.forms.push(fnew);
        this.count_forms = this.count_forms + 1;
        this.assign_form_id = fnew.id;
        this.form_card = fnew;
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
      return fx.mode(this.sightings_form_card.map((s) => s.location_name));
    },
    getFormCardDuration() {
      const datetime = this.sightings_form_card.map((s) => new Date(s.datetime)).sort();
      return Math.round((datetime[datetime.length - 1] - datetime[0]) / 1000 / 60);
    },
    getFormCardDistance() {
      return null;
    },
    getSightings(f) {
      console.log("get sightings from form " + String(this.form_card.id));

      return this.form_card.imported
        ? this.forms_sightings[this.form_card.id - 1]
        : this.sightings.filter((s) => s.form_id == this.form_card.id);
    },
  },
  computed: {
    sightings_form_card() {
      if (!this.form_card) {
        throw Error("Error with form_card");
      }

      const sightings = this.getSightings(this.form_card);

      this.map_card_bounds =
        sightings.length > 0
          ? L.latLngBounds(sightings.map((s) => L.latLng(s.lat, s.lon))).pad(0.05)
          : this.map_card_bounds;

      return sightings;
    },
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.skip_intro = urlParams.get("skip_intro") ? true : false;
  },
};
</script>
