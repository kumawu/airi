<script lang="ts">
	import { fortune } from '$lib/stores';

	$: wuXingData = $fortune?.wu_xing_value ? Object.entries($fortune.wu_xing_value) : [
		['\u91d1', '20%'],  // 金
		['\u6728', '20%'],  // 木
		['\u6c34', '20%'],  // 水
		['\u706b', '20%'],  // 火
		['\u571f', '20%']   // 土
	];
	
</script>

{#if wuXingData.length > 0}
	<div class="flex items-center justify-between rounded-xl py-2.5 px-2.5 w-full hover:bg-gray-100 dark:hover:bg-gray-900 transition">
		{#each wuXingData as [element, value]}
			<div class="flex items-center space-x-0.3">
				<span class="text-xs">
					{#if element === '金'}⭐
					{:else if element === '木'}🌲
					{:else if element === '水'}💧
					{:else if element === '火'}🔥
					{:else if element === '土'}⛰️
					{/if}
				</span>
				<span class="text-xs text-gray-600 dark:text-gray-400 mt-1">{value}</span>
			</div>
		{/each}
	</div>
{/if}