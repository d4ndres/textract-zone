<script setup>
import Rotate from './Rotate.vue';
import RotateCounter from './RotateCounter.vue';
import ComeBack from './ComeBack.vue';
import Load from './Load.vue';
import Download from './Download.vue'

import {comprimirImagen} from '../hooks/usePainter'
import { ref, computed, defineProps, defineEmits, watch } from 'vue';


const props = defineProps({
  typesFileAllowed: {
    type: Array,
    default: () => ['image/jpeg', 'image/png'],
    // default: () => ['image/jpeg', 'image/png', 'application/pdf'],
  },
  wordstracted: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['onLoad']);


// inicio

document.addEventListener('paste', async (event) => {
  const items = event.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        await validateAndProcessFile(file);
      }
    }
  }
});
// fin


const beforeProcess = ref(null)
const handleShowBefore = ref(false)
watch(() => props.wordstracted, (newValue) => {
  
  // wordstracted[0]  {label: 'I', confidence: '76.54%', parentPageDimension: Array(2), x: 246.3125, y: 195.3125, …}
  const selectedFile = window.structuredClone(fileOnClient.value);
  if(selectedFile) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      for (const word of newValue) {


        // crea un rectangulo azul semi transparente en coordenadas x, y y con ancho y alto h, w
        ctx.beginPath();
        ctx.rect(word.x, word.y, word.w, word.h);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Slightly more transparent blue
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.8)'; // More opaque blue border
        ctx.stroke();
        ctx.closePath();

        ctx.font = 'bold 12px Arial'; // Slightly larger and bold font
        ctx.fillStyle = 'rgba(0, 0, 255, 1)'; // More opaque blue text
        const textWidth = ctx.measureText(word.label).width;
        const textHeight = 12; // Adjusted to match font size
        const textX = word.x + (word.w - textWidth) / 2;
        const textY = word.y + (word.h + textHeight) / 2;
        ctx.fillText(word.label, textX, textY);
      }


      beforeProcess.value = imageUrl.value;
      imageUrl.value = canvas.toDataURL();
      
      // Create a new file from the rotated image
      canvas.toBlob((blob) => {
        const rotatedFile = new File([blob], selectedFile.name, { type: selectedFile.type });
        fileOnClient.value = rotatedFile;
      }, selectedFile.type);
    };

    img.src = window.URL.createObjectURL(selectedFile);
  }

});



const imageUrl = ref(null);
const inputRef = ref(null); // HTTMLInputElement
const fileOnClient = ref(null); // File

function triggerFileInput() {
  inputRef.value.click();


}

function handleFileChange(event) {
  const selectedFile = event.target.files[0];
  if (selectedFile) validateAndProcessFile(selectedFile);
}

function handleDrop(event) {
  const selectedFile = event.dataTransfer.files[0];
  if (selectedFile) validateAndProcessFile(selectedFile);
}

const disabled = computed( () => {
  return !imageUrl.value || props.loading || !!beforeProcess.value 
})

function rotateImage( clockwise = true ) {
  if( disabled.value ) return 

  const selectedFile = window.structuredClone(fileOnClient.value);

  if(fileOnClient) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      ctx.translate(img.height / 2, img.width / 2);
      ctx.rotate( ( clockwise ? 90 : -90 ) * Math.PI / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      imageUrl.value = canvas.toDataURL();
      
      // Create a new file from the rotated image
      canvas.toBlob((blob) => {
        const rotatedFile = new File([blob], selectedFile.name, { type: selectedFile.type });
        fileOnClient.value = rotatedFile;
      }, selectedFile.type);
    };

    img.src = window.URL.createObjectURL(selectedFile);
  }
}



async function validateAndProcessFile(selectedFile) {
  beforeProcess.value = null
  handleShowBefore.value = false
  if (props.typesFileAllowed.length && !props.typesFileAllowed.includes(selectedFile.type)) {
    console.log("El tipo de archivo no está permitido");
    return;
  }

  const regex = /^[^.]+\.[^.]+$/;
  if (!regex.test(selectedFile.name)) {
    console.log("El nombre del archivo no puede contener más de un punto");
    return;
  }

  if (selectedFile.type === 'application/pdf') {
    console.log("El archivo es un PDF, función no disponible");
    
    imageUrl.value = null;
    fileOnClient.value = null;

  } else if (selectedFile.type.startsWith('image/')) {
    const imageCompressed = await comprimirImagen(selectedFile);
    
    imageUrl.value = window.URL.createObjectURL(imageCompressed);
    fileOnClient.value = imageCompressed
    console.log("Imagen cargada", imageUrl.value);
    
  } else {
    console.log("Tipo de archivo no soportado");

    imageUrl.value = null;
    fileOnClient.value = null;
  }
}

function submit() {
  if(beforeProcess.value) return
  emit('onLoad', fileOnClient.value);
}

const toDownload = () => {
  const a = document.createElement('a');
  a.href = handleShowBefore.value ? beforeProcess.value : imageUrl.value;
  a.download = 'image.png';
  a.click();
}
</script>

<template>
  <form @submit.prevent="submit" class="border border-gray-400 rounded-lg overflow-hidden w-full min-w-72 max-w-screen-sm p-4 flex flex-col items-center">
    <div @click="triggerFileInput" class="border border-gray-400 rounded-lg p-4 mb-2 w-full cursor-pointer">
      <span class="font-bold">Selecciona el archivo </span>
    </div>
    <input
      type="file"
      @change="handleFileChange"
      ref="inputRef"
      style="display: none"
    />



    <div
      class="overflow-hidden flex relative"
      @click="triggerFileInput"
      @drop.prevent="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <div class="absolute top-0 right-0 flex gap-1" v-if="beforeProcess">
        <div @click.stop="toDownload" class=" h-10 w-10 bg-black/50 flex justify-center items-center cursor-pointer fill-slate-200 duration-300 hover:scale-110">
          <Download></Download>
        </div>
        <div  @click.stop="handleShowBefore = !handleShowBefore" 
        :class="{ 'fill-sky-500' : handleShowBefore }"
        class=" h-10 w-10 bg-black/50 flex justify-center items-center cursor-pointer fill-slate-200 duration-300 hover:scale-110">
          <ComeBack></ComeBack>
        </div>
      </div>
      <img class="w-full object-cover" v-if="imageUrl" :src="handleShowBefore ? beforeProcess : imageUrl" :alt="imageUrl">
    </div>

    <div class="flex gap-2 item-center justify-center mt-2">
      <div 
      @click="rotateImage(false)"
      class="flex justify-center items-center p-2  rounded-lg border border-gray-400 fill-gray-500 duration-300 cursor-pointer" :class="{ '!fill-gray-800 hover:bg-indigo-300' : !disabled}">
        <Rotate></Rotate>
      </div>
      <button :disabled="disabled" :class="{ '!bg-gray-500' : disabled}" class="p-2 px-4 bg-black text-white font-bold rounded-lg min-w-40 flex items-center justify-center" >
        <span v-show="!loading">
          Extraer texto
        </span>
        <Load v-show="loading" class="stroke-white"></Load>
      </button>
      <div 
      @click="rotateImage(true)"
      class="flex justify-center items-center p-2  rounded-lg border border-gray-400 fill-gray-500 duration-300 cursor-pointer" :class="{ '!fill-gray-800 hover:bg-indigo-300' : !disabled}">
        <RotateCounter></RotateCounter>
      </div>
    </div>

  </form>
</template>