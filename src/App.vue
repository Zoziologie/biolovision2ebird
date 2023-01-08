<script setup>
import logo from "/logo_w.svg";

//import pinSXFFF from "/pin-s-xfff.png";
//import markerSoft from "/markers-soft.png";

import marker_color from "/data/marker_color.json";
</script>

<template class="bg-light">
  <b-container>
    <b-row
      class="d-flex justify-content-between p-3 my-3 text-white rounded shadow-sm bg-secondary"
    >
      <div>
        <h1 class="mb-0">Biolovision2eBird</h1>
        <h6>Convert biolovision data to eBird</h6>
      </div>
      <b-link
        class="py-3 px-0 px-lg-3 rounded text-white text-decoration-none bg-primary"
        href="https://zoziologie.raphaelnussbaumer.com/"
      >
        <span class="mr-1">Powered by</span>

        <b-img class="me-3" :src="logo" alt="" height="36" />
      </b-link>
    </b-row>
    <Intro v-if="!skip_intro" @skipIntro="skip_intro = true" />

    <Import v-else @exportData="importData" />

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
            First click on "Create a checklist" to combine sightings into a checklist by drawing a
            rectanlge over them on the map. You can still modify the sightings allocation by first
            selecting the checklist in the dropdown list, and click on
            <b-icon icon="box-arrow-in-down" /> to draw a new rectangle.
          </p>
          <p>The sightings under "0. Non-assigned" will not be exported.</p>
        </b-col>
        <b-col lg="6">
          <div class="p-3 text-white rounded shadow-sm bg-secondary">
            <h5>Automatic attribution</h5>
            <p>
              Use this "magic" function to automatically create checklists. The function clusters
              sightings which are within a given distance and duration to one another.
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
          </div>
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
                    'Draw a rectangle over the sightings to be included in a new checklist.'
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
                      v-b-tooltip.hove.right="
                        'Draw a rectangle on the map to assign sightings to the checklist selected.'
                      "
                    >
                      <b-icon icon="box-arrow-in-down" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
                <b-button-group class="mt-2">
                  <b-button
                    @click="assignClean"
                    v-b-tooltip.bottom
                    title="Delete empty checklists."
                    variant="warning"
                    ><b-icon icon="trash" /> Clean</b-button
                  >
                  <b-button
                    @click="assignReset"
                    variant="danger"
                    v-b-tooltip.bottom
                    title="Delete all checklists."
                    ><b-icon icon="arrow-counterclockwise" /> Reset</b-button
                  >
                </b-button-group>
              </div>
            </l-control>

            <l-control-layers position="topright" />
            <l-tile-layer
              v-for="(l, id) in mapbox_layers"
              :key="l.text"
              :name="l.text"
              :visible="id == 1"
              :url="`https://api.mapbox.com/styles/v1/mapbox/${l.value}/tiles/{z}/{x}/{y}?access_token=${mapbox_access_token}`"
              layer-type="base"
            />
            <l-circle-marker
              v-for="s in sightings"
              :key="s.id"
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
                <b-table bordered small striped hover responsive :items="object2Table(popup_s)" />
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

    <b-row class="my-3 p-3 bg-white rounded shadow-sm align-items-center" v-if="forms.length > 0">
      <b-col lg="12">
        <h2 class="border-bottom pb-2 mb-3">3. Provide checklist details</h2>
      </b-col>
      <b-col lg="3">
        <div class="align-self-center text-center m-auto">
          <h3 class="mb-0">
            <b-badge
              v-b-tooltip.hover.html="protocol(form_card).title"
              :variant="protocol(form_card).variant"
              >{{ protocol(form_card).name.toUpperCase() }}</b-badge
            >
          </h3>
        </div>
      </b-col>
      <b-col lg="6" class="m-auto text-center">
        <b-button-group size="lg" class="w-100">
          <b-button
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
          <b-dropdown class="w-100">
            <template #button-content>
              {{ form_card.id + ". " + form_card.location_name }}
            </template>
            <b-dropdown-item href="#" v-for="f in forms" :key="f.id" @click="form_card = f">
              {{ f.id + ". " + f.location_name }}
              <b-badge :variant="protocol(f).variant" class="ml-2"
                >{{ protocol(f).letter }} </b-badge
              ><b-icon icon="check-lg" v-show="f.exportable" class="ml-2" variant="primary" />
            </b-dropdown-item>
          </b-dropdown>
          <b-button
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
      <b-col lg="3">
        <b-form-checkbox
          v-model="form_card.exportable"
          :disabled="form_card_invalid"
          switch
          size="lg"
          v-b-tooltip.hover
          title="Mark as ready to include the checklist in the export file. A checklist cannot be exported if invalid."
          >Ready for export</b-form-checkbox
        >
      </b-col>
      <b-col lg="12" class="mt-3">
        <b-card no-body>
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
            <b-alert show variant="danger" class="mt-2" v-show="form_card_sightings.length == 0">
              <b-icon-exclamation-triangle-fill class="mr-2" />This checklist contains no sightings.
              Please add sightings in step 2.
            </b-alert>
            <b-alert show variant="danger" class="mt-2" v-show="form_card_invalid">
              <b-icon-exclamation-triangle-fill class="mr-2" />This checklist is invalid according
              to
              <b-link
                href="https://ebird.freshdesk.com/en/support/solutions/articles/48000795623#eBird-Checklist-Basics"
                class="alert-link"
                target="_blank"
                >eBird Core Rules & Requirements</b-link
              >
              and cannot be exported. Please make sure to include a valid date and a duration less
              than a day.
            </b-alert>
            <b-row>
              <b-col lg="9">
                <b-row>
                  <b-col lg="4">
                    <b-form-group label="Location name:">
                      <b-input-group>
                        <b-form-input
                          v-model="form_card.location_name"
                          type="text"
                          :state="form_card.location_name.length > 0"
                        />
                        <b-input-group-append>
                          <b-button
                            variant="secondary"
                            @click="getFormName"
                            v-b-tooltip.hover
                            title="Use the most common location name of all sightings"
                            ><b-icon icon="arrow-repeat"
                          /></b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
                  </b-col>
                  <b-col lg="4">
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
                  <b-col lg="4">
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
                  <b-col lg="4">
                    <b-form-group label="Duration (minutes):">
                      <b-input-group>
                        <b-form-input
                          v-model="form_card.duration"
                          type="number"
                          step="1"
                          min="1"
                          max="1440"
                          :state="
                            parseFloat(form_card.duration) > 0 &&
                            parseFloat(form_card.duration) <= 1440
                          "
                        />
                        <b-input-group-append>
                          <b-button
                            variant="secondary"
                            @click="form_card.duration = form_card_duration"
                            v-b-tooltip.hover.bottom
                            title="Compute duration between the first and last sightings."
                            ><b-icon icon="arrow-repeat"
                          /></b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
                  </b-col>
                  <b-col lg="4">
                    <b-form-group label="Distance (km):">
                      <b-input-group>
                        <b-form-input
                          v-model="form_card.distance"
                          step="0.1"
                          min="0"
                          max="100"
                          type="number"
                          :state="
                            parseFloat(form_card.distance) >= 0 &&
                            parseFloat(form_card.distance) <= 80
                          "
                        />
                        <b-input-group-append>
                          <b-button
                            variant="secondary"
                            v-b-modal.modal-card
                            v-b-tooltip.hover.bottom
                            title="Draw your path on the map to compute the distance."
                          >
                            <b-icon icon="map" />
                          </b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
                  </b-col>
                  <b-col lg="4">
                    <b-form-group label="Party size:">
                      <template #label> Party size: </template>
                      <b-input-group>
                        <b-form-spinbutton
                          v-model="form_card.number_observer"
                          step="1"
                          min="1"
                          max="100"
                          :state="parseFloat(form_card.number_observer) > 0"
                        />
                        <b-input-group-append>
                          <b-button
                            size="sm"
                            v-b-tooltip.hover.bottom
                            title="Change the party size for all lists with no party size"
                            @click="setObserverForAll(form_card.number_observer)"
                          >
                            <b-icon icon="files" />
                          </b-button>
                        </b-input-group-append>
                      </b-input-group>
                    </b-form-group>
                  </b-col>
                  <b-col lg="4">
                    Effort:
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
                      v-b-tooltip.hover.bottom.html="
                        'In a <b>complete checklist</b>, you <i>report every species</i> you could identify to the best of your ability, by sight and/or sound.'
                      "
                    >
                      Complete Checklist
                    </b-form-checkbox>
                  </b-col>
                  <b-col lg="8">
                    <b-form-group>
                      <template #label>
                        Species comment template
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
                            title="Apply this template to all other checklists and set as default for new."
                            @click="applyCommentToAll"
                          >
                            <b-icon icon="files" />
                          </b-button>
                        </b-button-group>
                      </template>
                      <b-card class="bg-light">
                        <div
                          v-html="
                            speciesComment(form_card.species_comment_template, [
                              form_card_sightings[0],
                            ])
                          "
                        ></div>
                      </b-card>
                    </b-form-group>
                    <b-modal
                      id="modal-species-comment"
                      title="Species comment template"
                      size="lg"
                      hide-footer
                    >
                      <b-row>
                        <b-col lg="8">
                          <p class="mt-2">
                            You can edit the species comment using the HTML code below. Use the
                            notation <code>${property}</code> to display dynamic information on each
                            species. Use the table below to see all the properties available.
                          </p>
                          <b-form-textarea
                            v-model="form_card.species_comment_template.short"
                            rows="6"
                            class="html-editor"
                          />
                          <h6 class="mt-4 mb-0">Preview</h6>
                          <b-card class="bg-light">
                            <div
                              v-html="
                                speciesComment(form_card.species_comment_template, [
                                  form_card_sightings[0],
                                ])
                              "
                              class="mr-2 b-2"
                            ></div>
                          </b-card>
                          <h6 class="mt-5">Multiple sightings</h6>
                          <p>
                            With the current template, we expect that when around
                            {{
                              Math.floor(
                                8000 /
                                  (speciesComment(form_card.species_comment_template, [
                                    form_card_sightings[0],
                                  ]).length +
                                    5)
                              )
                            }}
                            sightings of the same species have been recorded on the same checklist,
                            the comment will exceed eBird limit size (8000 characters).
                          </p>
                          <p>
                            You can use this secondary species comment template, which will be used
                            when more than
                            <b-input
                              size="sm"
                              class="d-inline"
                              style="width: 50px"
                              type="number"
                              v-model="form_card.species_comment_template.limit"
                            />
                            sightings of the same species are recorded.
                          </p>
                          <b-form-textarea
                            v-model="form_card.species_comment_template.long"
                            rows="4"
                            class="html-editor"
                          />
                          <h6 class="mt-4 mb-0">
                            Preview for 20 sightings of the same species:
                            <small>(duplicated for the example here)</small>
                          </h6>
                          <b-card class="bg-light">
                            <div
                              v-html="
                                speciesComment(
                                  form_card.species_comment_template,
                                  Array(10)
                                    .fill()
                                    .map(
                                      () =>
                                        form_card_sightings[
                                          ~~(Math.random() * form_card_sightings.length)
                                        ]
                                    )
                                )
                              "
                            ></div>
                          </b-card>
                        </b-col>
                        <b-col lg="4">
                          <b-table
                            bordered
                            small
                            striped
                            v-if="form_card_sightings.length > 0"
                            :items="object2Table(form_card_sightings[0])"
                          />
                        </b-col>
                      </b-row>
                    </b-modal>
                  </b-col>
                </b-row>
              </b-col>
              <b-col lg="3">
                <b-form-group>
                  <template #label> Checklist comment: </template>
                  <b-form-checkbox switch v-model="form_card.static_map.in_checklist_comment">
                    Include static map
                    <b-button
                      size="sm"
                      v-b-modal.modal-card
                      v-if="form_card.static_map.in_checklist_comment"
                    >
                      <b-icon icon="map" />
                    </b-button>
                  </b-form-checkbox>
                  <b-card class="mt-2 bg-light">
                    <div v-html="checklist_comment(form_card, form_card_sightings)"></div>
                  </b-card>
                </b-form-group>
              </b-col>
            </b-row>
          </b-card-body>
        </b-card>
        <b-modal size="xl" id="modal-card" :title="form_card.location_name" hide-footer>
          <b-row>
            <b-col lg="8">
              <b-form inline>
                Draw a path (polyline) on the map to compute the distance.
                <b-input-group class="d-flex">
                  <template #prepend>
                    <b-input-group-text><b-icon icon="bezier" /></b-input-group-text>
                  </template>
                  <b-form-input readonly v-model="form_card_distance_bezier" />
                  <b-input-group-append>
                    <b-button
                      variant="primary"
                      @click="
                        form_card.distance = form_card_distance_bezier
                          ? form_card_distance_bezier
                          : form_card.distance
                      "
                      >Apply distance to checklist</b-button
                    >
                  </b-input-group-append>
                </b-input-group>
              </b-form>
              <b-aspect aspect="3:2" class="mt-3">
                <l-map class="w-100" ref="map_card" @ready="onMapCardReady">
                  <l-control position="topright">
                    <b-button
                      variant="primary"
                      v-b-tooltip.hover="'Draw your path to measure distance'"
                      @click="map_card_polyline.enable()"
                    >
                      <b-icon icon="bezier" />
                    </b-button>
                  </l-control>
                  <l-tile-layer
                    :url="`https://api.mapbox.com/styles/v1/mapbox/${form_card.static_map.style}/tiles/{z}/{x}/{y}?access_token=${mapbox_access_token}`"
                  />
                  <l-circle-marker
                    v-for="s in form_card_sightings"
                    :key="s.id"
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
                        :items="object2Table(popup_s)"
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
              </b-aspect>
            </b-col>

            <b-col lg="4">
              <b-img :src="static_map_link(form_card, form_card_sightings)" />
              <b-card bg-variant="light" class="mt-2">
                <b-form-group label="Background style: ">
                  <b-form-select
                    size="sm"
                    v-model="form_card.static_map.style"
                    :options="mapbox_layers"
                  />
                </b-form-group>
                <b-form-group label="View:">
                  <b-button size="sm" @click="makeSnapshot">
                    <b-icon icon="camera" /> Use current map view
                  </b-button>
                  <b-form-checkbox
                    switch
                    v-model="form_card.static_map.bounding_box_auto"
                    :disabled="!form_card.static_map.bounding_box"
                  >
                    Auto-bound
                  </b-form-checkbox>
                </b-form-group>
                <b-form-group v-if="false">
                  <b-input-group size="sm">
                    <b-input type="number" v-model="form_card.static_map.size[0]" size="sm" />
                    <b-input-group-addon>
                      <b-input-group-text> &#215; </b-input-group-text>
                    </b-input-group-addon>
                    <b-input type="number" v-model="form_card.static_map.size[1]" />
                  </b-input-group>
                </b-form-group>
                <b-form-group label="Path:">
                  <b-form-checkbox switch v-model="form_card.static_map.include_path" class="mb-1">
                    Include path in static map
                  </b-form-checkbox>
                  <b-input-group v-if="form_card.static_map.include_path" size="sm">
                    <b-input
                      type="number"
                      min="1"
                      v-model="form_card.static_map.path_style.strokeWidth"
                      v-b-tooltip.hover.bottom
                      title="line width"
                    />
                    <b-input
                      type="color"
                      v-model="form_card.static_map.path_style.strokeColor"
                      v-b-tooltip.hover.bottom
                      title="line color"
                    />
                    <b-input
                      type="number"
                      min="0"
                      max="1"
                      step=".1"
                      v-model="form_card.static_map.path_style.strokeOpacity"
                      v-b-tooltip.hover.bottom
                      title="line opacity"
                    />
                  </b-input-group>
                </b-form-group>
                <b-form-group label="Markers:" class="mb-0">
                  <b-input-group size="sm">
                    <b-form-select
                      v-model="form_card.static_map.marker_style['marker-size']"
                      v-b-tooltip.hover.bottom
                      title="marker size"
                    >
                      <b-form-select-option value="small">Small</b-form-select-option>
                      <b-form-select-option value="medium">Medium</b-form-select-option>
                      <b-form-select-option value="large">Large</b-form-select-option>
                    </b-form-select>
                    <b-select
                      v-model="form_card.static_map.marker_style['marker-symbol']"
                      :options="maki_icon_list"
                      v-b-tooltip.hover.bottom
                      title="marker symbol"
                    />
                    <b-input
                      type="color"
                      v-model="form_card.static_map.marker_style['marker-color']"
                      v-b-tooltip.hover.bottom
                      title="marker color"
                    />
                  </b-input-group>
                </b-form-group>
              </b-card>
            </b-col>
          </b-row>
        </b-modal>
      </b-col>
    </b-row>

    <Export
      :forms="forms"
      :sightings="sightings"
      :forms_sightings="forms_sightings"
      v-if="forms.length > 0"
    />

    <b-row
      class="d-flex justify-content-between p-3 my-3 text-white rounded shadow-sm bg-secondary"
    >
      <b-col lg="12">
        <strong>Any issues or suggestions?</strong> Check the
        <b-link
          class="btn btn-sm btn-primary"
          href="https://github.com/Zoziologie/biolovision2ebird/wiki/FAQ"
          target="_blank"
        >
          <b-icon icon="question-circle-fill" aria-hidden="true"> </b-icon> FAQ</b-link
        >
        first, and then submit an issue on
        <b-link
          class="btn btn-sm btn-primary"
          href="https://github.com/Zoziologie/Biolovision2eBird/issues"
          target="_blank"
        >
          <b-icon icon="github" aria-hidden="true"> </b-icon> Github</b-link
        >
        or
        <b-link class="btn btn-sm btn-primary" href="mailto:rafnuss@gmail.com" target="_blank">
          <b-icon icon="envelope-fill" aria-hidden="true"> </b-icon> Contact me</b-link
        >
        if necessary.
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
const mapbox_access_token =
  "pk.eyJ1IjoicmFmbnVzcyIsImEiOiJjbGNsNWtyNm01enhnM3hsazNmamQ5dm5hIn0.DonKVX7CLLfMHIZiiSbYnQ";

