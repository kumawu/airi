<script lang="ts">
    import { onMount, getContext } from 'svelte';
    import dayjs from 'dayjs';
    import { user} from '$lib/stores';
    import FortuneChart from './FortuneChart.svelte';
    import { updateUserProfile } from '$lib/apis/auths';
    import { toast } from 'svelte-sonner';

    const i18n = getContext('i18n');

    $: dataInfo = $user?.fortune?.web_format_data?? {};

    $: wxColor = (() => {
        let temp = dataInfo?.wu_xing_qiang_ruo?.split('、') || [];
        temp.forEach((txt, index) => {
            if (txt.includes('金')) temp[index] = `<span class="text-[#F79230]">${txt}</span>`;
            if (txt.includes('木')) temp[index] = `<span class="text-[#3EB679]">${txt}</span>`;
            if (txt.includes('火')) temp[index] = `<span class="text-[#FA576A]">${txt}</span>`;
            if (txt.includes('土')) temp[index] = `<span class="text-[#F2752C]">${txt}</span>`;
            if (txt.includes('水')) temp[index] = `<span class="text-[#3EABF1]">${txt}</span>`;
        });
        return temp.join('、');
    })();

    // export let gender = $user?.gender ?? 0;
    // const walletGender = [$i18n.t('Female'), $i18n.t('Male'), $i18n.t('Unknown')];
    
</script>

<div class="self-center w-full">
    <div class="rounded-t-[15px] flex flex-col items-center mb-1.5" >
        <img src="/assets/images/answer-sign-title.png" alt="title" class="mt-1 h-[37px]" />
        <div class="flex mt-2 gap-6">
            <div class="flex-1 flex flex-col gap-2 mt-[18px] w-full self-center text-right">
                <!-- <div class="flex flex-[1.3] gap-3">
                    <div class="w-[80px] text-[#717171] dark:text-[#fff]">{$i18n.t('Gender')}:</div>
                    <div class="text-[#333]  dark:text-[#fff] text-left flex-1">{walletGender[gender]}</div>
                    <select 
                        bind:value={gender}
                        class="w-[100px] px-2 py-0.5 rounded text-sm bg-transparent border border-purple-400 dark:border-purple-800 outline-none"
                    >
                        <option value={0}>{$i18n.t('Female')}</option>
                        <option value={1}>{$i18n.t('Male')}</option>
                        <option value={2}>{$i18n.t('Unknown')}</option>
                    </select>
                </div> -->
                <!-- <div class="flex gap-3 font-[PingFang SC] text-sm leading-7">
                    <div class="w-[80px] text-[#717171] dark:text-[#fff] ">阳历:</div>
                    <div class="text-[#333]  dark:text-[#fff] text-left flex-1">{dayjs($user?.created_at * 1000).format('YYYY年MM月DD日HH时')}</div>
                </div> -->

                <div class="flex gap-3 font-[PingFang SC] text-sm leading-7 ">
                    <div class="w-[80px]  text-[#717171] dark:text-[#fff]">五行强弱:</div>
                    <div class="text-[#333]  dark:text-[#fff] text-left flex-1">{@html wxColor}</div>
                </div>

                <div class="flex gap-3 font-[PingFang SC] text-sm leading-7">
                    <div class="w-[80px] text-[#717171] dark:text-[#fff]">日主属性:</div>
                    <div class="text-[#333]  dark:text-[#fff] ">{dataInfo?.ri_zhu_shu_xing??''}</div>
                </div>
                <div class="flex gap-3 font-[PingFang SC] text-sm leading-7">
                    <div class="w-[80px] text-[#717171] dark:text-[#fff]">阴阳参考:</div>
                    <div class="text-[#333]  dark:text-[#fff] text-left flex-1">{dataInfo?.yin_yang_can_kao??''}</div>
                </div>

                <div class="flex gap-3 font-[PingFang SC] text-sm leading-7">
                    <div class="w-[80px] text-[#717171] dark:text-[#fff]">格局参考:</div>
                    <div class="text-[#333]  dark:text-[#fff] text-left flex-1">{dataInfo?.ge_ju_can_kao??''}</div>
                </div>
                <div class="flex gap-3 font-[PingFang SC] text-sm leading-7">
                    <div class="w-[80px] text-[#717171] dark:text-[#fff]">旺衰参考:</div>
                    <div class="text-[#333] dark:text-[#fff] text-left flex-1">{dataInfo?.wang_shuai_can_kao??''}</div>
                </div>
            </div>
            <div class="flex-1">
                <FortuneChart rizhu={dataInfo?.ri_zhu_shu_xing??''} />
            </div>
        </div>
    </div>
</div>