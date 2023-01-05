<script setup>
import marker_color from "/data/marker_color.json";
</script>

<script>
import { LIcon } from "vue2-leaflet";

export default {
  components: {
    LIcon,
  },
  props: ["size", "fid"],
};
</script>

<template>
  <l-icon :iconAnchor="[size / 2, Math.sqrt((size * size) / 2) + size / 2]">
    <div style="display: grid">
      <div
        :style="{
          'background-color': marker_color[fid % marker_color.length],
          width: size + 'px',
          height: size + 'px',
          display: 'block',
          position: 'relative',
          'border-radius': '3rem 3rem 0',
          transform: 'rotate(45deg)',
          border: '1px solid #ffffff',
        }"
      ></div>
      <div
        :style="{
          position: 'absolute',
          width: size + 'px',
          'text-align': 'center',
          'line-height': size + 'px',
        }"
      >
        {{ fid }}
      </div>
    </div>
  </l-icon>
</template>
