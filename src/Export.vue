<script setup></script>

<script>
export default {
  props: ["forms", "sightings", "forms_sightings"],
  data() {
    return {};
  },
  computed: {},
  methods: {
    formatSightings(sightings) {
      return sightings.map((s) => {
        var eBird_bird = jQuery.grep(eBird_birds_list, function (e) {
          return e.id == s.species["@id"];
        });

        if (eBird_bird.length < 1) {
          alert_sp.push(s.species.name);
          eBird_bird.push([]);
          eBird_bird[0].PRIMARY_COM_NAME = s.species.name;
        }

        var f = this.forms.filter((f) => f.id == s.form_id)[0];

        return {
          common_name: eBird_bird[0].PRIMARY_COM_NAME,
          genus: "",
          specie: "",
          count: s.species_count,
          specie_comment: s.species_comment,
          location: f.location_name,
          lat: f.lat,
          lng: f.lon,
          date: moment(f.date).format("MM/DD/YYYY"),
          start_time: f.time_start,
          state: "",
          country: "",
          protocol: protocol(f),
          party_size: f.number_observer,
          duration: f.duration > 0 ? f.duration : "",
          full_form: f.full_form ? "Y" : "N",
          distance: f.distance * 0.621371 > 0 ? (f.distance * 0.621371).toString() : "",
          area: "",
          form_comment: f.checklist_comment,
        };
      });

      // Check for duplicate
    },
    arrayObjectToCSV(sightings) {
      const array = [Object.keys(sightings[0])].concat(sightings);

      return array
        .map((it) => {
          return Object.values(it).toString();
        })
        .join("\n");
    },
    downloadFile(csv, filename) {
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
    exportFile() {
      const fid = this.forms.filter((f) => f.exportable).map((f) => f.id);
      const sightings = [
        ...this.sightings.filter((s) => fid.includes(s.form_id)),
        ...this.forms_sightings.filter((s) => fig.includes(s.form_id)),
      ];

      const csv = this.arrayObjectToCSV(this.formatSightings(sightings));

      this.downloadFile(csv, "test.csv");
    },
  },
};
</script>

<template>
  <b-row class="my-3 p-3 bg-white rounded shadow-sm">
    <b-col lg="12">
      <h2 class="border-bottom pb-2 mb-3">4. Upload your data in eBird</h2>
    </b-col>
    <b-col lg="12">
      <p>
        First, download the eBird file (.csv) for the checklist(s) by clicking on the buttons below
      </p>

      <b-button @click="exportFile">Generate eBird file</b-button>

      {{ forms_sightings }}
      <p>Then, upload the eBird formatted file on eBird, following the process below:</p>
      <ol>
        <li>
          Open eBird, go to "Submit Observations", and "Import Data" or click on
          <a
            class=""
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
