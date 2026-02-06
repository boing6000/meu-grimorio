<template>
  <div class="flex flex-column h-screen overflow-hidden bg-stone-50 dark:bg-stone-950">

    <header
        class="flex align-items-center justify-content-between p-3 border-bottom-1 surface-border bg-surface-0 dark:bg-surface-900 shadow-sm z-1">
      <div class="flex align-items-center gap-3">
        <Button icon="pi pi-arrow-left" text rounded @click="navigateTo('/')"/>
        <div>
          <h2 class="font-serif m-0 text-lg lg:text-xl line-clamp-1">{{ chatStore.story?.name }}</h2>
          <div class="flex align-items-center gap-2 mt-1">
            <span class="text-xs font-mono text-muted-color">{{ chatStore.tokens || 0 }} / 8192 tokens</span>
            <ProgressBar :value="((chatStore.tokens || 0) / 8192) * 100" :showValue="false"
                         style="height: 4px; width: 60px;"/>
          </div>
        </div>
      </div>
      <div class="flex align-items-center gap-2">
        <Tag :value="`Ouro: 25.000`" severity="warn" icon="pi pi-briefcase" class="hidden md:flex"/>
        <Button icon="pi pi-cog" text rounded/>
      </div>
    </header>

    <ScrollPanel ref="scrollPanel" class="flex-grow-1 custom-scroll-area">
      <div class="max-w-4xl mx-auto py-6 px-3 lg:px-0 flex flex-column gap-6">

        <div v-for="(msg, index) in chatStore.messages" :key="index" class="message-wrapper">
          <div class="flex gap-3 lg:gap-4 items-start">
            <Avatar :image="getAvatar(msg.name)"
                    shape="circle"
                    size="large"
                    class="flex-shrink-0 shadow-2 border-1 border-100"
                    v-if="getAvatar(msg.name)"
            />

            <div class="flex-grow-1 min-w-0">
              <div class="flex align-items-center justify-content-between mb-2">
                <span class="font-bold text-sm text-primary uppercase tracking-wider">{{ msg.name }}</span>
                <div class="action-buttons flex gap-1">
                  <Button icon="pi pi-pencil" text rounded class="p-button-sm" @click="startEdit(index)"/>
                  <Button icon="pi pi-trash" text rounded severity="danger" class="p-button-sm"
                          @click="confirmDelete($event, index)"/>
                </div>
              </div>

              <div class="prose dark:prose-invert max-w-none font-serif leading-relaxed text-lg">
                <div v-if="editingIndex === index" ref="editableArea" contenteditable="true"
                     class="editable-area p-3 border-round bg-emphasis outline-none shadow-2"
                     @keydown="handleEditKey($event, index)">
                  {{ msg.content }}
                </div>
                <div v-else @dblclick="startEdit(index)" class="cursor-pointer">
                  <MDC :value="formatRichText(msg.content)"/>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="chatStore.sending" class="flex gap-4 items-center italic text-muted-color animate-pulse pl-2">
          <i class="pi pi-spin pi-spinner"></i>
          <span>O Lucid-V1-Nemo está tecendo a narrativa...</span>
        </div>
      </div>
    </ScrollPanel>

    <footer class="p-3 lg:p-4 bg-surface-0 dark:bg-surface-900 border-top-1 surface-border shadow-8">
      <div class="max-w-4xl mx-auto flex flex-column gap-3">

        <div class="flex flex-wrap justify-content-between align-items-center gap-2">
          <SelectButton v-model="selectedNpc" :options="chatStore.npcOptions" optionLabel="label" optionValue="value" size="small"
                        class="custom-select-button"/>

          <div class="flex gap-2">
            <Button v-if="chatStore.messages.length > 0" icon="pi pi-refresh" label="Regenerate"
                    class="p-button-sm p-button-text p-button-secondary" :loading="chatStore.sending"
                    @click="chatStore.regenerateLast()"/>
            <Button v-if="chatStore.messages.length > 0" icon="pi pi-step-forward" label="Continue"
                    class="p-button-sm p-button-text p-button-secondary" :loading="chatStore.sending"
                    @click="chatStore.continueStory(selectedNpc)"/>
          </div>
        </div>

        <div class="flex gap-2 relative">
          <Textarea v-model="userInput" autoResize rows="1"
                    placeholder="Comande o destino ou fale pela sua Persona... (Ctrl+Enter)"
                    ref="mainInput" class="flex-grow-1 p-3 text-lg border-round-xl shadow-2"
                    @keydown.ctrl.enter="send"/>
          <Button
              v-if="!chatStore.sending"
              icon="pi pi-send"
              class="p-button-rounded h-full px-4"
              @click="send"
          />

          <Button
              v-else
              icon="pi pi-stop-circle"
              severity="danger"
              label="Stop"
              class="p-button-rounded h-full px-4 animate-pulse"
              @click="chatStore.stopResponse()"
          />
        </div>
      </div>
    </footer>

    <ConfirmPopup/>
  </div>
</template>

<script lang="ts" setup>
import {useConfirm} from "primevue/useconfirm";

