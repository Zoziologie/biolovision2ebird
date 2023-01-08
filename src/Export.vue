<script setup>
import { Parser } from "@json2csv/plainjs";
</script>

<script>
export default {
  props: ["forms", "sightings", "forms_sightings"],
  data() {
    return {
      sightings_error: [],
    };
  },
  computed: {
    forms_exportable() {
      return this.forms.filter((f) => f.exportable);
    },
  },
  methods: {
    downloadFile() {
      const fid = this.forms_exportable.map((f) => f.id);

      const all_sightings = [
        ...this.sightings.filter((s) => fid.includes(s.form_id)),
        ...this.forms_sightings.flat(1).filter((s) => fid.includes(s.form_id)),
      ];

      const formatted_merged_sightings = this.forms
        .map((f) => {
          const formatted_sightings = all_sightings
            .filter((s) => f.id == s.form_id)
            .map((s) => {
              return {
                "Common Name": s.common_name,
                Genus: "",
                Species: "",
                "Species Count": s.count,
                "Location Name": f.location_name,
                Latitude: parseFloat(f.lat).toFixed(6),
                Longitude: parseFloat(f.lon).toFixed(6),
                "Observation date": this.formatDate(f.date, "/"),
                "Start time": f.time_start ? f.time_start.substring(0, 5) : "",
                State: "",
                Country: "",
                Protocol: this.protocol(f).name,
                "Number of observers": f.number_observer,
                Duration: f.duration > 0 ? f.duration : "",
                "All observations reported?": f.full_form ? "Y" : "N",
                "Distance covered":
                  f.distance * 0.621371 > 0 ? (f.distance * 0.621371).toString() : "",
                "Area covered": "",
                "Checklist Comments": f.comment,
              };
            });

          // Merge records of the same
          return Array.from(new Set(formatted_sightings.map((s) => s["Common Name"]))).map((sp) => {
            let s_dupl = formatted_sightings.filter((s) => s["Common Name"] === sp);
            let s_return = s_dupl[0];
            s_return["Species Count"] = s_dupl.reduce((acc, sp) => {
              return parseInt(acc) + parseInt(sp["Species Count"]);
            }, 0);
            s_return["Species Comments"] = this.speciesComment(f.species_comment_template, s_dupl);

            if (s_return["Species Comments"].length > 8000) {
              s_return._cellVariants = { "Species Comments": "danger" };
              this.sightings_error.push(s_return);
            }
            if (s_return["Species Count"] > 999999) {
              s_return._cellVariants = { "Species Count": "danger" };
              this.sightings_error.push(s_return);
            }
            if (s_return["Species Count"] < 0) {
              s_return._cellVariants = { "Species Count": "danger" };
              this.sightings_error.push(s_return);
            }
            return s_return;
          });
        })
        .flat(1);

      // Make check
      if (this.sightings_error.length > 0) {
        alert("There are some error in the export check the error below!");
        return;
      }

      const parser = new Parser({ header: false });
      const csv = parser.parse(formatted_merged_sightings);

      const filename =
        new Date().toISOString().slice(0, 19).replaceAll(":", "") +
        "_" +
        this.forms_exportable.length +
        "forms_" +
        all_sightings.length +
        "sightings_biolovision2Bird";

      const downloadLink = document.createElement("a");
      downloadLink.setAttribute("type", "text/csv");
      downloadLink.setAttribute("target", "_blank");
      var blob = new Blob(["\ufeff", csv], { type: "text/csv" });
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = filename + ".csv";
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
      <b-alert show variant="secondary" class="mx-auto" style="max-width: 600px">
        <h4 class="alert-heading">Well done!</h4>
        <p>
          You are ready to export <strong> {{ forms_exportable.length }} checklists</strong> out of
          {{ forms.length }} checklists available!
        </p>
        <b-button class="mx-auto" @click="downloadFile">Download CSV file</b-button>
      </b-alert>
      {{ sightings_error.length }}
      <b-alert variant="danger" v-if="sightings_error.length > 0" show>
        <h4 class="alert-heading">Well done!</h4>
        <p>
          The following sightings are not acceptable by eBird. Most common issue is that the species
          comments exceed 8000 character.
        </p>
        <b-table bordered small striped hover responsive :items="sightings_error" sticky-header />
      </b-alert>

      <h5>Final steps:</h5>
      <p>
        Go to
        <a
          href="http://ebird.org/ebird/import/upload.form?theme=ebird"
          target="_blank"
          rel="noopener"
          >eBird Import</a
        >, choose "eBird Record Format (Extended)", select the csv file on your computer and click
        on "Import File".
      </p>

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
