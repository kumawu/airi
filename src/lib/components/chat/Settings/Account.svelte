<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { onMount, getContext } from 'svelte';

	import { user, config, settings } from '$lib/stores';
	import { updateUserProfile, createAPIKey, getAPIKey } from '$lib/apis/auths';

	import UpdatePassword from './Account/UpdatePassword.svelte';
	import { getGravatarUrl } from '$lib/apis/utils';
	import { generateInitialsImage, canvasPixelTest, getFormattedTime } from '$lib/utils';
	import { copyToClipboard } from '$lib/utils';
	import Plus from '$lib/components/icons/Plus.svelte';
	import Tooltip from '$lib/components/common/Tooltip.svelte';
	import SensitiveInput from '$lib/components/common/SensitiveInput.svelte';
	import FortuneInfo from './Account/FortuneInfo.svelte';
	import AddressEdit from './Account/AddressEdit.svelte';
	import { truncateName } from '$lib/utils/index';
	import LunarSolarPicker from './Account/LunarSolarPicker.svelte';
	import Modal from '$lib/components/common/Modal.svelte';

	const i18n = getContext('i18n');

	export let saveHandler: Function;
	export let saveSettings: Function;

	let profileImageUrl = '';
	let name = '';
	let gender = 2;
	let birthday = 0;
	let birthdayStr = '';
	let birthdayArr = [
		new Date().getFullYear(),
		new Date().getMonth() + 1,
		new Date().getDate(),
		new Date().getHours(),
		new Date().getMinutes()
	];
	let birthPlace = '';
	let id = '';
	let profileImageInputElement: HTMLInputElement;
	let saving = false;
	let showAddressPicker = false;
	let showBirthdayPicker = false;
	let showConfirmModal = false;
    let pendingSubmit = false;
	const onChangeBirthday = (e) => {
		birthdayArr = e?.detail?.selectedValues??[];
		birthday = new Date(birthdayArr[0], birthdayArr[1] - 1, birthdayArr[2], birthdayArr[3]).getTime() / 1000;
		birthdayStr = `${birthdayArr[0]}-${birthdayArr[1]}-${birthdayArr[2]} ${birthdayArr[3]}:00`;
	}
	const changeAddress = (e) =>{
		console.log(e.detail.selectedValues, e.detail.selectedOptions)
		birthPlace = [...e.detail.selectedValues].join(",");
		// showAddressPicker = false;
	}
	const submitHandler = async () => {
		if (name !== $user.name) {
            if (profileImageUrl === generateInitialsImage($user.name) || profileImageUrl === '') {
                profileImageUrl = generateInitialsImage(name);
            }
        }
        if(birthday!== $user.birthday || birthPlace!== $user.birth_place || gender!== $user.gender){
            showConfirmModal = true;
            pendingSubmit = true;
            return false;
        }

        return await doSubmit();
	};
	const doSubmit = async () => {
        pendingSubmit = false;
        const updatedUser = await updateUserProfile(
            localStorage.token, 
            {
                "profile_image_url": profileImageUrl, 
                name, birthday, gender, 
                "birth_place": birthPlace
            }
        ).catch(
            (error) => {
                toast.error(`${error}`);
            }
        );

        if (updatedUser) {
            await user.set(updatedUser);
            return true;
        }
        return false;
    };

	onMount(async () => {
		name = $user?.name??'';
		id = $user?.id??'';
		profileImageUrl = $user?.profile_image_url??'';
		gender = $user?.gender?? '';
		birthPlace = $user?.birth_place?? '';
		// 如果用户没有生日信息则使用当前时间
		birthday = $user?.birthday ?? new Date().getTime() / 1000;
		 // 格式化时间
		const date = new Date(birthday * 1000);
		birthdayArr = [
			date.getFullYear(),
			date.getMonth() + 1,
			date.getDate(),
			date.getHours(),
		]
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		birthdayStr = `${year}-${month}-${day} ${hours}:${minutes}`;
	});
</script>