const mapbox_layers = [
  {
    text: "Satelite",
    value: "satellite-v9",
  },
  {
    text: "Street",
    value: "streets-v11",
  },
  {
    text: "Outdoor",
    value: "outdoors-v9",
  },
  {
    text: "Satelite-Street",
    value: "satellite-streets-v11",
  },
  {
    text: "Light",
    value: "light-v10",
  },
  {
    text: "Dark",
    value: "dark-v10",
  },
];

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
      form_card_distance_bezier: null,
      maki_icon_list: null,
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
          this.form_card.path = e.layer.getLatLngs().map((l) => [l.lat, l.lng]);
          this.form_card_distance_bezier = this.distanceFromLatLngs(this.form_card.path);
        }
      });
      setTimeout(() => {
        this.$refs.map_card.mapObject.invalidateSize();
        this.$refs.map_card.mapObject.fitBounds(
          L.latLngBounds(this.form_card_sightings.map((s) => L.latLng(s.lat, s.lon))).pad(0.05)
        );
      }, 100);
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
              const fnew = this.createForm(
                {
                  location_name: this.mathMode(sightings.map((s) => s.location_name)),
                  lat: sightings.reduce((a, b) => a + b.lat, 0) / sightings.length,
                  lon: sightings.reduce((a, b) => a + b.lon, 0) / sightings.length,
                  species_comment_template: this.website.species_comment_template,
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
      this.forms = this.forms.filter((f) => f.imported || form_id.includes(f.id));
      if (!form_id.includes(this.form_card.id)) {
        this.form_card = this.forms[this.forms.length - 1];
      }
    },
    assignReset() {
      if (confirm("Are you sure you want to reset the assign map? This action cannot be undone.")) {
        this.sightings.forEach((s) => (s.form_id = 0));
        this.forms = this.forms.filter((f) => f.imported);
        this.count_forms = this.forms.length;
        this.count_forms > 0 ? this.forms[this.count_forms - 1] : null;
        const form_id = this.forms.map((f) => f.id);
        if (!form_id.includes(this.form_card.id)) {
          this.form_card = this.forms[this.forms.length - 1];
        }
      }
    },
    assignMagic() {
      let sightings = this.sightings.filter((s) => s.form_id == 0);
      if (sightings.length == 0) {
        alert("There are no sightings to assign. Click on 'Reset' to start again.");
      }
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
        var fnew = this.createForm(
          {
            location_name: this.mathMode(sightings2.map((s) => s.location_name)),
            date: sightings2[0].date,
            time: sightings2[0].time,
            lat: sightings2.reduce((a, b) => a + b.lat, 0) / sightings2.length,
            lon: sightings2.reduce((a, b) => a + b.lon, 0) / sightings2.length,
            species_comment_template: this.website.species_comment_template,
          },
          this.count_forms + 1
        );
        this.forms.push(fnew);
        this.count_forms++;
        this.assign_form_id = fnew.id;
        this.form_card = fnew;
      }
    },
    static_map_link(form, sightings) {
      // Create path
      let path = "";
      if (form.path && form.path.length > 0 && form.static_map.include_path) {
        const path_simplified = L.LineUtil.simplify(
          form.path.map((x) => {
            return { x: x[0], y: x[1] };
          }),
          0.00001
        ).map((x) => [x.x, x.y]);

        const path_encodeded = L.PolylineUtil.encode(path_simplified, 5);

        const style = form.static_map.path_style;
        path = `path-${style.strokeWidth}+${style.strokeColor.slice(1, style.strokeColor.length)}-${
          style.strokeOpacity
        }(${encodeURIComponent(path_encodeded)}),`;
      }

      // Create sightings markers
      const sightings_simplified = L.LineUtil.simplify(
        sightings.map((x) => {
          return { x: x.lat, y: x.lon };
        }),
        sightings.length > 100 ? 0.001 : 0.0001
      ).map((x) => [x.x, x.y]);

      let sightings_geojson = L.polyline(sightings_simplified).toGeoJSON();
      sightings_geojson.geometry.type = "MultiPoint";
      sightings_geojson.properties = form.static_map.marker_style;
      sightings_geojson.geometry.coordinates = sightings_geojson.geometry.coordinates.map((c) => [
        this.mathRound(c[0], 4),
        this.mathRound(c[1], 4),
      ]);

      const markers = "geojson(" + encodeURIComponent(JSON.stringify(sightings_geojson)) + ")";

      return `https://api.mapbox.com/styles/v1/mapbox/${
        form.static_map.style
      }/static/${path}${markers}/${
        form.static_map.bounding_box_auto ? "auto" : "[" + form.static_map.bounding_box + "]"
      }/300x200?access_token=${mapbox_access_token}&logo=false`;
    },
    makeSnapshot() {
      this.form_card.static_map.bounding_box = this.$refs.map_card.mapObject
        .getBounds()
        .toBBoxString();
      this.form_card.static_map.bounding_box_auto = false;
    },
    getFormName() {
      this.form_card.location_name = this.mathMode(
        this.form_card_sightings.map((s) => s.location_name)
      );
    },
    setObserverForAll(nb) {
      const forms = this.forms.filter((f) => !(f.number_observer > 0));
      if (forms.length == 0) {
        alert("No other checklists have an empty party size.");
      } else if (
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
    applyCommentToAll() {
      if (
        confirm(
          "You are about to apply this template to all other checklists and set it as default for new checklists. This action cannot be undone."
        )
      ) {
        this.forms.forEach((f) => {
          f.species_comment_template = this.form_card.species_comment_template;
        });
        this.website.species_comment_template = this.form_card.species_comment_template;
      }
    },
    eraseComment() {
      if (
        confirm(
          "You are about to erase the content of the species comment. This action cannot be undone."
        )
      ) {
        this.form_card.species_comment_template = "";
      }
    },
  },
  computed: {
    form_card_sightings() {
      const sightings = this.form_card.imported
        ? this.forms_sightings[this.form_card.id - 1]
        : this.sightings.filter((s) => s.form_id == this.form_card.id);
      return sightings;
    },
    form_card_duration() {
      const datetime = this.form_card_sightings
        .map((s) => new Date(s.date + "T" + s.time))
        .sort((a, b) => a - b);
      return Math.round((datetime[datetime.length - 1] - datetime[0]) / 1000 / 60);
    },
    form_card_invalid() {
      if (this.protocol(this.form_card).name == "Invalid") {
        this.form_card.exportable = false;
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.skip_intro = urlParams.get("skip_intro") ? true : false;

    const t = this;
    fetch("https://raw.githubusercontent.com/mapbox/maki/main/layouts/all.json")
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        t.maki_icon_list = JSON.parse(JSON.stringify(res));
      });
  },
};
</script>
