import { APP_NAME } from '$lib/constants';
import { type Writable, writable } from 'svelte/store';
import type { ModelConfig } from '$lib/apis';
import type { Banner } from '$lib/types';
import type { Socket } from 'socket.io-client';

import emojiShortCodes from '$lib/emoji-shortcodes.json';

// Backend
export const WEBUI_NAME = writable(APP_NAME);
export const config: Writable<Config | undefined> = writable(undefined);
export const user: Writable<SessionUser | undefined> = writable(undefined);

// Electron App
export const isApp = writable(false);
export const appInfo = writable(null);
export const appData = writable(null);

// Frontend
export const MODEL_DOWNLOAD_POOL = writable({});

export const mobile = writable(false);

export const socket: Writable<null | Socket> = writable(null);
export const activeUserIds: Writable<null | string[]> = writable(null);
export const USAGE_POOL: Writable<null | string[]> = writable(null);

export const theme = writable('system');

export const shortCodesToEmojis = writable(
	Object.entries(emojiShortCodes).reduce((acc, [key, value]) => {
		if (typeof value === 'string') {
			acc[value] = key;
		} else {
			for (const v of value) {
				acc[v] = key;
			}
		}

		return acc;
	}, {})
);

export const chatId = writable('');
export const chatTitle = writable('');

export const channels = writable([]);
export const chats = writable([]);
export const pinnedChats = writable([]);
export const tags = writable([]);

export const models: Writable<Model[]> = writable([]);

export const prompts: Writable<null | Prompt[]> = writable(null);
export const knowledge: Writable<null | Document[]> = writable(null);
export const tools = writable(null);
export const functions = writable(null);

export const banners: Writable<Banner[]> = writable([]);

export const settings: Writable<Settings> = writable({});

export const showSidebar = writable(false);
export const showSettings = writable(false);
export const showArchivedChats = writable(false);
export const showChangelog = writable(false);

export const showControls = writable(false);
export const showOverview = writable(false);
export const showArtifacts = writable(false);
export const showCallOverlay = writable(false);

export const temporaryChatEnabled = writable(false);
export const scrollPaginationEnabled = writable(false);
export const currentChatPage = writable(1);

export const isLastActiveTab = writable(true);
export const playingNotificationSound = writable(false);

export type Model = OpenAIModel | OllamaModel;

type BaseModel = {
	id: string;
	name: string;
	info?: ModelConfig;
	owned_by: 'ollama' | 'openai' | 'arena';
};

export interface OpenAIModel extends BaseModel {
	owned_by: 'openai';
	external: boolean;
	source?: string;
}

export interface OllamaModel extends BaseModel {
	owned_by: 'ollama';
	details: OllamaModelDetails;
	size: number;
	description: string;
	model: string;
	modified_at: string;
	digest: string;
	ollama?: {
		name?: string;
		model?: string;
		modified_at: string;
		size?: number;
		digest?: string;
		details?: {
			parent_model?: string;
			format?: string;
			family?: string;
			families?: string[];
			parameter_size?: string;
			quantization_level?: string;
		};
		urls?: number[];
	};
}

type OllamaModelDetails = {
	parent_model: string;
	format: string;
	family: string;
	families: string[] | null;
	parameter_size: string;
	quantization_level: string;
};

type Settings = {
	models?: string[];
	conversationMode?: boolean;
	speechAutoSend?: boolean;
	responseAutoPlayback?: boolean;
	audio?: AudioSettings;
	showUsername?: boolean;
	notificationEnabled?: boolean;
	title?: TitleSettings;
	splitLargeDeltas?: boolean;
	chatDirection: 'LTR' | 'RTL';

	system?: string;
	requestFormat?: string;
	keepAlive?: string;
	seed?: number;
	temperature?: string;
	repeat_penalty?: string;
	top_k?: string;
	top_p?: string;
	num_ctx?: string;
	num_batch?: string;
	num_keep?: string;
	options?: ModelOptions;
};

type ModelOptions = {
	stop?: boolean;
};

type AudioSettings = {
	STTEngine?: string;
	TTSEngine?: string;
	speaker?: string;
	model?: string;
	nonLocalVoices?: boolean;
};

type TitleSettings = {
	auto?: boolean;
	model?: string;
	modelExternal?: string;
	prompt?: string;
};

type Prompt = {
	command: string;
	user_id: string;
	title: string;
	content: string;
	timestamp: number;
};

type Document = {
	collection_name: string;
	filename: string;
	name: string;
	title: string;
};

type Config = {
	status: boolean;
	name: string;
	version: string;
	default_locale: string;
	default_models: string;
	default_prompt_suggestions: PromptSuggestion[];
	features: {
		auth: boolean;
		auth_trusted_header: boolean;
		enable_api_key: boolean;
		enable_signup: boolean;
		enable_login_form: boolean;
		enable_web_search?: boolean;
		enable_google_drive_integration: boolean;
		enable_image_generation: boolean;
		enable_admin_export: boolean;
		enable_admin_chat_access: boolean;
		enable_community_sharing: boolean;
	};
	oauth: {
		providers: {
			[key: string]: string;
		};
	};
};

