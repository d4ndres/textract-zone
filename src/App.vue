<script setup>
import Dropzone from './components/Dropzone.vue'


import { ref } from 'vue';


const wordstracted = ref([]);



function convertirBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]); // Retornar Base64 sin prefijo
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}


const loading = ref(false)
const onLoad = async (data) => {
  const base64 = await convertirBase64(data);
  
  loading.value = true
  fetch('https://471d-191-156-190-112.ngrok-free.app/api/extract_text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "base64_image": base64
    }),
  })
  .then(response => response.json())
  .then(data => {
    wordstracted.value = data.words;
  })
  .finally(() => {
    loading.value = false
  })
}

</script>

<template>
  <div class="flex justify-center items-center min-h-screen flex-wrap">
    <Dropzone @onLoad="onLoad" :wordstracted="wordstracted" :loading="loading"></Dropzone>
  </div>
</template>