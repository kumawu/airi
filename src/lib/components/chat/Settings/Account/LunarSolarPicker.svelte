<script lang="ts">
  import { Lunar, LunarYear, SolarYear } from "lunar-typescript";
  import { createEventDispatcher } from 'svelte';
  // 农历中文月份数组
  const LunarMonths = ["润", "正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];

  // 农历中文日期数组
  const LunarDays = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
  ];

  // 小时选择器数组
  const TimeHours = Array.from({ length: 24 }, (_, i) => ({
    text: `${i.toString().padStart(2, '0')}时`,
    value: i
  }));

  // 分钟选择器数组
  const TimeMinute = Array.from({ length: 60 }, (_, i) => ({
    text: `${i.toString().padStart(2, '0')}分`,
    value: i
  }));

  // 阳历月份
  const SolarMonths = Array.from({ length: 12 }, (_, i) => ({
    text: `${i + 1}月`,
    value: i + 1
  }));

  // 阳历日期
  const SolarDays = Array.from({ length: 31 }, (_, i) => ({
    text: `${i + 1}日`,
    value: i + 1
  }));

  export let type = "solar";
  export let show = false;
  export let curTime = [2024, 4, 9, 8, 30];
  export let maxYear = 2050;
  export let minYear = 1900;

  const dispatch = createEventDispatcher();

  type ColumnOptionType = {
    text: string | number;
    value: string | number;
  };

  let columnsLunar: ColumnOptionType[][] = [];
  let columnsSolar: ColumnOptionType[][] = [];
  let selectedValues: (number | string)[] = [];
  let lunarVal: number[] = [];
  let solarVal: number[] = [];
  let curType = type;

  $: visible = show;

  function calcMonths(curYear: number | string) {
    const result = [];
    const lunarYear = LunarYear.fromYear(Number(curYear));
    let months = lunarYear.getMonthsInYear();

    for (let i = 0, j = months.length; i < j; i++) {
      const mi = months[i].getMonth();
      let mn = LunarMonths[mi];
      if (mi < 0) {
        mn = LunarMonths[0] + LunarMonths[Math.abs(mi)];
      }
      result.push({
        text: mn,
        value: mi,
      });
    }
    return result;
  }

  function calcDays(curYear: number | string, curMonth: number | string) {
    const result = [];
    const lunarYear = LunarYear.fromYear(Number(curYear));
    let months = lunarYear.getMonthsInYear();
    let tempM = months.findIndex(item => item.getMonth() == curMonth);
    let days = months[tempM].getDayCount();
    for (let d = 0; d < days; d++) {
      let dn = LunarDays[d];
      result.push({
        text: dn,
        value: d + 1,
      });
    }
    return result;
  }

  function calcSolarDays(curYear: number | string, curMonth: number | string) {
    const solarYear = SolarYear.fromYear(Number(curYear));
    let months = solarYear.getMonths();
    let days = months[Number(curMonth) - 1].getDays().length;
    return SolarDays.slice(0, days);
  }

  function init() {
    let year = 2000;
    let month = 1;
    let day = 1;
    let hours = 0;

    columnsSolar[0] = [];
    columnsLunar[0] = [];

    for (let y = minYear; y <= maxYear; y++) {
      columnsSolar[0].push({
        text: y + "年",
        value: y,
      });

      let yc = Lunar.fromYmd(y, 1, 1);
      columnsLunar[0].push({
        text: yc.getYearInChinese(),
        value: y,
      });
    }

    columnsSolar[1] = SolarMonths;
    columnsSolar[2] = calcSolarDays(year, 1);
    columnsSolar[3] = TimeHours;

    columnsLunar[1] = calcMonths(year);
    columnsLunar[2] = calcDays(year, 1);
    columnsLunar[3] = TimeHours;

    lunarVal = [year, month, day, hours];
    solarVal = [year, month, day, hours];
  }

  function handleChange(index: number, event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedValues[index] = Number(target.value);
    
    if (curType === "solar" && index === 1) {
      columnsSolar[2] = calcSolarDays(selectedValues[0], selectedValues[1]);
    }
    if (curType === "lunar") {
      if (index === 0) columnsLunar[1] = calcMonths(selectedValues[0]);
      if (index === 1) columnsLunar[2] = calcDays(selectedValues[0], selectedValues[1]);
    }

    dispatch('change', { selectedValues });
  }

  function cancel() {
    dispatch('cancel');
  }

  function confirm() {
    dispatch('confirm', {
      curType,
      data: selectedValues
    });
    cancel();
  }

  $: if (curTime) {
    if (curType === "solar") {
      solarVal = curTime;
      selectedValues = [...curTime];
    }
    if (curType === "lunar") {
      lunarVal = curTime;
      selectedValues = [...curTime];
    }
  }

  $: if (show) {
    curType = type;
  }

  init();
</script>

{#if visible}
<div class="w-[75%]" >
  <div class=" w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-t-xl">
    <div class="relative">
      <!-- <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button class="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg" on:click={cancel}>取消</button>
        <div class="flex gap-2">
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 {curType === 'solar' ? 'bg-orange-500 hover:bg-orange-500 text-white dark:bg-orange-500 dark:hover:bg-orange-500 dark:text-white' : ''}"
            on:click={() => curType = 'solar'}
          >
            阳历
          </button>
          <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 {curType === 'lunar' ? 'bg-orange-500 hover:bg-orange-500 text-white dark:bg-orange-500 dark:hover:bg-orange-500 dark:text-white' : ''}"
            on:click={() => curType = 'lunar'}
          >
            农历
          </button>
        </div>
        <button class="text-sm text-orange-500 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg" on:click={confirm}>确定</button>
      </div> -->

      <div class="grid grid-cols-9 gap-1">
        {#if curType === 'lunar'}
          {#each columnsLunar as column, i}
            <select
              class="{i === 0 ? 'col-span-3' : 'col-span-2'} h-8 py-1 px-2.5 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e')] bg-[right_0.5rem_center] bg-no-repeat bg-[length:1.5em_1.5em]"
              value={lunarVal[i]}
              on:change={(e) => handleChange(i, e)}
            >
              {#each column as option}
                <option value={option.value}>{option.text}</option>
              {/each}
            </select>
          {/each}
        {:else}
          {#each columnsSolar as column, i}
            <select
              class="{i === 0 ? 'col-span-3' : 'col-span-2'} h-8 py-1 px-2.5 text-sm rounded-lg text-gray-900 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e')] bg-[right_0.5rem_center] bg-no-repeat bg-[length:1.5em_1.5em]"
              value={solarVal[i]}
              on:change={(e) => handleChange(i, e)}
            >
              {#each column as option}
                <option value={option.value}>{option.text}</option>
              {/each}
            </select>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>
{/if}
