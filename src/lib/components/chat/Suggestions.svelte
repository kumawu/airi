<script lang="ts">
	import Bolt from '$lib/components/icons/Bolt.svelte';
	import { onMount, getContext, createEventDispatcher } from 'svelte';

	const i18n = getContext('i18n');
	const dispatch = createEventDispatcher();

	export let suggestionPrompts = [];
	export let className = '';

	let prompts = [];

	$: prompts = (suggestionPrompts ?? [])
		.reduce((acc, current) => [...acc, ...[current]], [])
		.sort(() => Math.random() - 0.5);
</script>

{#if prompts.length > 0}
	<div class="mb-1 flex gap-1 text-sm font-medium items-center text-gray-400 dark:text-gray-600">
		<Bolt />
		{$i18n.t('Suggested')}
	</div>
{/if}

<div class=" h-60 max-h-full overflow-auto scrollbar-none {className}">
	{#each prompts as prompt, promptIdx}
		<button
			class="flex flex-col flex-1 shrink-0 w-full justify-between px-3 py-2 rounded-xl bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition group"
			on:click={() => {
				dispatch('select', $i18n.t(prompt.content));
			}}
		>
			<div class="flex flex-col text-left">
				{#if prompt.title && prompt.title[0] !== ''}
					<div
						class="  font-medium dark:text-gray-300 dark:group-hover:text-gray-200 transition line-clamp-1"
					>
						{$i18n.t(prompt.title[0])}
					</div>
					<div class="text-xs text-gray-500 font-normal line-clamp-1">{$i18n.t(prompt.title[1])}</div>
				{:else}
					<div
						class="  font-medium dark:text-gray-300 dark:group-hover:text-gray-200 transition line-clamp-1"
					>
						{$i18n.t(prompt.content)}
					</div>

					<div class="text-xs text-gray-500 font-normal line-clamp-1">Prompt</div>
				{/if}
			</div>
		</button>
	{/each}
	<div
		class="flex flex-col flex-1 shrink-0 w-full justify-between px-3 py-2 rounded-xl bg-transparent hover:bg-purple-50 dark:hover:bg-white/5 transition group"
	>
		<div class="flex flex-col text-left">
			<div
				class="  font-medium dark:text-gray-300 dark:group-hover:text-gray-200 transition line-clamp-1"
			>
				{$i18n.t('专业解盘')}
			</div>
			<div class="text-xs text-gray-500 font-normal line-clamp-1">{$i18n.t('👀敬请期待！🎉')}</div>
		</div>
	</div>
</div>
