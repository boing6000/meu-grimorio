<template>
  <div class="grid">
    <div class="col-12 md:col-7">
      <Card class="shadow-sm border-1 border-200 mb-4">
        <template #title> Capa da Crónica </template>
        <template #content>
          <div class="flex align-items-center gap-4 p-3 surface-50 border-round-xl border-dashed border-2 border-300">
            <div v-if="story.cover_base64 || story.cover_url" class="relative">
              <img :src="story.cover_base64 || story.cover_url" alt="Capa da crônica" class="w-8rem h-11rem shadow-4 border-round-lg object-cover" />
              <Button icon="pi pi-times" severity="danger" rounded class="absolute -top-2 -right-2 p-button-sm" @click="clearCover" />
            </div>
            <div class="flex-grow-1">
              <FileUpload mode="basic" @select="onCoverSelect" accept="image/*" chooseLabel="Escolher Capa" class="p-button-outlined w-full" />
              <p class="text-xs text-muted-color mt-2 italic">Dica: Use uma imagem vertical 2:3 para um visual de livro clássico.</p>
            </div>
          </div>
        </template>
      </Card>

      <Card class="shadow-sm border-1 border-200">
        <template #title> Fundamentos </template>
        <template #content>
          <div class="flex flex-column gap-4">
            <div class="flex flex-column gap-2">
              <label class="font-bold"><i class="pi pi-tag mr-2 text-primary"></i>Nome da Estória*</label>
              <InputText v-model="story.name" placeholder="Ex: As Brumas de ValUr" class="w-full" />
            </div>

            <div class="flex flex-column gap-2">
              <label class="font-bold"><i class="pi pi-map mr-2 text-primary"></i>Enredo (Plot)*</label>
              <Textarea v-model="story.plot" rows="3" placeholder="O conflito central..." class="w-full" />
            </div>

            <div class="flex flex-column gap-2">
              <label class="font-bold"><i class="pi pi-compass mr-2 text-primary"></i>Ambientação (Setting)*</label>
              <Textarea v-model="story.setting" rows="3" placeholder="Onde e quando a história se passa..." class="w-full" />
            </div>

            <div class="flex flex-column gap-2">
              <label class="font-bold"><i class="pi pi-palette mr-2 text-primary"></i>Estilo de Escrita</label>
              <Textarea v-model="story.style" rows="3" class="w-full text-sm font-serif" placeholder="Ex: Ed Greenwood, rico em detalhes sensoriais..." />
            </div>

            <div class="flex flex-column gap-2 border-top-1 border-100 pt-3">
              <label class="font-bold text-primary"><i class="pi pi-user mr-2"></i> Sua Persona</label>
              <div class="flex gap-3 align-items-start">
                <div class="flex flex-column align-items-center gap-2">
                  <Avatar :image="story.persona.avatar_base64 || story.persona.avatar_url || '/default-avatar.png'" size="xlarge" shape="circle" class="shadow-2 border-2 border-primary" />
                  <FileUpload mode="basic" @select="onPersonaAvatarSelect" accept="image/*" chooseLabel="Foto" size="small" class="p-button-xs" />
                </div>
                <div class="flex-grow-1 grid">
                  <div class="col-12">
                    <InputText v-model="story.persona.name" placeholder="Nome da Persona" class="w-full p-inputtext-sm" />
                  </div>
                  <div class="col-12">
                    <Textarea v-model="story.persona.content" placeholder="Sua biografia e segredos..." rows="2" class="w-full text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

    </div>

    <div class="col-12 md:col-5">
      <Card class="h-full shadow-sm border-1 border-200">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span><i class="pi pi-users mr-2 text-primary"></i> Personagens</span>
            <Button icon="pi pi-plus" label="Novo NPC" size="small" text @click="addCharacter" />
          </div>
        </template>
        <template #content>
          <div class="flex flex-column gap-3 max-h-50rem overflow-y-auto pr-2">
            <div v-for="(char, index) in story.characters" :key="index"
                 class="p-3 border-1 border-200 border-round surface-50 flex flex-column gap-2 relative">

              <div class="flex gap-3 align-items-center">
                <div class="flex flex-column align-items-center gap-2">
                  <Avatar :image="char.avatar_base64 || char.avatar_url || '/default-npc.png'" size="large" shape="circle" />
                  <FileUpload mode="basic" @select="(e) => onCharAvatarSelect(e, index)" accept="image/*" chooseIcon="pi pi-camera" class="p-button-rounded p-button-text" />
                </div>
                <div class="flex-grow-1 grid">
                  <div class="col-6"><InputText v-model="char.name" placeholder="Nome" class="w-full p-inputtext-sm" /></div>
                  <div class="col-6"><InputText v-model="char.variable" placeholder="ID (npc1)" class="w-full p-inputtext-sm" /></div>
                </div>
                <Button icon="pi pi-times" severity="danger" text rounded @click="removeCharacter(index)" :disabled="story.characters.length <= 1" />
              </div>
              <Textarea v-model="char.content" placeholder="Personalidade e traços..." rows="2" class="w-full text-sm" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <div class="col-12 mt-4">
      <Card class="shadow-sm border-1 border-primary-100 surface-50">
        <template #title>
          <div class="flex justify-content-between align-items-center">
            <span><i class="pi pi-sparkles text-primary mr-2"></i>Palavras de Abertura (Opening)</span>
            <div class="flex gap-2">
              <Button icon="pi pi-magic" label="Sugerir" severity="help" size="small" text @click="suggestOpening" :loading="suggesting" />
              <Button icon="pi pi-plus" label="Novo Bloco" size="small" text @click="addOpeningBlock" />
            </div>
          </div>
        </template>
        <template #content>
          <div class="flex flex-column gap-3">
            <div v-for="(block, index) in story.opening" :key="index" class="flex gap-2 align-items-start border-bottom-1 border-100 pb-3">
              <Dropdown v-model="block.sender_name" :options="senderOptions" class="w-12rem p-dropdown-sm" placeholder="Quem fala?" />
              <Textarea v-model="block.content" rows="2" class="flex-grow-1 text-lg italic font-serif bg-transparent border-none focus:shadow-none" placeholder="Escreva o início da lenda..." />
              <Button icon="pi pi-trash" severity="danger" text @click="story.opening.splice(index, 1)" />
            </div>
          </div>
        </template>
      </Card>
    </div>

    <slot name="footer">
      <div class="col-12 flex justify-content-end gap-3 py-4">
        <!-- Default empty footer; parent can provide buttons -->
      </div>
    </slot>
  </div>
