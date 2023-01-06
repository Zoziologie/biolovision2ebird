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
        <b-col lg="6">
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
        <b-col lg="6">
          <h5>Automatic attribution</h5>
          <p>
            Instead of doing this process manually, there is (new) an "Automatic Attribution". This
            "magic" function will create checklists and attribute the corresponding incidental
            sightings automotically. The function is based on a distance and duration threashold to
            aggregate sightings together. You can still edit automotic attribution later.
          </p>
          <b-row>
            <b-col sm="4">
              <b-input-group append="hr">
                <b-form-input
                  v-model="assign_duration"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="24"
                />
              </b-input-group>
            </b-col>
            <b-col sm="4">
              <b-input-group append="km">
                <b-form-input
                  v-model="assign_distance"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5"
                />
              </b-input-group>
            </b-col>
            <b-col sm="4">
              <b-button variant="primary" block @click="assignMagic">
                <b-icon icon="arrow-repeat" class="mr-1"></b-icon>Magic tool
              </b-button>
            </b-col>
          </b-row>
        </b-col>

        <b-col lg="12">
          <l-map
            class="w-100 mt-2"
            style="height: 400px"
            ref="map_sightings"
            @ready="onMapSightingsReady"
            :bounds="map_sightings_bounds"
          >
            <l-control position="bottomright">
              <div class="d-flex flex-column" style="max-width: 480px">
                <b-button
                  class="mb-2"
                  variant="success"
                  @click="
                    create_checklist = true;
                    map_draw_rectangle.enable();
                  "
                  v-b-tooltip.hover="
                    'Draw a rectangle on the map to initialize the new checklists with sightings included in the rectangle.'
                  "
                >
                  <b-icon icon="plus" /> Create a checklist
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
                      v-b-tooltip.hover="
                        'Draw a rectangle on the map to assign checklist to the checklist selected.'
                      "
                    >
                      <b-icon icon="box-arrow-in-down" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
                <b-button-group class="mt-2">
                  <b-button @click="assignClean" v-b-tooltip.bottom title="Delete empty checklists"
                    ><b-icon icon="trash" /> Clean</b-button
                  >
                  <b-button
                    @click="assignReset"
                    variant="danger"
                    v-b-tooltip.bottom
                    title="Delete all checklists"
                    ><b-icon icon="arrow-counterclockwise" /> Reset</b-button
                  >
                </b-button-group>
              </div>
            </l-control>

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
              :key="s.time + s.common_name"
              :lat-lng="[s.lat, s.lon]"
              :radius="10"
              :fillColor="marker_color[s.form_id % marker_color.length]"
              :color="marker_color[s.form_id % marker_color.length]"
              @click="openPopup(s, 'marker_popup_sightings')"
            >
            </l-circle-marker>
            <l-marker ref="marker_popup_sightings" :latLng="popup_latLng">
              <l-icon :popup-anchor="[0, 2]" :icon-size="[0, 0]" :icon-url="logo" />
              <l-popup>
                <b-table
                  bordered
                  small
                  striped
                  hover
                  responsive
                  :items="fx.object2Table(popup_s)"
                />
              </l-popup>
            </l-marker>
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
      </template>
    </b-row>

    <b-row class="my-3 p-3 bg-white rounded shadow-sm" v-if="forms.length > 0">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">3. Provide checklists details</h2>
      </b-col>
      <b-col lg="9">
        <p>
          You can navigate into each checklist by clicking on the tab and modify each of them as
          desire. In addition, we automatically added a few improvement such as exact timing and
          location of each observation in comment or a static map with location of your sightings.
          Feel free to remove them of modify them
        </p>
      </b-col>
      <b-col lg="3">
        <p>Change the party size for all lists with no party size</p>
        <b-input-group class="mt-3">
          <b-form-spinbutton v-model="number_observer_for_all" step="1" min="0" max="100" />
          <b-input-group-append>
            <b-button @click="setObserverForAll(number_observer_for_all)" variant="primary">
              <b-icon icon="files" />
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
      <b-col lg="6" class="m-auto text-center">
        <b-button-group size="lg" class="w-100">
          <b-button
            variant="blue"
            @click="
              {
                let idx = forms.map((f) => f.id).indexOf(form_card.id);
                idx = idx == 0 ? idx : idx - 1;
                form_card = forms[idx];
              }
            "
          >
            <b-icon icon="chevron-left" />
          </b-button>
          <b-dropdown variant="blue" class="w-100">
            <template #button-content>
              {{ form_card.id + ". " + form_card.location_name }}
              <b-badge :variant="protocol_variant(protocol(form_card))" class="ml-2"
                >{{ protocol(form_card).slice(0, 1).toUpperCase() }} </b-badge
              ><b-icon icon="check" v-show="form_card.exportable" class="ml-2" />
            </template>
            <b-dropdown-item href="#" v-for="f in forms" :key="f.id" @click="form_card = f">
              {{ f.id + ". " + f.location_name }}
              <b-badge :variant="protocol_variant(protocol(f))" class="ml-2"
                >{{ protocol(f).slice(0, 1).toUpperCase() }} </b-badge
              ><b-icon icon="check" v-show="f.exportable" class="ml-2" />
            </b-dropdown-item>
          </b-dropdown>
          <b-button
            variant="blue"
            @click="
              {
                let idx = forms.map((f) => f.id).indexOf(form_card.id);
                idx = idx == forms.length - 1 ? idx : idx + 1;
                form_card = forms[idx];
              }
            "
            ><b-icon icon="chevron-right"
          /></b-button>
        </b-button-group>
      </b-col>
      <b-col lg="12" class="mt-3">
        <b-card no-body>
          <!--<b-tabs pills card no-fade :small="forms.length > 7">
            <b-tab v-for="f in forms" :key="f.id" @click="form_card = f">
              <template #title class="d-inline">
                {{
                  (f.location_name.length > 15) & (forms.length > 5)
                    ? f.location_name.slice(0, 15 - 1) + "..."
                    : f.location_name
                }}
              </template>
            </b-tab>
          </b-tabs>-->
          <b-card-body v-if="form_card">
            <b-alert show variant="danger" class="mt-2" v-show="form_card_duration > 60 * 24">
              <b-icon-exclamation-triangle-fill class="mr-2" />This checklist contains sightings
              from different days which is not in agreement with
              <b-link
                href="https://ebird.freshdesk.com/en/support/solutions/articles/48000795623#eBird-Checklist-Basics"
                class="alert-link"
                target="_blank"
                >eBird Core Rules & Requirements</b-link
              >.
            </b-alert>
            <b-row>
              <b-col lg="4">
                <b-form-group label="Location Name:">
                  <b-input-group>
                    <b-form-input v-model="form_card.location_name" type="text" />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        @click="form_card.location_name = getFormName(form_card)"
                        v-b-tooltip.hover
                        title="Use the most common location name of all sightings"
                        ><b-icon icon="arrow-repeat"
                      /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="3">
                <b-form-group label="Date:">
                  <b-input-group>
                    <b-form-input
                      v-model="form_card.date"
                      type="date"
                      :state="form_card.date != ''"
                    />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        @click="form_card.date = form_card_sightings[0].date"
                        v-b-tooltip.hover
                        title="Compute earliest date of all sightings."
                        ><b-icon icon="arrow-repeat"
                      /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="3">
                <b-form-group label="Time:">
                  <b-input-group>
                    <b-form-input
                      v-model="form_card.time"
                      type="time"
                      step="60"
                      :state="form_card.time != ''"
                    />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        @click="form_card.time = form_card_sightings[0].time"
                        v-b-tooltip.hover
                        title="Compute earliest time of all sightings."
                        ><b-icon icon="arrow-repeat"
                      /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="2">
                <b-form-group label="Duration (minutes):">
                  <b-input-group>
                    <b-form-input
                      v-model="form_card.duration"
                      type="number"
                      step="1"
                      min="1"
                      max="1440"
                      :state="
                        parseFloat(form_card.duration) > 0 && parseFloat(form_card.duration) <= 1440
                      "
                    />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        @click="form_card.duration = form_card_duration"
                        v-b-tooltip.hover
                        title="Compute duration between the first and last sightings."
                        ><b-icon icon="arrow-repeat"
                      /></b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="3">
                <b-form-group label="Distance (km):">
                  <b-input-group>
                    <b-form-input
                      v-model="form_card.distance"
                      step="0.1"
                      min="0"
                      max="100"
                      type="number"
                      :state="
                        parseFloat(form_card.distance) >= 0 && parseFloat(form_card.distance) <= 80
                      "
                    />
                    <b-input-group-append>
                      <b-button
                        variant="secondary"
                        v-b-tooltip.click="
                          'Click on the map below to draw your path and update distance'
                        "
                        @click="animateBezier"
                      >
                        <b-icon icon="bezier" />
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                </b-form-group>
              </b-col>
              <b-col lg="3">
                <b-form-group label="Party size:">
                  <b-form-spinbutton
                    v-model="form_card.number_observer"
                    step="1"
                    min="1"
                    max="100"
                    :state="parseFloat(form_card.number_observer) > 0"
                  />
                </b-form-group>
              </b-col>
              <b-col lg="4">
                Effort:
                <div class="d-flex">
                  <div>
                    <b-form-checkbox
                      switch
                      v-model="form_card.primary_purpose"
                      v-b-tooltip.hover.html="
                        'When birding is your <b>primary purpose</b>, you <i>are making an effort</i> to find all the birds around you to the best of your ability.'
                      "
                      >Primary Purpose
                    </b-form-checkbox>
                    <b-form-checkbox
                      switch
                      v-model="form_card.full_form"
                      v-b-tooltip.hover.html="
                        'In a <b>complete checklist</b>, you <i>report every species</i> you could identify to the best of your ability, by sight and/or sound.'
                      "
                    >
                      Complete Checklist
                    </b-form-checkbox>
                  </div>
                  <div class="align-self-center text-center m-auto">
                    <h4 variant>
                      <b-badge :variant="protocol_variant(protocol(form_card))">{{
                        protocol(form_card).toUpperCase()
                      }}</b-badge>
                    </h4>
                  </div>
                </div>
              </b-col>
              <b-col lg="2">
                <b-form-group label="">
                  <b-form-checkbox v-model="form_card.exportable">Ready for export</b-form-checkbox>
                </b-form-group>
              </b-col>
            </b-row>
            <b-row>
              <b-col lg="6">
                <b-form-group label="Checklist Comments">
                  <b-form-textarea
                    v-model="form_card.comment"
                    max-rows="6"
                    no-resize
                  ></b-form-textarea>
                </b-form-group>
              </b-col>
              <b-col lg="6">
                <b-form-group>
                  <template #label>
                    Species Comment Model
                    <b-button-group size="sm">
                      <b-button
                        v-b-modal.modal-species-comment
                        v-b-tooltip.hover
                        title="Open edit windows"
                      >
                        <b-icon icon="pencil" />
                      </b-button>
                      <b-button
                        variant="danger"
                        v-b-tooltip.hover
                        title="Erase comment"
                        @click="eraseComment"
                      >
                        <b-icon icon="trash" />
                      </b-button>
                      <b-button
                        variant="primary"
                        v-b-tooltip.hover
                        title="Apply this model to all other checklists and set as default for new."
                        @click="applyCommentToAll"
                      >
                        <b-icon icon="files" />
                      </b-button>
                    </b-button-group>
                  </template>
                  <b-card>
                    <div
                      v-html="
                        speciesComment(
                          form_card.species_comment,
                          form_card_sightings.slice(0, 1)
                        )[0]
                      "
                      class="mr-2"
                    ></div>
                  </b-card>
                </b-form-group>

                <b-modal id="modal-species-comment" size="lg" title="Edit Species Comment">
                  <p class="mt-2">
                    You can edit how the species comment looks like using the HTML code below.
                  </p>
                  <b-form-textarea
                    v-model="form_card.species_comment"
                    rows="6"
                    class="html-editor"
                  />

                  <h6 class="mt-4">Live Preview</h6>
                  <b-card>
                    <div
                      v-html="
                        speciesComment(
                          form_card.species_comment,
                          form_card_sightings.slice(0, 1)
                        )[0]
                      "
                      class="mr-2 b-2"
                    ></div>
                  </b-card>
                  <p class="mt-4">
                    Use the notation <code>${Properties}</code> to disply dynamic information on
                    each species. Use the table below to see all the properties available.
                  </p>

                  <b-table
                    bordered
                    small
                    striped
                    hover
                    responsive
                    v-if="form_card_sightings.length > 0"
                    :items="fx.object2Table(form_card_sightings[0])"
                  />
                </b-modal>
              </b-col>
              <b-col lg="6">
                <b-form-checkbox switch v-model="form_card.static_map"
                  >Include static map</b-form-checkbox
                >
                <template v-if="form_card.static_map">
                  <b-input-group>
                    <template #prepend>
                      <b-input-group-text
                        ><a href="https://docs.mapbox.com/help/getting-started/access-tokens/"
                          >Mapbox Access Token</a
                        >
                      </b-input-group-text>
                    </template>
                    <b-form-input v-model="mapbox_access_token" type="text" />
                  </b-input-group>
                  <b-img :src="static_map_link(form_card, form_card_sightings)" />
                </template>
              </b-col>
            </b-row>
          </b-card-body>
          <l-map
            class="w-100"
            style="height: 400px"
            :bounds="map_card_bounds"
            ref="map_card"
            @ready="onMapCardReady"
          >
            <l-control-layers position="topright" />
            <l-control position="topright">
              <b-button
                :pressed="animate_bezier"
                v-b-tooltip.hover="'Draw your path to measure distance'"
                @click="map_card_polyline.enable()"
              >
                <b-icon icon="bezier" :animation="animate_bezier ? 'throb' : 'false'" />
              </b-button>
            </l-control>
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
              v-for="s in form_card_sightings"
              :key="s.time + s.common_name"
              :lat-lng="[s.lat, s.lon]"
              :radius="10"
              :fillColor="marker_color[s.form_id % marker_color.length]"
              :color="marker_color[s.form_id % marker_color.length]"
              @click="openPopup(s, 'marker_popup_card')"
            >
            </l-circle-marker>
            <l-marker ref="marker_popup_card" :latLng="popup_latLng">
              <l-icon :popup-anchor="[0, 2]" :icon-size="[0, 0]" :icon-url="logo" />
              <l-popup>
                <b-table
                  bordered
                  small
                  striped
                  hover
                  responsive
                  :items="fx.object2Table(popup_s)"
                />
              </l-popup>
            </l-marker>
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
            <l-polyline :lat-lngs="form_card.path" :color="'brown'" v-if="form_card.path" />
          </l-map>
        </b-card>
      </b-col>
    </b-row>

    <Export
      :forms="forms"
      :sightings="sightings"
      :form_sightings="forms_sightings"
      v-if="forms.length > 0"
    />

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
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import "leaflet";
import "leaflet-draw/dist/leaflet.draw-src.js";
import "leaflet-fullscreen/dist/Leaflet.fullscreen.js";
import "polyline-encoded/Polyline.encoded.js";
// fix for leaflet draw
window.type = true;

