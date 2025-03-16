<script lang="ts">
  import { onMount } from 'svelte';
  import { getAdressInfoApi } from '$lib/apis/index';

  export let title = '';
  export let val: any[] = [];
  export let show = false;

  let modelVal: any[] = [];
  let visible = false;
  let columns: any[] = [];

  const customFieldName = {
    text: 'name',
    value: 'name',
    children: 'children'
  };

  onMount(async () => {
    try {
      columns = await getAdressInfoApi();
    } catch (res: any) {
      // columns = res;
    }
  });

  $: {
    modelVal = val??[];
  }

  $: {
    visible = show;
  }

  function handleChange(index: number, event: any) {
    const value = event.target.value;
    
    // 创建新数组以确保响应式更新
    let newModelVal = [...modelVal];
    newModelVal[index] = value;
    
    // 如果更改了上级选项，清除下级选择
    if (index < 2) {
      newModelVal = newModelVal.slice(0, index + 1);
    }
    
    // 更新模型值
    modelVal = newModelVal;
    
    // 构建选中的选项数据
    const selectedOptions = newModelVal.map((val, i) => {
      if (i === 0) {
        return columns.find(item => item[customFieldName.value] === val) || {};
      } else if (i === 1 && newModelVal[0]) {
        const province = columns.find(item => item[customFieldName.value] === newModelVal[0]);
        return province?.[customFieldName.children]?.find(item => item[customFieldName.value] === val) || {};
      } else if (i === 2 && newModelVal[0] && newModelVal[1]) {
        const province = columns.find(item => item[customFieldName.value] === newModelVal[0]);
        const city = province?.[customFieldName.children]?.find(item => item[customFieldName.value] === newModelVal[1]);
        return city?.[customFieldName.children]?.find(item => item[customFieldName.value] === val) || {};
      }
      return {};
    });
    
    // 触发变更事件
    change({
      selectedValues: newModelVal,
      selectedOptions: selectedOptions
    });
  }

  function confirm(data: any) {
    dispatch('confirm', {
      selectedValues: modelVal,
      selectedOptions: modelVal.map((val, i) => {
        if (i === 0) {
          return columns.find(item => item[customFieldName.value] === val) || {};
        } else if (i === 1 && modelVal[0]) {
          const province = columns.find(item => item[customFieldName.value] === modelVal[0]);
          return province?.[customFieldName.children]?.find(item => item[customFieldName.value] === val) || {};
        } else if (i === 2 && modelVal[0] && modelVal[1]) {
          const province = columns.find(item => item[customFieldName.value] === modelVal[0]);
          const city = province?.[customFieldName.children]?.find(item => item[customFieldName.value] === modelVal[1]);
          return city?.[customFieldName.children]?.find(item => item[customFieldName.value] === val) || {};
        }
        return {};
      })
    });
  }

  function cancel(data: any) {
    dispatch('cancel', data);
  }

  function change(data: any) {
    dispatch('change', data);
  }

  function clickOption(data: any) {
    dispatch('clickOption', data);
  }

  function scrollInto(data: any) {
    dispatch('scrollInto', data);
  }

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

{#if visible}
    <div class="w-[80%] grid grid-cols-3 gap-2">
      {#each [0, 1, 2] as level, index}
        <div class="flex flex-col">
          <select
            class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={modelVal[index]}
            on:change={(e) => { handleChange(index, e)}}
          >
            <option value="">{index === 0 ? '选择省' : index === 1 ? '选择市' : '选择区'}</option>
            {#if index === 0}
              {#each columns || [] as option}
                <option value={option[customFieldName.value]}>
                  {option[customFieldName.text]}
                </option>
              {/each}
            {:else if index === 1 && modelVal[0]}
              {#each columns.find(item => item[customFieldName.value] === modelVal[0])?.[customFieldName.children] || [] as option}
                <option value={option[customFieldName.value]}>
                  {option[customFieldName.text]}
                </option>
              {/each}
            {:else if index === 2 && modelVal[0] && modelVal[1]}
              {#each columns.find(item => item[customFieldName.value] === modelVal[0])?.[customFieldName.children]?.find(item => item[customFieldName.value] === modelVal[1])?.[customFieldName.children] || [] as option}
                <option value={option[customFieldName.value]}>
                  {option[customFieldName.text]}
                </option>
              {/each}
            {/if}
          </select>
        </div>
      {/each}
    </div>
{/if}
