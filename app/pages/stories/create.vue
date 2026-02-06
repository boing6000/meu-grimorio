<template>
  <AppLayout>
    <div class="max-w-screen-xl mx-auto p-4 lg:p-6">
      <div class="mb-6 flex align-items-center gap-3">
        <i class="pi pi-feather text-primary text-4xl"></i>
        <div>
          <h1 class="text-4xl font-serif m-0 text-primary">Forjar Nova Estória</h1>
          <p class="text-muted-color italic m-0">Configure os pilares da sua narrativa.</p>
        </div>
      </div>

      <StoryForm :story="story">
        <template #footer>
          <div class="col-12 flex justify-content-end gap-3 py-4">
            <Button label="Limpar" severity="secondary" variant="text" icon="pi pi-trash" @click="() => { story.value = { name: '', plot: '', setting: '', style: '', cover_base64: '', persona: { name: '', variable: 'user', content: '', avatar_base64: '' }, characters: [{ name: '', variable: '', content: '', avatar_base64: '' }], opening: [{ sender_name: 'Narrative', content: '' }] } }" />
            <Button label="Iniciar Narração" icon="pi pi-bolt" @click="saveAndStart" size="large" class="px-6" :loading="loading" />
          </div>
        </template>
      </StoryForm>
    </div>
  </AppLayout>
</template>

<script setup>
import StoryForm from '~/components/StoryForm.vue'

const router = useRouter();
const loading = ref(false);

const story = ref({
  name: '',
  plot: '',
  setting: '',
  style: '',
  cover_base64: '',
  persona: {
    name: '',
    variable: 'user',
    content: '',
    avatar_base64: ''
  },
  characters: [{ name: '', variable: '', content: '', avatar_base64: '' }],
  opening: [{ sender_name: 'Narrative', content: '' }]
});


const saveAndStart = async () => {
  loading.value = true;
  try {
    const data = await $fetch('/api/stories', {
      method: 'POST',
      body: story.value
    });
    await router.push(`/stories/chat/${data.id}`);
  } catch (err) {
    console.error('Erro ao forjar estória:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
:deep(.p-card-title) {
  font-family: 'Georgia', serif;
  font-size: 1.25rem;
}
textarea {
  resize: none;
}
</style>