</template>

<script setup>
const props = defineProps({ story: { type: Object, required: true } });
const story = props.story;
const suggesting = ref(false);

// Computed options
const senderOptions = computed(() => {
  const options = ['Narrative'];
  if (story.persona?.name) options.push(story.persona.name);
  (story.characters || []).forEach(c => { if (c.name) options.push(c.name); });
  return options;
});

// Auxiliares de Imagem
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

const onCoverSelect = async (e) => { story.cover_base64 = await fileToBase64(e.files[0]); };
const onPersonaAvatarSelect = async (e) => { story.persona.avatar_base64 = await fileToBase64(e.files[0]); };
const onCharAvatarSelect = async (e, index) => { story.characters[index].avatar_base64 = await fileToBase64(e.files[0]); };

const clearCover = () => { story.cover_base64 = ''; story.cover_url = ''; };

// Gerenciamento de NPCs e Abertura
const addCharacter = () => { if (!story.characters) story.characters = []; story.characters.push({ name: '', variable: '', content: '', avatar_base64: '', avatar_url: '' }); };
const removeCharacter = (index) => story.characters.splice(index, 1);
const addOpeningBlock = () => { if (!story.opening) story.opening = []; story.opening.push({ sender_name: 'Narrative', content: '' }); };

const suggestOpening = async () => {
  suggesting.value = true;
  try {
    story.opening = await $fetch('/api/stories/suggest-opening', { method: 'POST', body: story });
  } finally {
    suggesting.value = false;
  }
};
</script>

<style scoped>
:deep(.p-card-title) {
  font-family: 'Georgia', serif;
  font-size: 1.25rem;
}
textarea { resize: none; }
</style>

