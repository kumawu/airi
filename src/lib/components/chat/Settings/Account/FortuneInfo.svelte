<script lang="ts">
    import { onMount } from 'svelte';
    import dayjs from 'dayjs';
    import { user} from '$lib/stores';
    import FortuneChart from './FortuneChart.svelte';
    import { updateUserProfile } from '$lib/apis/auths';
    import { toast } from 'svelte-sonner';

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

    export let gender = $user?.gender ?? 0;
    
</script>

<div class="self-center w-full">
    <div class="rounded-t-[15px] flex flex-col items-center mb-1.5" >
        <img src="/assets/images/answer-sign-title.png" alt="title" class="mt-1 h-[37px]" />
        <div class="flex mt-2 gap-5">
            <div class="flex-1 flex flex-col gap-1 mt-[18px] w-full self-center">
                <div class="flex">
                    <div class="flex-[1.3]">
                        <span class="text-[#717171]">性别：</span>
                        <select 
                            bind:value={gender}
                            class="w-[60px] ml-2 px-2 py-0.5 rounded text-sm bg-transparent border border-gray-200 dark:border-gray-700 outline-none"
                        >
                            <option value={0}>女</option>
                            <option value={1}>男</option>
                            <option value={2}>未知</option>
                        </select>
                    </div>
                </div>
                <div class="flex font-[PingFang SC] text-sm leading-7">
                    <span class="text-[#717171]">阳历：</span>
                    <span class="text-[#333]">{dayjs($user?.created_at * 1000).format('YYYY年MM月DD日HH时')}</span>
                </div>

                <div class="font-[PingFang SC] text-sm leading-7">
                    <span class="text-[#717171]">五行强弱：</span>
                    <span class="text-[#333]">{@html wxColor}</span>
                </div>

                <div class="flex">
                    <div class="flex-[1.3] font-[PingFang SC] text-sm leading-7">
                        <span class="text-[#717171]">日主属性：</span>
                        <span class="text-[#333]">{dataInfo?.ri_zhu_shu_xing}</span>
                    </div>
                    <!-- <div class="flex-1 font-[PingFang SC] text-sm leading-7">
                        <span class="text-[#717171]">阴阳参考：</span>
                        <span class="text-[#333]">{dataInfo?.yin_yang_can_kao}</span>
                    </div> -->
                </div>
                <div class="flex font-[PingFang SC] text-sm leading-7">
                    <span class="text-[#717171]">阴阳参考：</span>
                    <span class="text-[#333]">{dataInfo?.yin_yang_can_kao}</span>
                </div>

                <div class="flex">
                    <div class="flex-[1.3] font-[PingFang SC] text-sm leading-7">
                        <span class="text-[#717171]">格局参考：</span>
                        <span class="text-[#333]">{dataInfo?.ge_ju_can_kao}</span>
                    </div>
                    <!-- <div class="flex-1 font-[PingFang SC] text-sm leading-7">
                        <span class="text-[#717171]">旺衰参考：</span>
                        <span class="text-[#333]">{dataInfo?.wang_shuai_can_kao}</span>
                    </div> -->
                </div>
                <div class="flex font-[PingFang SC] text-sm leading-7">
                    <span class="text-[#717171]">旺衰参考：</span>
                    <span class="text-[#333]">{dataInfo?.wang_shuai_can_kao}</span>
                </div>
            </div>
            <div class="flex-1">
                <FortuneChart rizhu={dataInfo?.ri_zhu_shu_xing} />
            </div>
        </div>
    </div>
</div>