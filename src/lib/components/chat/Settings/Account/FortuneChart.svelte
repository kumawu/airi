<script lang="ts">
	import { user } from '$lib/stores';
  $: wxData = $user?.fortune?.web_format_data?? {
      wu_xing_neng_liang: {},
      wu_xing_ge_shu: {},
      han_cang_ge_shu: {}
  };
  export let rizhu: string = "";

  let data = {
      mu: { label: "木", bg: "linear-gradient(135.1deg, #8DEAB2 15.08%, #36B173 85.37%)", color: "#3EB679" },
      huo: { label: "火", bg: "linear-gradient(134.2deg, #FFC0C0 15.01%, #F9455B 85.2%)", color: "#FA576A" },
      tu: { label: "土", bg: "linear-gradient(134.2deg, #F8CFBC 15.29%, #F27227 83.43%)", color: "#F2752C" },
      jin: { label: "金", bg: "linear-gradient(135.08deg, #FFDA5B 15.11%, #F79230 85.32%)", color: "#F79230" },
      shui: { label: "水", bg: "linear-gradient(135.1deg, #C1E4FA 15.08%, #3BAAF1 85.37%)", color: "#3EABF1" }
  };

  $: if (wxData?.wu_xing_neng_liang) {
      for (const k in wxData.wu_xing_neng_liang) {
          const sx = k.split("_").pop() as "mu" | "huo" | "tu" | "jin" | "shui";
          if (sx && data[sx]) {
              const [value, name] = wxData.wu_xing_neng_liang[k].split(" ");
              data[sx] = { ...data[sx], value, name };
          }
      }
  }
</script>
<div class="relative flex self-center justify-center h-[320px] w-[320px] my-[10px] mx-[8px]">
    <img src="/assets/images/polygon.png" class="absolute w-[235px] h-[239px] top-10" alt="polygon" />
    <img src="/assets/images/shuxing-liu.png" class="absolute w-[280px] h-[280px] top-10" alt="shuxing" />
    
    {#each Object.entries(data) as [key, item], index}
        <div 
            class="absolute flex items-center justify-center w-[62px] h-[62px] rounded-full bg-white font-[MFKeSong-Bold] text-[28px] font-bold leading-5 text-center text-white"
            style:border={`2px solid ${item.color}`}
            class:top-[5px]={index === 0}
            class:top-[104px]={index === 1 || index === 4}
            class:bottom-[5px]={index === 2 || index === 3}
            class:left-[5px]={index === 4}
            class:left-[55px]={index === 3}
            class:right-[55px]={index === 2}
            class:right-[5px]={index === 1}
        >
            <div 
                class="flex flex-col items-center justify-center w-[53px] h-[53px] rounded-full pt-1 "
                style:background={item.bg}
            >
                {item.label}
                <span class="text-sm font-normal mt-[1px]">{item.value || ''}</span>
            </div>
            
            <div 
                class="absolute font-[PingFang SC] text-[15px] font-normal leading-5 text-center"
                style:color={item.color}
                class:top-[-23px]={index === 0 || index === 4 || index === 1}
                class:left-[-36px]={index === 3}
                class:right-[-36px]={index === 2}
            >
                {item.name || ''}
            </div>

            {#if rizhu.includes(item.label)}
                <div 
                    class="absolute bottom-[-10px] w-10 h-[18px] rounded-[14px] font-[PingFang SC] text-xs font-normal leading-[18px] text-center"
                    style:background={item.color}
                >
                    日主
                </div>
            {/if}
        </div>
    {/each}
</div>