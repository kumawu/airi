<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { createEventDispatcher, getContext } from 'svelte';

	import { flyAndScale } from '$lib/utils/transitions';
	import { goto } from '$app/navigation';
	import ArchiveBox from '$lib/components/icons/ArchiveBox.svelte';
	import { showSettings, activeUserIds, USAGE_POOL, mobile, showSidebar } from '$lib/stores';
	import { fade, slide } from 'svelte/transition';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import { userSignOut } from '$lib/apis/auths';
	import { user } from '$lib/stores';
	import i18next from 'i18next';
	const i18n = getContext('i18n');
	import { writable } from 'svelte/store';
	import languages from '$lib/i18n/locales/languages.json';
	import { truncateName } from '$lib/utils/index';
	import { generateInitialsImage, canvasPixelTest } from '$lib/utils';
	import Modal from '$lib/components/common/Modal.svelte';

	const currentLanguage = writable(i18next.language);

	async function handleLanguageChange(langCode: string, langTitle: string) {
		await i18next.changeLanguage(langCode);
		currentLanguage.set(langCode);
		// Force a reload to ensure all components update their translations
		window.location.reload();
		show = false;
	}

	export let show = false;
	export let role = '';
	export let className = 'max-w-[240px]';

	let showWalletBalanceModal = false;

	const dispatch = createEventDispatcher();

	// import { useLogout } from '@privy-io/react-auth';

	// const { logout } = useLogout();

	// Call this function to log out the user
	// logout();

</script>

<DropdownMenu.Root
	bind:open={show}
	onOpenChange={(state) => {
		dispatch('change', state);
	}}
