<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import tippy from 'tippy.js';
	import { theme, showSettings } from '$lib/stores';

	const i18n = getContext('i18n');

	export let show = false;

	let tourSteps = [
		{
			element: '#sidebar',
			title: '左侧导航栏',
			content: '这里是主要的导航区域，你可以在这里创建新的聊天、查看历史记录、管理聊天。',
            ignoreCheck: false
		},
		{
			element: '#sidebar-user-info',
			title: '个人菜单',
			content: '在这里你可以访问个人资料、钱包持币信息、五行信息，切换语言，以及退出登录等操作。',
            ignoreCheck: false,
            action: () => {
                const event = new CustomEvent('show-user-menu');
                window.dispatchEvent(event);
            }
		},
        {
			element: '#fortune-info',
			title: '点击【账号设置】会看到你的运势',
			content: '这里显示了你的运势信息, 切换性别后会重新计算运势',
            ignoreCheck: true,
            action: async () => {
                await showSettings.set(true);
            }
		},
        {
			element: '#chat-wrapper',
			title: '聊天区域，Have fun!',
			content: '在这里输入你想说的话，可以是问题、指令或者任何你想与AI讨论的内容。',
            ignoreCheck: false,
            action: async () => {
                await showSettings.set(false);
            }
		}
	];

	let currentStep = 0;
	let tippyInstances = [];
	let overlay: HTMLDivElement;

	function createOverlay() {
		overlay = document.createElement('div');
		overlay.className = 'tour-overlay';
		document.body.appendChild(overlay);
	}

	function updateOverlay(element: Element) {
		if (!overlay) {
            createOverlay();
        }
        const rect = element.getBoundingClientRect();
        const padding = 4; // 添加一些内边距
        overlay.style.setProperty('--highlight-top', `${rect.top - padding}px`);
        overlay.style.setProperty('--highlight-left', `${rect.left - padding}px`);
        overlay.style.setProperty('--highlight-width', `${rect.width + padding * 2}px`);
        overlay.style.setProperty('--highlight-height', `${rect.height + padding * 2}px`);
	}

	function startTour() {
		if (currentStep < tourSteps.length) {
			const step = tourSteps[currentStep];
            // 执行步骤动作
            if (step.action) {
                step.action();
            }
            setTimeout(() => {
                const element = document.querySelector(step.element);
                if (element) {
                    updateOverlay(element);
                    // 创建 tour-tip 元素
                    const tipElement = document.createElement('div');
                    tipElement.className = 'tour-tip';
                    tipElement.innerHTML = `
                        <h3 class="text-lg font-bold mb-2">${step.title}</h3>
                        <p class="mb-4">${step.content}</p>
                        <div class="flex justify-between items-center">
                            <span class="text-sm">${currentStep + 1}/${tourSteps.length}</span>
                            <button class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 relative z-[10002]" onclick="window.nextTourStep && window.nextTourStep()">
                                ${currentStep === tourSteps.length - 1 ? '完成' : '下一步'}
                            </button>
                        </div>
                    `;
                    const instance = tippy(element, {
                        content: tipElement,
                        allowHTML: true,
                        placement: 'auto',
                        theme: $theme === 'dark' ? 'light' : 'dark',
                        interactive: true,
                        hideOnClick: false,
                        trigger: 'manual',
                        appendTo: document.body,
                        zIndex: 10002,
                        popperOptions: {
                            modifiers: [
                                {
                                    name: 'flip',
                                    options: {
                                        fallbackPlacements: ['top', 'right', 'bottom', 'left']
                                    }
                                },
                            ]
                        },
                    });
                
					instance.show();
				    tippyInstances.push(instance);

				}
            }, 100);
		}
	}

	function nextStep() {
		// 隐藏当前提示
		if (tippyInstances[currentStep]) {
			tippyInstances[currentStep].destroy();
		}

		currentStep++;
		
		if (currentStep < tourSteps.length) {
			startTour();
		} else {
			// 引导结束，保存状态
			localStorage.setItem('tourCompleted', 'true');
			// 移除遮罩层
			if (overlay) {
				document.body.removeChild(overlay);
			}
		}
	}

	function checkElementsExist() {
		return tourSteps.every(step => step.ignoreCheck || document.querySelector(step.element) !== null);
	}

	function startTourWhenReady() {
		if (checkElementsExist()) {
            setTimeout(() => {
                createOverlay();
                startTour();
            }, 200);
            
		} else {
			// 如果元素还未就绪，等待100ms后重试
			setTimeout(startTourWhenReady, 100);
		}
	}

	onMount(() => {
        // 将 nextStep 函数暴露给全局，以便在 tippy 内部调用
        window.nextTourStep = nextStep;

        if (localStorage.getItem('tourCompleted') !== 'true') {
            // 开始引导
            startTourWhenReady();
        }

        return () => {
            // 清理工作
            tippyInstances.forEach(instance => instance.destroy());
            delete window.nextTourStep;
            // 移除遮罩层
            if (overlay) {
                document.body.removeChild(overlay);
            }
        };
    });
</script>

<style>
	:global(.tour-tip) {
		padding: 1rem;
		max-width: 300px;
		z-index: 10002 !important;
	}

	:global(.tippy-box[data-theme~='dark']) {
		background-color: #1a1b1e;
		color: #ffffff;
        z-index: 10002 !important;  /* 添加这行 */
	}

	:global(.tippy-box[data-theme~='light']) {
		background-color: #ffffff;
		color: #1a1b1e;
        z-index: 10002 !important;  /* 添加这行 */
	}

	:global(.tour-overlay) {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.1);
		z-index: 10000;
		pointer-events: auto;
	}
	:global(.tour-overlay::before) {
		content: '';
		position: absolute;
		top: var(--highlight-top);
		left: var(--highlight-left);
		width: var(--highlight-width);
		height: var(--highlight-height);
		background: rgba(168, 85, 247, 0.1);  /* 改为淡紫色背景 */
		/* box-shadow: 0 0 0 2px rgb(168, 85, 247);  改为紫色边框 */
		border-radius: 4px;
	}
</style>