const confirm = useConfirm();
const route = useRoute()
const chatStore = useChatStore()
const userInput = ref('')
const selectedNpc = ref('Narrative')
const editingIndex = ref(-1);
const editContent = ref('');

// Referência para o elemento que está sendo editado no Card (dinâmico)
const editableRef = useTemplateRef<HTMLElement[]>('editableArea');
const scrollPanel = useTemplateRef('scrollPanel');

// Função para buscar Avatar
const getAvatar = (name: string) => {
  if (name === 'Narrative' || name === 'Narrator') return ''; // Substitua pelo seu ícone
  if (name === chatStore.story?.persona.name) return chatStore.story?.persona.avatar_url;
  const npc = chatStore.story?.characters.find((c: any) => c.name === name);
  return npc?.avatar_url || '';
}

// Lógica de Scroll Automático
const scrollToBottom = () => {
  if (scrollPanel.value) {
    const container = scrollPanel.value.$el.querySelector('.p-scrollpanel-content');
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }
};

// Vigiar novas mensagens para rolar
watch(() => chatStore.messages.length, () => {
  nextTick(() => scrollToBottom());
}, { deep: true });

onMounted(async () => {
  await chatStore.loadChat(route.params.id as string);
  setTimeout(scrollToBottom, 500); // Garante scroll após carga inicial
});

const formatRichText = (text: string) => {
  if (!text) return '';

  // 1. Envolve textos entre aspas duplas em um span de cor laranja
  // Usamos uma regex que captura o conteúdo entre " "
  let processed = text.replace(/"([^"]+)"/g, '<span class="speech">"$1"</span>');

  // 2. Se a IA usar o formato Nome: Texto, podemos destacar o Nome também
  processed = processed.replace(/^([\w\s]+:)/gm, '<b class="text-primary">$1</b>');

  return processed;
};

const confirmDelete = (event: MouseEvent, index: number) => {
  confirm.require({
    target: event.currentTarget,
    message: 'How shall this thread be severed?',
    icon: 'pi pi-trash',
    acceptLabel: 'From here below',
    rejectLabel: 'Only this one',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-warn',
    accept: () => {
      chatStore.deleteMessage(index, true);
    },
    reject: () => {
      chatStore.deleteMessage(index, false);
    }
  });
};


const saveEdit = async (index: number) => {
  if (editingIndex.value === -1) return;

  // editableRef é o nome que definimos no useTemplateRef('editableArea')
  const el = Array.isArray(editableRef.value) ? editableRef.value[0]
      : editableRef.value;

  if (el) {
    const newText = el.innerText; // Captura o texto puro, sem o HTML de cores

    // 1. Atualiza a Store (que por sua vez chama a API PATCH que criamos)
    await chatStore.updateMessage(index, newText);

    // 2. Fecha o modo de edição
    editingIndex.value = -1;
  }

  editingIndex.value = -1;
};

const send = async () => {
  let messageText = userInput.value.trim();
  if (!messageText){
    await chatStore.continueStory(selectedNpc.value)
    return;
  }
  userInput.value = ''
  await chatStore.sendMessage(messageText, selectedNpc.value)
}

const startEdit = (index: number) => {
  editingIndex.value = index;
  nextTick(() => {
    const el = Array.isArray(editableRef.value) ? editableRef.value[0]
        : editableRef.value;
    if (el) {
      el.focus();

      // Mover o cursor para o final do texto (Opcional, mas elegante)
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false); // false move para o final
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  });
};

// Salva a edição (Ctrl + Enter)
const handleEditKey = (event: KeyboardEvent, index: number) => {
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    saveEdit(index);
  }
  if (event.key === 'Escape') {
    editingIndex.value = -1;
  }
};


const formatDate = (date: string) => new Date(date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
</script>

<style scoped>
/* Remove o limite de altura anterior, agora usamos flex-grow */
.custom-scroll-area {
  height: 30vh;
}

/* Efeito DreamGen: Botões aparecem no Hover */
/* Os botões de ação ficam escondidos por padrão */
.action-buttons {
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
}

/* Quando passamos o mouse na mensagem, os botões surgem como fumaça */
.message-wrapper:hover .action-buttons {
  opacity: 1;
}

/* Ajuste para dispositivos móveis (onde não há hover) */
@media (max-width: 768px) {
  .action-buttons {
    opacity: 0.6; /* Ficam levemente visíveis no mobile */
  }
}

/* Estilo de Texto Imersivo */
:deep(.prose) {
  color: light-dark(#334155, #cbd5e1);
  font-size: 1.125rem;
}

:deep(.speech) {
  color: #f97316; /* Laranja DreamGen para falas */
  font-weight: 500;
}

:deep(em) {
  color: #64748b;
  font-style: italic;
}

/* Ajuste no Input para parecer um prompt épico */
:deep(.p-textarea) {
  border: 1px solid var(--p-surface-300);
}
:deep(.p-textarea:focus) {
  border-color: var(--p-primary-color);
  box-shadow: 0 0 0 2px var(--p-primary-100);
}

.custom-select-button :deep(.p-button) {
  background: transparent;
  border: none;
  font-size: 0.8rem;
}
</style>