>
	<DropdownMenu.Trigger>
		<slot />
	</DropdownMenu.Trigger>

	<slot name="content">
		<DropdownMenu.Content
			class="w-full {className} text-sm rounded-xl px-1 py-1.5 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg font-primary"
			sideOffset={8}
			side="bottom"
			align="start"
			transition={(e) => fade(e, { duration: 100 })}
		>
			<div class="flex flex-col px-3 py-2 w-full cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition">
				<!-- 钱包地址和总余额 -->
				<div class="flex items-center justify-between" 
					on:click={
						async () => {
							showWalletBalanceModal = true
							show = false;
							if ($mobile) {
								showSidebar.set(false);
							}
						}
					}>
					<div class="flex items-center gap-2">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 dark:text-gray-500">
							<path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
						</svg>
						<span class="text-sm">{truncateName($user?.wallet_balance?.accountOwner ?? $i18n.t('Unknown Address'), 10)}</span>
					</div>
					<span class="text-sm font-medium dark:text-gray-500">
						${$user?.wallet_balance?.totalValueUsd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
					</span>
				</div>

				<!-- 代币列表 -->
				{#if $user?.wallet_balance?.totalValueUsd}
					<!-- <div class="space-y-2 ml-1">
						{#each $user.wallet_balance.balanceInfo.slice(0, 3) as token}
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-2">
									<div class="w-4 h-4">
										<img src={generateInitialsImage(token.symbol)} alt="Token Logo" class="w-full h-full rounded-full" />
									</div>
									<span class="text-xs  dark:text-gray-300 truncate w-20">{token.name}</span>
								</div>
								<span class="text-xs dark:text-gray-500">
									${token.valueUsd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
								</span>
							</div>
						{/each}
					</div> -->
				{:else}
					<!-- <div class="text-sm text-gray-500">{$i18n.t('No Balance')}</div> -->
				{/if}
			</div>

			
			<hr class=" border-gray-50 dark:border-gray-850 my-1 p-0" />
			<button
				class="flex rounded-md py-2 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
				on:click={async () => {
					await showSettings.set(true);
					show = false;

					if ($mobile) {
						showSidebar.set(false);
					}
				}}
			>
				<div class=" self-center mr-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-5 h-5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				</div>
				<div class="self-center truncate">{$i18n.t('Account')}</div>
			</button>

			<!-- <button
				class="flex rounded-md py-2 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
				on:click={() => {
					dispatch('show', 'archived-chat');
					show = false;

					if ($mobile) {
						showSidebar.set(false);
					}
				}}
			>
				<div class=" self-center mr-3">
					<ArchiveBox className="size-5" strokeWidth="1.5" />
				</div>
				<div class=" self-center truncate">{$i18n.t('Archived Chats')}</div>
			</button> -->

			{#if role === 'admin'}
				<!-- <a
					class="flex rounded-md py-2 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
					href="/playground"
					on:click={() => {
						show = false;

						if ($mobile) {
							showSidebar.set(false);
						}
					}}
				>
					<div class=" self-center mr-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
							/>
						</svg>
					</div>
					<div class=" self-center truncate">{$i18n.t('Playground')}</div>
				</a> -->

				<!-- <a
					class="flex rounded-md py-2 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
					href="/admin"
					on:click={() => {
						show = false;

						if ($mobile) {
							showSidebar.set(false);
						}
					}}
				>
					<div class=" self-center mr-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</div>
					<div class=" self-center truncate">{$i18n.t('Admin Panel')}</div>
				</a> -->
			{/if}
			<hr class=" border-gray-50 dark:border-gray-850 my-1 p-0" />

			

			<DropdownMenu.Sub>
				<DropdownMenu.SubTrigger
					class="flex items-center justify-between rounded-md py-2 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
				>
					<div class="flex items-center">
						<div class="flex self-center mr-1">
							<svg
							viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="
							w-5 h-5
						  ">
								<!-- xmlns="http://www.w3.org/2000/svg"
								fill="currentColor"
								viewBox="0 0 24 24"
								stroke-width="1"
								stroke="none"
								class="w-5 h-5"
							> -->
								<path d="M18.5 10L22.9 21H20.745L19.544 18H15.454L14.255 21H12.101L16.5 10H18.5ZM10 2V4H16V6L14.0322 6.0006C13.2425 8.36616 11.9988 10.5057 10.4115 12.301C11.1344 12.9457 11.917 13.5176 12.7475 14.0079L11.9969 15.8855C10.9237 15.2781 9.91944 14.5524 8.99961 13.7249C7.21403 15.332 5.10914 16.5553 2.79891 17.2734L2.26257 15.3442C4.2385 14.7203 6.04543 13.6737 7.59042 12.3021C6.46277 11.0281 5.50873 9.57985 4.76742 8.00028L7.00684 8.00037C7.57018 9.03885 8.23979 10.0033 8.99967 10.877C10.2283 9.46508 11.2205 7.81616 11.9095 6.00101L2 6V4H8V2H10ZM17.5 12.8852L16.253 16H18.745L17.5 12.8852Z"></path>
							</svg>
						</div>
						<span class="ml-2">{$i18n.t('Language')}</span>
					</div>
					<span class="text-gray-400">→</span>
				</DropdownMenu.SubTrigger>
				<DropdownMenu.SubContent class="min-w-[180px] text-sm rounded-xl px-1 py-1.5 z-50 bg-white dark:bg-gray-850 dark:text-white shadow-lg font-primary">
					{#each languages as lang}
						<DropdownMenu.Item
							class="flex items-center rounded-md py-2 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
							on:click={() => handleLanguageChange(lang.code,lang.title)}
						>
							<div class="flex items-center justify-between w-full">
								<span>{lang.title}</span>
								{#if $currentLanguage === lang.code}
									<span class="text-blue-500">✓</span>
								{/if}
							</div>
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.SubContent>
			</DropdownMenu.Sub>

			<button
				class="flex rounded-md py-2 px-3 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
				on:click={async () => {
					await userSignOut();

					

					// rebuid for privyio logout
					//Log the current user out and clears their authentication state. `authenticated` will become false, `user` will become null, and the Privy Auth tokens will be deleted from the browser's local storage.
					
					Object.keys(localStorage).forEach(key => {
						if (key.includes('privy') || key.includes('walletlink')) {
							localStorage.removeItem(key);
							console.log(`已删除：${key}`);
						}
					});

					console.log('当前所有 localStorage 项：');
					Object.keys(localStorage).forEach((key) => {
						console.log(`${key}: ${localStorage.getItem(key)}`);
					});

					localStorage.removeItem('token');
					location.href = '/auth';
					//localStorage 

					//locale
					show = false;
				}}
			>
				<div class=" self-center mr-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="w-5 h-5"
					>
						<path
							fill-rule="evenodd"
							d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
							clip-rule="evenodd"
						/>
						<path
							fill-rule="evenodd"
							d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class=" self-center truncate">{$i18n.t('Sign Out')}</div>
			</button>

			{#if $activeUserIds?.length > 0 && ($user.role === 'admin')}
				<hr class=" border-gray-50 dark:border-gray-850 my-1 p-0" />

				<Tooltip
					content={$USAGE_POOL && $USAGE_POOL.length > 0
						? `${$i18n.t('Running')}: ${$USAGE_POOL.join(', ')} ✨`
						: ''}
				>
					<div class="flex rounded-md py-1.5 px-3 text-xs gap-2.5 items-center">
						<div class=" flex items-center">
							<span class="relative flex size-2">
								<span
									class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
								/>
								<span class="relative inline-flex rounded-full size-2 bg-green-500" />
							</span>
						</div>
						<div class=" ">
							<span class="">
								{$i18n.t('Active Users')}:
							</span>
							<span class=" font-semibold">
								{$activeUserIds?.length}
							</span>
						</div>
					</div>
				</Tooltip>
			{/if}

			<!-- <DropdownMenu.Item class="flex items-center px-3 py-2 text-sm ">
				<div class="flex items-center">Profile</div>
			</DropdownMenu.Item> -->
		</DropdownMenu.Content>
	</slot>
</DropdownMenu.Root>

<Modal
	title={$i18n.t('Portfolio')}
	showClose={true}
	on:close={() => showWalletBalanceModal = false}
	bind:show={showWalletBalanceModal}
>
	<div class="wallet-balance-detail p-8 space-y-4">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2 dark:text-gray-200">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
					<path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
				</svg>
				<span class="text-sm">{truncateName($user?.wallet_balance?.accountOwner ?? $i18n.t('Unknown Address'), 30)}</span>
			</div>
			
		</div>
		<div class="space-y-2">
			<div class="text-sm font-medium mb-2 dark:text-gray-200 flex">
				<span class="flex-1">{$i18n.t('Tokens')}</span>	
				<span class="flex-1 text-right">
					${$user?.wallet_balance?.totalValueUsd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
				</span>
			</div>
			{#if $user?.wallet_balance?.balanceInfo?.length}
				<div class="w-full text-sm dark:text-gray-200 border border-purple-200 dark:border-purple-900 px-2 space-y-3">
					<!-- 表头 -->
					<div class="grid grid-cols-6 border-b border-purple-200 dark:border-purple-900 font-medium text-gray-600 dark:text-gray-200 ">
						<div class="text-left py-2 pl-4 col-span-2">{$i18n.t('Tokens')}</div>
						<div class="text-right py-2">{$i18n.t('Balance')}</div>
						<div class="text-right py-2">{$i18n.t('Price')}</div>
						<div class="text-right py-2">{$i18n.t('Value')}</div>
						<div class="text-right py-2 pr-4">{$i18n.t('Action')}</div>
					</div>
					<!-- 数据行 -->
					<div class="divide-y divide-purple-200 dark:divide-purple-900">
						{#each $user.wallet_balance.balanceInfo as token}
							<div class="grid grid-cols-6 hover:bg-gray-100 dark:hover:bg-gray-800">
								<div class="py-2 pl-4 col-span-2">
									<div class="flex items-center gap-2">
										<img src={token.logo??generateInitialsImage(token.symbol)} alt="Token Logo" class="w-6 h-6 rounded-full" />
										<div>
											<div class="font-medium">{token.name}</div>
										</div>
									</div>
								</div>
								<div class="text-right py-2">
									<div>{token.amount?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
								</div>
								<div class="text-right py-2">
									<div>${token.priceUsd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
								</div>
								<div class="text-right py-2">
									<div>${token.valueUsd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</div>
								</div>
								<div class="text-right py-2 pr-4">
									<button
										class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-purple-500 rounded hover:bg-purple-600 transition-colors"
										on:click={() => {
											const event = new CustomEvent('new-chat', {detail: { "msg": `看下和 ${token.name} 的合盘信息, 合约地址:${token.contactAddress}` }});
											window.dispatchEvent(event);
											showWalletBalanceModal = false;
											show = false;
											if ($mobile) {
												showSidebar.set(false);
											}
										}}
									>
										<!-- <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
											<line x1="12" y1="7" x2="12" y2="13" />
											<line x1="9" y1="10" x2="15" y2="10" />
										</svg> -->
										{$i18n.t('合盘')}
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
				{:else}
					<div class="text-sm text-gray-500">{$i18n.t('No Tokens')}</div>
				{/if}
		</div>
		<div class="flex justify-end pt-3">
			<button
				class="px-3.5 py-1.5 text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-purple-800  dark:hover:bg-purple-400 transition rounded-full"
				on:click={async () => {
					showWalletBalanceModal = false;
				}}
			>
				{$i18n.t('Close')}
			</button>
		</div>
	</div>
	
</Modal>
