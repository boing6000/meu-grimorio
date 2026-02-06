<template>
  <div class="layout-wrapper">
    <header class="layout-topbar p-3 shadow-2 flex align-items-center justify-content-between surface-card">
      <div class="flex align-items-center gap-3">
        <Image src="/logo.png" alt="Logo" height="50" />
        <Breadcrumb :model="breadcrumbItems" />
      </div>

      <slot name="top-defaut" />

      <div class="flex align-items-center gap-2">
        <slot name="top-actions" />
        <Button
            :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
            @click="toggleTheme"
            rounded
            text
        />
      </div>
    </header>

    <div class="layout-container flex flex-grow-1">
      <aside class="layout-sidebar p-3 surface-section border-right-1 surface-border" style="width: 250px">
        <Menu :model="navigationItems" class="w-full border-none" />
      </aside>

      <main class="layout-main flex-grow-1 overflow-auto bg-neutral-50 dark:bg-neutral-900">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isDark = ref(false);

const navigationItems = ref([
  { label: 'Role-play', icon: 'pi pi-comments', url: '/stories/list' },
  { label: 'Biblioteca de Lore', icon: 'pi pi-book', url: '/lore' },
  { label: 'Personas', icon: 'pi pi-users', url: '/characters' },
  { label: 'Configurações', icon: 'pi pi-cog', url: '/settings' }
]);

const breadcrumbItems = ref([
  { label: 'Grande Salão', icon: 'pi pi-home' }
]);

function toggleTheme() {
  const element = document.querySelector('html');
  element.classList.toggle('p-dark'); // Lógica de tema do PrimeVue Aura
  isDark.value = !isDark.value;
}
</script>

<style scoped>
.layout-wrapper {
  margin: -8px;
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.layout-container {
  overflow: hidden;
}
</style>