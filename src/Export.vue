<script setup></script>

<script>
import fx from "./functions";

export default {
  props: ["forms", "sightings", "forms_sightings"],
  data() {
    return {
      formattedSightings: [],
    };
  },
  computed: {
    forms_exportable() {
      return this.forms.filter((f) => f.exportable);
    },
  },
  methods: {
    formatSightings() {
      const fid = this.forms_exportable.map((f) => f.id);

      const sightings = [
        ...this.sightings.filter((s) => fid.includes(s.form_id)),
        ...this.forms_sightings.filter((s) => fid.includes(s.form_id)),
      ];

      this.formattedSightings = sightings.map((s) => {
        let f = this.forms.filter((f) => f.id == s.form_id)[0];
        let date = new Date(f.date);
        date =
          (date.getMonth() > 8 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1)) +
          "/" +
          (date.getDate() > 9 ? date.getDate() : "0" + date.getDate()) +
          "/" +
          date.getFullYear();
        return {
          "Common Name": s.common_name,
          Genus: "",
          Species: "",
          "Species Count": s.count,
          "Species Comments": s.comment,
          "Location Name": f.location_name,
          Latitude: parseFloat(f.lat).toFixed(6),
          Longitude: parseFloat(f.lon).toFixed(6),
          "Observation date": date,
          "Start time": f.time_start ? f.time_start.substring(0, 5) : "",
          State: "",
          Country: "",
          Protocol: fx.protocol(f),
          "Number of observers": f.number_observer,
          Duration: f.duration > 0 ? f.duration : "",
          "All observations reported?": f.full_form ? "Y" : "N",
          "Distance covered": f.distance * 0.621371 > 0 ? (f.distance * 0.621371).toString() : "",
          "Area covered": "",
          "Checklist Comments": f.comment,
        };
      });
    },
    downloadFile(filename) {
      const csv = this.formattedSightings
        .map((it) => {
          return Object.values(it).toString();
        })
        .join("\n");

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
      <b-alert show variant="secondary">
        <h4 class="alert-heading">Well done!</h4>
        <p>
          You are ready to export: <strong> {{ forms_exportable.length }} checklists</strong>!
        </p>
        <b-button class="text-center" @click="formatSightings">Preview CSV export</b-button>
        <b-button class="text-center" @click="downloadFile('file')">Preview CSV export</b-button>
      </b-alert>

      <b-table bordered small striped hover responsive :items="formattedSightings" sticky-header />

      <p>Then, upload the eBird formatted file on eBird, following the process below:</p>
      <ol>
        <li>
          Open eBird, go to "Submit Observations", and "Import Data" or click on
          <a
            href="http://ebird.org/ebird/import/upload.form?theme=ebird"
            target="_blank"
            rel="noopener"
            >eBird Import</a
          >
        </li>
        <li>
          Choose "eBird Record Format (Extended)", and load the file which was downloaded at the
          ttvious step.
        </li>
        <li>Click on "Import File"</li>
        <li>
          Probably that some specie won't be recognized. You will have to match them with the
          correct specie. Don't worry, this is only done once per specie, then eBird memorize the
          match!
        </li>
      </ol>
    </b-col>
  </b-row>
</template>
