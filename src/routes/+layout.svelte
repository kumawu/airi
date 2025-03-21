<script>
	import { io } from 'socket.io-client';
	import { spring } from 'svelte/motion';

	//fix: s11: Buffer is not defined
	import { Buffer } from 'buffer';
	globalThis.Buffer = Buffer;

	let loadingProgress = spring(0, {
		stiffness: 0.05
	});

	import { onMount, tick, setContext } from 'svelte';
	import {
		config,
		user,
		settings,
		theme,
		WEBUI_NAME,
		mobile,
		socket,
		activeUserIds,
		USAGE_POOL,
		chatId,
		chats,
		currentChatPage,
		tags,
		temporaryChatEnabled,
		isLastActiveTab,
		isApp,
		appInfo,
	} from '$lib/stores';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Toaster, toast } from 'svelte-sonner';

	import { getBackendConfig } from '$lib/apis';
	import { getSessionUser } from '$lib/apis/auths';

	import '../tailwind.css';
	import '../app.css';

	import 'tippy.js/dist/tippy.css';

	import { WEBUI_BASE_URL, WEBUI_HOSTNAME } from '$lib/constants';
	import i18n, { initI18n, getLanguages } from '$lib/i18n';
	import { bestMatchingLanguage, getFormattedDate } from '$lib/utils';
	import { getAllTags, getChatList } from '$lib/apis/chats';
	import NotificationToast from '$lib/components/NotificationToast.svelte';
	import AppSidebar from '$lib/components/app/AppSidebar.svelte';
	import TourGuide from '$lib/components/TourGuide.svelte';

	setContext('i18n', i18n);

	const bc = new BroadcastChannel('active-tab-channel');

	let loaded = false;
	let tourCompleted = localStorage.getItem('tourCompleted')?? 'false';

	const BREAKPOINT = 768;

	const setupSocket = async (enableWebsocket) => {
		const _socket = io(`${WEBUI_BASE_URL}` || undefined, {
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			randomizationFactor: 0.5,
			path: '/ws/socket.io',
			transports: enableWebsocket ? ['websocket'] : ['polling', 'websocket'],
			auth: { token: localStorage.token }
		});

		await socket.set(_socket);

		_socket.on('connect_error', (err) => {
			console.log('connect_error', err);
		});

		_socket.on('connect', () => {
			console.log('connected', _socket.id);
		});

		_socket.on('reconnect_attempt', (attempt) => {
			console.log('reconnect_attempt', attempt);
		});

		_socket.on('reconnect_failed', () => {
			console.log('reconnect_failed');
		});

		_socket.on('disconnect', (reason, details) => {
			console.log(`Socket ${_socket.id} disconnected due to ${reason}`);
			if (details) {
				console.log('Additional details:', details);
			}
		});

		_socket.on('user-list', (data) => {
			console.log('user-list', data);
			activeUserIds.set(data.user_ids);
		});

		_socket.on('usage', (data) => {
			console.log('usage', data);
			USAGE_POOL.set(data['models']);
		});

		_socket.on('fortune_updated', (data) => {
			// 更新 user store 中的 fortune 数据
			console.log('fortune_updated', data, $user);
			
			if (!$user) {
				console.warn('用户数据为空，尝试延迟处理运势更新');
				// 延迟一段时间后再次尝试更新
				setTimeout(() => {
					if ($user) {
						console.log('延迟后用户数据已加载，更新运势');
						const updatedUser = { ...$user, fortune: data['fortune'] };
						user.set(updatedUser);
					} else {
						console.error('延迟后用户数据仍为空，无法更新运势');
						// 将运势数据保存到 localStorage，以便后续使用
						localStorage.setItem('pendingFortune', JSON.stringify(data['fortune']));
					}
				}, 2000); // 延迟2秒再尝试
				return;
			}
			
			const updatedUser = { ...$user, fortune: data['fortune'] };
			user.set(updatedUser);
		});

		_socket.on('wallet_balance_updated', (data) => {
			// 更新 user store 中的 wallet_balance 数据
			console.log('wallet_balance_updated', data, $user);
			
			if (!$user) {
				console.warn('用户数据为空，尝试延迟处理运势更新');
				// 延迟一段时间后再次尝试更新
				setTimeout(() => {
					if ($user) {
						console.log('延迟后用户数据已加载，更新运势');
						const updatedUser = { ...$user, wallet_balance: data['wallet_balance'] };
						user.set(updatedUser);
					} else {
						console.error('延迟后用户数据仍为空，无法更新运势');
						// 将运势数据保存到 localStorage，以便后续使用
						localStorage.setItem('pendingWalletBalance', JSON.stringify(data['wallet_balance']));
					}
				}, 2000); // 延迟2秒再尝试
				return;
			}
			
			const updatedUser = { ...$user, wallet_balance: data['wallet_balance'] };
			user.set(updatedUser);
		});

		_socket.on('remaining_count_updated', (data) => {
			// 更新 user store 中的 remaining_count 数据
			console.log('remaining_count', data, $user);
			
			if (!$user) {
				console.warn('用户数据为空，尝试延迟处理更新');
				// 延迟一段时间后再次尝试更新
				setTimeout(() => {
					if ($user) {
						console.log('延迟后用户数据已加载，更新数据');
						const updatedUser = { ...$user, remaining_count: data['remaining_count'] };
						user.set(updatedUser);
					} else {
						console.error('延迟后用户数据仍为空，无法更新数据');
						// 将数据保存到 localStorage，以便后续使用
						localStorage.setItem('pendingRemainingCount', JSON.stringify(data['remaining_count']));
					}
				}, 2000); // 延迟2秒再尝试
				return;
			}
			
			const updatedUser = { ...$user, remaining_count: data['remaining_count'] };
			user.set(updatedUser);
		});
	};

	const chatEventHandler = async (event) => {
		const chat = $page.url.pathname.includes(`/c/${event.chat_id}`);

		let isFocused = document.visibilityState !== 'visible';
		if (window.electronAPI) {
			const res = await window.electronAPI.send({
				type: 'window:isFocused'
			});
			if (res) {
				isFocused = res.isFocused;
			}
		}

		if ((event.chat_id !== $chatId && !$temporaryChatEnabled) || isFocused) {
			await tick();
			const type = event?.data?.type ?? null;
			const data = event?.data?.data ?? null;

			if (type === 'chat:completion') {
				const { done, content, title } = data;

				if (done) {
					if ($isLastActiveTab) {
						if ($settings?.notificationEnabled ?? false) {
							new Notification(`${title} | Airi`, {
								body: content,
								icon: `${WEBUI_BASE_URL}/static/favicon.png`
							});
						}
					}

					toast.custom(NotificationToast, {
						componentProps: {
							onClick: () => {
								goto(`/c/${event.chat_id}`);
							},
							content: content,
							title: title
						},
						duration: 15000,
						unstyled: true
					});
				}
			} else if (type === 'chat:title') {
				currentChatPage.set(1);
				await chats.set(await getChatList(localStorage.token, $currentChatPage));
			} else if (type === 'chat:tags') {
				tags.set(await getAllTags(localStorage.token));
			}
		}
	};

	const channelEventHandler = async (event) => {
		if (event.data?.type === 'typing') {
			return;
		}

		// check url path
		const channel = $page.url.pathname.includes(`/channels/${event.channel_id}`);

		let isFocused = document.visibilityState !== 'visible';
		if (window.electronAPI) {
			const res = await window.electronAPI.send({
				type: 'window:isFocused'
			});
			if (res) {
				isFocused = res.isFocused;
			}
		}

		if ((!channel || isFocused) && event?.user?.id !== $user?.id) {
			await tick();
			const type = event?.data?.type ?? null;
			const data = event?.data?.data ?? null;

			if (type === 'message') {
				if ($isLastActiveTab) {
					if ($settings?.notificationEnabled ?? false) {
						new Notification(`${data?.user?.name} (#${event?.channel?.name}) | Airi`, {
							body: data?.content,
							icon: data?.user?.profile_image_url ?? `${WEBUI_BASE_URL}/static/favicon.png`
						});
					}
				}

				toast.custom(NotificationToast, {
					componentProps: {
						onClick: () => {
							goto(`/channels/${event.channel_id}`);
						},
						content: data?.content,
						title: event?.channel?.name
					},
					duration: 15000,
					unstyled: true
				});
			}
		}
	};

	onMount(async () => {
		if (window?.electronAPI) {
			const info = await window.electronAPI.send({
				type: 'app:info'
			});

			if (info) {
				isApp.set(true);
				appInfo.set(info);

				const data = await window.electronAPI.send({
					type: 'app:data'
				});

				if (data) {
					appData.set(data);
				}
			}
		}

		// Listen for messages on the BroadcastChannel
		bc.onmessage = (event) => {
			if (event.data === 'active') {
				isLastActiveTab.set(false); // Another tab became active
			}
		};

		// Set yourself as the last active tab when this tab is focused
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				isLastActiveTab.set(true); // This tab is now the active tab
				bc.postMessage('active'); // Notify other tabs that this tab is active
			}
		};

		// Add event listener for visibility state changes
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Call visibility change handler initially to set state on load
		handleVisibilityChange();

		theme.set(localStorage.theme?? 'dark');

		mobile.set(window.innerWidth < BREAKPOINT);
		const onResize = () => {
			if (window.innerWidth < BREAKPOINT) {
				mobile.set(true);
			} else {
				mobile.set(false);
			}
		};

		window.addEventListener('resize', onResize);

		let backendConfig = null;
		try {
			backendConfig = await getBackendConfig();
			console.log('Backend config:', backendConfig);
		} catch (error) {
			console.error('Error loading backend config:', error);
		}
		// Initialize i18n even if we didn't get a backend config,
		// so `/error` can show something that's not `undefined`.

		initI18n();
		if (!localStorage.locale) {
			const languages = await getLanguages();
			const browserLanguages = navigator.languages
				? navigator.languages
				: [navigator.language || navigator.userLanguage];
			const lang = backendConfig.default_locale
				? backendConfig.default_locale
				: bestMatchingLanguage(languages, browserLanguages, 'en-US');
			$i18n.changeLanguage(lang);
		}

		if (backendConfig) {
			// Save Backend Status to Store
			await config.set(backendConfig);
			await WEBUI_NAME.set(backendConfig.name);

			if ($config) {
				await setupSocket($config.features?.enable_websocket ?? true);

				if (localStorage.token) {
					// Get Session User Info
					const sessionUser = await getSessionUser(localStorage.token).catch((error) => {
						toast.error(`${error}`);
						return null;
					});

					if (sessionUser) {
						// Save Session User to Store
						$socket?.emit('user-join', { auth: { token: sessionUser.token } });

						$socket?.on('chat-events', chatEventHandler);
						$socket?.on('channel-events', channelEventHandler);

						await user.set(sessionUser);
						await config.set(await getBackendConfig());
						
						// 检查是否有待处理的运势数据
						const pendingFortune = localStorage.getItem('pendingFortune');
						if (pendingFortune) {
							try {
								const fortuneData = JSON.parse(pendingFortune);
								const updatedUser = { ...sessionUser, fortune: fortuneData };
								user.set(updatedUser);
								localStorage.removeItem('pendingFortune'); // 清除已处理的数据
							} catch (e) {
								console.error('解析待处理运势数据失败', e);
							}
						}

						// 检查是否有待处理的钱包数据
						const pendingWalletBalance = localStorage.getItem('pendingWalletBalance');
						if (pendingWalletBalance) {
							try {
								const wallet_balance = JSON.parse(pendingWalletBalance);
								const updatedUser = { ...sessionUser, wallet_balance: wallet_balance };
								user.set(updatedUser);
								localStorage.removeItem('pendingWalletBalance'); // 清除已处理的数据
							} catch (e) {
								console.error('解析待处理钱包数据失败', e);
							}
						}

						// 检查是否有待处理的剩余次数数据
						const pendingRemainingCount = localStorage.getItem('pendingRemainingCount');
						if (pendingRemainingCount) {
							try {
								const remaining_count = JSON.parse(pendingRemainingCount);
								const updatedUser = { ...sessionUser, remaining_count: remaining_count };
								user.set(updatedUser);
								localStorage.removeItem('pendingRemainingCount'); // 清除已处理的数据
							} catch (e) {
								console.error('解析待处理剩余次数数据失败', e);
							}
						}
						
					} else {
						// Redirect Invalid Session User to /auth Page
						localStorage.removeItem('token');
						await goto('/auth');
					}
				} else {
					// Don't redirect if we're already on the auth page
					// Needed because we pass in tokens from OAuth logins via URL fragments
					if ($page.url.pathname !== '/auth') {
						await goto('/auth');
					}
				}
			}
		} else {
			// Redirect to /error when Backend Not Detected
			await goto(`/error`);
		}

		await tick();

		if (
			document.documentElement.classList.contains('her') &&
			document.getElementById('progress-bar')
		) {
			loadingProgress.subscribe((value) => {
				const progressBar = document.getElementById('progress-bar');

				if (progressBar) {
					progressBar.style.width = `${value}%`;
				}
			});

			await loadingProgress.set(100);

			document.getElementById('splash-screen')?.remove();

			const audio = new Audio(`/audio/greeting.mp3`);
			const playAudio = () => {
				audio.play();
				document.removeEventListener('click', playAudio);
			};

			document.addEventListener('click', playAudio);

			loaded = true;
		} else {
			document.getElementById('splash-screen')?.remove();
			loaded = true;
		}

		return () => {
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<svelte:head>
	<title>{$WEBUI_NAME}</title>
	<link crossorigin="anonymous" rel="icon" href="{WEBUI_BASE_URL}/static/favicon.png" />

	<!-- rosepine themes have been disabled as it's not up to date with our latest version. -->
	<!-- feel free to make a PR to fix if anyone wants to see it return -->
	<!-- <link rel="stylesheet" type="text/css" href="/themes/rosepine.css" />
	<link rel="stylesheet" type="text/css" href="/themes/rosepine-dawn.css" /> -->
</svelte:head>

{#if loaded}
	{#if $isApp}
		<div class="flex flex-row h-screen">
			<AppSidebar />

			<div class="w-full flex-1 max-w-[calc(100%-4.5rem)]">
				<slot />
			</div>
		</div>
	{:else}
		<slot />
	{/if}
	{#if tourCompleted !=='true'}
		<TourGuide/>
	{/if}

{/if}

<Toaster
	theme={$theme.includes('dark')
		? 'dark'
		: $theme === 'system'
			? window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
			: 'light'}
	richColors
	position="top-right"
/>