type PromptSuggestion = {
	content: string;
	title: [string, string];
};

type SessionUser = {
	id: string;
	email: string;
	name: string;
	role: string;
	profile_image_url: string;
	created_at: number;
	gender: number;
	birthday: string;
	fortune: Fortune;
};


type WuXingValue = {
    [key in '金' | '木' | '水' | '火' | '土']: string;
};

type WebFormatData = {
	ge_ju_can_kao: string;
	ri_zhu_shu_xing: string;
	wang_shuai_can_kao: string;
	wu_xing_qiang_ruo: string;
	yin_yang_can_kao: string;
    yong_hu_xin_xi: {
        [key: string]: string; 
    };
    wu_xing_neng_liang: {
        [key: string]: string;  // 允许任意的五行能量键值对
    };
    [key: string]: any;  // 允许其他任意字段
}

type Fortune = {
    bazi_info: string;
    wu_xing_value: WuXingValue;
    web_format_data: WebFormatData;
}

// {
//     "bazi_info": "\n\n【五行强弱】：木旺、火相、水休、金囚、土死\n【日主属性】：戊土\n【阴阳参考】：平衡\n【旺衰参考】：偏强\n【格局参考】：七杀格\n【同党比例】：56%\n【异党比例】：43%\n\n【性别】：女    \n【五行能量】：金: 3% 食伤；木: 39% 官杀；水: 1% 财才；火: 41% 印绶；土: 15% 比劫\n\n【年柱】：主星: 正官；天干: 丙火；地支: 覆灯火；藏干: 丙火, 庚金, 戊土；副星: 偏印, 食神, 比肩；星运: 临官；自坐: 沐浴；空亡: 寅卯；纳音: 覆灯火；神煞: 天罗地网, 金舆, 禄神, 流霞, 劫煞\n\n【月柱】：主星: 比肩；天干: 甲木；地支: 城头土；藏干: 甲木, 丙火, 戊土；副星: 七杀, 偏印, 比肩；星运: 长生；自坐: 长生；空亡: 申酉；纳音: 城头土；神煞: 德秀贵人, 空亡, 劫煞, 披麻, 驿马, 学堂\n\n【日柱】：主星: 元女；天干: 戊土；地支: 大林木；藏干: 戊土, 乙木, 癸水；副星: 比肩, 正官, 正财；星运: 冠带；自坐: 冠带；空亡: 戌亥；纳音: 大林木；神煞: 太极贵人, 天罗地网, 德秀贵人, 红艳煞, 寡宿, 天喜\n\n【时柱】：主星: 正印；天干: 丙火；地支: 沙中土；藏干: 丙火, 庚金, 戊土；副星: 偏印, 食神, 比肩；星运: 临官；自坐: 帝旺；空亡: 子丑；纳音: 沙中土；神煞: 天德贵人, 德秀贵人, 天罗地网, 金舆, 禄神, 流霞, 劫煞, 词馆\n\n【大运】：2025年，1~1岁，干支-小运；2026年，2岁，干支-己卯；2036年，12岁，干支-庚辰；2046年，22岁，干支-辛巳；2056年，32岁，干支-壬午；2066年，42岁，干支-癸未；2076年，52岁，干支-甲申；2086年，62岁，干支-乙酉；2096年，72岁，干支-丙戌；\n\n【天干留意】：无合冲关系\n【地支留意】：寅辰见乙暗三会,寅辰拱会,寅巳相刑,寅巳相害\n\n\n",
//     "web_format_data": {
//         "ge_ju_can_kao": "七杀格",
//         "ri_zhu_shu_xing": "戊土",
//         "wang_shuai_can_kao": "偏强",
//         "wu_xing_neng_liang": {
//             "wu_xing_neng_liang_huo": "41% 食伤",
//             "wu_xing_neng_liang_jin": "3% 官杀",
//             "wu_xing_neng_liang_mu": "39% 比劫",
//             "wu_xing_neng_liang_shui": "1% 印绶",
//             "wu_xing_neng_liang_tu": "15% 财才"
//         },
//         "wu_xing_qiang_ruo": "木旺、火相、水休、金囚、土死",
//         "yin_yang_can_kao": "平衡",
//         "yong_hu_xin_xi": {
//             "ruzhu_riqi": "二〇二五年二月初一日 巳时",
//             "xing_bie": "女",
//             "xing_ming": "start.name"
//         }
//     },
//     "wu_xing_value": {
//         "土": "15%",
//         "木": "39%",
//         "水": "1%",
//         "火": "41%",
//         "金": "3%"
//     }
// }