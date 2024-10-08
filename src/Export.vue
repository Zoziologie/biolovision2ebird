<script setup>
import { Parser } from "@json2csv/plainjs";
</script>

<script>
export default {
  props: ["forms", "sightings", "forms_sightings"],
  data() {
    return {
      sightings_error: [],
      prepare_status: null,
      nb_sightings: null,
      csv: "",
      filename: "",
    };
  },
  computed: {
    forms_exportable() {
      return this.forms.filter((f) => f.exportable);
    },
  },
  methods: {
    prepareFile() {
      this.prepare_status = 0;
      const fid = this.forms_exportable.map((f) => f.id);

      const all_sightings = [
        ...this.sightings.filter((s) => fid.includes(s.form_id)),
        ...this.forms_sightings.flat(1).filter((s) => fid.includes(s.form_id)),
      ];

      const formatted_merged_sightings = this.forms_exportable
        .map((f) => {
          const filtered_sightings = all_sightings.filter((s) => f.id == s.form_id);

          const checklist_comment = this.checklistComment(f, filtered_sightings);

          // Merge records of the same
          return Array.from(new Set(filtered_sightings.map((s) => s.common_name))).map((sp) => {
            const s_dupl = filtered_sightings.filter((s) => s.common_name === sp);

            let count = s_dupl.reduce((acc, sp) => {
              return parseInt(acc) + parseInt(sp.count);
            }, 0);
            if (isNaN(count)) count = "X";

            const s_return = {
              common_name: s_dupl[0].common_name ? s_dupl[0].common_name : "",
              Genus: "",
              Species: "",
              count: count,
              species_comment: this.speciesComment(f.species_comment_template, s_dupl),
              location_name: f.location_name,
              latitude: f.lat ? parseFloat(f.lat).toFixed(6) : "",
              longitude: f.lon ? parseFloat(f.lon).toFixed(6) : "",
              date: this.formatDate(f.date, "/"),
              time: f.time ? f.time.substring(0, 5) : "",
              state: "",
              country: "",
              protocol: this.protocol(f).name,
              number_observer: f.number_observer,
              Duration: f.duration > 0 ? f.duration : "",
              full_form: f.full_form ? "Y" : "N",
              distance: f.distance > 0 ? this.mathRound(f.distance * 0.621371, 3) : "",
              area_covered: "",
              checklist_comment: checklist_comment ? checklist_comment : "",
            };
            if (!s_return.common_name) {
              s_return._cellVariants = { common_name: "danger" };
              this.sightings_error.push(s_return);
            }
            if (s_return.count > 999999) {
              s_return._cellVariants = { count: "danger" };
              this.sightings_error.push(s_return);
            }
            if (s_return.count < 0) {
              s_return._cellVariants = { count: "danger" };
              this.sightings_error.push(s_return);
            }
            if (s_return.species_comment.length > 8000) {
              s_return._cellVariants = { species_comment: "danger" };
              this.sightings_error.push(s_return);
            }
            if (!s_return.date) {
              s_return._cellVariants = { date: "danger" };
              this.sightings_error.push(s_return);
            }
            return s_return;
          });
        })
        .flat(1);

      // Stop export if error presen
      if (this.sightings_error.length > 0) {
        return -1;
      }

      this.nb_sightings = formatted_merged_sightings.length;

      const parser = new Parser({ header: false });
      this.csv = parser.parse(formatted_merged_sightings);

      this.filename =
        new Date().toISOString().slice(0, 19).replaceAll(":", "") +
        "_" +
        this.forms_exportable.length +
        "forms_" +
        this.nb_sightings +
        "sightings.csv";
      return 1;
    },
    downloadFile() {
      const downloadLink = document.createElement("a");
      downloadLink.setAttribute("type", "text/csv");
      downloadLink.setAttribute("target", "_blank");
      var blob = new Blob(["\ufeff", this.csv], { type: "text/csv" });
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = this.filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
  },
};
</script>

<template>
  <b-row class="my-3 p-3 bg-white rounded shadow-sm">
    <b-col lg="12">
      <h2 class="border-bottom pb-2 mb-3">4. Upload your data in eBird</h2>
    </b-col>
    <b-col lg="12" v-if="forms_exportable.length === 0">
      <b-alert show variant="secondary">
        <h4 class="alert-heading">Not ready yet...</h4>
        <p>None of the checklist have been marked as being ready. Go back to the previous step!</p>
      </b-alert>
    </b-col>
    <b-col lg="12" v-else>
      <b-alert show variant="secondary" class="d-flex mx-auto flex-column" style="max-width: 600px">
        <h4 class="alert-heading">Well done!</h4>
        <p>
          You are ready to export <strong> {{ forms_exportable.length }} checklists</strong> out of
          {{ forms.length }} checklists available!
        </p>
        <b-button class="mx-auto" @click="prepare_status = prepareFile()">
          <span v-if="prepare_status == null"><b-icon icon="table" /> Prepare CSV</span>
          <span v-else-if="prepare_status == 0">
            <b-spinner small style="width: 1.3rem; height: 1.3rem" /> Preparing CSV
          </span>
          <span v-else> <b-icon icon="table" /> Refresh CSV file</span>
        </b-button>
        <template v-if="prepare_status == 1">
          <hr />
          <h5 class="alert-heading">
            <b-icon icon="check-circle-fill" /> CSV ready with {{ nb_sightings }} records!
          </h5>
          <p>
            Once imported on eBird, the filename will be the only way to find out which import
            correspond to which data. We encourage you to use a name which make sence to you.
          </p>
          <b-input-group prepend="filename">
            <b-form-input type="text" v-model="filename"></b-form-input>
          </b-input-group>
          <b-button class="mx-auto mt-2" @click="downloadFile">
            <b-icon icon="download" /> Download CSV
          </b-button>
        </template>
      </b-alert>
      <b-alert variant="danger" v-if="sightings_error.length > 0" show>
        <h4 class="alert-heading">Sorry, there has been an issue!</h4>
        <p>
          The following {{ sightings_error.length }} entries are not acceptable by eBird. The most
          common issue is that the species comments exceed 8000 character.
        </p>
      </b-alert>
      {{ sightings_error[0] }}
      <b-table bordered small striped hover responsive :items="sightings_error" sticky-header />

      <h5>Final steps:</h5>
      <p>
        Go to
        <a
          href="http://ebird.org/ebird/import/upload.form?theme=ebird"
          target="_blank"
          rel="noopener"
          >eBird Import</a
        >, choose "eBird Record Format (Extended)", select the CSV file on your computer and click
        on "Import File".
      </p>
      <b-col class="text-center my-2">
        <a
          href="http://ebird.org/ebird/import/upload.form?theme=ebird"
          target="_blank"
          rel="noopener"
          class="btn btn-primary"
        >
          Open eBird Import
        </a>
      </b-col>
      <p>
        The import process on eBird
        <b-link
          href="https://github.com/Zoziologie/biolovision2ebird/wiki/FAQ#long-processing-time"
          target="_blank"
          >might take a while</b-link
        >, don't worry. After it has been processed, you might still have to
        <b-link
          href="https://support.ebird.org/en/support/solutions/articles/48000907878-upload-spreadsheet-data-to-ebird#anchorCleanData"
          target="_blank"
          >fix species name </b-link
        >before the data will appear on your eBird profile.
      </p>
      <p>
        Make sure you carefully review your checklist: merge locations to hotspots when possible and
        check the texts and links in species comment. If you see an error, it is best to
        <b-link href="https://ebird.org/import/status/all.htm" target="_blank"
          >delete your import</b-link
        >, and re-upload a new version rather than fix them on eBird.
      </p>
    </b-col>
  </b-row>
</template>
