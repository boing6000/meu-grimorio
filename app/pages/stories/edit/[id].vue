<template>
  <AppLayout>
    <div class="max-w-screen-xl mx-auto p-4 lg:p-6">
      <div class="mb-6 flex align-items-center gap-3">
        <i class="pi pi-pencil text-primary text-4xl"></i>
        <div>
          <h1 class="text-4xl font-serif m-0 text-primary">Editar Estória</h1>
          <p class="text-muted-color italic m-0">Modifique os pilares da sua narrativa.</p>
        </div>
      </div>

      <StoryForm :story="story">
        <template #footer>
          <div class="col-12 flex justify-content-end gap-3 py-4">
            <Button label="Limpar" severity="secondary" variant="text" icon="pi pi-trash" @click="resetToOriginal" />
            <Button label="Salvar Alterações" icon="pi pi-save" @click="saveAndReturn" size="large" class="px-6" :loading="loading" />
          </div>
        </template>
      </StoryForm>
    </div>
  </AppLayout>
</template>

<script setup>
import StoryForm from '~/components/StoryForm.vue'
const route = useRoute();
const router = useRouter();
const loading = ref(false);
const original = ref(null);

const story = ref({
  id: '',
  name: '',
  plot: '',
  setting: '',
  style: '',
  cover_base64: '',
  cover_url: '',
  persona: { name: '', variable: 'user', content: '', avatar_base64: '', avatar_url: '' },
  characters: [{ name: '', variable: '', content: '', avatar_base64: '', avatar_url: '' }],
  opening: [{ sender_name: 'Narrative', content: '' }]
});

// Load existing story
const load = async () => {
  const id = route.params.id;
  const data = await $fetch(`/api/stories/${id}`);
  console.log(data.name)
  // Map server stored fields into editable model
  story.value = {
    id: data.id,
    name: data.name || '',
    plot: data.plot || '',
    setting: data.setting || '',
    style: data.style || '',
    cover_base64: '',
    cover_url: data.cover_url || '',
    persona: {
      name: data.persona?.name || '',
      variable: data.persona?.variable || 'user',
      content: data.persona?.content || '',
      avatar_base64: '',
      avatar_url: data.persona?.avatar_url || ''
    },
    characters: (data.characters || []).map((c) => ({
      name: c.name || '',
      variable: c.variable || '',
      content: c.content || '',
      avatar_base64: '',
      avatar_url: c.avatar_url || ''
    })),
    opening: (data.opening || []).map((b) => ({ sender_name: b.sender_name, content: b.content }))
  };

  // Keep a copy for reset
  original.value = JSON.parse(JSON.stringify(story.value));
};

onMounted(load);

// The StoryForm component handles image helpers, character management and opening suggestions.
// Page-level code only manages loading the story, resetting and saving.

const resetToOriginal = () => {
  if (original.value) story.value = JSON.parse(JSON.stringify(original.value));
};

const saveAndReturn = async () => {
  loading.value = true;
  try {
    // Prepare payload: we send all fields, keeping base64 only when set (server ignores undefined)
    const payload = JSON.parse(JSON.stringify(story.value));

    // Remove url-only fields so server will keep existing ones if no new base64 provided
    if (!payload.cover_base64) delete payload.cover_url;
    if (payload.persona && !payload.persona.avatar_base64) delete payload.persona.avatar_url;
    payload.characters = payload.characters.map((c) => {
      if (!c.avatar_base64) delete c.avatar_url;
      return c;
    });

    await $fetch(`/api/stories/${story.value.id}`, { method: 'PATCH', body: payload });
    await router.push('/stories');
  } catch (err) {
    console.error('Erro ao salvar estória:', err);
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

