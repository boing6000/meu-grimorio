<template>
 <AppLayout>
   <div class="max-w-screen-xl mx-auto p-4 lg:p-6">
     <div class="flex flex-column md:flex-row justify-content-between align-items-end mb-6 gap-4">
       <div>
         <h1 class="text-5xl font-serif m-0 text-primary">Grimório de Crônicas</h1>
       </div>
       <Button
           label="Forjar Nova Estória"
           icon="pi pi-plus"
           size="large"
           @click="navigateTo('/stories/create')"
           class="shadow-2"
       />
     </div>

     <div v-if="stories && stories.length > 0" class="grid">
       <div v-for="story in stories" :key="story.id" class="col-12 md:col-6 lg:col-4 xl:col-3">
         <Card class="h-full hover:shadow-6 transition-all border-1 border-200 overflow-hidden group">
           <template #header>
             <Image v-if="story.cover_url" :src="story.cover_url" width="100%"/>
             <div v-else
                  style="min-height: 212px;"
                  class="h-8rem bg-primary-50 flex align-items-center justify-content-center border-bottom-1 border-100">
               <i class="pi pi-book text-5xl text-primary-200 group-hover:text-primary transition-colors"></i>
             </div>
           </template>
           <template #title>
             <span class="text-xl font-serif">{{ story.name }}</span>
           </template>
           <template #subtitle>
             <div class="flex align-items-center gap-2 mt-2">
               <i class="pi pi-calendar text-xs"></i>
               <span class="text-xs">{{ formatDate(story.created_at) }}</span>
             </div>
           </template>
           <template #footer>
             <div class="flex justify-content-between align-items-center">
               <small class="text-muted-color">ID: {{ story.id.split('-')[0] }}...</small>
               <Button icon="pi pi-pencil" @click="navigateTo(`/stories/edit/${story.id}`)" rounded text/>
               <Button icon="pi pi-chevron-right" @click="goTodoChat(story.id)" rounded text/>
             </div>
           </template>
         </Card>
       </div>
     </div>

     <div v-else class="text-center py-8 bg-surface-50 border-round-xl border-2 border-dashed border-200">
       <i class="pi pi-cloud-upload text-4xl mb-3 text-300"></i>
       <h3 class="text-2xl font-serif text-600">O arquivo está em branco</h3>
       <p class="text-muted-color mb-4">Nenhuma crônica foi forjada ainda nestas terras.</p>
       <Button label="Criar seu primeiro conto" icon="pi pi-pencil" @click="navigateTo('/stories/create')" text/>
     </div>
   </div>
 </AppLayout>
</template>

<script lang="ts" setup>
import type {StoryListItem} from "~/models";

const {data: stories, refresh} = await useFetch<StoryListItem[]>('/api/stories');

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const goTodoChat = (id: string | number) => {
  navigateTo(`/stories/chat/${id}`);
};

// Refresh automático ao entrar na página para garantir novos registros
onMounted(() => {
  refresh();
});
</script>

<style scoped>
.group:hover :deep(.p-card-title) {
  color: var(--p-primary-color);
}
</style>