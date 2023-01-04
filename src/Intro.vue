<script setup>
import gif from "/b2e.gif";
</script>

<script>
export default {
  data() {
    return {
      important_information: [],
    };
  },
  mounted() {
    this.important_information = JSON.parse(this.$cookie.get("important_information"));
  },
  watch: {
    important_information() {
      this.$cookie.set("important_information", JSON.stringify(this.important_information), 365);
    },
  },
};
</script>

<template>
  <b-row class="my-3 p-3 bg-white rounded shadow-sm">
    <b-col lg="12">
      <h2 class="border-bottom pb-2 mb-3">Introduction</h2>
    </b-col>
    <b-col lg="6">
      <p>
        <strong>Biolovision2eBird</strong> helps you to import your bird sightings from any
        Biolovision website (e.g.
        <b-link href="https://www.ornitho.ch/" target="_blank">ornitho.ch</b-link>,
        <b-link href="http://faune-alsace.org/" target="_blank">faune-alsace</b-link>,...) to eBird!
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
            Mapping the protocol of the original system used (biolovision, Birdlasser, Birdtrack) to
            eBird is not always simple. In accordance with
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
            >. On the webapp, import all your sightings and create a single checklist at the step 2.
            Assign individual sightings. Then, modify location and dates in eBird as recommended on
            the link above.
          </li>
          <li>Skip the intro by adding <code>?skip_intro=true</code> to the url</li>
        </ol>
      </b-alert>
    </b-col>
    <b-col lg="12" class="text-center">
      <b-button
        variant="secondary"
        :disabled="important_information.length < 3"
        @click="$emit('skipIntro')"
      >
        Continue
      </b-button>
    </b-col>
  </b-row>
</template>