import {
  LMap,
  LTileLayer,
  LControlLayers,
  LControl,
  LPopup,
  LCircleMarker,
  LMarker,
  LPolyline,
  LIcon,
} from "vue2-leaflet";

import fx from "./functions";

import IconChecklist from "./IconChecklist.vue";
import Intro from "./Intro.vue";
import Import from "./Import.vue";
import Export from "./Export.vue";

export default {
  components: {
    LMap,
    LPolyline,
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
    Export,
  },
  data() {
    return {
      website: null,
      sightings: [],
      forms: [],
      forms_sightings: [],
      skip_intro: false,
      count_forms: null,
      popup_latLng: [0, 0],
      popup_s: {},
      assign_form_id: 0,
      create_checklist: false,
      map_sightings_bounds: null,
      assign_distance: 0.5,
      assign_duration: 1,
      map_draw_rectangle: null,
      map_draw_marker: null,
      map_card_polyline: null,
      form_card: null,
      number_observer_for_all: 1,
      animate_bezier: false,
      mapbox_access_token: "",
    };
  },
  methods: {
    importData(d) {
      this.forms = d.forms;
      this.sightings = d.sightings;
      this.forms_sightings = d.forms_sightings;
      this.website = d.website;

      this.count_forms = this.forms.length;

      // Define the default form_card with the latest forms of the list
      this.form_card = this.count_forms > 0 ? this.forms[this.count_forms - 1] : null;

      this.map_sightings_bounds = L.latLngBounds(
        [...this.sightings, ...this.forms].map((s) => L.latLng(s.lat, s.lon))
      ).pad(0.05);
    },
    async onMapCardReady() {
      await this.$nextTick();
      this.$refs.map_card.mapObject.addControl(new L.Control.Fullscreen());
      this.map_card_polyline = new L.Draw.Polyline(this.$refs.map_card.mapObject);
      this.$refs.map_card.mapObject.on(L.Draw.Event.CREATED, (e) => {
        if (e.layerType === "polyline") {
          const latlngs = e.layer.getLatLngs();
          // Compute distance as the cumulative distance between each point.
          const dist = (
            latlngs.reduce(
              (acc, latlng) => {
                return [acc[0] + acc[1].distanceTo(latlng), latlng];
              },
              [0, latlngs[0]]
            )[0] / 1000
          ).toFixed(2);
          if (
            confirm(
              "Are you sure you want to reset the path on the map and set the distance to " +
                dist +
                "km? This action cannot be undone."
            )
          ) {
            this.form_card.distance = dist;
            this.form_card.path = latlngs.map((l) => [l.lat, l.lng]);
          }
        }
      });
    },
    async onMapSightingsReady() {
      await this.$nextTick();
      this.$refs.map_sightings.mapObject.addControl(new L.Control.Fullscreen());
      this.map_draw_rectangle = new L.Draw.Rectangle(this.$refs.map_sightings.mapObject);
      this.$refs.map_sightings.mapObject.on(L.Draw.Event.CREATED, (e) => {
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
                  species_comment: this.website.species_comment,
                },
                this.count_forms + 1
              );
              this.forms.push(fnew);
              this.assign_form_id = fnew.id;
              this.form_card = fnew;
              this.count_forms++;
              this.create_checklist = false;
            }
            // Assign sightings to new checklist
            sightings.forEach((s) => {
              s.form_id = this.assign_form_id;
            });
          }
        }
      });
    },
    assignClean() {
      const form_id = this.sightings.reduce((prev, s, sid, self) => {
        return prev.includes(s.form_id) ? prev : [...prev, s.form_id];
      }, []);
      this.forms = this.forms.filter((f) => f.imported | form_id.includes(f.id));
    },
    assignReset() {
      if (confirm("Are you sure you want to reset the assign map? This action cannot be undone.")) {
        this.sightings.forEach((s) => (s.form_id = 0));
        this.forms = this.forms.filter((f) => f.imported);
        this.count_forms = this.forms.length;
        this.count_forms > 0 ? this.forms[this.count_forms - 1] : null;
      }
    },
    assignMagic() {
      let sightings = this.sightings.filter((s) => s.form_id == 0);
      const datetime = sightings.map((s) => new Date(s.date + "T" + s.time));
      var form_id = this.count_forms + 1;

      for (var i = 0; i < sightings.length; i++) {
        for (var j = i - 1; j >= 0; j--) {
          if (Math.abs(datetime[i] - datetime[j]) < this.assign_duration * 60 * 60 * 1000) {
            var km =
              L.latLng([sightings[j].lat, sightings[j].lon]).distanceTo(
                L.latLng([sightings[i].lat, sightings[i].lon])
              ) / 1000;
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
          form_id++;
        }
      }

      for (var i = this.count_forms + 1; i < form_id; i++) {
        var sightings2 = sightings.filter((s) => s.form_id == i);
        var fnew = fx.createForm(
          {
            location_name: fx.mode(sightings2.map((s) => s.location_name)),
            date: sightings2[0].date,
            time: sightings2[0].time,
            lat: sightings2.reduce((a, b) => a + b.lat, 0) / sightings2.length,
            lon: sightings2.reduce((a, b) => a + b.lon, 0) / sightings2.length,
            species_comment: this.website.species_comment,
          },
          this.count_forms + 1
        );
        this.forms.push(fnew);
        this.count_forms++;
        this.assign_form_id = fnew.id;
        this.form_card = fnew;
      }
    },
    protocol(form) {
      if (!form.date) {
        return "invalid";
      }
      if (form.primary_purpose) {
        if (
          !!form.time &&
          parseFloat(form.distance) >= 0 &&
          parseFloat(form.duration) > 0 &&
          parseFloat(form.number_observer) > 0
        ) {
          if (form.distance > 0) {
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
    protocol_variant(p) {
      switch (p) {
        case "traveling":
          return "success";
        case "stationary":
          return "success";
        case "warning":
          return "success";
        case "incidental":
          return "warning";
        case "invalid":
          return "danger";
      }
    },
    static_map_link(form, sightings) {
      if (form && sightings) {
        // Create path
        let path = "";
        if (form.path && form.path.length > 0) {
          const path_simplified = L.LineUtil.simplify(
            form.path.map((x) => {
              return { x: x[0], y: x[1] };
            }),
            0.00001
          ).map((x) => [x.x, x.y]);

          const path_encodeded = L.PolylineUtil.encode(path_simplified, 5);

          path = "path-5+AD8533(" + encodeURIComponent(path_encodeded) + "),";
        }

        // Create sightings markers
        const sightings_simplified = L.LineUtil.simplify(
          sightings.map((x) => {
            return { x: x.lat, y: x.lon };
          }),
          0.001
        ).map((x) => [x.x, x.y]);

        let sightings_geojson = L.polyline(sightings_simplified).toGeoJSON();
        sightings_geojson.geometry.type = "MultiPoint";
        sightings_geojson.properties = {
          "marker-size": "s",
        };
        sightings_geojson.geometry.coordinates = sightings_geojson.geometry.coordinates.map((c) => [
          Math.round(c[0] * 1000) / 1000,
          Math.round(c[1] * 1000) / 1000,
        ]);

        const markers = "geojson(" + encodeURIComponent(JSON.stringify(sightings_geojson)) + ")";

        return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${path}${markers}/auto/300x200?access_token=${this.mapbox_access_token}&logo=false`;
      }
    },
    speciesComment(species_comment, sightings) {
      return sightings.map((s) => {
        let cmt = species_comment;
        Object.keys(s).forEach((k) => {
          cmt = cmt.replaceAll("${" + k + "}", s[k]);
        });
        return cmt;
      });
    },
    checklist_comment(form) {
      return f.checklist_comment + f.static_map.display
        ? "<img src=" + static_map_link(f) + " style='max-width:600px;width:100%'>"
        : "" +
            `Imported with <a href="https://zoziologie.raphaelnussbaumer.com/biolovision2ebird/">biolovision2eBird<a>.
      `;
    },
    getFormName(form) {
      return fx.mode(this.form.map((s) => s.location_name));
    },
    setObserverForAll(nb) {
      const forms = this.forms.filter((f) => !(f.number_observer > 0));
      if (
        confirm(
          "Are you sure you want to set the party size for " +
            forms.map((f) => f.location_name).join(", ") +
            " to " +
            nb +
            ". This action cannot be undone."
        )
      ) {
        forms.forEach((f) => (f.number_observer = nb));
      }
    },
    openPopup(s, marker) {
      this.popup_latLng = L.latLng([s.lat, s.lon]);
      this.popup_s = s;
      setTimeout(() => this.$refs[marker].mapObject.openPopup(), 100);
    },
    animateBezier() {
      this.animate_bezier = true;
      setTimeout(() => {
        this.animate_bezier = false;
      }, 5000);
    },
    applyCommentToAll() {
      if (
        confirm(
          "You are about to apply the the species comment model to all other checklist and set this model as default for new checklist. This action cannot be undone."
        )
      ) {
        this.forms.forEach((f) => {
          f.species_comment = this.form_card.species_comment;
        });
        this.website.species_comment = this.form_card.species_comment;
      }
    },
    eraseComment() {
      if (
        confirm(
          "You are about to earse the content of the species comment. This action cannot be undone."
        )
      ) {
        this.form_card.species_comment = "";
      }
    },
  },
  computed: {
    form_card_sightings() {
      if (!this.form_card) {
        throw Error("Error with form_card");
      }

      const sightings = this.form_card.imported
        ? this.forms_sightings[this.form_card.id - 1]
        : this.sightings.filter((s) => s.form_id == this.form_card.id);

      console.log("form_card_sightings");
      return sightings;
    },
    map_card_bounds() {
      return this.form_card_sightings.length > 0
        ? L.latLngBounds(this.form_card_sightings.map((s) => L.latLng(s.lat, s.lon))).pad(0.05)
        : null;
    },
    form_card_duration() {
      console.log("getFormCardDuration");
      const datetime = this.form_card_sightings.map((s) => new Date(s.date + "T" + s.time)).sort();
      return Math.round((datetime[datetime.length - 1] - datetime[0]) / 1000 / 60);
    },
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.skip_intro = urlParams.get("skip_intro") ? true : false;

    this.mapbox_access_token = JSON.parse(this.$cookie.get("mapbox_access_token"));
  },
  watch: {
    mapbox_access_token() {
      this.$cookie.set("mapbox_access_token", JSON.stringify(this.mapbox_access_token), 365);
    },
  },
};
</script>