<div class="flex flex-col h-full justify-between text-sm">
	<div class=" space-y-3 overflow-y-scroll max-h-[32rem] lg:max-h-full">
		<input
			id="profile-image-input"
			bind:this={profileImageInputElement}
			type="file"
			hidden
			accept="image/*"
			on:change={(e) => {
				const files = profileImageInputElement.files ?? [];
				let reader = new FileReader();
				reader.onload = (event) => {
					let originalImageUrl = `${event.target.result}`;

					const img = new Image();
					img.src = originalImageUrl;

					img.onload = function () {
						const canvas = document.createElement('canvas');
						const ctx = canvas.getContext('2d');

						// Calculate the aspect ratio of the image
						const aspectRatio = img.width / img.height;

						// Calculate the new width and height to fit within 250x250
						let newWidth, newHeight;
						if (aspectRatio > 1) {
							newWidth = 250 * aspectRatio;
							newHeight = 250;
						} else {
							newWidth = 250;
							newHeight = 250 / aspectRatio;
						}

						// Set the canvas size
						canvas.width = 250;
						canvas.height = 250;

						// Calculate the position to center the image
						const offsetX = (250 - newWidth) / 2;
						const offsetY = (250 - newHeight) / 2;

						// Draw the image on the canvas
						ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

						// Get the base64 representation of the compressed image
						const compressedSrc = canvas.toDataURL('image/jpeg');

						// Display the compressed image
						profileImageUrl = compressedSrc;

						profileImageInputElement.files = null;
					};
				};

				if (
					files.length > 0 &&
					['image/gif', 'image/webp', 'image/jpeg', 'image/png'].includes(files[0]['type'])
				) {
					reader.readAsDataURL(files[0]);
				}
			}}
		/>

		<div class="space-y-1">
			<!-- <div class=" text-sm font-medium">{$i18n.t('Account')}</div> -->

			<div class="flex space-x-5">
				<div class="flex flex-col">
					<div class="self-center mt-2">
						<button
							class="relative rounded-full dark:bg-gray-700"
							type="button"
							on:click={() => {
								profileImageInputElement.click();
							}}
						>
							<img
								src={profileImageUrl !== '' ? profileImageUrl : generateInitialsImage(name)}
								alt="profile"
								class=" rounded-full size-16 object-cover"
							/>

							<div
								class="absolute flex justify-center rounded-full bottom-0 left-0 right-0 top-0 h-full w-full overflow-hidden bg-gray-700 bg-fixed opacity-0 transition duration-300 ease-in-out hover:opacity-50"
							>
								<div class="my-auto text-gray-100">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										class="w-5 h-5"
									>
										<path
											d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z"
										/>
									</svg>
								</div>
							</div>
						</button>
					</div>
				</div>
				<div class="flex-1 self-center flex flex-col gap-1">
					<div class="text-xl font-semibold">	{truncateName(name)} </div>
					<div class="text-xs text-gray-500">
						{$i18n.t('Joined on')} {new Date($user?.created_at * 1000).toISOString().slice(0, 10)} {new Date($user?.created_at * 1000).toTimeString().slice(0, 5)}
					</div>
					<div class="text-sm text-gray-800 flex">
						<div class="flex-1 text-gray-700 dark:text-gray-200">{$i18n.t('Connected Wallet')} <span class="bg-gray-200 px-1 py-0.5  border rounded-lg bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700  ">{truncateName($user?.wallet_address, 50)}</span></div>
						<button class="w-2 hover:text-purple-800 dark:hover:text-purple-400 transition rounded-lg"
								on:click={() => {
									copyToClipboard(name);
									toast.success($i18n.t('Copied to clipboard'));
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 16 16"
									fill="currentColor"
									class="w-4 h-4 dark:text-white"
								>
									<path
										fill-rule="evenodd"
										d="M11.986 3H12a2 2 0 0 1 2 2v6a2 2 0 0 1-1.5 1.937V7A2.5 2.5 0 0 0 10 4.5H4.063A2 2 0 0 1 6 3h.014A2.25 2.25 0 0 1 8.25 1h1.5a2.25 2.25 0 0 1 2.236 2ZM10.5 4v-.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V4h3Z"
										clip-rule="evenodd"
									/>
									<path
										fill-rule="evenodd"
										d="M3 6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H3Zm1.75 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5ZM4 11.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z"
										clip-rule="evenodd"
									/>
								</svg>
						</button>
					</div>
				</div>
				<div class="w-40 flex flex-col self-center gap-0.5 items-end">
					<button
						class=" h-12 px-8 py-1.5 text-base font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-purple-800  dark:hover:bg-purple-400 transition rounded-full "
						on:click={() => {
							profileImageInputElement.click();
						}}
					>{$i18n.t('Change Profile Picture')}</button>
				</div>
			</div>
		</div>

		<div class="py-1" id="profile-settings">
			<div class="space-y-3 flex flex-col">
				<div class="grid grid-cols-3 gap-3">
					<div class="flex col-span-1 items-center">
						<label class="w-16 text-right text-sm font-medium text-gray-700 dark:text-gray-200 mr-3">{$i18n.t('姓名')}</label>
						<input
							type="text"
							bind:value={name}
							required
							maxlength="100"
							placeholder={$i18n.t("填写您的姓名")}
							class="w-40 px-4 py-1.5 border rounded-lg bg-white dark:bg-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-orange-400 focus:border-orange-400 focus:outline-none transition-colors"
						/>
					</div>
					<div class="flex col-span-2 items-center">
						<label class="w-16 text-right text-sm font-medium text-gray-700 dark:text-gray-200 mr-3">{$i18n.t('出生时间')}</label>
						{#if !showBirthdayPicker}
							<button
								show={!showBirthdayPicker}
								type="button"
								on:click={() => showBirthdayPicker = true}
								class="px-4 py-1.5 text-left border rounded-lg focus:ring-2 focus:ring-amber-500 "
							>
								{birthdayStr  || $i18n.t("点击选择生日")}
							</button>
						{/if}
						<LunarSolarPicker 
							show={showBirthdayPicker} 
							type = 'solar'
							curTime={birthdayArr} 
							on:change={onChangeBirthday}
						/>
					</div>
					<div class="flex col-span-1 items-center">
						<label class="w-16 text-right text-sm font-medium text-gray-700 dark:text-gray-200 mr-3">{$i18n.t('Gender')}</label>
						<div class="w-40 flex space-x-2">
							<label class="flex items-center">
								<input
									type="radio"
									bind:group={gender}
									value=1
									class="hidden"
									on:click={() => {
										gender = 1;
									}}
								/>
								<div class={`px-4 py-1.5 rounded-full cursor-pointer transition-colors ${gender === 1 ? 'bg-amber-400 text-white ' : 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'}`}>{$i18n.t('Male')}</div>
							</label>
							<label class="flex items-center">
								<input
									type="radio"
									bind:group={gender}
									value=0
									class="hidden"
									on:click={() => {
										gender = 0;
									}}
								/>
								<div class={`px-4 py-1.5 rounded-full cursor-pointer transition-colors ${gender === 0? 'bg-amber-400 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white'}`}>{$i18n.t('Female')}</div>
							</label>
						</div>
					</div>
					<div class="flex col-span-2 items-center">
						<label class="w-16 text-right text-sm font-medium text-gray-700 dark:text-gray-200 mr-3">{$i18n.t('出生地点')}</label>
						{#if !showAddressPicker}
							<button
								type="button"
								on:click={() => showAddressPicker = true}
								class="w-80 px-4 py-1.5 text-left border rounded-lg focus:ring-2 focus:ring-amber-500 "
							>
								{birthPlace || $i18n.t("点击选择省市区")}
							</button>
						{/if}
						<AddressEdit show={showAddressPicker} val={birthPlace.split(',')} on:change={changeAddress} />
					</div>
				</div>
			</div>
			
			<p class="text-gray-500 text-xs mt-3 text-center">
			温馨提示：若不确定出生日期，时间可填写12:00；出生地点可选择默认地址，对结果可能造成一定影响
			</p>
			<!-- {#if showAddressPicker}
				<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div class="bg-white rounded-lg p-4 w-full max-w-md mx-4">
						<h3 class="text-lg font-medium mb-4">选择地址</h3>
						<AddressEdit show={showAddressPicker} title="出生地址" on:confirm={changeAddress} on:cancel={() => showAddressPicker = false} />
					</div>
				</div>
			{/if} -->
		</div>

		<hr class=" dark:border-gray-850 my-4" />
		<div class="flex flex-col gap-4" id="fortune-info">
			<!-- <div class=" mb-1 text-xs font-medium">{$i18n.t('命局综述')}</div> -->
			<FortuneInfo />
		</div>
	</div>

	<div class="flex justify-end pt-3">
		<button
			class="px-3.5 py-1.5 text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-purple-800  dark:hover:bg-purple-400 transition rounded-full"
			disabled={saving}
			on:click={async () => {
				saving = true;
				const res = await submitHandler();
				console.log(res)

				if (res) {
					saveHandler();
				}
				saving = false;
			}}
		>
			{#if saving}
				<div class="flex items-center gap-1">
					<div class="size-3.5 border-2 border-t-transparent rounded-full animate-spin" />
					{$i18n.t('Saving')}
				</div>
			{:else}
				{$i18n.t('保存个人信息')}
			{/if}
		</button>
	</div>
</div>
{#if showConfirmModal}
    <Modal
		size="sm" 
        on:close={() => {
            showConfirmModal = false;
            pendingSubmit = false;
        }}
    >
        <div class="px-6 pt-6 pb-6">
            <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <p class="text-gray-700 dark:text-gray-200 text-md">
                    {$i18n.t('性别、生日、出生地只能修改一次，您确定要修改吗？')}
                </p>
            </div>
            <div class="flex justify-end gap-3">
                <button
                    class="min-w-[80px] px-4 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                    on:click={() => {
                        showConfirmModal = false;
                        pendingSubmit = false;
                    }}
                >
                    {$i18n.t('取消')}
                </button>
                <button
                    class="min-w-[80px] px-4 py-1.5 rounded-full text-sm bg-black text-white hover:bg-purple-500 transition-colors"
                    on:click={async () => {
                        showConfirmModal = false;
                        const res = await doSubmit();
                        if (res) {
                            saveHandler();
                        }
                    }}
                >
                    {$i18n.t('确认')}
                </button>
            </div>
        </div>
    </Modal>
{/if}