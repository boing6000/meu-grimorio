import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useChatStore = defineStore('chat', () => {
    // --- ESTADO (Refs) ---
    const story = ref<any>(null)
    const messages = ref<any[]>([])
    const index = ref<any>(null)
    const loading = ref(false)
    const sending = ref(false)
    const tokens = ref(0)
    const promptProcessingMode = ref<'none' | 'merge' | 'strict'>('none')
    let abortController: AbortController | null = null;

    // --- GETTERS (Computed) ---
    const currentStoryId = computed(() => index.value?.story_id)

    const npcOptions = computed(() => {
        const options = [{ label: 'Narrative', value: 'Narrative' }]
        options.push({ label: story.value?.persona?.name || 'User', value: story.value?.persona?.name || 'User' })
        if (story.value?.characters) {
            story.value.characters.forEach((c: any) => {
                options.push({ label: c.name, value: c.name })
            })
        }
        options.push({ label: 'Random', value: 'Multiples' })
        return options
    })

    // --- AÇÕES (Functions) ---

    /**
     * Carrega o estado inicial do chat e os metadados da estória
     */
    async function loadChat(storyId: string) {
        loading.value = true
        try {
            // 1. Busca os metadados da estória (Plot, Style, Persona)
            story.value = await $fetch(`/api/stories/${storyId}`)

            // 2. Busca o índice do chat e o chunk mais recente
            const data: any = await $fetch(`/api/stories/chat/${storyId}`)
            index.value = data
            messages.value = data.messages
            tokens.value = data.stats.prompt_tokens || 0
        } catch (error) {
            console.error("Erro ao invocar memórias do chat:", error)
        } finally {
            loading.value = false
        }
    }

    /**
     * Envia mensagem e gerencia o histórico local
     */
    async function sendMessage(content: string, npcName = 'Narrative') {
        if (!content || sending.value) return

        sending.value = true
        abortController = new AbortController(); // Criamos um novo controlador
        const personaName = story.value?.persona?.name || 'User'
        const isNarrative = npcName === 'Narrative'
        const isPersona = npcName === personaName
        const role = isNarrative ? 'system' : isPersona ? 'user' : 'assistant'

        // Otimismo: Adicionamos a fala do usuário imediatamente à UI
        const userMsg = {
            role,
            content,
            name: npcName,
            created_at: new Date().toISOString()
        }
        messages.value.push(userMsg)

        try {
            const response: any = await $fetch(`/api/stories/chat/${currentStoryId.value}`, {
                // @ts-ignore
                method: 'POST',
                body: {
                    role,
                    content,
                    npc_name: npcName,
                    custom_prompt_post_processing: promptProcessingMode.value
                }
            })

            tokens.value = response.stats.prompt_tokens || 0
            // Se a resposta for um array (várias mensagens de NPCs), adicionamos todas
            if (Array.isArray(response.messages)) {
                messages.value.push(...response.messages);
            } else {
                messages.value.push(response.messages);
            }
        } catch (error) {
            console.error("A conexão com o oráculo falhou:", error)
        } finally {
            sending.value = false
            abortController = null;
        }
    }

    function stopResponse() {
        if (abortController) {
            abortController.abort(); // Corta a conexão imediatamente
            sending.value = false;
            abortController = null;
        }
    }

    /**
     * Carrega chunks anteriores para o scroll infinito
     */
    async function loadPreviousChunk() {
        if (!index.value || index.value.current_chunk <= 1) return

        const prevNum = index.value.current_chunk - 1
        try {
            const oldMessages: any = await $fetch(`/api/stories/chat/${currentStoryId.value}/chunk/${prevNum}`)
            // Adicionamos no topo da lista
            messages.value = [...oldMessages, ...messages.value]
            index.value.current_chunk = prevNum
        } catch (error) {
            console.error("Falha ao recuperar pergaminhos antigos:", error)
        }
    }

    async function deleteMessage(index: number, removeBelow: boolean) {
        const storyId = story.value?.id || currentStoryId.value; // Usa story.id quando possível

        try {
            // Primeiro atualizamos localmente para resposta imediata na UI
            if (removeBelow) {
                messages.value.splice(index);
            } else {
                messages.value.splice(index, 1);
            }

            // Sincronizamos com o Grande Escriba (Servidor)
            await $fetch(`/api/stories/chat/${storyId}`, {
                method: 'DELETE',
                body: { index, remove_below: removeBelow }
            });
        } catch (err) {
            console.error("Falha ao apagar memórias no servidor", err);
        }
    }

    async function updateMessage(index: number, newContent: string) {
        const storyId = story.value?.id;

        // Atualiza localmente para feedback instantâneo
        messages.value[index].content = newContent;

        try {
            await $fetch(`/api/stories/chat/${storyId}`, {
                //@ts-ignore
                method: 'PATCH',
                body: { index, content: newContent }
            });
        } catch (err) {
            console.error("Falha ao editar a crônica:", err);
        }
    }

    async function regenerateLast() {
        if (messages.value.length < 2) return;

        // 1. Verifica se o final da lista contém mensagens geradas pela IA
        const lastMsg = messages.value[messages.value.length - 1];
        if (lastMsg.role !== 'assistant' && lastMsg.role !== 'writer') return;

        // 2. Encontra o primeiro índice das mensagens de IA consecutivas no final
        let firstAiIndex = messages.value.length - 1;
        while (firstAiIndex >= 0 && (messages.value[firstAiIndex].role === 'assistant' || messages.value[firstAiIndex].role === 'writer')) {
            firstAiIndex--;
        }
        // firstAiIndex agora aponta para a última mensagem que NÃO é da IA
        const removeFrom = firstAiIndex + 1;

        // 3. Remove do servidor e local todas as mensagens de IA a partir de `removeFrom`
        await deleteMessage(removeFrom, true);

        // 4. Recupera o último comando do usuário (agora o último após a poda)
        const lastUserMsg = messages.value[messages.value.length - 1];
        if (!lastUserMsg || !lastUserMsg.content) return;

        // 5. Re-envia para a IA (o servidor sabe que é um retry através de is_retry)
        await triggerAiResponse(lastUserMsg.content, lastUserMsg.name);
    }

    async function continueStory(npcName = 'Narrative') {
        if(npcName === 'Multiples') {
            npcName = story.value.characters.map((c: any) => c.name).random();
        }
        // Envia um comando vazio ou "Continue..." como Narrative (OOC)
        // mas sem registrar um novo Card de usuário se preferir
        await triggerAiResponse("\n\n", npcName);
    }

// Função auxiliar para disparar a IA sem duplicar o card do usuário
    async function triggerAiResponse(content: string, npcName: string) {
        // Usa story.id quando disponível, senão fallback para currentStoryId
        const storyId = story.value?.id || currentStoryId.value;
        try {
            sending.value = true;
            abortController = new AbortController(); // Criamos um novo controlador
            const response = await $fetch(`/api/stories/chat/${storyId}`, {
                method: 'POST',
                body: {
                    content,
                    npc_name: npcName,
                    is_retry: true,
                    custom_prompt_post_processing: promptProcessingMode.value
                } // is_retry avisa o server para não duplicar
            });

            tokens.value = response.stats.prompt_tokens || 0
            // Se a resposta for um array (várias mensagens de NPCs), adicionamos todas
            if (Array.isArray(response.messages)) {
                messages.value.push(...response.messages);
            } else {
                messages.value.push(response.messages);
            }
        } finally {
            sending.value = false;
            abortController = null;
        }
    }

    return {
        // Estado
        story,
        messages,
        index,
        loading,
        sending,
        tokens,
        promptProcessingMode,
        // Getters
        npcOptions,
        currentStoryId,
        // Ações
        loadChat,
        sendMessage,
        loadPreviousChunk,
        deleteMessage,
        updateMessage,
        continueStory,
        regenerateLast,
        stopResponse,
    }
})
